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

const getDividerMotion = (isReduced) => ({
  initial: isReduced ? false : { opacity: 0, y: 8 },
  whileInView: isReduced ? undefined : { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: {
    duration: isReduced ? 0 : 0.5,
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

  const openingEssay = Array.isArray(story.openingEssay) ? story.openingEssay : [];
  const subject = story.subject || {};
  const moments = story.moments || {};
  const behind = story.behind || {};
  const pause = story.pause || {};
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
      className="editorial-page editorial-page--fashion"
      key={story.id || categoryKey}
      initial={isReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={isReduced ? false : { opacity: 0 }}
      transition={{ duration: 0.5, ease: APPLE_EASE }}
    >
      <div className="editorial-container">
        <article className="editorial-article" aria-label={`${story.issueKicker || "Field Notes"}: ${story.headline || ""}`}>
          
          {/* SECTION 1: EDITORIAL OPENING */}
          <motion.header
            className="editorial-masthead"
            {...getFadeUpMotion(isReduced, 0, 12)}
          >
            <div className="editorial-kicker" aria-label="Issue category">
              {story.issueKicker || `FIELD NOTES / ${String(story.category || "MONOGRAPH").toUpperCase()}`}
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
              {story.deck && <p className="editorial-deck">{conciseCopy(story.deck, 22)}</p>}
              <div className="editorial-byline">{story.byline || "Photography & Words by Phantom Labs"}</div>
              <span className="editorial-opening-page">{String(storyIndex).padStart(2, "0")} <i>—</i> 06</span>
            </motion.div>
          </section>

          <motion.hr className="editorial-divider" {...getDividerMotion(isReduced)} />

          {/* SECTION 3: OPENING ESSAY */}
          {openingEssay.length > 0 && (
            <>
              <motion.section
                className="editorial-essay-section"
                aria-label={`Opening essay on ${story.category?.toLowerCase() || "the subject"}`}
                {...getFadeUpMotion(isReduced, 0.04, 18)}
              >
                <div className="editorial-essay-grid">
                  <div className="editorial-column">
                    <h3 className="editorial-subheading">
                      {story.essaySubheadings?.[0] || "The Space Between Poses"}
                    </h3>
                    {openingEssay.slice(0, 2).map((para, idx) => (
                      <p
                        key={idx}
                        className={`editorial-p ${idx === 0 ? "editorial-drop-cap" : ""}`}
                      >
                        {conciseCopy(para, idx === 0 ? 38 : 30)}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.hr
                className="editorial-divider"
                {...getDividerMotion(isReduced)}
              />
            </>
          )}

          {/* SECTION 4: MEET THE SUBJECT / FOCUS PROFILE */}
          {subject.name && (
            <>
              <motion.section
                className="editorial-subject-section"
                aria-label="Feature subject profile"
                {...getFadeUpMotion(isReduced, 0.04, 18)}
              >
                {subject.tag && <span className="editorial-section-tag">{subject.tag}</span>}
                <div className="editorial-subject-grid">
                  <div className="editorial-subject-content">
                    <h2 className="editorial-subject-name">{subject.name}</h2>
                    {subject.role && <div className="editorial-subject-role">{subject.role}</div>}

                    {subject.quote && (
                      <blockquote className="editorial-subject-quote">
                        &ldquo;{conciseCopy(subject.quote, 24)}&rdquo;
                      </blockquote>
                    )}

                    {subject.bio && (
                      <>
                        <h3 className="editorial-subheading">
                          {subject.bioTitle || "A Sanctuary for Quiet Rooms"}
                        </h3>
                        <p className="editorial-p">{conciseCopy(subject.bio, 32)}</p>
                      </>
                    )}

                  </div>
                </div>
              </motion.section>

              <motion.hr
                className="editorial-divider"
                {...getDividerMotion(isReduced)}
              />
            </>
          )}

          {/* SECTION 5: THE SESSION, IN MOMENTS */}
          {moments.title && (
            <>
              <motion.section
                className="editorial-moments-section"
                aria-label="Photographic sequence of the session"
                {...getFadeUpMotion(isReduced, 0.04, 18)}
              >
                <div className="editorial-moments-header">
                  {moments.tag && <span className="editorial-section-tag">{moments.tag}</span>}
                  <h2 className="editorial-section-title">{moments.title}</h2>
                  {moments.intro && <p className="editorial-section-intro">{conciseCopy(moments.intro, 18)}</p>}
                </div>

                {/* LAYOUT B: FOUR-FRAME PORTRAIT COLLECTION */}
                {collectionImages.length > 0 && (
                  <div className="editorial-photo-collection" aria-label={`${story.category} photo collection`}>
                    {collectionImages.map((image, idx) => (
                      <motion.figure key={`${image.src}-${idx}`} className={`editorial-collection-photo editorial-collection-photo--${idx + 1}`} {...getFadeUpMotion(isReduced, idx * 0.04, 14)}>
                        <img src={image.src} alt={image.alt} width="900" height="1200" loading="lazy" decoding="async" />
                        <figcaption>{image.caption ? conciseCopy(image.caption, 10) : `${story.category} · 0${idx + 1}`}</figcaption>
                      </motion.figure>
                    ))}
                  </div>
                )}

                {moments.passage1 && (
                  <motion.div
                    className="editorial-moment-passage"
                    {...getFadeUpMotion(isReduced, 0.06, 16)}
                  >
                    <h3 className="editorial-subheading">
                      {moments.passage1Subheading || "The Drift of Midday Light"}
                    </h3>
                    <p className="editorial-p">{conciseCopy(moments.passage1, 30)}</p>
                  </motion.div>
                )}

                {moments.passage2 && (
                  <motion.div
                    className="editorial-moment-passage"
                    {...getFadeUpMotion(isReduced, 0.06, 16)}
                  >
                    <h3 className="editorial-subheading">
                      {moments.passage2Subheading || "The Intersection of Fatigue & Truth"}
                    </h3>
                    <p className="editorial-p">{conciseCopy(moments.passage2, 30)}</p>
                  </motion.div>
                )}
              </motion.section>

              <motion.hr
                className="editorial-divider"
                {...getDividerMotion(isReduced)}
              />
            </>
          )}

          {/* SECTION 6: BEHIND THE CRAFT */}
          {behind.title && Array.isArray(behind.craftCards) && behind.craftCards.length > 0 && (
            <>
              <motion.section
                className="editorial-behind-section"
                aria-label="Creative choices and craft notes"
                {...getFadeUpMotion(isReduced, 0.04, 18)}
              >
                {behind.tag && <span className="editorial-section-tag">{behind.tag}</span>}
                <h2 className="editorial-section-title">{behind.title}</h2>
                {behind.intro && <p className="editorial-section-intro">{conciseCopy(behind.intro, 18)}</p>}

                <div className="editorial-craft-spread">
                  <div className="editorial-craft-columns">
                    {behind.craftCards.slice(0, 2).map((card, idx) => (
                      <motion.div
                        key={idx}
                        className="editorial-craft-entry"
                        {...getFadeUpMotion(isReduced, 0.06 * idx, 14)}
                      >
                        <div className="editorial-craft-entry-header">
                          <span className="editorial-craft-index">0{idx + 1}</span>
                          <span className="editorial-craft-kicker">
                            {card.kicker || `NOTE 0${idx + 1}`}
                          </span>
                        </div>
                        <h3 className="editorial-craft-headline">{card.title}</h3>
                        <p className="editorial-craft-body">{conciseCopy(card.text, 24)}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.hr
                className="editorial-divider"
                {...getDividerMotion(isReduced)}
              />
            </>
          )}

          {/* SECTION 7: PULL QUOTE */}
          {pause.quote && (
            <>
              <motion.section
                className="editorial-quote-section"
                aria-label="Pull quote and reflections"
                {...getFadeUpMotion(isReduced, 0.04, 18)}
              >
                <blockquote className="editorial-pull-quote">
                  &ldquo;{pause.quote}&rdquo;
                </blockquote>

                {Array.isArray(pause.reflections) && pause.reflections.length > 0 && (
                  <div className="editorial-reflection-grid">
                    <div className="editorial-column">
                      <h3 className="editorial-subheading">
                        {pause.subheadings?.[0] || "The Face as Autobiography"}
                      </h3>
                      <p className="editorial-p">{conciseCopy(pause.reflections[0], 34)}</p>
                    </div>
                  </div>
                )}
              </motion.section>

              <motion.hr
                className="editorial-divider"
                {...getDividerMotion(isReduced)}
              />
            </>
          )}

          {/* SECTION 8: FINAL FRAMES & CONCLUSION */}
          {finalSec.title && (
            <motion.section
              className="editorial-final-section"
              aria-label="Closing photographic sequence and conclusion"
              {...getFadeUpMotion(isReduced, 0.04, 18)}
            >
              <div className="editorial-final-header">
                {finalSec.tag && <span className="editorial-section-tag">{finalSec.tag}</span>}
                <h2 className="editorial-section-title">{finalSec.title}</h2>
              </div>

              {finalSec.image && (
                <motion.figure
                  className="editorial-closing-figure"
                  {...getFadeUpMotion(isReduced, 0.06, 18)}
                >
                  <div className="editorial-closing-frame">
                    <img
                      src={finalSec.image.src || finalSec.image}
                      alt={finalSec.image.alt || "Final frame"}
                      className="editorial-closing-img"
                      width="1376"
                      height="768"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {finalSec.image.caption && (
                    <figcaption className="editorial-caption">
                      {conciseCopy(finalSec.image.caption, 14)}
                    </figcaption>
                  )}
                </motion.figure>
              )}

              {Array.isArray(finalSec.conclusion) && finalSec.conclusion.length > 0 && (
                <motion.div
                  className="editorial-closing-essay"
                  {...getFadeUpMotion(isReduced, 0.06, 16)}
                >
                  <h3 className="editorial-subheading">
                    {finalSec.conclusionSubheading || "What the Light Left Behind"}
                  </h3>
                  {finalSec.conclusion.slice(0, 1).map((para, idx) => (
                    <p key={idx} className="editorial-p">{conciseCopy(para, 34)}</p>
                  ))}
                </motion.div>
              )}
            </motion.section>
          )}

          {/* Back to Stories or Book CTA */}
          <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <Link to="/stories" className="editorial-back-link" style={{ fontSize: "14px" }}>
              ← Return to All Stories
            </Link>
            <Link
              to={`/book?category=${story.id || story.category?.toLowerCase() || "portraits"}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 24px",
                backgroundColor: "#111111",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Commission a Session
            </Link>
          </div>

        </article>
      </div>
    </motion.div>
  );
}
