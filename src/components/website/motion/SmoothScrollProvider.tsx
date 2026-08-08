'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cancelFrame, frame, useReducedMotion } from 'framer-motion';
import { ReactLenis, type LenisRef, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

type SmoothScrollProviderProps = {
  children: ReactNode;
};

function LenisLayoutSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const resize = () => lenis.resize();
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    window.addEventListener('load', resize);

    return () => {
      observer.disconnect();
      window.removeEventListener('load', resize);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp);
    }

    frame.update(update, true);
    return () => cancelFrame(update);
  }, [reducedMotion]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        duration: 1.1,
        lerp: 0.1,
        smoothWheel: true,
        respectReducedMotion: true,
      }}
    >
      <LenisLayoutSync />
      {children}
    </ReactLenis>
  );
}
