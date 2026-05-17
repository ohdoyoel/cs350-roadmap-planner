import { useEffect, useState } from 'react';

export type UseApiResult<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

// 가벼운 단방향 fetch 훅. 향후 react-query로 교체 가능.
export function useApi<T>(fetcher: () => Promise<T>, deps: ReadonlyArray<unknown>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}
