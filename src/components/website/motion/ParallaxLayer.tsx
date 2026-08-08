'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMotionSafe } from './useMotionSafe';

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  /** 0 = static, 0.15 = subtle, 0.25 = moderate */
  speed?: number;
  disabled?: boolean;
};

export default function ParallaxLayer({
  children,
  className,
  speed = 0.15,
  disabled = false,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = disabled || reducedMotion ? 0 : speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`]);

  return (
    <div ref={ref} className={className} data-cr-motion="parallax">
      <motion.div style={{ y, willChange: range > 0 ? 'transform' : undefined }}>
        {children}
      </motion.div>
    </div>
  );
}
