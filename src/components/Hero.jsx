import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SmartImage from "./SmartImage.jsx";
import { scrollToId, prefersReducedMotion } from "../utils/helpers.js";
import { initParallax, killTriggers } from "../animations/scrollAnimations.js";
import { attachMagnetic } from "../animations/hoverAnimations.js";
import { useData } from "../context/DataContext.jsx";
import { EASE_APPLE, EASE_APPLE_SOFT } from "../animations/pageTransitions.js";

export default function Hero() {
  const sectionRef = useRef(null);
  const btn1Ref = useRef(null);
  const btn2Ref = useRef(null);
  const { siteSettings } = useData();
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const triggers = initParallax(sectionRef.current);
    const cleanBtn1 = attachMagnetic(btn1Ref.current, 0.15);
    const cleanBtn2 = attachMagnetic(btn2Ref.current, 0.15);
    return () => {
      killTriggers(triggers);
      cleanBtn1();
      cleanBtn2();
    };
  }, [reducedMotion]);

  const {
    eyebrow = "",
    heroTitle = "",
    heroSubtitle = "",
    heroBadge = "",
    heroImage = "noir-hero-main",
    heroAction1 = "Selected Work ↓",
    heroAction2 = "Moments in Motion",
    heroStats = [],
  } = siteSettings || {};

  const transitionConfig = (delay, duration = 0.65) => ({
    duration: reducedMotion ? 0.01 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE_APPLE,
  });

  return (
    <section className="hero-split" id="hero" ref={sectionRef}>
      <div className="hero-split__inner container-max">
        {/* Left Column: Typography & Studio Narrative (Staggered Cinematic Reveal) */}
        <div className="hero-split__content">
          <motion.span
            className="eyebrow hero-split__eyebrow"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig(0.08, 0.55)}
          >
            {eyebrow}
          </motion.span>

          <motion.h1
            className="display-1 hero-split__title"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig(0.16, 0.65)}
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            className="body-lg hero-split__subtitle"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig(0.28, 0.6)}
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            className="hero-split__actions"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig(0.38, 0.5)}
          >
            <button
              ref={btn1Ref}
              className="btn btn-primary"
              data-cursor="button"
              onClick={() => scrollToId("portfolio")}
            >
              {heroAction1}
            </button>
            <button
              ref={btn2Ref}
              className="btn btn-ghost"
              data-cursor="button"
              onClick={() => scrollToId("gallery")}
            >
              {heroAction2}
            </button>
          </motion.div>

          <motion.div
            className="hero-split__stats"
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig(0.48, 0.5)}
          >
            {heroStats.map((st, i) => (
              <div key={i} className="hero-split__stat">
                <span className="hero-split__stat-num">{st.num}</span>
                <span className="hero-split__stat-label label-sm">{st.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Featured Visual Archive Frame */}
        <div className="hero-split__visual">
          <motion.div
            className="hero-split__frame"
            data-cursor="view"
            onClick={() => scrollToId("portfolio")}
            initial={reducedMotion ? false : { opacity: 0.96, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitionConfig(0.05, 1.0)}
          >
            <SmartImage
              seed={heroImage}
              aspect={4 / 5}
              widths={[600, 1000, 1400]}
              sizes="(max-width: 900px) 100vw, 48vw"
              alt={`${heroTitle} Archival Photography`}
              className="hero-split__image"
              priority
            />
            <motion.div
              className="hero-split__badge label-sm"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transitionConfig(0.42, 0.5)}
            >
              {heroBadge}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
