import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

const SHOWCASE_TILES = [
  {
    id: "portraits",
    title: "Portraits.",
    tagline: "Timeless, Personal, You.",
    primaryLabel: "Explore",
    primaryTo: "/explore/portraits",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=portraits",
    theme: "light",
    layout: "stacked",
    imageBase: "/images/tiles/tile-portraits",
    alt: "Fine-art editorial studio portrait of an Indian woman looking back over her shoulder",
  },
  {
    id: "couples",
    title: "Couples.",
    tagline: "Stories of Two.",
    primaryLabel: "Explore",
    primaryTo: "/explore/couples",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=couples",
    theme: "light",
    layout: "stacked",
    imageBase: "/images/tiles/tile-couples",
    alt: "Intimate golden-hour couple portrait with warm backlit sunset rim light",
  },
  {
    id: "events",
    title: "Events.",
    tagline: "Moments. People. Celebrations.",
    primaryLabel: "Explore",
    primaryTo: "/explore/events",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=events",
    theme: "dark",
    layout: "stacked",
    imageBase: "/images/tiles/tile-events",
    alt: "Luxury evening outdoor celebration pavilion glowing with floral garlands and crystal chandeliers",
  },
  {
    id: "brands",
    title: "Brands.",
    tagline: "Visuals for Modern Brands.",
    primaryLabel: "Explore",
    primaryTo: "/explore/brands",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=brands",
    theme: "dark",
    layout: "stacked",
    imageBase: "/images/tiles/tile-brands",
    alt: "Luxury amber glass fragrance flacon perched on dark volcanic stone in studio lighting",
  },
  {
    id: "editorial",
    title: "Editorial.",
    tagline: "Art. Fashion. Expression.",
    primaryLabel: "Explore",
    primaryTo: "/explore/editorial",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=editorial",
    theme: "light",
    layout: "split",
    imageBase: "/images/tiles/tile-editorial",
    mobileImageBase: "/images/tiles/tile-editorial-mobile",
    alt: "Monochrome high-fashion editorial portrait in a tailored black architectural blazer",
  },
  {
    id: "commercial",
    title: "Commercial.",
    tagline: "Creative Assets that Sell.",
    primaryLabel: "Explore",
    primaryTo: "/explore/commercial",
    secondaryLabel: "Book Now",
    secondaryTo: "/book?category=commercial",
    theme: "light",
    layout: "split",
    imageBase: "/images/tiles/tile-commercial",
    mobileImageBase: "/images/tiles/tile-commercial-mobile",
    alt: "Sculptural matte-black studio headphones photographed on a clean off-white sweep",
  },
];

export default function Services() {
  const isReduced = prefersReducedMotion();

  return (
    <section
      className="promo-grid-section"
      id="services"
      aria-label="Phantom Labs — Photography Showcase Categories"
    >
      <div className="promo-grid">
        {SHOWCASE_TILES.map((tile, idx) => (
          <motion.article
            key={tile.id}
            className={`promo-tile promo-tile--${tile.theme} promo-tile--${tile.layout}`}
            initial={isReduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{
              duration: 0.72,
              delay: (idx % 2) * 0.06,
              ease: APPLE_EASE,
            }}
          >
            <picture className="promo-tile__picture">
              {tile.mobileImageBase && (
                <>
                  <source
                    media="(max-width: 679px)"
                    type="image/webp"
                    srcSet={`${tile.mobileImageBase}.webp`}
                    width="800"
                    height="520"
                  />
                  <source
                    media="(max-width: 679px)"
                    srcSet={`${tile.mobileImageBase}.jpg`}
                    width="800"
                    height="520"
                  />
                </>
              )}
              <source
                type="image/webp"
                srcSet={`${tile.imageBase}-800.webp 800w, ${tile.imageBase}.webp 1200w`}
                sizes="(max-width: 679px) 96vw, 49vw"
              />
              <img
                src={`${tile.imageBase}.jpg`}
                srcSet={`${tile.imageBase}-800.jpg 800w, ${tile.imageBase}.jpg 1200w`}
                sizes="(max-width: 679px) 96vw, 49vw"
                alt={tile.alt}
                className="promo-tile__img"
                width="1200"
                height="750"
                loading="lazy"
                decoding="async"
              />
            </picture>

            <hgroup className="promo-tile__header">
              <h2 className="promo-tile__title">{tile.title}</h2>
              <p className="promo-tile__tagline">{tile.tagline}</p>
            </hgroup>

            <footer className="promo-tile__actions">
              <Link
                to={tile.primaryTo}
                className="promo-tile__btn promo-tile__btn--primary promo-tile__primary-link"
                data-cursor="pointer"
              >
                {tile.primaryLabel}
              </Link>
              <Link
                to={tile.secondaryTo}
                className="promo-tile__btn promo-tile__btn--secondary"
                data-cursor="pointer"
              >
                {tile.secondaryLabel}
                <span className="visually-hidden"> {tile.title.replace(".", "")}</span>
              </Link>
            </footer>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
