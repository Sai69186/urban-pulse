/**
 * Generic data fetching hook with loading, error, and retry states
 * Falls back to static data if backend is unavailable
 */

import { useState, useEffect, useCallback } from "react";

export function useApi(fetchFn, fallbackData = null, deps = []) {
  const [data,    setData]    = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [retries, setRetries] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err?.message || "Backend unavailable — showing static data");
      // Keep fallbackData on error
    } finally {
      setLoading(false);
    }
  }, [retries, ...deps]);

  useEffect(() => { load(); }, [load]);

  const retry = () => setRetries((r) => r + 1);

  return { data, loading, error, retry };
}

export function useMultiApi(fetchFns, fallbacks = {}) {
  const [results, setResults] = useState(fallbacks);
  const [loading, setLoading] = useState(true);
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const entries = Object.entries(fetchFns);
    Promise.allSettled(entries.map(([, fn]) => fn())).then((outcomes) => {
      if (cancelled) return;
      const newResults = { ...fallbacks };
      const newErrors  = {};
      entries.forEach(([key], i) => {
        if (outcomes[i].status === "fulfilled") {
          newResults[key] = outcomes[i].value;
        } else {
          newErrors[key] = outcomes[i].reason?.message;
        }
      });
      setResults(newResults);
      setErrors(newErrors);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return { results, loading, errors };
}
