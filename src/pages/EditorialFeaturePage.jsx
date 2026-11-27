import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { EDITORIAL_STORIES } from "../data/editorialStories.js";
import "../styles/editorialMagazine.css";

const APPLE_EASE = [0.22, 1, 0.36, 1];

const PHANTOM_BENEFITS = [
  {
    title: "Personalise your session.",
    text: "Make it yours with a session shaped around your story, style and pace.",
    detail: "We plan together before the shoot so you know what to expect and can arrive feeling prepared.",
    icon: <><circle cx="24" cy="24" r="17" /><circle cx="18" cy="20" r="1" /><circle cx="30" cy="20" r="1" /><path d="M15 28c2.4 4.2 5.4 6 9 6s6.6-1.8 9-6" /></>,
  },
  {
    title: "Flexible booking options.",
    text: "Find a time and setting that fit easily into your plans.",
    detail: "Choose a studio, an outdoor location or a place that already feels like you.",
    icon: <><rect x="6" y="10" width="36" height="30" rx="4" /><path d="M6 18h36M15 6v8M33 6v8M14 25h5m5 0h5m5 0h1M14 32h5m5 0h5" /></>,
  },
  {
    title: "Beautifully finished photographs.",
    text: "Every frame is selected and refined with care.",
    detail: "Your finished gallery is easy to revisit and share with the people who matter.",
    icon: <><path d="M5 14h8l3-4h16l3 4h8v24H5z" /><circle cx="24" cy="25" r="8" /><circle cx="36" cy="19" r="1" /></>,
  },
  {
    title: "Talk to a real photographer.",
    text: "Get thoughtful guidance from your first question to the final image.",
    detail: "We can help with outfits, locations and timing so the whole experience feels comfortable.",
    icon: <><path d="M6 8h36v25H22l-10 8v-8H6z" /><path d="M14 17h20M14 24h14" /></>,
  },
];

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
  const subject = story.subject || {};
  const moments = story.moments || {};
  const finalSec = story.final || {};
  const featureImage = finalSec.image || moments.envFigure || subject.image || story.leadImage;
  const longImage = moments.envFigure || subject.image || story.leadImage || finalSec.image || featureImage;
  const featureCards = [
    { title: "A natural rhythm.", text: "An unhurried session leaves room for real expression and the moments in between." },
    { title: "A considered frame.", text: "Thoughtful composition brings out the subtle details that make your story yours." },
    { title: "Light, honestly seen.", text: "We work with the light around you to keep every image grounded and timeless." },
    { title: "Made to keep.", text: "A carefully edited collection gives you photographs you will want to return to." },
  ];
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
  })).filter((image, index, list) => list.findIndex((candidate) => candidate.src === image.src) === index).slice(0, 8);

  const [isReduced, setIsReduced] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState(null);
  const benefitTrackRef = useRef(null);

  const scrollBenefits = (direction) => {
    benefitTrackRef.current?.scrollBy({ left: direction * 390, behavior: "smooth" });
  };

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
          
          {/* Full-screen category opening */}
          <section id="overview" className="editorial-opening-spread" aria-label={`${story.category} photography`}>
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
              <span className="editorial-opening-brand">PHANTOM LABS</span>
              <span className="editorial-opening-label">{story.category || "Photography"}</span>
              <h1 className="editorial-headline">{story.headline}</h1>
              {story.deck && <p className="editorial-deck">{conciseCopy(story.deck, 16)}</p>}
            </motion.div>
          </section>

          <motion.section
            id="details"
            className="editorial-closer-section"
            aria-label={`${story.category} photo details`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-closer-heading">
              <h2>Take a closer look.</h2>
            </header>
            {collectionImages.length > 0 && (
              <div id="gallery" className="editorial-gallery">
                <div className="editorial-photo-collection" aria-label={`${story.category} detailed photographs`}>
                  {collectionImages.map((image, idx) => (
                    <motion.figure
                      key={`detail-${image.src}-${idx}`}
                      className="editorial-collection-photo"
                      {...getFadeUpMotion(isReduced, idx * 0.04, 14)}
                    >
                      <div className="editorial-collection-image">
                        <img src={image.src} alt={image.alt} width="1600" height="1100" loading="lazy" decoding="async" />
                      </div>
                      <figcaption>{image.caption ? conciseCopy(image.caption, 14) : `${story.category} · 0${idx + 1}`}</figcaption>
                    </motion.figure>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          <motion.section
            id="experience"
            className="editorial-experience-section"
            aria-label={`${story.category} photography`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            {featureImage && (
              <img
                className="editorial-experience-image"
                src={featureImage.src || featureImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="editorial-experience-overlay" aria-hidden="true" />
            <div className="editorial-experience-copy">
              <p>{story.category} Photography</p>
              <h2>Exceptional {story.category.toLowerCase()} for every story.</h2>
            </div>
          </motion.section>

          <motion.section
            id="approach"
            className="editorial-approach-section"
            aria-label="Our photography approach"
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-approach-intro">
              <h2>Presence first. Beautifully seen.</h2>
              <p>A thoughtful, unhurried approach brings out the details that make your story feel like yours.</p>
            </header>
            <div className="editorial-approach-grid">
              <article className="editorial-approach-item">
                <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" /><path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5m21.2 21.2 3.5 3.5m0-28.2-3.5 3.5M13.4 34.6l-3.5 3.5" /></svg>
                <h3>Natural direction</h3>
                <p>Gentle prompts and an easy pace leave room for you to settle into the moment.</p>
              </article>
              <article className="editorial-approach-item">
                <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7v34M7 24h34M12 12l24 24m0-24L12 36" /><circle cx="24" cy="24" r="11" /></svg>
                <h3>Considered craft</h3>
                <p>Light, composition, and careful editing work together to keep every frame timeless.</p>
              </article>
              <article className="editorial-approach-item">
                <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="19" cy="15" r="7" /><path d="M5 41c0-8 6-14 14-14s14 6 14 14M35 16l2.5 5.5L43 24l-5.5 2.5L35 32l-2.5-5.5L27 24l5.5-2.5L35 16Z" /></svg>
                <h3>Your story, your way</h3>
                <p>Every session adapts to the people, energy, and feeling at its heart.</p>
              </article>
            </div>
          </motion.section>

          <motion.section
            id="perspective"
            className="editorial-long-image-section"
            aria-label={`${story.category} in a new perspective`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            {longImage && (
              <img
                className="editorial-long-image"
                src={longImage.src || longImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="editorial-long-image-overlay" aria-hidden="true" />
            <div className="editorial-long-image-copy">
              <p>A considered perspective</p>
              <h2>A new perspective on {story.category.toLowerCase()}.</h2>
            </div>
          </motion.section>

          <motion.section
            id="features"
            className="editorial-feature-cards-section"
            aria-label={`${story.category} photography details`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <div className="editorial-feature-cards-track">
              {featureCards.map((card, idx) => {
                const image = collectionImages[idx % collectionImages.length];
                return (
                  <article className="editorial-feature-card" key={card.title}>
                    <div className="editorial-feature-card-image">
                      <img src={image?.src} alt={image?.alt || ""} loading="lazy" decoding="async" />
                    </div>
                    <div className="editorial-feature-card-copy">
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            id="why-phantom"
            className="editorial-why-section"
            aria-label="Why choose Phantom Labs"
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-why-heading">
              <h2>Why Phantom Labs is the best place to have your moments captured.</h2>
              <Link to="/stories">Explore our work <span aria-hidden="true">›</span></Link>
            </header>
            <div className="editorial-why-track" ref={benefitTrackRef}>
              {PHANTOM_BENEFITS.map((benefit, index) => {
                const isExpanded = expandedBenefit === index;
                return (
                  <article className={`editorial-why-card${isExpanded ? " is-expanded" : ""}`} key={benefit.title}>
                    <svg className="editorial-why-icon" viewBox="0 0 48 48" aria-hidden="true">{benefit.icon}</svg>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                    {isExpanded && <p className="editorial-why-detail">{benefit.detail}</p>}
                    <button
                      type="button"
                      className="editorial-why-toggle"
                      aria-label={`${isExpanded ? "Show less about" : "Show more about"} ${benefit.title}`}
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedBenefit(isExpanded ? null : index)}
                    >
                      <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="editorial-why-controls" aria-label="Browse benefits">
              <button type="button" aria-label="Previous benefits" onClick={() => scrollBenefits(-1)}>‹</button>
              <button type="button" aria-label="Next benefits" onClick={() => scrollBenefits(1)}>›</button>
            </div>
          </motion.section>

          <motion.section
            id="values"
            className="editorial-values-section"
            aria-label="Our values"
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-values-heading">
              <h2>Our values lead the way.</h2>
            </header>
            <div className="editorial-values-grid">
              <article className="editorial-value-card">
                <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" /><path d="M5 24h38M24 5c6 5 9 11 9 19s-3 14-9 19c-6-5-9-11-9-19s3-14 9-19Z" /></svg>
                <h3>A thoughtful approach.</h3>
                <p>Every session is shaped around who you are and what you want to remember.</p>
                <Link to="#approach">Learn about our approach <span aria-hidden="true">›</span></Link>
              </article>
              <article className="editorial-value-card">
                <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 42s-17-10-17-23a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 13-17 23-17 23Z" /><path d="m16 24 5 5 11-12" /></svg>
                <h3>Care in every detail.</h3>
                <p>From the first conversation to your finished gallery, we work with care and intention.</p>
                <Link to="#features">See how we work <span aria-hidden="true">›</span></Link>
              </article>
              <article className="editorial-value-card">
                <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" /><circle cx="24" cy="17" r="5" /><path d="M13 39c1-7 5-11 11-11s10 4 11 11M5 24h7m24 0h7" /></svg>
                <h3>Inclusive by design.</h3>
                <p>We create welcoming sessions that honour every person, connection and story.</p>
                <Link to="/stories">Explore our stories <span aria-hidden="true">›</span></Link>
              </article>
            </div>
          </motion.section>

          {/* Back to Stories or Book CTA */}
          <div className="editorial-commission-footer">
            <Link to={story.backTo || "/stories"} className="editorial-back-link">
              ← All {story.category || "Stories"}
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
