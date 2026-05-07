import { useState, useEffect } from 'react';
import type { SectionState } from './types';

const BASE = 'http://localhost:3001/api';

export function useGitHubData<T>(path: string, intervalMs = 60_000) {
  const [state, setState] = useState<SectionState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(`${BASE}${path}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { message?: string })?.message ?? `HTTP ${res.status}`);
        }
        const json: T[] = await res.json();
        setState({ data: json, loading: false, error: null });
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
        setState({ data: null, loading: false, error: (err as Error).message });
      }
    }

    void run();
    const id = setInterval(() => void run(), intervalMs);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [path, intervalMs]);

  return state;
}

/** Like useGitHubData but for endpoints that return a single object, not an array. */
export function useGitHubSingle<T>(path: string, intervalMs = 60_000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE}${path}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { message?: string })?.message ?? `HTTP ${res.status}`);
        }
        const json: T = await res.json();
        setData(json);
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void run();
    const id = setInterval(() => void run(), intervalMs);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [path, intervalMs]);

  return { data, loading, error };
}
