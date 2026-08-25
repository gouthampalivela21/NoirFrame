import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartImage from "./SmartImage.jsx";

export default function StoryModal({ activeStory, onClose }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!activeStory) return undefined;

    // Pause background Lenis virtual scroll
    if (window.__lenis) {
      window.__lenis.stop();
    }

    // Lock body scroll behind modal
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Ensure scroll container starts at top
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      if (window.__lenis) {
        window.__lenis.start();
      }
      window.removeEventListener("keydown", onKey);
    };
  }, [activeStory, onClose]);

  return (
    <AnimatePresence>
      {activeStory && (
        <motion.div
          key={`story-modal-${activeStory.id}`}
          className="story-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
        >
          {/* Real Continuous 1-Screen Snap Document */}
          <div
            className="story-scroll-container"
            ref={scrollRef}
            data-lenis-prevent="true"
          >
            {/* SECTION 00: Centered Popup Hero Stage */}
            <section className="story-hero-stage">
              <div className="story-hero-container">
                {/* 1. Large Hero Image with shared-element FLIP transition */}
                <motion.div
                  className="story-hero-image-wrap"
                  layoutId={`story-image-${activeStory.id}`}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{ aspectRatio: activeStory.aspect }}
                >
                  <SmartImage
                    seed={activeStory.seed}
                    aspect={activeStory.aspect}
                    widths={[900, 1500, 2200]}
                    sizes="(max-width: 768px) 92vw, min(1200px, 92vw)"
                    alt={activeStory.title}
                    priority
                  />
                </motion.div>

                {/* 2. Metadata, Title & Quote */}
                <motion.div
                  className="story-hero-meta"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="eyebrow story-hero-eyebrow">
                    {(activeStory.category || "PHOTOGRAPHY").toUpperCase()} &mdash;{" "}
                    {activeStory.year || "2026"}
                  </span>
                  <h2 className="heading-xl story-hero-title">{activeStory.title}</h2>
                  <p className="body-md story-hero-quote font-serif-italic">
                    &ldquo;
                    {activeStory.intro?.quote ||
                      activeStory.tagline ||
                      activeStory.description ||
                      "Some stories are not told. They are remembered."}
                    &rdquo;
                  </p>
                </motion.div>

                {/* 3. Scroll Indicator */}
                <motion.div
                  className="story-scroll-indicator label-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>SCROLL TO EXPLORE STORY</span>
                  <span className="story-scroll-indicator__arrow">&darr;</span>
                </motion.div>
              </div>
            </section>

            {/* STORY CONTENT FLOW */}
            <div className="story-content-flow">
              {/* Story Prologue / Intro Copy */}
              {activeStory.intro?.description && (
                <section className="story-copy-section">
                  <motion.div
                    className="story-copy-inner"
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.45 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="eyebrow story-section-eyebrow">THE PROLOGUE</span>
                    <p className="display-2 story-copy-lead font-serif-italic">
                      &ldquo;{activeStory.intro.description}&rdquo;
                    </p>
                  </motion.div>
                </section>
              )}

              {/* Chapters Flow */}
              {activeStory.sections &&
                activeStory.sections.map((section, idx) => (
                  <React.Fragment key={idx}>
                    {/* Chapter Narrative Text */}
                    {(section.chapter || section.subtitle || section.quote || section.text) && (
                      <section className="story-copy-section">
                        <motion.div
                          className="story-copy-inner"
                          initial={{ opacity: 0, y: 24, scale: 0.98 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: false, amount: 0.45 }}
                          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <span className="eyebrow story-section-eyebrow">{section.chapter}</span>
                          <h3 className="display-2 story-section-title">{section.subtitle}</h3>
                          {section.quote && (
                            <p className="body-lg story-section-quote font-serif-italic">
                              &ldquo;{section.quote}&rdquo;
                            </p>
                          )}
                          {section.text && (
                            <p className="body-md story-section-text">{section.text}</p>
                          )}
                        </motion.div>
                      </section>
                    )}

                    {/* Chapter Major Image (100dvh screen snap) */}
                    {section.image && (
                      <section className="story-image-section">
                        <motion.figure
                          className="story-image-figure"
                          initial={{ opacity: 0, scale: 0.96 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: false, amount: 0.35 }}
                          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div
                            className="story-image-container"
                            style={{ aspectRatio: section.image.aspect || 16 / 10 }}
                          >
                            <SmartImage
                              seed={section.image.seed}
                              aspect={section.image.aspect || 16 / 10}
                              widths={[900, 1500, 2200]}
                              sizes="(max-width: 768px) 100vw, 88vw"
                              alt={section.image.caption || section.subtitle}
                            />
                          </div>
                          {section.image.caption && (
                            <figcaption className="label-sm story-caption">
                              {section.image.caption}
                            </figcaption>
                          )}
                        </motion.figure>
                      </section>
                    )}

                    {/* Supporting Multi-Photo Editorial Gallery Grid */}
                    {section.gallery && section.gallery.length > 0 && (
                      <section className="story-gallery-section">
                        <div className="container-max">
                          <div
                            className={`story-gallery-grid story-gallery-grid--${section.gallery.length}`}
                          >
                            {section.gallery.map((photo, pIdx) => (
                              <motion.figure
                                key={pIdx}
                                className="story-gallery-figure"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{
                                  duration: 0.7,
                                  delay: pIdx * 0.08,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                <div
                                  className="story-gallery-image-wrap"
                                  style={{ aspectRatio: photo.aspect || 4 / 5 }}
                                >
                                  <SmartImage
                                    seed={photo.seed}
                                    aspect={photo.aspect || 4 / 5}
                                    widths={[600, 1000, 1400]}
                                    sizes="(max-width: 768px) 100vw, 45vw"
                                    alt={photo.caption || ""}
                                  />
                                </div>
                                {photo.caption && (
                                  <figcaption className="label-sm story-caption">
                                    {photo.caption}
                                  </figcaption>
                                )}
                              </motion.figure>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
