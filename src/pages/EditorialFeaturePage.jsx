import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { EDITORIAL_STORIES } from "../data/editorialStories.js";
import "../styles/editorialMagazine.css";

const APPLE_EASE = [0.22, 1, 0.36, 1];

// Reusable scroll animation helper: subtle Apple-style fade up on viewport enter, smooth fade out on exit, fully reversible
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
  const story = EDITORIAL_STORIES[categoryKey] || EDITORIAL_STORIES.portraits;
  
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
    document.title = `${story.category}: ${story.headline} — Phantom Labs Field Notes`;
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [story]);

  return (
    <motion.div
      className="editorial-page"
      key={story.id}
      initial={isReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={isReduced ? false : { opacity: 0 }}
      transition={{ duration: 0.5, ease: APPLE_EASE }}
    >
      <div className="editorial-container">
        <article className="editorial-article" aria-label={`${story.issueKicker}: ${story.headline}`}>
          
          {/* ================================================================
              SECTION 1: EDITORIAL OPENING
              ================================================================ */}
          <motion.header
            className="editorial-masthead"
            {...getFadeUpMotion(isReduced, 0, 12)}
          >
            <div className="editorial-kicker" aria-label="Issue category">
              {story.issueKicker}
            </div>
            <Link
              to={story.backTo || "/#services"}
              className="editorial-back-link"
              data-cursor="pointer"
              aria-label={`Back to ${story.category} showcase`}
            >
              {story.backLabel}
            </Link>
          </motion.header>

          <motion.div
            className="editorial-title-group"
            {...getFadeUpMotion(isReduced, 0.05, 16)}
          >
            <h1 className="editorial-headline">{story.headline}</h1>
            <p className="editorial-deck">{story.deck}</p>
            <div className="editorial-byline">{story.byline}</div>
          </motion.div>

          <motion.hr
            className="editorial-divider editorial-divider--tight"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 2: FULL-WIDTH LEAD PHOTOGRAPH
              ================================================================ */}
          <motion.figure
            className="editorial-lead-figure"
            {...getFadeUpMotion(isReduced, 0.06, 18)}
          >
            <div className="editorial-lead-frame">
              <img
                src={story.leadImage.src}
                alt={story.leadImage.alt}
                className="editorial-lead-img"
                width="1376"
                height="768"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption className="editorial-caption">
              {story.leadImage.caption}
            </figcaption>
          </motion.figure>

          <motion.hr
            className="editorial-divider"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 3: OPENING ESSAY (MAGAZINE-WIDTH COLUMNS WITH SUBHEADINGS)
              ================================================================ */}
          <motion.section
            className="editorial-essay-section"
            aria-label={`Opening essay on ${story.category.toLowerCase()}`}
            {...getFadeUpMotion(isReduced, 0.04, 18)}
          >
            <div className="editorial-essay-grid">
              <div className="editorial-column">
                <h3 className="editorial-subheading">
                  {story.essaySubheadings?.[0] || "The Space Between Poses"}
                </h3>
                {story.openingEssay.slice(0, 2).map((para, idx) => (
                  <p
                    key={idx}
                    className={`editorial-p ${idx === 0 ? "editorial-drop-cap" : ""}`}
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div className="editorial-column">
                <h3 className="editorial-subheading">
                  {story.essaySubheadings?.[1] || "Unlearning the Impulse to Audition"}
                </h3>
                {story.openingEssay.slice(2).map((para, idx) => (
                  <p key={idx} className="editorial-p">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.hr
            className="editorial-divider"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 4: MEET THE SUBJECT / FOCUS PROFILE
              ================================================================ */}
          <motion.section
            className="editorial-subject-section"
            aria-label="Feature subject profile"
            {...getFadeUpMotion(isReduced, 0.04, 18)}
          >
            <span className="editorial-section-tag">{story.subject.tag}</span>
            <div className="editorial-subject-grid">
              <motion.figure
                className="editorial-subject-photo-wrap"
                {...getFadeUpMotion(isReduced, 0.08, 16)}
              >
                <div className="editorial-subject-frame">
                  <img
                    src={story.subject.image.src}
                    alt={story.subject.image.alt}
                    className="editorial-subject-img"
                    width="896"
                    height="1200"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="editorial-caption">
                  {story.subject.image.caption}
                </figcaption>
              </motion.figure>

              <div className="editorial-subject-content">
                <h2 className="editorial-subject-name">{story.subject.name}</h2>
                <div className="editorial-subject-role">{story.subject.role}</div>

                <blockquote className="editorial-subject-quote">
                  &ldquo;{story.subject.quote}&rdquo;
                </blockquote>

                <h3 className="editorial-subheading">
                  {story.subject.bioTitle || "A Sanctuary for Quiet Rooms"}
                </h3>
                <p className="editorial-p">{story.subject.bio}</p>

                <h3 className="editorial-subheading editorial-subheading--secondary">
                  {story.subject.detailTitle || "On Stillness & Observation"}
                </h3>
                <div className="editorial-personal-detail">
                  <strong>{story.subject.detailTitle}:</strong> {story.subject.detailText}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.hr
            className="editorial-divider"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 5: THE SESSION, IN MOMENTS
              ================================================================ */}
          <motion.section
            className="editorial-moments-section"
            aria-label="Photographic sequence of the session"
            {...getFadeUpMotion(isReduced, 0.04, 18)}
          >
            <div className="editorial-moments-header">
              <span className="editorial-section-tag">{story.moments.tag}</span>
              <h2 className="editorial-section-title">{story.moments.title}</h2>
              <p className="editorial-section-intro">{story.moments.intro}</p>
            </div>

            {/* Diptych: Two complementary vertical frames side-by-side */}
            <div className="editorial-diptych-grid">
              {story.moments.diptych.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="editorial-frame-card"
                  {...getFadeUpMotion(isReduced, 0.05 * idx, 16)}
                >
                  <div className="editorial-frame-box">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="editorial-frame-img"
                      width="896"
                      height="1200"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption className="editorial-caption">
                    {item.caption}
                  </figcaption>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="editorial-moment-passage"
              {...getFadeUpMotion(isReduced, 0.06, 16)}
            >
              <h3 className="editorial-subheading">
                {story.moments.passage1Subheading || "The Drift of Midday Light"}
              </h3>
              <p className="editorial-p">{story.moments.passage1}</p>
            </motion.div>

            {/* Wide Environmental Frame */}
            <motion.figure
              className="editorial-env-figure"
              {...getFadeUpMotion(isReduced, 0.06, 18)}
            >
              <div className="editorial-env-frame">
                <img
                  src={story.moments.envFigure.src}
                  alt={story.moments.envFigure.alt}
                  className="editorial-env-img"
                  width="1200"
                  height="896"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="editorial-caption">
                {story.moments.envFigure.caption}
              </figcaption>
            </motion.figure>

            <motion.div
              className="editorial-moment-passage"
              {...getFadeUpMotion(isReduced, 0.06, 16)}
            >
              <h3 className="editorial-subheading">
                {story.moments.passage2Subheading || "The Intersection of Fatigue & Truth"}
              </h3>
              <p className="editorial-p">{story.moments.passage2}</p>
            </motion.div>
          </motion.section>

          <motion.hr
            className="editorial-divider"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 6: BEHIND THE CRAFT (CLEAN EDITORIAL SPREAD & UNBOXED COLUMNS)
              ================================================================ */}
          <motion.section
            className="editorial-behind-section"
            aria-label="Creative choices and craft notes"
            {...getFadeUpMotion(isReduced, 0.04, 18)}
          >
            <span className="editorial-section-tag">{story.behind.tag}</span>
            <h2 className="editorial-section-title">{story.behind.title}</h2>
            <p className="editorial-section-intro">{story.behind.intro}</p>

            <div className="editorial-craft-spread">
              <div className="editorial-craft-columns">
                {story.behind.craftCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    className="editorial-craft-entry"
                    {...getFadeUpMotion(isReduced, 0.06 * idx, 14)}
                  >
                    <div className="editorial-craft-entry-header">
                      <span className="editorial-craft-index">
                        0{idx + 1}
                      </span>
                      <span className="editorial-craft-kicker">
                        {card.kicker || (card.num.includes("—") ? card.num.split("—")[1].trim() : `NOTE 0${idx + 1}`)}
                      </span>
                    </div>
                    <h3 className="editorial-craft-headline">{card.title}</h3>
                    <p className="editorial-craft-body">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.hr
            className="editorial-divider"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 7: A PAUSE IN THE STORY (PROMINENT PULL QUOTE + REFLECTIONS)
              ================================================================ */}
          <motion.section
            className="editorial-quote-section"
            aria-label="Pull quote and reflections"
            {...getFadeUpMotion(isReduced, 0.04, 18)}
          >
            <blockquote className="editorial-pull-quote">
              &ldquo;{story.pause.quote}&rdquo;
            </blockquote>

            <div className="editorial-reflection-grid">
              <div className="editorial-column">
                <h3 className="editorial-subheading">
                  {story.pause.subheadings?.[0] || "The Face as Autobiography"}
                </h3>
                <p className="editorial-p">{story.pause.reflections[0]}</p>
              </div>
              <div className="editorial-column">
                <h3 className="editorial-subheading">
                  {story.pause.subheadings?.[1] || "The Dignity of Stillness"}
                </h3>
                {story.pause.reflections.slice(1).map((para, idx) => (
                  <p key={idx} className="editorial-p">{para}</p>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.hr
            className="editorial-divider"
            {...getDividerMotion(isReduced)}
          />

          {/* ================================================================
              SECTION 8: THE FINAL FRAMES & CONCLUSION
              ================================================================ */}
          <motion.section
            className="editorial-final-section"
            aria-label="Closing photographic sequence and conclusion"
            {...getFadeUpMotion(isReduced, 0.04, 18)}
          >
            <div className="editorial-final-header">
              <span className="editorial-section-tag">{story.final.tag}</span>
              <h2 className="editorial-section-title">{story.final.title}</h2>
            </div>

            <motion.figure
              className="editorial-closing-figure"
              {...getFadeUpMotion(isReduced, 0.06, 18)}
            >
              <div className="editorial-closing-frame">
                <img
                  src={story.final.image.src}
                  alt={story.final.image.alt}
                  className="editorial-closing-img"
                  width="1376"
                  height="768"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="editorial-caption">
                {story.final.image.caption}
              </figcaption>
            </motion.figure>

            <motion.div
              className="editorial-closing-essay"
              {...getFadeUpMotion(isReduced, 0.06, 16)}
            >
              <h3 className="editorial-subheading">
                {story.final.conclusionSubheading || "What the Light Left Behind"}
              </h3>
              {story.final.conclusion.map((para, idx) => (
                <p key={idx} className="editorial-p">{para}</p>
              ))}
            </motion.div>
          </motion.section>

        </article>
      </div>
    </motion.div>
  );
}