/**
 * Apple-Inspired Shared Motion Curves & Page Transitions for Noir Frame
 * - Physical, continuous, predictable, silky-smooth motion
 * - Zero layout thrashing, 60fps GPU acceleration
 */

export const EASE_APPLE = [0.22, 1, 0.36, 1];
export const EASE_APPLE_SOFT = [0.25, 0.46, 0.45, 0.94];
export const EASE_APPLE_OUT = [0.22, 1, 0.36, 1];

export const routeTransition = {
  initial: {
    opacity: 0.98,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: EASE_APPLE,
    },
  },
  exit: {
    opacity: 0.98,
    y: -4,
    transition: {
      duration: 0.2,
      ease: EASE_APPLE_SOFT,
    },
  },
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: EASE_APPLE_SOFT },
  },
};

export const fade = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.45, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: EASE_APPLE_SOFT },
  },
};

export const fadeScale = {
  initial: { opacity: 0.96, scale: 0.99 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0.96,
    scale: 0.99,
    transition: { duration: 0.22, ease: EASE_APPLE_SOFT },
  },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const staggerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.02,
    },
  },
};

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.35, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: EASE_APPLE_SOFT },
  },
};

export const modalContentVariants = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE_APPLE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: {
      duration: 0.25,
      ease: EASE_APPLE_SOFT,
    },
  },
};
