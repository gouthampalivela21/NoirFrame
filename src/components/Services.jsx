import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { optimizedImageSrc } from "../utils/optimizedImageSrc.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function Services() {
  const isReduced = prefersReducedMotion();
  const { home } = useLiveCms();
  const categories = Array.isArray(home?.categories) ? home.categories : [];

  return (
    <section
      className="promo-grid-section"
      id="services"
      aria-label="Phantom Labs — Photography Showcase Categories"
    >
      <div className="promo-grid">
        {categories.map((tile, idx) => {
          const imageSrc = optimizedImageSrc(tile.image || (tile.imageBase ? `${tile.imageBase}.jpg` : "/images/hero-villa-wide.jpg"));
          const mobileSrc = optimizedImageSrc(tile.mobileImage || (tile.mobileImageBase ? `${tile.mobileImageBase}.jpg` : null));

          return (
            <motion.article
              key={tile.id || idx}
              className={`promo-tile promo-tile--${tile.id || idx} promo-tile--${tile.theme || "light"} promo-tile--${tile.layout || "stacked"}`}
              data-category={tile.id}
              initial={isReduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{
                duration: 0.72,
                delay: (idx % 2) * 0.06,
                ease: APPLE_EASE,
              }}
            >
              <div className="promo-tile__picture">
                {mobileSrc ? (
                  <picture>
                    <source media="(max-width: 679px)" srcSet={mobileSrc} />
                    <img
                      src={imageSrc}
                      alt={tile.alt || tile.title}
                      className="promo-tile__img"
                      width="1200"
                      height="750"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                ) : (
                  <img
                    src={imageSrc}
                    alt={tile.alt || tile.title}
                    className="promo-tile__img"
                    width="1200"
                    height="750"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>

              <div className="promo-tile__copy" style={{ "--tile-text-x": `${tile.textPosition?.x ?? 50}%`, "--tile-text-y": `${tile.textPosition?.y ?? 16}%` }}>
                <hgroup className="promo-tile__header">
                  <h2 className="promo-tile__title">{tile.title}</h2>
                  <p className="promo-tile__tagline">{tile.tagline}</p>
                </hgroup>

                <footer className="promo-tile__actions">
                  <Link
                    to={tile.primaryTo || `/explore/${tile.id}`}
                    className="promo-tile__btn promo-tile__btn--primary promo-tile__primary-link"
                    data-cursor="pointer"
                  >
                    {tile.primaryLabel || "Explore"}
                  </Link>
                  <Link
                    to={tile.secondaryTo || `/book?category=${tile.id}`}
                    className="promo-tile__btn promo-tile__btn--secondary"
                    data-cursor="pointer"
                  >
                    {tile.secondaryLabel || "Book Now"}
                    <span className="visually-hidden"> {tile.title ? tile.title.replace(".", "") : ""}</span>
                  </Link>
                </footer>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
