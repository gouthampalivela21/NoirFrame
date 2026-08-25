import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades + lifts every element matching `selector` inside `scope` as it
 * enters the viewport. Uses a single ScrollTrigger.batch instead of one
 * trigger per element — cheap even on sections with many cards.
 * Returns the batch's triggers so callers can clean them up on unmount.
 */
export function initScrollReveals(scope, selector = ".reveal") {
  if (!scope) return [];
  const elements = scope.querySelectorAll(selector);
  if (!elements.length) return [];

  gsap.set(elements, { autoAlpha: 0, y: 30 });

  return ScrollTrigger.batch(elements, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power2.out",
        stagger: 0.06,
        overwrite: true,
      }),
  });
}

/**
 * Subtle vertical drift for elements carrying a data-speed attribute
 * (e.g. images), used sparingly for depth rather than decoration.
 */
export function initParallax(scope, selector = "[data-speed]") {
  const elements = scope.querySelectorAll(selector);
  const triggers = [];

  elements.forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.15");
    const tween = gsap.fromTo(
      el,
      { yPercent: -speed * 40 },
      {
        yPercent: speed * 40,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
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
