'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import {
  fadeLeftVariants,
  fadeRightVariants,
  fadeUpVariants,
  instantVariants,
  MOTION_VIEWPORT,
  revealTransition,
  scaleInVariants,
} from './motion-presets';
import { useMotionSafe } from './useMotionSafe';

type RevealDirection = 'up' | 'left' | 'right' | 'scale';

const directionVariants = {
  up: fadeUpVariants,
  left: fadeLeftVariants,
  right: fadeRightVariants,
  scale: scaleInVariants,
} as const;

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  direction?: RevealDirection;
  delay?: number;
  disabled?: boolean;
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  disabled = false,
  className,
  ...rest
}: ScrollRevealProps) {
  const { reducedMotion } = useMotionSafe();
  const variants =
    disabled || reducedMotion ? instantVariants : directionVariants[direction];

  return (
    <motion.div
      data-cr-motion="reveal"
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={MOTION_VIEWPORT}
      variants={variants}
      transition={revealTransition(delay)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
