import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/helpers.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * Apple-Inspired Subtle Scroll-Triggered Reveals:
 * - Natural entrance (opacity: 0.01 -> 1, y: 20px -> 0)
 * - Gentle stagger between child elements (0.05–0.08s)
 * - Batch processing for 60fps GPU acceleration
 */
export function initScrollReveals(scope, selector = ".reveal") {
  if (!scope) return [];
  if (prefersReducedMotion()) {
    const elements = scope.querySelectorAll(selector);
    gsap.set(elements, { autoAlpha: 1, y: 0 });
    return [];
  }

  const elements = scope.querySelectorAll(selector);
  if (!elements.length) return [];

  gsap.set(elements, { autoAlpha: 0.01, y: 20 });

  return ScrollTrigger.batch(elements, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.06,
        overwrite: true,
      }),
  });
}

/**
 * Subtle Parallax for images & background frames:
 * - Barely noticeable, cinematic micro-drift on scroll (max ~12-16px)
 * - Disabled automatically on touch/mobile devices to maintain 60 FPS
 */
export function initParallax(scope, selector = "[data-speed]") {
  if (!scope || prefersReducedMotion() || (typeof window !== "undefined" && window.innerWidth <= 768)) {
    return [];
  }

  const elements = scope.querySelectorAll(selector);
  const triggers = [];

  elements.forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.08");
    const tween = gsap.fromTo(
      el,
      { yPercent: -speed * 12 },
      {
        yPercent: speed * 12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      }
    );
    triggers.push(tween.scrollTrigger);
  });

  return triggers;
}

export function killTriggers(triggers = []) {
  triggers.forEach((t) => t && t.kill());
}
