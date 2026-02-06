"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuakeResponse, QuakeWindow } from "@/types/quakes";
import { parseQuakeResponse, pollIntervalMs } from "@/lib/quakes";

interface UseQuakesState {
  data: QuakeResponse | null;
  error: string | null;
  isLoading: boolean;
}

const buildUrl = (window: QuakeWindow, minMag: number) => {
  const params = new URLSearchParams({ window });
  if (Number.isFinite(minMag) && minMag > 0) {
    params.set("minMag", minMag.toFixed(1));
  }
  return `/api/quakes?${params.toString()}`;
};

export function useQuakes(window: QuakeWindow, minMag: number) {
  const [state, setState] = useState<UseQuakesState>({
    data: null,
    error: null,
    isLoading: true
  });

  const url = useMemo(() => buildUrl(window, minMag), [window, minMag]);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setState((prev) => ({ ...prev, isLoading: prev.data === null }));
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
      }
      const payload = await response.json();
      const parsed = parseQuakeResponse(payload);
      setState({ data: parsed, error: null, isLoading: false });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      setState((prev) => ({
        data: prev.data,
        error: (error as Error).message,
        isLoading: false
      }));
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    const interval = setInterval(() => fetchData(), pollIntervalMs[window]);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchData, window]);

  return state;
}
