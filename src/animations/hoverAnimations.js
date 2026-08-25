import { gsap } from "gsap";

/**
 * A restrained magnetic-button effect: the element follows the
 * pointer within its own bounds by a small fraction, then eases home.
 */
export function attachMagnetic(el, strength = 0.25) {
  if (!el) return () => {};

  const handleMove = (e) => {
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: relX * strength,
      y: relY * strength,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const handleLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  el.addEventListener("mousemove", handleMove);
  el.addEventListener("mouseleave", handleLeave);

  return () => {
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
  };
}

/** Slow, deliberate zoom used on portfolio / service imagery on hover. */
export function imageHoverZoom(imgEl, active) {
  if (!imgEl) return;
  gsap.to(imgEl, {
    scale: active ? 1.06 : 1,
    duration: 1.1,
    ease: "power3.out",
  });
}
