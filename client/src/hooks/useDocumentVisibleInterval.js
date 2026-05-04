import { useEffect, useRef } from 'react';

/**
 * Repeatedly runs `callback` every `intervalMs` while the browser tab is visible.
 * When the user returns to the tab, runs `callback` once immediately.
 * Skips ticks while `document.hidden` to avoid useless requests in background.
 */
export function useDocumentVisibleInterval(callback, intervalMs) {
  const cb = useRef(callback);
  useEffect(() => {
    cb.current = callback;
  }, [callback]);

  useEffect(() => {
    if (intervalMs == null || intervalMs < 2000) return;

    let id;
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      cb.current();
    };

    const arm = () => {
      clearInterval(id);
      id = setInterval(tick, intervalMs);
    };

    arm();

    const onVisibility = () => {
      if (!document.hidden) {
        tick();
        arm();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs]);
}
