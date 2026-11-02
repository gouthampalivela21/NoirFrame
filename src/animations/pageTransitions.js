/**
 * Apple-Inspired Shared Motion Curves & Page Transitions for Phantom Labs
 * - Physical, continuous, predictable, silky-smooth motion
 * - Zero layout thrashing, 60fps GPU acceleration
 * - Strict prefers-reduced-motion compliance
 */

export const EASE_APPLE = [0.22, 1, 0.36, 1];
export const EASE_APPLE_SOFT = [0.25, 0.46, 0.45, 0.94];
export const EASE_APPLE_OUT = [0.22, 1, 0.36, 1];

/**
 * Simple, Elegant Route Fade Transition
 * 1. Current page fades out gently (200ms).
 * 2. New destination page appears with a smooth fade-in (280ms).
 * 3. Restrained duration (200–280ms) and natural cinematic easing.
 */
export const routeTransition = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: EASE_APPLE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: EASE_APPLE_SOFT,
    },
  },
};

export const reducedMotionTransition = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0 } },
  exit: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease: EASE_APPLE_SOFT },
  },
};

export const fade = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_APPLE },
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
    transition: { duration: 0.45, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0.96,
    scale: 0.99,
    transition: { duration: 0.2, ease: EASE_APPLE_SOFT },
  },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.32, ease: EASE_APPLE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: EASE_APPLE_SOFT },
  },
};

export const modalContentVariants = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: EASE_APPLE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: {
      duration: 0.22,
      ease: EASE_APPLE_SOFT,
    },
  },
};
