import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { useLiveCms } from "../context/LiveCmsContext.jsx";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function WebsitesShowcase() {
  const isReduced = prefersReducedMotion();
  const { home } = useLiveCms();
  const website = home.websiteSection || {};

  const title = website.title || "Website.";
  const subtitle = website.subtitle || "A better way to experience the web.";
  const imageDesktop = website.imageDesktop || "/images/websites-showcase-desktop.jpg";
  const imageMobile = website.imageMobile || "/images/websites-showcase-mobile.jpg";
  const ctaLink = website.ctaLink || "/experiences/website-design";

  return (
    <section
      className="websites-showcase"
      id="websites"
      aria-label="Phantom Labs — Website Showcase"
    >
      {/* Centered Heading & Tagline in Pure Black Studio Negative Space */}
      <motion.div
        className="websites-showcase__copy"
        initial={isReduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.85, ease: APPLE_EASE }}
      >
        <h2 className="websites-showcase__title">{title}</h2>
        <p className="websites-showcase__subtitle">{subtitle}</p>
      </motion.div>

      {/* Clean 2D Laptop Showcase */}
      <motion.div
        className="websites-showcase__visual-wrap"
        initial={isReduced ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.9, delay: 0.06, ease: APPLE_EASE }}
      >
        <Link
          to={ctaLink}
          className="websites-showcase__interactive-link"
          aria-label="Explore Website Design Experience"
        >
          <div className="websites-showcase__stage">
            <picture className="websites-showcase__picture">
              <source
                media="(max-width: 768px)"
                srcSet={imageMobile}
              />
              <img
                src={imageDesktop}
                alt="Studio laptop displaying the Velora Architecture luxury modern residence website"
                className="websites-showcase__image"
                width="1056"
                height="616"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
