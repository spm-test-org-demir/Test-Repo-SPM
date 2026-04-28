import { useState, useEffect, useCallback } from 'react';
import type { SectionState } from './types';

const BASE = 'http://localhost:3001/api';

export function useGitHubData<T>(path: string, intervalMs = 60_000) {
  const [state, setState] = useState<SectionState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${BASE}${path}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const json: T[] = await res.json();
      setState({ data: json, loading: false, error: null });
    } catch (err: unknown) {
      setState({ data: null, loading: false, error: (err as Error).message });
    }
  }, [path]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs]);

  return state;
}

/** Like useGitHubData but for endpoints that return a single object, not an array. */
export function useGitHubSingle<T>(path: string, intervalMs = 60_000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}${path}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const json: T = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs]);

  return { data, loading, error };
}
