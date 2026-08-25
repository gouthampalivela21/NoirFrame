/** Shared Framer Motion variants for cinematic, low-key transitions. */

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

export const routeTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export const viewerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};
