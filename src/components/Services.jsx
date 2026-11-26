import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { optimizedImageSrc } from "../utils/optimizedImageSrc.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function Services() {
  const isReduced = prefersReducedMotion();
  const { home, stories } = useLiveCms();
  const categories = Array.isArray(home?.categories) ? home.categories : [];

  const getCategoryStory = (tile) => (stories || []).find((story) =>
    story.id?.toLowerCase() === tile.id?.toLowerCase() ||
    story.category?.toLowerCase() === tile.title?.replace(/[.]$/, "").toLowerCase()
  );

  const getCategoryImages = (tile) => {
    const story = getCategoryStory(tile);
    const candidates = [
      { src: tile.image || (tile.imageBase ? `${tile.imageBase}.jpg` : null), alt: tile.alt || tile.title },
      story?.leadImage && { src: story.leadImage.src, alt: story.leadImage.alt || tile.title },
      story?.subject?.image && { src: story.subject.image.src, alt: story.subject.image.alt || tile.title },
      ...(story?.moments?.diptych || []).map((image) => ({ src: image.src, alt: image.alt || tile.title })),
      story?.final?.image && { src: story.final.image.src, alt: story.final.image.alt || tile.title },
    ].filter((image) => image?.src);
    const seen = new Set();
    const unique = candidates.filter((image) => {
      if (seen.has(image.src)) return false;
      seen.add(image.src);
      return true;
    });
    const fallbackImage = unique[0];
    while (fallbackImage && unique.length < 4) unique.push(fallbackImage);
    return unique.slice(0, 4).map((image) => ({ ...image, src: optimizedImageSrc(image.src) }));
  };

  return (
    <section
      className="promo-grid-section promo-editorial-section"
      id="services"
      aria-label="Phantom Labs — Photography Showcase Categories"
    >
      <header className="promo-editorial-masthead">
        <span>Phantom Labs</span>
        <span>Photography · Portraiture · Image Making</span>
        <span>The Collection / {String(categories.length).padStart(2, "0")}</span>
      </header>
      <div className="promo-grid promo-editorial-list">
        {categories.map((tile, idx) => {
          const imageSrc = optimizedImageSrc(tile.image || (tile.imageBase ? `${tile.imageBase}.jpg` : "/images/hero-villa-wide.jpg"));
          const mobileSrc = optimizedImageSrc(tile.mobileImage || (tile.mobileImageBase ? `${tile.mobileImageBase}.jpg` : null));
          const categoryHref = tile.primaryTo || `/explore/${tile.id}`;
          const collectionImages = getCategoryImages(tile);
          const isFeatureSpread = idx % 2 === 0;

          return (
            <motion.article
              key={tile.id || idx}
              className={`promo-tile promo-editorial-tile ${isFeatureSpread ? "promo-editorial-tile--feature" : "promo-editorial-tile--collection"} promo-tile--${tile.id || idx}`}
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
              {isFeatureSpread ? (
                <>
                  <Link to={categoryHref} className="promo-editorial-feature-image" aria-label={`Explore ${tile.title}`}>
                    {mobileSrc ? (
                      <picture>
                        <source media="(max-width: 679px)" srcSet={mobileSrc} />
                        <img src={imageSrc} alt={tile.alt || tile.title} width="1200" height="1500" loading="lazy" decoding="async" />
                      </picture>
                    ) : (
                      <img src={imageSrc} alt={tile.alt || tile.title} width="1200" height="1500" loading="lazy" decoding="async" />
                    )}
                  </Link>
                  <div className="promo-editorial-feature-copy">
                    <span className="promo-editorial-brand">Phantom Labs</span>
                    <span className="promo-editorial-kicker">An image story · No. {String(idx + 1).padStart(2, "0")}</span>
                    <h2><Link to={categoryHref}>{tile.title}</Link></h2>
                    <p>{tile.tagline}</p>
                    <span className="promo-editorial-page-number">{String(idx + 1).padStart(2, "0")} <i>—</i> {String(categories.length).padStart(2, "0")}</span>
                    <footer className="promo-editorial-actions">
                      <Link to={categoryHref} className="promo-editorial-explore">{tile.primaryLabel || "Explore"} <span aria-hidden="true">↗</span></Link>
                      <Link to={tile.secondaryTo || `/book?category=${tile.id}`} className="promo-editorial-book">{tile.secondaryLabel || "Book Now"}</Link>
                    </footer>
                  </div>
                </>
              ) : (
                <>
                  <header className="promo-editorial-collection-heading">
                    <div>
                      <span className="promo-editorial-kicker">The portrait collection · No. {String(idx + 1).padStart(2, "0")}</span>
                      <h2><Link to={categoryHref}>{tile.title}</Link></h2>
                    </div>
                    <span className="promo-editorial-collection-subtitle">{tile.tagline}</span>
                  </header>
                  <div className="promo-editorial-photo-grid">
                    {collectionImages.map((image, imageIndex) => (
                      <Link
                        key={`${image.src}-${imageIndex}`}
                        to={categoryHref}
                        className={`promo-editorial-photo promo-editorial-photo--${imageIndex + 1}`}
                        aria-label={`Explore ${tile.title}`}
                      >
                        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                        <span>{String(idx + 1).padStart(2, "0")} / {String(imageIndex + 1).padStart(2, "0")}</span>
                      </Link>
                    ))}
                  </div>
                  <footer className="promo-editorial-collection-footer">
                    <span>Phantom Labs · {tile.title.replace(/[.]$/, "")}</span>
                    <Link to={categoryHref}>{tile.primaryLabel || "Explore"} <span aria-hidden="true">↗</span></Link>
                    <Link to={tile.secondaryTo || `/book?category=${tile.id}`}>{tile.secondaryLabel || "Book Now"}</Link>
                  </footer>
                </>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
