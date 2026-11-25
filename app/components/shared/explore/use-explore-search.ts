"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  EMPTY_SEARCH_RESULTS,
  extractSearchErrorMessage,
  unifiedSearch,
  type UnifiedSearchResults,
} from "@/lib/api/search";

const DEBOUNCE_MS = 350;
export const MIN_SEARCH_LENGTH = 2;

export function useExploreSearch(opts?: {
  minLength?: number;
  limit?: number;
  initialQuery?: string;
}) {
  const minLength = opts?.minLength ?? MIN_SEARCH_LENGTH;
  const limit = opts?.limit ?? 8;
  const initialQuery = opts?.initialQuery?.trim() ?? "";

  const [query, setQueryValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] =
    useState<UnifiedSearchResults>(EMPTY_SEARCH_RESULTS);
  const [settledQuery, setSettledQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const setQuery = useCallback(
    (value: string) => {
      setQueryValue(value);
      clearTimer();
      timerRef.current = setTimeout(() => {
        setDebouncedQuery(value);
      }, DEBOUNCE_MS);
    },
    [clearTimer],
  );

  const runSearch = useCallback(
    (value: string) => {
      clearTimer();
      setQueryValue(value);
      setDebouncedQuery(value.trim());
    },
    [clearTimer],
  );

  const clear = useCallback(() => {
    clearTimer();
    setQueryValue("");
    setDebouncedQuery("");
    setError(null);
  }, [clearTimer]);

  const retry = useCallback(() => {
    setSettledQuery("");
    setError(null);
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < minLength) return;

    let cancelled = false;

    unifiedSearch(q, { limit })
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setError(null);
        setSettledQuery(q);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults(EMPTY_SEARCH_RESULTS);
        setError(extractSearchErrorMessage(err, "Search failed"));
        setSettledQuery(q);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, limit, minLength, retryToken]);

  const normalizedQuery = query.trim();
  const normalizedDebounced = debouncedQuery.trim();
  const isActive = normalizedQuery.length >= minLength;
  const isReady =
    isActive &&
    normalizedDebounced === normalizedQuery &&
    settledQuery === normalizedQuery;
  const isSearching = isActive && !isReady;

  return {
    query,
    setQuery,
    runSearch,
    clear,
    retry,
    isActive,
    isSearching,
    results: isReady ? results : EMPTY_SEARCH_RESULTS,
    error: isReady ? error : null,
  };
}

export type ExploreSearchState = ReturnType<typeof useExploreSearch>;
