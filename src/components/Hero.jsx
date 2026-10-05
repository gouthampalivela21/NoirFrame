import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SmartImage from "./SmartImage.jsx";
import { scrollToId, prefersReducedMotion } from "../utils/helpers.js";
import { initParallax, killTriggers } from "../animations/scrollAnimations.js";
import { attachMagnetic } from "../animations/hoverAnimations.js";

const EASE_CINEMA = [0.22, 1, 0.36, 1];

export default function Hero() {
  const sectionRef = useRef(null);
  const btn1Ref = useRef(null);
  const btn2Ref = useRef(null);
  const imageFrameRef = useRef(null);

  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;

    const triggers = initParallax(sectionRef.current, "[data-speed]");
    const cleanBtn1 = attachMagnetic(btn1Ref.current, 0.08);
    const cleanBtn2 = attachMagnetic(btn2Ref.current, 0.08);

    return () => {
      killTriggers(triggers);
      cleanBtn1();
      cleanBtn2();
    };
  }, [reducedMotion]);

  return (
    <section className="section hero-startup" id="hero" ref={sectionRef}>
      <div className="container-max hero-startup__grid">
        {/* Left Column: Typography & Staggered Cinematic Sequence */}
        <div className="hero-startup__content">
          {/* 1. Eyebrow */}
          <motion.div
            className="hero-startup__eyebrow"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_CINEMA }}
          >
            <span className="hero-startup__eyebrow-dot" />
            <span className="eyebrow">CREATIVE STUDIO / COMMISSIONS OPEN</span>
          </motion.div>

          {/* 2. Main Brand Title (Line-by-line rise) */}
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              className="display-1 hero-startup__title"
              initial={reducedMotion ? false : { y: "105%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.18, ease: EASE_CINEMA }}
            >
              NOIR FRAME
            </motion.h1>
          </div>

          {/* 3. Headline */}
          <div style={{ overflow: "hidden" }}>
            <motion.h2
              className="hero-startup__headline font-serif-italic"
              initial={reducedMotion ? false : { y: "105%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.28, ease: EASE_CINEMA }}
            >
              Visual stories, framed differently.
            </motion.h2>
          </div>

          {/* 4. Subtitle narrative */}
          <motion.p
            className="body-lg hero-startup__subtitle"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.38, ease: EASE_CINEMA }}
          >
            A visual studio dedicated to cinematic photography, unhurried observation,
            and frames that stand the test of time.
          </motion.p>

          {/* 5. CTAs with micro-interactions */}
          <motion.div
            className="hero-startup__actions"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.48, ease: EASE_CINEMA }}
          >
            <button
              ref={btn1Ref}
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToId("beginning")}
            >
              <span>Explore Collection</span>
              <span className="btn-arrow">&rarr;</span>
            </button>
            <button
              ref={btn2Ref}
              type="button"
              className="btn btn-secondary"
              onClick={() => scrollToId("contact")}
            >
              <span>Commission an Inquiry</span>
              <span className="btn-arrow">&rarr;</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Hero Visual Frame with Mask Reveal & Subtle Parallax */}
        <div
          ref={imageFrameRef}
          className="hero-startup__visual-frame"
          data-speed="0.04"
        >
          <motion.div
            className="hero-startup__image-wrapper"
            initial={
              reducedMotion
                ? false
                : { clipPath: "inset(0 0 100% 0)", scale: 1.05, opacity: 0.85 }
            }
            animate={{ clipPath: "inset(0 0 0% 0)", scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.22, ease: EASE_CINEMA }}
          >
            <SmartImage
              seed="noir-hero-main"
              aspect={4 / 5}
              widths={[600, 1000, 1400]}
              sizes="(max-width: 1024px) 100vw, 500px"
              alt="Noir Frame Visual Study Composition"
              priority
            />
            <div className="hero-startup__placeholder-watermark">
              <span>SERIES 01 &mdash; THE MONOCHROME STUDY</span>
              <span>ARCHIVE &bull; 2026</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

