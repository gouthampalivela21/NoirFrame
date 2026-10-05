import { gsap } from "gsap";
import { prefersReducedMotion } from "../utils/helpers.js";

/**
 * Apple-style subtle magnetic button interaction:
 * Follows the cursor by a tiny fraction, then smoothly springs back.
 */
export function attachMagnetic(el, strength = 0.15) {
  if (
    !el ||
    prefersReducedMotion() ||
    (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)
  ) {
    return () => {};
  }

  const handleMove = (e) => {
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: relX * strength,
      y: relY * strength,
      duration: 0.45,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  el.addEventListener("mousemove", handleMove);
  el.addEventListener("mouseleave", handleLeave);

  return () => {
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
  };
}

/**
 * Restrained, elegant image zoom on hover (1.025x max, silky 0.7s easing).
 */
export function imageHoverZoom(imgEl, active) {
  if (
    !imgEl ||
    prefersReducedMotion() ||
    (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)
  ) {
    return;
  }
  gsap.to(imgEl, {
    scale: active ? 1.025 : 1,
    duration: 0.7,
    ease: "power3.out",
  });
}
