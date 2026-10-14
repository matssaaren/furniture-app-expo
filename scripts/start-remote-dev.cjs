const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const ngrok = require('@ngrok/ngrok');
const httpProxy = require('http-proxy');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const API_PORT = 4000;
const METRO_PORT = 8081;

const children = new Set();
let tunnel;
let proxyServer;
let shuttingDown = false;

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

function spawnNode(entryFile, args = [], options = {}) {
  const child = spawn(process.execPath, [entryFile, ...args], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    ...options,
  });

  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

function stopProcessTree(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    child.kill('SIGTERM');
  }
}

function isServiceReady(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 400);
    });

    request.setTimeout(1000, () => {
      request.destroy();
      resolve(false);
    });
    request.once('error', () => resolve(false));
  });
}

async function waitForService(url, label, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isServiceReady(url)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`${label} did not start within ${timeoutMs / 1000} seconds.`);
}

function startProxy() {
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
      { target: isApiRequest ? `http://127.0.0.1:${API_PORT}` : `http://127.0.0.1:${METRO_PORT}` },
      () => {
        if (!response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'application/json' });
        }
        response.end(JSON.stringify({ message: 'The local development service is starting.' }));
      }
    );
  });

  server.on('upgrade', (request, socket, head) => {
    proxy.ws(request, socket, head, { target: `http://127.0.0.1:${METRO_PORT}` });
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Could not determine the local proxy port.'));
        return;
      }

      resolve({ server, port: address.port });
    });
  });
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    stopProcessTree(child);
  }

  await Promise.allSettled([
    tunnel?.close(),
    proxyServer
      ? new Promise((resolve) => proxyServer.close(resolve))
      : Promise.resolve(),
  ]);

  process.exit(exitCode);
}

async function main() {
  const authtoken = readAuthtoken();

  console.log('Starting backend...');
  const backend = spawnNode(path.join(PROJECT_ROOT, 'server', 'index.js'));
  backend.once('exit', (code) => {
    if (!shuttingDown) {
      console.error(`Backend stopped unexpectedly with code ${code}.`);
      void shutdown(code || 1);
    }
  });

  await waitForService(`http://127.0.0.1:${API_PORT}/health`, 'Backend');
  console.log('Backend is ready.');

  const localProxy = await startProxy();
  proxyServer = localProxy.server;
  tunnel = await ngrok.forward({ addr: `localhost:${localProxy.port}`, authtoken });
  const publicUrl = tunnel.url();
  const apiUrl = `${publicUrl}/api`;

  console.log(`Public API: ${apiUrl}`);
  console.log('Starting Expo Metro...');

  const expo = spawnNode(
    path.join(PROJECT_ROOT, 'node_modules', 'expo', 'bin', 'cli'),
    ['start', '--localhost', '--clear'],
    {
      env: {
        ...process.env,
        EXPO_PUBLIC_API_URL: apiUrl,
        EXPO_PACKAGER_PROXY_URL: publicUrl,
      },
    }
  );

  expo.once('exit', (code) => {
    if (!shuttingDown) {
      void shutdown(code || 0);
    }
  });

  await waitForService(`http://127.0.0.1:${METRO_PORT}/status`, 'Expo Metro');
  console.log('\nRemote development server is ready. Scan the QR code above with Expo Go.');
  console.log('Press Ctrl+C once to stop Expo, the backend, and the tunnel.\n');
}

process.once('SIGINT', () => void shutdown(0));
process.once('SIGTERM', () => void shutdown(0));

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  void shutdown(1);
});
