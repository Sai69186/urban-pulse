/**
 * Data-fetching hook with loading, error, retry, and upload-aware refresh.
 * Falls back gracefully to static data when backend is unreachable.
 */

import { useState, useEffect, useCallback, useRef } from "react";

export function useApi(fetchFn, fallbackData = null, deps = []) {
  const [data,    setData]    = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [rev,     setRev]     = useState(0);    // increment to force refresh

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err?.message || "Backend unavailable — showing default data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev, ...deps]);

  useEffect(() => { load(); }, [load]);

  const retry = useCallback(() => setRev(r => r + 1), []);

  return { data, loading, error, retry };
}

/**
 * Fetch multiple endpoints in parallel.
 * Returns merged results + combined loading/error state.
 */
export function useMultiApi(fetchFns, fallbacks = {}) {
  const [results, setResults] = useState(fallbacks);
  const [loading, setLoading] = useState(true);
  const [errors,  setErrors]  = useState({});
  const [rev,     setRev]     = useState(0);

  // stable reference so we don't loop
  const fnRef = useRef(fetchFns);
  fnRef.current = fetchFns;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const entries = Object.entries(fnRef.current);
    Promise.allSettled(entries.map(([, fn]) => fn())).then(outcomes => {
      if (cancelled) return;
      const newResults = { ...fallbacks };
      const newErrors  = {};
      entries.forEach(([key], i) => {
        if (outcomes[i].status === "fulfilled") {
          newResults[key] = outcomes[i].value;
        } else {
          newErrors[key] = outcomes[i].reason?.message || "Error";
          // keep fallback on error
        }
      });
      setResults(newResults);
      setErrors(newErrors);
      setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev]);

  const refresh = useCallback(() => setRev(r => r + 1), []);

  return { results, loading, errors, refresh };
}
