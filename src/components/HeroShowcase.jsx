import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { optimizedImageSrc } from "../utils/optimizedImageSrc.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function HeroShowcase() {
  const isReduced = prefersReducedMotion();
  const { home, isLoading } = useLiveCms();
  const hero = home.hero || {};

  const heroWide = optimizedImageSrc(hero.heroImageWide || hero.bannerImage || "/images/hero-villa-wide.jpg");
  const heroMobile = optimizedImageSrc(hero.heroImageMobile || hero.bannerImage || "/images/hero-villa-mobile.jpg");
  const headline = hero.headline || "PHANTOM LABS";
  const subheadline = hero.subheadline || "Photography. Framed Differently.";
  const ctaTo = hero.secondaryButtonLink || "/stories";
  const ctaLabel = hero.secondaryButtonText || "Explore Our Work";
  const altText = hero.altText || "Architectural landscape and photography showcase by Phantom Labs";

  return (
    <section
      className="hero-showcase"
      id="hero"
      aria-label="Phantom Labs — Photography Showcase"
    >
      {/* Full-Viewport Photographic Architectural Canvas */}
      <motion.div
        className="hero-showcase__media-wrap"
        initial={isReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: APPLE_EASE }}
      >
        <picture className="hero-showcase__picture">
          <source
            media="(max-aspect-ratio: 1/1)"
            srcSet={heroMobile}
            width="768"
            height="1376"
          />
          <source
            media="(min-aspect-ratio: 1/1)"
            srcSet={heroWide}
            width="1376"
            height="768"
          />
          <img
            src={heroWide}
            alt={altText}
            className="hero-showcase__image"
            width="1376"
            height="768"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>

        {/* Subtle atmospheric scrim */}
        <div className="hero-showcase__scrim" aria-hidden="true" />
      </motion.div>

      {/* Typography positioned within unoccupied negative space */}
      <div className="hero-showcase__copy-layer">
        <motion.div
          className="hero-showcase__copy-block"
          initial={isReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.22, ease: APPLE_EASE }}
        >
          <h1 className="hero-showcase__title">{headline}</h1>
          <p className="hero-showcase__tagline">{subheadline}</p>
          <Link
            to={ctaTo}
            className="hero-showcase__cta"
            data-cursor="pointer"
          >
            <span>{ctaLabel}</span>
            <span className="hero-showcase__cta-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
