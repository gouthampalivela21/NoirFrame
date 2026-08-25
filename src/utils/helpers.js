export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (start, end, t) => start + (end - start) * t;

export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
};

export const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const debounce = (fn, wait = 150) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

export const isLowPowerDevice = () => {
  if (typeof navigator === "undefined") return false;
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  return isTouchDevice() && (lowCores || lowMemory);
};

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -80, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
