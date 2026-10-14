const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const ngrok = require('@ngrok/ngrok');
const httpProxy = require('http-proxy');

const PROXY_PORT = 8080;

function readAuthtoken() {
  if (process.env.NGROK_AUTHTOKEN) {
    return process.env.NGROK_AUTHTOKEN;
  }

  const configPaths = [
    path.join(os.homedir(), '.ngrok2', 'ngrok.yml'),
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'ngrok', 'ngrok.yml')
      : null,
  ].filter(Boolean);

  for (const configPath of configPaths) {
    if (!fs.existsSync(configPath)) {
      continue;
    }

    const config = fs.readFileSync(configPath, 'utf8');
    const match = config.match(/^\s*authtoken\s*:\s*["']?([^\s"'#]+)["']?\s*$/m);

    if (match) {
      return match[1];
    }
  }

  throw new Error(
    'Ngrok authtoken was not found. Set NGROK_AUTHTOKEN or configure ngrok first.'
  );
}

async function main() {
  const authtoken = readAuthtoken();
  const proxy = httpProxy.createProxyServer({ ws: true, xfwd: false });
  const server = http.createServer((request, response) => {
    const isApiRequest = request.url === '/api' || request.url.startsWith('/api/');

    request.headers['x-forwarded-proto'] = 'https';
    request.headers['x-forwarded-host'] = request.headers.host;

    if (isApiRequest) {
      request.url = request.url.slice(4) || '/';
    }

    proxy.web(
      request,
      response,
      { target: isApiRequest ? 'http://127.0.0.1:4000' : 'http://127.0.0.1:8081' },
      () => {
        if (!response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'application/json' });
        }
        response.end(JSON.stringify({ message: 'The local development server is not running.' }));
      }
    );
  });

  server.on('upgrade', (request, socket, head) => {
    proxy.ws(request, socket, head, { target: 'http://127.0.0.1:8081' });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PROXY_PORT, '127.0.0.1', resolve);
  });

  const tunnel = await ngrok.forward({ addr: `localhost:${PROXY_PORT}`, authtoken });
  const publicUrl = tunnel.url();

  console.log('\nKeep this terminal open.');
  console.log(`API_URL=${publicUrl}/api`);
  console.log(`EXPO_PROXY_URL=${publicUrl}\n`);

  const stop = async () => {
    await Promise.allSettled([
      tunnel.close(),
      new Promise((resolve) => server.close(resolve)),
    ]);
    process.exit(0);
  };

  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  setInterval(() => {}, 2_147_483_647);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
