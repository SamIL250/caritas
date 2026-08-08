'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import {
  instantVariants,
  MOTION_VIEWPORT,
  staggerContainerVariants,
  staggerItemVariants,
} from './motion-presets';
import { useMotionSafe } from './useMotionSafe';

type ScrollStaggerProps = HTMLMotionProps<'div'> & {
  disabled?: boolean;
};

export function ScrollStagger({
  children,
  className,
  disabled = false,
  ...rest
}: ScrollStaggerProps) {
  const { reducedMotion } = useMotionSafe();
  const variants =
    disabled || reducedMotion ? instantVariants : staggerContainerVariants;

  return (
    <motion.div
      data-cr-motion="stagger"
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={MOTION_VIEWPORT}
      variants={variants}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type ScrollStaggerItemProps = HTMLMotionProps<'div'> & {
  disabled?: boolean;
};

export function ScrollStaggerItem({
  children,
  className,
  disabled = false,
  ...rest
}: ScrollStaggerItemProps) {
  const { reducedMotion } = useMotionSafe();
  const variants =
    disabled || reducedMotion ? instantVariants : staggerItemVariants;

  return (
    <motion.div className={className} variants={variants} data-cr-motion="stagger-item" {...rest}>
      {children}
    </motion.div>
  );
}
