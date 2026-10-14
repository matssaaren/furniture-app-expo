import Constants from 'expo-constants';
import { Platform } from 'react-native';

type RequestConfig = RequestInit & {
  timeoutMs?: number;
};

function resolveApiHost() {
  const expoGoConfig = Constants.expoGoConfig as { debuggerHost?: string } | null;
  const hostUri =
    Constants.expoConfig?.hostUri ??
    expoGoConfig?.debuggerHost ??
    Constants.platform?.hostUri ??
    null;

  if (hostUri) {
    return hostUri.split(':')[0];
  }

  const experienceHost = Constants.experienceUrl?.split('//')[1]?.split(':')[0];
  if (experienceHost) {
    return experienceHost;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

export const API_BASE_URL = configuredApiUrl || `http://${resolveApiHost()}:4000`;

function isLocalTunnelUrl(url: string) {
  return /\.loca\.lt($|\/)/i.test(url) || /localtunnel/i.test(url);
}

function isNgrokUrl(url: string) {
  return /\.ngrok(-free)?\.app($|\/)/i.test(url) || /ngrok/i.test(url);
}

function isJsonLikeResponse(raw: string, contentType: string) {
  const trimmed = raw.trim();

  return (
    contentType.includes('application/json') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[')
  );
}

function getTunnelErrorMessage(path: string) {
  return `The backend tunnel returned a non-API response for ${path}. Restart the backend tunnel and Expo, or switch from localtunnel to cloudflared/ngrok.`;
}

function isTunnelUrl(url: string | undefined) {
  return Boolean(url && (isLocalTunnelUrl(url) || isNgrokUrl(url)));
}

export async function request<T>(
  path: string,
  init: RequestConfig = {},
  token?: string
): Promise<T> {
  const { timeoutMs = 8000, ...requestInit } = init;
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (!isFormData && !headers.has('Content-Type') && requestInit.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (configuredApiUrl && isLocalTunnelUrl(configuredApiUrl)) {
    headers.set('bypass-tunnel-reminder', 'true');
  }

  if (configuredApiUrl && isNgrokUrl(configuredApiUrl)) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Could not reach the local API at ${API_BASE_URL}. Start the backend and try again.`);
    }

    throw new Error(`Network request failed for ${API_BASE_URL}. Make sure the backend is running and the app can reach that URL.`);
  }

  clearTimeout(timeout);

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  const trimmed = raw.trim();
  let data: unknown = null;

  if (trimmed) {
    if (isJsonLikeResponse(trimmed, contentType)) {
      try {
        data = JSON.parse(trimmed);
      } catch {
        throw new Error(`The API returned malformed JSON for ${path}.`);
      }
    } else {
      data = trimmed;
    }
  }

  if (!response.ok) {
    if (configuredApiUrl && isTunnelUrl(configuredApiUrl) && (typeof data === 'string' || data === null)) {
      throw new Error(getTunnelErrorMessage(path));
    }

    throw new Error(
      typeof data === 'string'
        ? data
        : (data as { message?: string } | null)?.message || 'Something went wrong.'
    );
  }

  if (typeof data === 'string') {
    if (configuredApiUrl && isTunnelUrl(configuredApiUrl)) {
      throw new Error(getTunnelErrorMessage(path));
    }

    throw new Error(`The API returned an unexpected response for ${path}.`);
  }

  return data as T;
}
