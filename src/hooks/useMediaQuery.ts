"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media-query hook using useSyncExternalStore.
 * Returns `false` on the server and during hydration,
 * then updates reactively on the client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = () => window.matchMedia(query).matches;

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
