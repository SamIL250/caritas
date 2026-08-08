'use client';

import { useReducedMotion } from 'framer-motion';
import { instantVariants } from './motion-presets';

export function useMotionSafe() {
  const reducedMotion = useReducedMotion();

  return {
    reducedMotion: reducedMotion ?? false,
    variants: reducedMotion ? instantVariants : undefined,
    parallaxRange: reducedMotion ? 0 : undefined,
  };
}
