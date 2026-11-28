import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { EDITORIAL_STORIES } from "../data/editorialStories.js";
import { getCategoryPageContent } from "../data/categoryPageContent.js";
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

const VALUE_CARD_ICONS = [
  <><circle cx="24" cy="24" r="19" /><path d="M5 24h38M24 5c6 5 9 11 9 19s-3 14-9 19c-6-5-9-11-9-19s3-14 9-19Z" /></>,
  <><path d="M24 42s-17-10-17-23a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 13-17 23-17 23Z" /><path d="m16 24 5 5 11-12" /></>,
  <><circle cx="24" cy="24" r="19" /><circle cx="24" cy="17" r="5" /><path d="M13 39c1-7 5-11 11-11s10 4 11 11M5 24h7m24 0h7" /></>,
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
  viewport: { once: true, amount: 0.12, margin: "0px 0px -28px 0px" },
  transition: {
    duration: isReduced ? 0 : 0.65,
    delay: isReduced ? 0 : delay,
    ease: APPLE_EASE,
  },
});

export default function EditorialFeaturePage({ categoryOverride }) {
  const { category: paramCategory } = useParams();
  const categoryKey = categoryOverride || paramCategory || "portraits";
  const { getStoryById, home, previewMode } = useLiveCms();

  const categoryIsUnpublished = home.categories?.find((category) => category.id === categoryKey)?.published === false;

  const liveStory = getStoryById(categoryKey);
  const defaultStory = EDITORIAL_STORIES[categoryKey] || EDITORIAL_STORIES.portraits;
  const imageSource = (image) => {
    if (typeof image === "string") return image.trim();
    const src = image?.src;
    return (typeof src === "string" ? src : src?.src || image?.url || "").trim();
  };
  const imageOrDefault = (image, fallback) => imageSource(image) ? image : fallback;
  const story = liveStory ? {
    ...defaultStory,
    ...liveStory,
    leadImage: imageOrDefault(liveStory.leadImage, defaultStory.leadImage),
    subject: { ...defaultStory.subject, ...liveStory.subject, image: imageOrDefault(liveStory.subject?.image, defaultStory.subject?.image) },
    moments: {
      ...defaultStory.moments,
      ...liveStory.moments,
      envFigure: imageOrDefault(liveStory.moments?.envFigure, defaultStory.moments?.envFigure),
      diptych: Array.from({ length: Math.max(defaultStory.moments?.diptych?.length || 0, liveStory.moments?.diptych?.length || 0) }, (_, index) => imageOrDefault(liveStory.moments?.diptych?.[index], defaultStory.moments?.diptych?.[index])).filter(Boolean),
    },
    final: { ...defaultStory.final, ...liveStory.final, image: imageOrDefault(liveStory.final?.image, defaultStory.final?.image) },
  } : defaultStory;
  const isEditorialCategory = story.id === "editorial" || categoryKey === "editorial";
  const subject = story.subject || {};
  const moments = story.moments || {};
  const finalSec = story.final || {};
  const pageContent = getCategoryPageContent(story);
  const mobileOverrides = pageContent.mobileOverrides || {};
  const defaultsPageContent = getCategoryPageContent(defaultStory);
  const featureImage = [pageContent.sectionImages.experience, finalSec.image, moments.envFigure, subject.image, story.leadImage, defaultsPageContent.sectionImages.experience].find((image) => imageSource(image));
  const longImage = [pageContent.sectionImages.approach, moments.envFigure, subject.image, story.leadImage, finalSec.image, featureImage, defaultsPageContent.sectionImages.approach].find((image) => imageSource(image));
  const perspectiveImage = [pageContent.sectionImages.perspective, longImage, defaultsPageContent.sectionImages.perspective].find((image) => imageSource(image));
  const collectionImages = [...pageContent.galleryCards, ...defaultsPageContent.galleryCards].filter((image) => imageSource(image));
  const mobileCollectionImages = [...(mobileOverrides.galleryCards || []), ...collectionImages].filter((image) => imageSource(image));
  const mobileCards = (key, fallback) => mobileOverrides.cards?.[key] || fallback;
  const sectionColor = (section, type = "body") => pageContent.sectionColors?.[section]?.[type] || undefined;
  const mobileImage = (section, fallback) => imageSource(mobileOverrides.images?.[section]) ? mobileOverrides.images[section] : fallback;
  const mobileText = (key, fallback) => mobileOverrides.copy?.[key] || fallback || "";
  const renderResponsiveText = (key, fallback) => (
    <>
      <span className="cms-desktop-copy">{fallback || ""}</span>
      <span className="cms-mobile-copy">{mobileText(key, fallback)}</span>
    </>
  );
  const renderResponsiveLines = (key, fallback) => {
    const renderLines = (value) => String(value || "").split("\n").map((line, index) => <span key={`${index}-${line}`}>{line}</span>);
    return (
      <>
        <span className="cms-desktop-copy">{renderLines(fallback)}</span>
        <span className="cms-mobile-copy">{renderLines(mobileText(key, fallback))}</span>
      </>
    );
  };
  const categoryImage = (image, phoneImage, props = {}) => {
    if (!image) return null;
    const { pictureClassName = "", className = "", style: imageStyle, ...imageProps } = props;
    const normalizeImage = (candidate) => {
      if (typeof candidate === "string") return { src: candidate };
      if (!candidate || typeof candidate !== "object") return { src: "" };
      const nested = candidate.src;
      const src = typeof nested === "string" ? nested
        : typeof nested?.src === "string" ? nested.src
          : typeof candidate.url === "string" ? candidate.url : "";
      return { ...candidate, src };
    };
    const desktop = normalizeImage(image);
    const mobile = phoneImage ? normalizeImage(phoneImage) : desktop;
    if (!desktop.src) return null;
    return (
      <picture className={`cms-responsive-picture ${pictureClassName}`.trim()}>
        {mobile?.src && mobile.src !== desktop.src && <source media="(max-width: 680px)" srcSet={mobile.src} />}
        <img
          {...imageProps}
          src={desktop.src}
          style={{
            "--cms-image-position-desktop": desktop.objectPosition || "50% 50%",
            "--cms-image-zoom-desktop": Number(desktop.cropZoom) || 1,
            "--cms-image-position-mobile": mobile.objectPosition || desktop.objectPosition || "50% 50%",
            "--cms-image-zoom-mobile": Number(mobile.cropZoom) || Number(desktop.cropZoom) || 1,
            ...imageStyle,
          }}
          className={`cms-crop-image ${className}`.trim()}
        />
      </picture>
    );
  };
  const sectionLayoutStyle = (section) => {
    const desktop = pageContent.displaySettings?.desktop?.[section] || {};
    const mobile = pageContent.displaySettings?.mobile?.[section] || {};
    return {
      "--cms-desktop-text-x": `${desktop.textX ?? 7}%`,
      "--cms-desktop-text-y": `${desktop.textY ?? 72}%`,
      "--cms-mobile-text-x": `${mobile.textX ?? desktop.textX ?? 6}%`,
      "--cms-mobile-text-y": `${mobile.textY ?? desktop.textY ?? 72}%`,
      "--cms-desktop-text-align": desktop.textAlign || "",
      "--cms-mobile-text-align": mobile.textAlign || "",
      "--cms-mobile-heading-color": mobile.headingColor || "",
      "--cms-mobile-body-color": mobile.bodyColor || "",
      "--cms-desktop-copy-shift": desktop.textAlign === "center" ? "-50%" : desktop.textAlign === "right" ? "-100%" : "0%",
      "--cms-mobile-copy-shift": (mobile.textAlign || desktop.textAlign) === "center" ? "-50%" : (mobile.textAlign || desktop.textAlign) === "right" ? "-100%" : "0%",
    };
  };
  const mobileColorClass = (section) => {
    const settings = pageContent.displaySettings?.mobile?.[section] || {};
    return [settings.headingColor && "cms-mobile-head-custom", settings.bodyColor && "cms-mobile-body-custom"].filter(Boolean).join(" ");
  };
  const typographyTargets = {
    opening: "overview", gallery: "details", experience: "experience", approach: "approach",
    perspective: "perspective", featureCards: "features", why: "why-phantom", values: "values", collection: "editorial-collection-story",
  };
  const getTypographyRules = (viewport) => Object.entries(typographyTargets).flatMap(([section, id]) => {
    const settings = pageContent.displaySettings?.[viewport]?.[section] || {};
    const headingSize = Number(settings.headingSize);
    const bodySize = Number(settings.bodySize);
    const cardTitleSize = Number(settings.cardTitleSize);
    const cardBodySize = Number(settings.cardBodySize);
    const rules = [];
    if (Number.isFinite(headingSize) && headingSize > 0) rules.push(`#${id} h1, #${id} h2, #${id} h3 { font-size: ${Math.min(160, Math.max(12, headingSize))}px !important; }`);
    if (Number.isFinite(bodySize) && bodySize > 0) rules.push(`#${id} p, #${id} a, #${id} figcaption { font-size: ${Math.min(48, Math.max(10, bodySize))}px !important; }`);
    if (Number.isFinite(cardTitleSize) && cardTitleSize > 0) rules.push(`#${id} .editorial-feature-card-copy h3 { font-size: ${Math.min(80, Math.max(10, cardTitleSize))}px !important; }`);
    if (Number.isFinite(cardBodySize) && cardBodySize > 0) rules.push(`#${id} .editorial-feature-card-copy p { font-size: ${Math.min(40, Math.max(10, cardBodySize))}px !important; }`);
    return rules;
  }).join("\n");
  const responsiveTypographyCss = [
    getTypographyRules("desktop"),
    getTypographyRules("mobile") ? `@media (max-width: 680px) { ${getTypographyRules("mobile")} }` : "",
  ].filter(Boolean).join("\n");
  const sectionHeadingStyle = (section) => {
    const color = sectionColor(section, "heading");
    return color ? { color, backgroundImage: "none", WebkitTextFillColor: color } : undefined;
  };
  const isReduced = true;

  useEffect(() => {
    if (story) {
      document.title = `${story.category || "Story"}: ${story.headline || "Field Notes"} — Phantom Labs`;
    }
  }, [story.category, story.headline]);

  if (categoryIsUnpublished && !previewMode) {
    return (
      <main className="editorial-page editorial-page--unpublished" style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "120px 24px 80px", textAlign: "center" }}>
        <div>
          <p className="editorial-eyebrow">Category unavailable</p>
          <h1>This page is currently unpublished.</h1>
          <Link to="/" className="editorial-cta">Return to the homepage</Link>
        </div>
      </main>
    );
  }

  const featureCardsSection = (
    <motion.section
      id="features"
      className={`editorial-feature-cards-section cms-section-layout ${mobileColorClass("featureCards")}`}
      style={sectionLayoutStyle("featureCards")}
      aria-label={`${story.category} photography details`}
      {...getFadeUpMotion(isReduced, 0.04, 16)}
    >
      {pageContent.featureHeading && (
        <header className="editorial-feature-cards-heading">
          <h2 style={{ color: sectionColor("featureCards", "heading") }}>{renderResponsiveText("featureHeading", pageContent.featureHeading)}</h2>
        </header>
      )}
      <div className="editorial-feature-cards-track cms-desktop-copy">
        {pageContent.featureCards.map((card, idx) => {
          const selectedImageIndex = Number.isFinite(Number(card.imageIndex)) ? Math.max(0, Number(card.imageIndex) - 1) : idx;
          const image = collectionImages.length ? collectionImages[selectedImageIndex % collectionImages.length] : null;
          const phoneImage = mobileCollectionImages.length ? mobileCollectionImages[selectedImageIndex % mobileCollectionImages.length] : image;
          return (
            <article className="editorial-feature-card" key={card.title}>
              <div className="editorial-feature-card-image">
                {categoryImage(image, phoneImage, { alt: phoneImage?.alt || image?.alt || "", loading: "lazy", decoding: "async" })}
              </div>
              <div className="editorial-feature-card-copy">
                <h3 style={{ color: sectionColor("featureCards", "heading") }}>{card.title}</h3>
                <p style={{ color: sectionColor("featureCards", "body") }}>{card.text}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="editorial-feature-cards-track cms-mobile-copy cms-mobile-feature-cards">
        {mobileCards("featureCards", pageContent.featureCards).map((card, idx) => {
          const selectedImageIndex = Number.isFinite(Number(card.imageIndex)) ? Math.max(0, Number(card.imageIndex) - 1) : idx;
          const image = mobileCollectionImages.length ? mobileCollectionImages[selectedImageIndex % mobileCollectionImages.length] : null;
          return (
            <article className="editorial-feature-card" key={`mobile-${card.title}`}>
              <div className="editorial-feature-card-image">
                {categoryImage(image, image, { alt: image?.alt || "", loading: "lazy", decoding: "async" })}
              </div>
              <div className="editorial-feature-card-copy">
                <h3 style={{ color: sectionColor("featureCards", "heading") }}>{card.title}</h3>
                <p style={{ color: sectionColor("featureCards", "body") }}>{card.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </motion.section>
  );

  const whyPhantomSection = (
    <motion.section
      id="why-phantom"
      className={`editorial-why-section cms-section-layout ${mobileColorClass("why")}`}
      style={sectionLayoutStyle("why")}
      aria-label={pageContent.whyHeading}
      {...getFadeUpMotion(isReduced, 0.04, 16)}
    >
      <div className="editorial-why-panel">
        <header className="editorial-why-heading">
          <h2 style={{ color: sectionColor("why", "heading") }}>{renderResponsiveText("whyHeading", pageContent.whyHeading)}</h2>
          <Link style={{ color: sectionColor("why", "body") }} to={mobileText("whyExploreLink", pageContent.whyExploreLink || "/stories")}>{renderResponsiveText("whyExploreLabel", pageContent.whyExploreLabel)} <span aria-hidden="true">›</span></Link>
        </header>
        <p className="editorial-why-lead" style={{ color: sectionColor("why", "body") }}>{renderResponsiveText("whyLead", pageContent.whyLead)}</p>
        <div className="editorial-why-grid cms-desktop-copy">
          {pageContent.whyCards.map((benefit) => (
            <article className="editorial-why-card" key={benefit.title}>
              {PHANTOM_BENEFITS[benefit.icon] && <svg className="editorial-why-icon" viewBox="0 0 48 48" aria-hidden="true">{PHANTOM_BENEFITS[benefit.icon].icon}</svg>}
              <h3 style={{ color: sectionColor("why", "heading") }}>{benefit.title}</h3>
              <p style={{ color: sectionColor("why", "body") }}>{benefit.text}</p>
            </article>
          ))}
        </div>
        <div className="editorial-why-grid cms-mobile-copy cms-mobile-feature-cards">
          {mobileCards("whyCards", pageContent.whyCards).map((benefit) => (
            <article className="editorial-why-card" key={`mobile-${benefit.title}`}>
              {PHANTOM_BENEFITS[benefit.icon] && <svg className="editorial-why-icon" viewBox="0 0 48 48" aria-hidden="true">{PHANTOM_BENEFITS[benefit.icon].icon}</svg>}
              <h3 style={{ color: sectionColor("why", "heading") }}>{benefit.title}</h3>
              <p style={{ color: sectionColor("why", "body") }}>{benefit.text}</p>
            </article>
          ))}
        </div>
        <footer className="editorial-why-footer">
          <h3 style={{ color: sectionColor("why", "heading") }}>{renderResponsiveText("whyFooterHeading", pageContent.whyFooterHeading)}</h3>
          <p style={{ color: sectionColor("why", "body") }}>{renderResponsiveText("whyFooterText", pageContent.whyFooterText)}</p>
          <Link style={{ color: sectionColor("why", "body") }} to={mobileText("whyCtaLink", pageContent.whyCtaLink || "/contact")}>{renderResponsiveText("whyCtaLabel", pageContent.whyCtaLabel)} <span aria-hidden="true">›</span></Link>
        </footer>
      </div>
    </motion.section>
  );

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
      {responsiveTypographyCss && <style>{responsiveTypographyCss}</style>}
      <div className="editorial-container">
        <article className="editorial-article" aria-label={`${story.category || "Photography"}: ${story.headline || ""}`}>
          
          {/* Full-screen category opening */}
          <section id="overview" className={`editorial-opening-spread cms-section-layout ${mobileColorClass("opening")}`} style={sectionLayoutStyle("opening")} aria-label={`${story.category} photography`}>
            {story.leadImage && (
              <motion.figure className="editorial-opening-photo" {...getFadeUpMotion(isReduced, 0.04, 18)}>
                {categoryImage(story.leadImage, mobileImage("opening", story.leadImage), { alt: mobileImage("opening", story.leadImage)?.alt || story.leadImage.alt || story.headline, width: "1200", height: "1500", loading: "eager", fetchPriority: "high", decoding: "async" })}
                {story.leadImage.caption && <figcaption className="editorial-caption" style={{ color: sectionColor("opening", "body") }}>{conciseCopy(story.leadImage.caption, 12)}</figcaption>}
              </motion.figure>
            )}
            <motion.div className="editorial-opening-copy cms-positionable-copy" {...getFadeUpMotion(isReduced, 0.08, 16)}>
              <span className="editorial-opening-brand">PHANTOM LABS</span>
              <span className="editorial-opening-label" style={{ color: sectionColor("opening", "body") }}>{renderResponsiveText("openingLabel", story.category || "Photography")}</span>
              <h1 className="editorial-headline" style={{ color: sectionColor("opening", "heading") }}>{renderResponsiveText("openingHeadline", story.headline)}</h1>
              {(story.deck || mobileText("openingDeck", "")) && <p className="editorial-deck" style={{ color: sectionColor("opening", "body") }}>{renderResponsiveText("openingDeck", conciseCopy(story.deck, 16))}</p>}
            </motion.div>
          </section>

          <motion.section
            id="details"
            className={`editorial-closer-section cms-section-layout ${mobileColorClass("gallery")}`}
            style={sectionLayoutStyle("gallery")}
            aria-label={`${story.category} photo details`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-closer-heading">
              <h2 style={{ color: sectionColor("gallery", "heading") }}>{renderResponsiveText("closerLookHeading", pageContent.closerLookHeading)}</h2>
            </header>
            {collectionImages.length > 0 && (
              <div id="gallery" className="editorial-gallery">
                <div
                  className="editorial-photo-collection"
                  role="region"
                  aria-roledescription="carousel"
                  aria-label={`${story.category} detailed photographs`}
                >
                  {collectionImages.map((image, idx) => (
                    <figure
                      key={`detail-${image.src}-${idx}`}
                      className="editorial-collection-photo"
                    >
                      <div className="editorial-collection-image">
                        {categoryImage(image, mobileCollectionImages[idx] || image, { alt: mobileCollectionImages[idx]?.alt || image.alt || "", width: "1600", height: "1100", loading: "lazy", decoding: "async" })}
                      </div>
                      <figcaption style={{ color: sectionColor("gallery", "body") }}>
                        <span className="cms-desktop-copy">{image.caption ? conciseCopy(image.caption, 14) : `${story.category} · 0${idx + 1}`}</span>
                        <span className="cms-mobile-copy">{mobileCollectionImages[idx]?.caption ? conciseCopy(mobileCollectionImages[idx].caption, 14) : (image.caption ? conciseCopy(image.caption, 14) : `${story.category} · 0${idx + 1}`)}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          <motion.section
            id="experience"
            className={`editorial-experience-section cms-section-layout ${mobileColorClass("experience")}`}
            style={sectionLayoutStyle("experience")}
            aria-label={`${story.category} photography`}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            {isEditorialCategory ? (
              <div className="editorial-experience-copy editorial-experience-copy--editorial">
                <p style={{ color: sectionColor("experience", "body") }}>{renderResponsiveText("experienceEyebrow", pageContent.experienceEyebrow)}</p>
                <h2 style={sectionHeadingStyle("experience")}>{renderResponsiveLines("experienceHeading", pageContent.experienceHeading)}</h2>
                <div className="editorial-experience-description">
                  <span style={{ color: sectionColor("experience", "body") }}>{renderResponsiveText("experienceLead", pageContent.experienceLead)}</span> <span style={{ color: sectionColor("experience", "body") }}>{renderResponsiveText("experienceDescription", pageContent.experienceDescription)}</span>
                </div>
                {featureImage && (
                  <figure className="editorial-experience-editorial-image">
                    {categoryImage(featureImage, mobileImage("experience", featureImage), { alt: mobileImage("experience", featureImage)?.alt || featureImage.alt || `${story.category} photography`, loading: "lazy", decoding: "async" })}
                  </figure>
                )}
              </div>
            ) : (
              <>
                  {featureImage && categoryImage(featureImage, mobileImage("experience", featureImage), { pictureClassName: "editorial-experience-picture", className: "editorial-experience-image", alt: "", "aria-hidden": true, loading: "lazy", decoding: "async" })}
                <div className="editorial-experience-overlay" aria-hidden="true" />
                <div className="editorial-experience-copy cms-positionable-copy">
                  <p style={{ color: sectionColor("experience", "body") }}>{renderResponsiveText("experienceEyebrow", pageContent.experienceEyebrow)}</p>
                  <h2 style={sectionHeadingStyle("experience")}>{renderResponsiveLines("experienceHeading", pageContent.experienceHeading)}</h2>
                </div>
              </>
            )}
          </motion.section>

          {isEditorialCategory && featureCardsSection}

          <motion.section
            id="approach"
            className={`editorial-approach-section cms-section-layout ${mobileColorClass("approach")}`}
            style={sectionLayoutStyle("approach")}
            aria-label="Our photography approach"
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            {isEditorialCategory ? (
              <div className="editorial-camera-feature">
                <header className="editorial-camera-copy">
                  <p className="editorial-camera-label" style={{ color: sectionColor("approach", "body") }}>{renderResponsiveText("cameraLabel", pageContent.cameraLabel)}</p>
                  <h2 style={sectionHeadingStyle("approach")}>{renderResponsiveLines("cameraHeading", pageContent.cameraHeading)}</h2>
                  <p className="editorial-camera-description" style={{ color: sectionColor("approach", "body") }}>{renderResponsiveText("cameraDescription", pageContent.cameraDescription)}</p>
                </header>
                {longImage && (
                  <figure className="editorial-camera-image">
                    {categoryImage(longImage, mobileImage("approach", longImage), { alt: mobileImage("approach", longImage)?.alt || longImage.alt || "Editorial portrait", loading: "lazy", decoding: "async" })}
                  </figure>
                )}
              </div>
            ) : (
              <>
                <header className="editorial-approach-intro">
                <h2 style={sectionHeadingStyle("approach")}>{renderResponsiveText("approachHeading", pageContent.approachHeading)}</h2>
                <p style={{ color: sectionColor("approach", "body") }}>{renderResponsiveText("approachDescription", pageContent.approachDescription)}</p>
                </header>
                <div className="editorial-approach-grid cms-desktop-copy">
                  {pageContent.approachCards.map((card, index) => <article className="editorial-approach-item" key={card.title}>
                    <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" /><path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5m21.2 21.2 3.5 3.5m0-28.2-3.5 3.5M13.4 34.6l-3.5 3.5" /></svg>
                    <h3 style={{ color: sectionColor("approach", "heading") }}>{card.title}</h3>
                    <p style={{ color: sectionColor("approach", "body") }}>{card.text}</p>
                  </article>)}
                </div>
                <div className="editorial-approach-grid cms-mobile-copy cms-mobile-feature-cards">
                  {mobileCards("approachCards", pageContent.approachCards).map((card, index) => <article className="editorial-approach-item" key={`mobile-${card.title}`}>
                    <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" /><path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5m21.2 21.2 3.5 3.5m0-28.2-3.5 3.5M13.4 34.6l-3.5 3.5" /></svg>
                    <h3 style={{ color: sectionColor("approach", "heading") }}>{card.title}</h3>
                    <p style={{ color: sectionColor("approach", "body") }}>{card.text}</p>
                  </article>)}
                </div>
              </>
            )}
          </motion.section>

          {!isEditorialCategory && (
            <motion.section
              id="perspective"
              className={`editorial-long-image-section cms-section-layout ${mobileColorClass("perspective")}`}
              style={sectionLayoutStyle("perspective")}
              aria-label={`${story.category} in a new perspective`}
              {...getFadeUpMotion(isReduced, 0.04, 16)}
            >
                {longImage && categoryImage(perspectiveImage, mobileImage("perspective", perspectiveImage), {
                  className: "editorial-long-image",
                  pictureClassName: "editorial-long-image-picture",
                  alt: "",
                  "aria-hidden": true,
                  loading: "eager",
                  decoding: "async",
                  onError: (event) => {
                    const fallbackSrc = imageSource(defaultsPageContent.sectionImages.perspective);
                    const image = event.currentTarget;
                    if (!fallbackSrc || image.currentSrc === new URL(fallbackSrc, window.location.href).href) return;
                    image.closest("picture")?.querySelectorAll("source").forEach((source) => source.remove());
                    image.src = fallbackSrc;
                  },
                })}
              <div className="editorial-long-image-overlay" aria-hidden="true" />
              <div className="editorial-long-image-copy cms-positionable-copy">
                <p style={{ color: sectionColor("perspective", "body") }}>{renderResponsiveText("perspectiveEyebrow", pageContent.perspectiveEyebrow)}</p>
                <h2 style={sectionHeadingStyle("perspective")}>{renderResponsiveText("perspectiveHeading", pageContent.perspectiveHeading)}</h2>
              </div>
            </motion.section>
          )}

          {!isEditorialCategory && featureCardsSection}

          {!isEditorialCategory && whyPhantomSection}

          <motion.section
            id="values"
            className={`editorial-values-section cms-section-layout ${mobileColorClass("values")}`}
            style={sectionLayoutStyle("values")}
            aria-label={pageContent.valuesHeading}
            {...getFadeUpMotion(isReduced, 0.04, 16)}
          >
            <header className="editorial-values-heading">
              <h2 style={{ color: sectionColor("values", "heading") }}>{renderResponsiveText("valuesHeading", pageContent.valuesHeading)}</h2>
            </header>
            <div className="editorial-values-grid cms-desktop-copy">
              {pageContent.valueCards.map((card, index) => (
                <article className="editorial-value-card" key={card.title}>
                  <svg viewBox="0 0 48 48" aria-hidden="true">{VALUE_CARD_ICONS[index]}</svg>
                  <h3 style={{ color: sectionColor("values", "heading") }}>{card.title}</h3>
                  <p style={{ color: sectionColor("values", "body") }}>{card.text}</p>
                  {card.linkLabel && <Link style={{ color: sectionColor("values", "body") }} to={card.linkTo || "/stories"}>{card.linkLabel} <span aria-hidden="true">›</span></Link>}
                </article>
              ))}
            </div>
            <div className="editorial-values-grid cms-mobile-copy cms-mobile-feature-cards">
              {mobileCards("valueCards", pageContent.valueCards).map((card, index) => (
                <article className="editorial-value-card" key={`mobile-${card.title}`}>
                  <svg viewBox="0 0 48 48" aria-hidden="true">{VALUE_CARD_ICONS[index % VALUE_CARD_ICONS.length]}</svg>
                  <h3 style={{ color: sectionColor("values", "heading") }}>{card.title}</h3>
                  <p style={{ color: sectionColor("values", "body") }}>{card.text}</p>
                  {card.linkLabel && <Link style={{ color: sectionColor("values", "body") }} to={card.linkTo || "/stories"}>{card.linkLabel} <span aria-hidden="true">›</span></Link>}
                </article>
              ))}
            </div>
          </motion.section>

          {isEditorialCategory && (
            <motion.section
              id="editorial-collection-story"
              className={`editorial-family-section cms-section-layout ${mobileColorClass("collection")}`}
              style={sectionLayoutStyle("collection")}
              aria-label={pageContent.collectionEyebrow}
              {...getFadeUpMotion(isReduced, 0.04, 16)}
            >
              <header className="editorial-family-copy">
                <p style={{ color: sectionColor("collection", "body") }}>{renderResponsiveText("collectionEyebrow", pageContent.collectionEyebrow)}</p>
                <h2 style={sectionHeadingStyle("collection")}>{renderResponsiveLines("collectionHeading", pageContent.collectionHeading)}</h2>
              </header>
              <div className="editorial-family-composition" aria-label="A collection of editorial portraits">
                {collectionImages.slice(0, 3).map((image, index) => (
                  <figure className={`editorial-family-frame editorial-family-frame--${index + 1}`} key={image.src}>
                    {categoryImage(image, mobileCollectionImages[index] || image, { alt: mobileCollectionImages[index]?.alt || image.alt || "", loading: "lazy", decoding: "async" })}
                  </figure>
                ))}
              </div>
              <p className="editorial-family-description" style={{ color: sectionColor("collection", "body") }}>{renderResponsiveText("collectionDescription", pageContent.collectionDescription)}</p>
            </motion.section>
          )}

          {isEditorialCategory && whyPhantomSection}

        </article>
      </div>
    </motion.div>
  );
}
