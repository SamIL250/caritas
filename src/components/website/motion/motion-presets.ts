import type { Transition, Variants, ViewportOptions } from 'framer-motion';

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION_DURATION = {
  reveal: 0.62,
  stagger: 0.1,
  parallax: 0,
} as const;

export const MOTION_DISTANCE = {
  yMobile: 24,
  yDesktop: 32,
  x: 24,
} as const;

export const MOTION_VIEWPORT: ViewportOptions = {
  once: true,
  margin: '-10%',
  amount: 0.2,
};

export const revealTransition = (delay = 0): Transition => ({
  duration: MOTION_DURATION.reveal,
  ease: MOTION_EASE,
  delay,
});

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: MOTION_DISTANCE.yDesktop },
  visible: { opacity: 1, y: 0 },
};

export const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: MOTION_DISTANCE.x },
  visible: { opacity: 1, x: 0 },
};

export const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -MOTION_DISTANCE.x },
  visible: { opacity: 1, x: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: MOTION_DURATION.stagger,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: MOTION_DISTANCE.yDesktop },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.reveal,
      ease: MOTION_EASE,
    },
  },
};

export const instantVariants: Variants = {
  hidden: { opacity: 1, y: 0, x: 0, scale: 1 },
  visible: { opacity: 1, y: 0, x: 0, scale: 1 },
};
