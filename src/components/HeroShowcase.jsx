import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function HeroShowcase() {
  const isReduced = prefersReducedMotion();

  return (
    <section
      className="hero-showcase"
      id="hero"
      aria-label="Phantom Labs — Photography Showcase"
    >
      {/* Full-Viewport Edge-to-Edge Sunset Villa & Mountain Architectural Canvas */}
      <motion.div
        className="hero-showcase__media-wrap"
        initial={isReduced ? false : { opacity: 0, scale: 1.018 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.05, ease: APPLE_EASE }}
      >
        <picture className="hero-showcase__picture">
          <source
            media="(max-aspect-ratio: 1/1)"
            type="image/webp"
            srcSet="/images/hero-villa-mobile.webp"
            width="768"
            height="1376"
          />
          <source
            media="(max-aspect-ratio: 1/1)"
            srcSet="/images/hero-villa-mobile.jpg"
            width="768"
            height="1376"
          />
          <source
            type="image/webp"
            srcSet="/images/hero-villa-wide.webp"
            width="1376"
            height="768"
          />
          <img
            src="/images/hero-villa-wide.jpg"
            alt="Modern glass-and-concrete luxury villa overlooking misty mountains and an infinity pool at sunset, photographed by Phantom Labs"
            className="hero-showcase__image"
            width="1376"
            height="768"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </picture>

        {/* Subtle left atmospheric scrim to guarantee white typography readability */}
        <div className="hero-showcase__scrim" aria-hidden="true" />
      </motion.div>

      {/* Typography positioned naturally within unoccupied negative space */}
      <div className="hero-showcase__copy-layer">
        <motion.div
          className="hero-showcase__copy-block"
          initial={isReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.22, ease: APPLE_EASE }}
        >
          <h1 className="hero-showcase__title">PHANTOM LABS</h1>
          <p className="hero-showcase__tagline">
            Photography. Framed Differently.
          </p>
          <Link
            to="/work"
            className="hero-showcase__cta"
            data-cursor="pointer"
          >
            <span>Explore Our Work</span>
            <span className="hero-showcase__cta-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
