import { API_BASE } from '@/constants/Config';

type QueryValue = string | number | boolean | undefined | null;

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}: ${body || 'request failed'}`);
  }
}

export async function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body);
  }
  return (await res.json()) as T;
}
