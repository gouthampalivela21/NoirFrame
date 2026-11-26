import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { EDITORIAL_STORIES } from "../data/editorialStories.js";
import "../styles/editorialMagazine.css";

const APPLE_EASE = [0.22, 1, 0.36, 1];

const conciseCopy = (value, limit = 36) => {
  if (typeof value !== "string") return "";
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return value;
  return `${words.slice(0, limit).join(" ").replace(/[,:;.!?]+$/, "")}…`;
};

const getFadeUpMotion = (isReduced, delay = 0, distance = 16) => ({
  initial: isReduced ? false : { opacity: 0, y: distance },
  whileInView: isReduced ? undefined : { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.12, margin: "0px 0px -28px 0px" },
  transition: {
    duration: isReduced ? 0 : 0.65,
    delay: isReduced ? 0 : delay,
    ease: APPLE_EASE,
  },
});

export default function EditorialFeaturePage({ categoryOverride }) {
  const { category: paramCategory } = useParams();
  const categoryKey = categoryOverride || paramCategory || "portraits";
  const { getStoryById } = useLiveCms();

  const liveStory = getStoryById(categoryKey);
  const story = liveStory || EDITORIAL_STORIES[categoryKey] || EDITORIAL_STORIES.portraits;

  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    setIsReduced(prefersReducedMotion());
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = (e) => setIsReduced(e.matches);
      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }
    }
  }, []);

  useEffect(() => {
    if (story) {
      document.title = `${story.category || "Story"}: ${story.headline || "Field Notes"} — Phantom Labs`;
    }
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [story]);

  if (!story) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7ede0", padding: "120px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "serif", fontSize: "32px", color: "#111" }}>Story Not Found</h1>
        <Link to="/stories" style={{ color: "#777", textDecoration: "underline", marginTop: "16px", display: "inline-block" }}>
          ← Back to Stories
        </Link>
      </div>
    );
  }

  const subject = story.subject || {};
  const moments = story.moments || {};
  const finalSec = story.final || {};
  const storyIndex = Math.max(0, Object.keys(EDITORIAL_STORIES).indexOf(story.id)) + 1;
  const collectionImages = [
    subject.image,
    ...(Array.isArray(moments.diptych) ? moments.diptych : []),
    moments.envFigure,
    finalSec.image,
    story.leadImage,
  ].filter(Boolean).map((image) => ({
    src: image.src || image,
    alt: image.alt || story.category || "Editorial photograph",
    caption: image.caption || "",
  })).filter((image, index, list) => list.findIndex((candidate) => candidate.src === image.src) === index).slice(0, 4);

  return (
    <motion.div
      className={`editorial-page editorial-page--fashion editorial-page--category-${story.id || categoryKey}`}
      key={story.id || categoryKey}
      initial={isReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={isReduced ? false : { opacity: 0 }}
      transition={{ duration: 0.5, ease: APPLE_EASE }}
    >
      <div className="editorial-container">
        <article className="editorial-article" aria-label={`${story.category || "Photography"}: ${story.headline || ""}`}>
          
          {/* SECTION 1: EDITORIAL OPENING */}
          <motion.header
            className="editorial-masthead"
            {...getFadeUpMotion(isReduced, 0, 12)}
          >
            <div className="editorial-kicker" aria-label="Issue category">
              {story.category || "Photography"}
            </div>
            <Link
              to={story.backTo || "/stories"}
              className="editorial-back-link"
              data-cursor="pointer"
              aria-label={`Back to ${story.category || "stories"} showcase`}
            >
              {story.backLabel || `← ${story.category || "Stories"}`}
            </Link>
          </motion.header>

          {/* LAYOUT A: IMAGE-LED FEATURE SPREAD */}
          <section className="editorial-opening-spread" aria-label={`${story.category} feature spread`}>
            {story.leadImage && (
              <motion.figure className="editorial-opening-photo" {...getFadeUpMotion(isReduced, 0.04, 18)}>
                <img
                  src={story.leadImage.src || story.leadImage}
                  alt={story.leadImage.alt || story.headline}
                  width="1200"
                  height="1500"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                {story.leadImage.caption && <figcaption className="editorial-caption">{conciseCopy(story.leadImage.caption, 12)}</figcaption>}
              </motion.figure>
            )}
            <motion.div className="editorial-opening-copy" {...getFadeUpMotion(isReduced, 0.08, 16)}>
              <span className="editorial-opening-brand">Phantom Labs</span>
              <span className="editorial-opening-label">{story.category || "Photography"} · Editorial No. {String(storyIndex).padStart(2, "0")}</span>
              <h1 className="editorial-headline">{story.headline}</h1>
              <span className="editorial-opening-rule" aria-hidden="true" />
              {story.deck && <p className="editorial-deck">{conciseCopy(story.deck, 22)}</p>}
              <div className="editorial-byline">{story.byline || "Photography & Words by Phantom Labs"}</div>
              <span className="editorial-opening-page">{String(storyIndex).padStart(2, "0")} <i>—</i> 06</span>
            </motion.div>
          </section>

          <motion.section
            className="editorial-collection-section"
            aria-label={`${story.category} portrait collection`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-collection-heading">
              <span className="editorial-opening-label">The portrait collection</span>
              <h2>{moments.title || `${story.category} in frames`}</h2>
              {moments.intro && <p>{conciseCopy(moments.intro, 12)}</p>}
            </header>
            {collectionImages.length > 0 && (
              <div className="editorial-photo-collection" aria-label={`${story.category} photo collection`}>
                {collectionImages.map((image, idx) => (
                  <motion.figure
                    key={`${image.src}-${idx}`}
                    className={`editorial-collection-photo editorial-collection-photo--${idx + 1}`}
                    {...getFadeUpMotion(isReduced, idx * 0.04, 14)}
                  >
                    <img src={image.src} alt={image.alt} width="900" height="1200" loading="lazy" decoding="async" />
                    <figcaption>{image.caption ? conciseCopy(image.caption, 10) : `${story.category} · 0${idx + 1}`}</figcaption>
                  </motion.figure>
                ))}
              </div>
            )}
          </motion.section>

          {/* Back to Stories or Book CTA */}
          <div className="editorial-commission-footer">
            <Link to="/stories" className="editorial-back-link">
              ← Return to All Stories
            </Link>
            <Link
              to={`/book?category=${story.id || story.category?.toLowerCase() || "portraits"}`}
              className="editorial-commission-btn"
            >
              Commission a Session
            </Link>
          </div>

        </article>
      </div>
    </motion.div>
  );
}
