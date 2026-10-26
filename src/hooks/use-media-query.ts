'use client';

import { useSyncExternalStore } from 'react';

/** Assina uma media query. No servidor retorna `fallback`. */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (notificar) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', notificar);
      return () => mql.removeEventListener('change', notificar);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const QUERY_DESKTOP = '(min-width: 1024px)';

export function useIsDesktop(): boolean {
  return useMediaQuery(QUERY_DESKTOP);
}
