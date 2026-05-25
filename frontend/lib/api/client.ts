import { API_BASE } from '@/constants/Config';

type QueryValue = string | number | boolean | undefined | null;
type Json = unknown;

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}: ${body || 'request failed'}`);
  }
}

// 세션 토큰 공급자. SessionContext가 초기화될 때 주입한다.
let tokenProvider: (() => string | null) | null = null;

export function setApiTokenProvider(provider: (() => string | null) | null) {
  tokenProvider = provider;
}

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function buildHeaders(hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  const token = tokenProvider?.();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: { params?: Record<string, QueryValue>; body?: Json } = {},
): Promise<T> {
  const res = await fetch(buildUrl(path, options.params), {
    method,
    headers: buildHeaders(options.body !== undefined),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  return request<T>('GET', path, { params });
}

export function apiPost<T>(
  path: string,
  body?: Json,
  params?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>('POST', path, { body, params });
}

export function apiPatch<T>(
  path: string,
  body?: Json,
  params?: Record<string, QueryValue>,
): Promise<T> {
  return request<T>('PATCH', path, { body, params });
}

export function apiDelete<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  return request<T>('DELETE', path, { params });
}
