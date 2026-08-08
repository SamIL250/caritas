'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Keeps Lenis scroll limits in sync when page height changes
 * (dynamic panels, hidden footer, late layout, etc.).
 */
export function useLenisResize(deps: unknown[] = []) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.resize();

    const frame = requestAnimationFrame(() => {
      lenis.resize();
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit dependency list from caller
  }, [lenis, ...deps]);
}
