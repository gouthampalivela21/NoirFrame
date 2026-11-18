import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MacBookStageShowcase from "../components/experience/MacBookStageShowcase.jsx";
import InsideWebsiteModal, {
  INSIDE_WEBSITE_MODULES,
} from "../components/experience/InsideWebsiteModal.jsx";
import {
  routeTransition,
  reducedMotionTransition,
  EASE_APPLE,
} from "../animations/pageTransitions.js";
import { prefersReducedMotion } from "../utils/helpers.js";

gsap.registerPlugin(ScrollTrigger);

const FILM_PROCESS_STAGES = [
  { num: "1.", title: "Discovery", caption: "Brand research & visual goals" },
  { num: "2.", title: "Strategy", caption: "Narrative structure & conversion path" },
  { num: "3.", title: "UI/UX Architecture", caption: "Grid systems & user flow clarity" },
  { num: "4.", title: "Visual Design", caption: "Typography, lighting & restraint" },
  { num: "5.", title: "Development", caption: "GSAP motion, Vite & clean code" },
  { num: "6.", title: "Testing & Launch", caption: "Cross-browser QA & live release" },
];

const CREATIVE_PROCESS_TIMELINE = [
  {
    step: "01",
    name: "DISCOVER",
    desc: "Understanding the brand, audience, goals and vision.",
  },
  {
    step: "02",
    name: "DEFINE",
    desc: "Creating the creative direction and digital strategy.",
  },
  {
    step: "03",
    name: "DESIGN",
    desc: "Crafting intuitive interfaces and distinctive visual identities.",
  },
  {
    step: "04",
    name: "DEVELOP",
    desc: "Transforming designs into responsive, high-performance experiences.",
  },
  {
    step: "05",
    name: "DELIVER",
    desc: "Testing, refining and launching the final experience.",
  },
];

const TECH_STACK = [
  {
    name: "React 18",
    role: "Component Architecture",
    detail: "Modular view hierarchy with concurrent route suspense.",
  },
  {
    name: "Vite 5",
    role: "Build Engine",
    detail: "Sub-second HMR and tree-shaken production chunks.",
  },
  {
    name: "GSAP & ScrollTrigger",
    role: "Scroll Choreography",
    detail: "Pinned multi-phase keynote timelines scrubbed at 60fps.",
  },
  {
    name: "Lenis",
    role: "Smooth Inertia",
    detail: "Normalized wheel damping synchronized via gsap.ticker.",
  },
  {
    name: "Framer Motion",
    role: "Surface Transitions",
    detail: "Coordinated route crossfades and tactile UI physics.",
  },
  {
    name: "CSS 3D & Modern Layout",
    role: "Optical Rendering",
    detail: "Hardware-accelerated perspective rigs, fluid clamp type, and native dialogs.",
  },
  {
    name: "Supabase",
    role: "Studio Backend",
    detail: "Managed PostgreSQL data layer powering PHANTOM LABS operations.",
  },
];

function getDesktopCinematicMatch() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(min-width: 900px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function InsidePreviewThumb({ module }) {
  switch (module.id) {
    case "homepage":
      return (
        <div className="inside-thumb inside-thumb--homepage" aria-hidden="true">
          <img src="/images/hero-villa-wide.webp" alt="" loading="lazy" />
          <div className="inside-thumb__overlay">
            <span>Spaces That Inspire.</span>
          </div>
        </div>
      );
    case "navigation":
      return (
        <div className="inside-thumb inside-thumb--nav" aria-hidden="true">
          <div className="inside-thumb-nav-bar">
            <span>PHANTOM</span>
            <div className="inside-thumb-nav-dots">
              <i />
              <i />
              <i />
            </div>
            <span className="inside-thumb-nav-pill" />
          </div>
        </div>
      );
    case "typography":
      return (
        <div className="inside-thumb inside-thumb--type" aria-hidden="true">
          <span className="inside-thumb-type__aa">Aa</span>
          <span className="inside-thumb-type__meta">-0.03em · Inter Display</span>
        </div>
      );
    case "ui-components":
      return (
        <div className="inside-thumb inside-thumb--ui" aria-hidden="true">
          <span className="inside-thumb-ui__pill">Explore ↗</span>
          <span className="inside-thumb-ui__chip">Interactive Surface</span>
        </div>
      );
    case "mobile-experience":
      return (
        <div className="inside-thumb inside-thumb--mobile" aria-hidden="true">
          <div className="inside-thumb-phone">
            <img src="/images/hero-villa-mobile.webp" alt="" loading="lazy" />
          </div>
        </div>
      );
    case "animations":
    default:
      return (
        <div className="inside-thumb inside-thumb--motion" aria-hidden="true">
          <svg viewBox="0 0 180 76" fill="none" className="inside-thumb-curve">
            <path
              d="M12 64 C 46 64, 54 12, 168 12"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="64" r="3.5" fill="#ffffff" />
            <circle cx="168" cy="12" r="3.5" fill="rgba(255,255,255,0.85)" />
          </svg>
        </div>
      );
  }
}

export default function WebsiteExperiencePage() {
  const pageRef = useRef(null);
  const filmSectionRef = useRef(null);
  const pinRef = useRef(null);
  const visionRef = useRef(null);

  const [isDesktopCinematic, setIsDesktopCinematic] = useState(getDesktopCinematicMatch);
  const [activeMobileStage, setActiveMobileStage] = useState(0);
  const [selectedInsideId, setSelectedInsideId] = useState(null);

  const isReduced = prefersReducedMotion();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Website Experience — PHANTOM LABS";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const widthMq = window.matchMedia("(min-width: 900px)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setIsDesktopCinematic(widthMq.matches && !motionMq.matches);
    };

    update();
    widthMq.addEventListener("change", update);
    motionMq.addEventListener("change", update);
    return () => {
      widthMq.removeEventListener("change", update);
      motionMq.removeEventListener("change", update);
    };
  }, []);

  // Desktop 6-Phase Pinned Apple Keynote ScrollTrigger Film + Vision Parallax
  useEffect(() => {
    if (!pageRef.current) return undefined;

    const ctx = gsap.context(() => {
      if (isDesktopCinematic && filmSectionRef.current && pinRef.current) {
        const rig = pinRef.current.querySelector(".mbp-rig");
        const floatWrap = pinRef.current.querySelector(".mbp-float");
        const backlight = pinRef.current.querySelector(".exp-film__backlight");
        const heroCopy = pinRef.current.querySelector(".exp-hero__copy");
        const scrollCue = pinRef.current.querySelector(".exp-hero__scroll-cue");

        const sceneHero = pinRef.current.querySelector(".mbp-scene--hero");
        const sceneArchive = pinRef.current.querySelector(".mbp-scene--archive");
        const archiveCards = pinRef.current.querySelectorAll(".mbp-archive__card");
        const sceneResp = pinRef.current.querySelector(".mbp-scene--responsive");
        const respPhone = pinRef.current.querySelector(".mbp-resp__phone");
        const sceneProcess = pinRef.current.querySelector(".mbp-scene--process");
        const sceneFinal = pinRef.current.querySelector(".mbp-scene--final");

        const storyEditorial = pinRef.current.querySelector(".exp-story-editorial");
        const processStage = pinRef.current.querySelector(".exp-process-stage");
        const finalCaption = pinRef.current.querySelector(".exp-final-caption");

        const procItems = FILM_PROCESS_STAGES.map((_, idx) =>
          pinRef.current.querySelector(`.exp-proc-item--${idx}`)
        );
        const procViews = FILM_PROCESS_STAGES.map((_, idx) =>
          pinRef.current.querySelector(`.mbp-proc-view--${idx}`)
        );

        // Initial resting hero compositor coordinates
        gsap.set(rig, {
          transformPerspective: 1800,
          transformOrigin: "50% 45%",
          x: 0,
          yPercent: 20,
          scale: 0.94,
          rotationX: 3,
          rotationY: 0,
        });

        gsap.set(sceneHero, { opacity: 1, yPercent: 0 });
        gsap.set(sceneArchive, { opacity: 0, yPercent: 10 });
        gsap.set(archiveCards, { y: 24, opacity: 0 });
        gsap.set(sceneResp, { opacity: 0, yPercent: 8 });
        gsap.set(respPhone, { y: 28, opacity: 0 });
        gsap.set(sceneProcess, { opacity: 0 });
        gsap.set(sceneFinal, { opacity: 0 });

        gsap.set(storyEditorial, { opacity: 0, y: 28 });
        gsap.set(processStage, { opacity: 0, y: 24 });
        gsap.set(finalCaption, { opacity: 0, y: 20 });

        procItems.forEach((item, idx) => {
          gsap.set(item, { opacity: idx === 0 ? 1 : 0.32, x: idx === 0 ? 6 : 0 });
        });
        procViews.forEach((view, idx) => {
          gsap.set(view, { opacity: idx === 0 ? 1 : 0, y: idx === 0 ? 0 : 14 });
        });

        const getSideOffsetX = () => Math.min(window.innerWidth * 0.175, 250);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: filmSectionRef.current,
            start: "top top",
            end: "+=540%",
            pin: pinRef.current,
            scrub: 0.95,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // PHASE 1 (0 -> 0.14): Hero fade out & laptop centers
        tl.to(heroCopy, { opacity: 0, y: -36, duration: 0.11 }, 0)
          .to(scrollCue, { opacity: 0, y: 12, duration: 0.08 }, 0)
          .to(floatWrap, { y: 0, duration: 0.1 }, 0)
          .to(
            rig,
            { yPercent: 0, scale: 1.08, rotationX: 0, duration: 0.14 },
            0
          )

          // PHASE 2 (0.14 -> 0.28): Cinematic zoom cleanly into Retina viewport
          .to(
            rig,
            { scale: 2.08, yPercent: 3, duration: 0.14, ease: "power2.inOut" },
            0.14
          )
          .to(backlight, { opacity: 0.25, duration: 0.12 }, 0.14)

          // PHASE 3 (0.28 -> 0.46): Website reveal across internal sections with depth
          .to(sceneHero, { opacity: 0, yPercent: -12, duration: 0.07 }, 0.28)
          .to(sceneArchive, { opacity: 1, yPercent: 0, duration: 0.08 }, 0.29)
          .to(
            archiveCards,
            { y: 0, opacity: 1, stagger: 0.015, duration: 0.06 },
            0.31
          )
          .to(sceneArchive, { opacity: 0, yPercent: -8, duration: 0.06 }, 0.37)
          .to(sceneResp, { opacity: 1, yPercent: 0, duration: 0.07 }, 0.38)
          .to(respPhone, { y: 0, opacity: 1, duration: 0.07 }, 0.39)

          // PHASE 4 (0.46 -> 0.62): Laptop glides aside + angled 3D + Design Story copy
          .to(sceneResp, { opacity: 0, duration: 0.05 }, 0.46)
          .to(sceneHero, { opacity: 1, yPercent: 0, duration: 0.06 }, 0.47)
          .to(backlight, { opacity: 0.72, duration: 0.12 }, 0.47)
          .to(
            rig,
            {
              x: getSideOffsetX,
              yPercent: 2,
              scale: 0.9,
              rotationY: -18,
              rotationX: 4,
              duration: 0.14,
            },
            0.46
          )
          .to(storyEditorial, { opacity: 1, y: 0, duration: 0.09 }, 0.51)

          // PHASE 5 (0.62 -> 0.88): Sequential Process 1..6 synced inside MacBook screen
          .to(storyEditorial, { opacity: 0, y: -22, duration: 0.05 }, 0.62)
          .to(sceneHero, { opacity: 0, duration: 0.04 }, 0.62)
          .to(sceneProcess, { opacity: 1, duration: 0.05 }, 0.63)
          .to(
            rig,
            { rotationY: -12, rotationX: 2, duration: 0.08 },
            0.62
          )
          .to(processStage, { opacity: 1, y: 0, duration: 0.06 }, 0.64);

        // Sequential stepping across Process stages 1 -> 6
        const stepStart = 0.66;
        const stepDuration = 0.036;
        for (let i = 1; i < FILM_PROCESS_STAGES.length; i++) {
          const at = stepStart + (i - 1) * stepDuration;
          tl.to(
            procItems[i - 1],
            { opacity: 0.32, x: 0, duration: 0.022 },
            at
          )
            .to(
              procViews[i - 1],
              { opacity: 0, y: -12, duration: 0.022 },
              at
            )
            .to(
              procItems[i],
              { opacity: 1, x: 8, duration: 0.024 },
              at + 0.008
            )
            .to(
              procViews[i],
              { opacity: 1, y: 0, duration: 0.024 },
              at + 0.008
            );
        }

        // PHASE 6 (0.88 -> 1.00): Full-width centered final presentation + subtle 3D settle
        tl.to(processStage, { opacity: 0, y: -20, duration: 0.05 }, 0.88)
          .to(sceneProcess, { opacity: 0, duration: 0.04 }, 0.88)
          .to(sceneFinal, { opacity: 1, duration: 0.06 }, 0.89)
          .to(backlight, { opacity: 0.95, duration: 0.1 }, 0.88)
          .to(
            rig,
            {
              x: 0,
              yPercent: 1,
              scale: 1.14,
              rotationY: 0,
              rotationX: 2,
              duration: 0.11,
            },
            0.88
          )
          .to(finalCaption, { opacity: 1, y: 0, duration: 0.07 }, 0.92);
      }

      // Vision Section subtle architectural parallax (all desktop non-reduced)
      if (!isReduced && visionRef.current) {
        const visionMedia = visionRef.current.querySelector(".exp-vision__parallax-img");
        if (visionMedia) {
          gsap.fromTo(
            visionMedia,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: visionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            }
          );
        }
      }
    }, pageRef);

    // Ensure ScrollTrigger recalculates geometry cleanly after lazy route entry
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [isDesktopCinematic, isReduced]);

  const variants = isReduced ? reducedMotionTransition : routeTransition;

  return (
    <motion.div
      ref={pageRef}
      className="exp-page"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* SECTION 01 & 02: CINEMATIC HERO + APPLE SCROLL-DRIVEN FILM */}
      <section
        ref={filmSectionRef}
        className={`exp-film ${isDesktopCinematic ? "exp-film--pinned" : "exp-film--stacked"}`}
        aria-label="Website Design Interactive Experience"
      >
        <div ref={pinRef} className="exp-film__pin">
          <div className="exp-film__backlight" aria-hidden="true" />

          {/* Hero Copy Overlay */}
          <div className="exp-hero__copy">
            <span className="exp-hero__label">WEBSITE EXPERIENCE</span>
            <h1 className="exp-hero__title">
              Websites that
              <br />
              feel different.
            </h1>
            <p className="exp-hero__subtitle">
              We design and develop digital experiences that turn ideas into something extraordinary.
            </p>
          </div>

          {/* Center / 3D Transform MacBook Stage */}
          <div className="exp-film__macbook-slot">
            <MacBookStageShowcase
              activeProcessIdx={isDesktopCinematic ? null : activeMobileStage}
              interactiveMode={!isDesktopCinematic}
            />
          </div>

          {isDesktopCinematic && (
            <>
              {/* Phase 4 Editorial Copy beside angled laptop */}
              <div className="exp-story-editorial" aria-hidden="false">
                <span className="exp-kicker">03 / DESIGN STORY</span>
                <h2 className="exp-story-editorial__title">
                  Designed with restraint.
                  <br />
                  Built to hold attention.
                </h2>
                <p className="exp-story-editorial__text">
                  Every proportion, margin, and light cue is calibrated so the product commands the room — never visual noise.
                </p>
              </div>

              {/* Phase 5 Sequential 6-Stage Process beside synchronized screen */}
              <div className="exp-process-stage">
                <span className="exp-kicker">04 / THE PROCESS</span>
                <ul className="exp-proc-list">
                  {FILM_PROCESS_STAGES.map((stage, idx) => (
                    <li key={stage.title} className={`exp-proc-item exp-proc-item--${idx}`}>
                      <span className="exp-proc-item__num">{stage.num}</span>
                      <div className="exp-proc-item__copy">
                        <strong>{stage.title}</strong>
                        <span>{stage.caption}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase 6 Final Reveal Caption */}
              <div className="exp-final-caption">
                <span className="exp-kicker">05 / FINAL REVEAL</span>
                <p>Precision crafted from concept to live viewport.</p>
              </div>
            </>
          )}

          {/* Scroll Prompt */}
          <div className="exp-hero__scroll-cue" aria-hidden="true">
            <span>SCROLL TO EXPLORE</span>
            <span className="exp-hero__scroll-arrow">↓</span>
          </div>
        </div>

        {/* Non-Pinned Mobile / Reduced-Motion Story & Interactive Process Panel */}
        {!isDesktopCinematic && (
          <div className="exp-mobile-story">
            <div className="exp-mobile-story__card">
              <span className="exp-kicker">DESIGN STORY</span>
              <h2 className="exp-mobile-story__title">
                Designed with restraint. Built to hold attention.
              </h2>
              <p className="exp-mobile-story__text">
                Tap any stage below to inspect how the architecture inside the MacBook screen evolves from discovery to production release.
              </p>

              <div className="exp-mobile-tabs" role="tablist" aria-label="Experience workflow stages">
                {FILM_PROCESS_STAGES.map((stage, idx) => (
                  <button
                    key={stage.title}
                    type="button"
                    role="tab"
                    aria-selected={activeMobileStage === idx}
                    className={`exp-mobile-tab ${activeMobileStage === idx ? "is-active" : ""}`}
                    onClick={() => setActiveMobileStage(idx)}
                  >
                    <span>{stage.num}</span>
                    <span>{stage.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 03: THE VISION */}
      <section ref={visionRef} className="exp-vision" aria-labelledby="vision-heading">
        <div className="exp-vision__inner container-max">
          <motion.div
            className="exp-vision__copy"
            initial={isReduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: EASE_APPLE }}
          >
            <span className="exp-kicker">THE VISION</span>
            <h2 id="vision-heading" className="exp-vision__title">
              More than a website.
            </h2>
            <p className="exp-vision__desc">
              We don’t just build websites. We create digital experiences that communicate identity, evoke emotion, and make brands unforgettable.
            </p>
          </motion.div>

          <div className="exp-vision__media-frame">
            <picture>
              <source type="image/webp" srcSet="/images/hero-villa-wide.webp" />
              <img
                src="/images/hero-villa-wide.jpg"
                alt="Architectural glass villa glowing at twilight overlooking misty mountains"
                className="exp-vision__parallax-img"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* SECTION 04: OUR CREATIVE PROCESS TIMELINE */}
      <section className="exp-creative-process" aria-labelledby="process-heading">
        <div className="exp-creative-process__inner container-max">
          <div className="exp-section-head">
            <span className="exp-kicker">METHODOLOGY</span>
            <h2 id="process-heading" className="exp-section-title">
              Our Creative Process
            </h2>
          </div>

          <ol className="exp-timeline">
            {CREATIVE_PROCESS_TIMELINE.map((stage, idx) => (
              <motion.li
                key={stage.name}
                className="exp-timeline__row"
                initial={isReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.72,
                  delay: isReduced ? 0 : idx * 0.06,
                  ease: EASE_APPLE,
                }}
              >
                <span className="exp-timeline__num">{stage.step}</span>
                <h3 className="exp-timeline__name">{stage.name}</h3>
                <p className="exp-timeline__desc">{stage.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* SECTION 05: INSIDE THE WEBSITE */}
      <section className="exp-inside" aria-labelledby="inside-heading">
        <div className="exp-inside__inner container-max">
          <div className="exp-section-head">
            <span className="exp-kicker">ANATOMY OF THE EXPERIENCE</span>
            <h2 id="inside-heading" className="exp-section-title">
              Inside the Website
            </h2>
            <p className="exp-section-sub">
              Select any layer below to open its enlarged interactive inspection view.
            </p>
          </div>

          <div className="exp-inside__grid">
            {INSIDE_WEBSITE_MODULES.map((mod, idx) => (
              <motion.button
                key={mod.id}
                type="button"
                className="exp-inside-card"
                onClick={() => setSelectedInsideId(mod.id)}
                initial={isReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.72,
                  delay: isReduced ? 0 : (idx % 3) * 0.06,
                  ease: EASE_APPLE,
                }}
              >
                <InsidePreviewThumb module={mod} />
                <div className="exp-inside-card__footer">
                  <div className="exp-inside-card__titles">
                    <span className="exp-inside-card__index">{mod.index}</span>
                    <strong className="exp-inside-card__name">{mod.title}</strong>
                  </div>
                  <span className="exp-inside-card__inspect" aria-hidden="true">
                    Inspect ↗
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 06: TECHNOLOGY (GENUINE ACTIVE STACK ONLY) */}
      <section className="exp-tech" aria-labelledby="tech-heading">
        <div className="exp-tech__inner container-max">
          <div className="exp-section-head">
            <span className="exp-kicker">TECHNOLOGY</span>
            <h2 id="tech-heading" className="exp-section-title">
              Engineered for quiet speed.
            </h2>
          </div>

          <div className="exp-tech__list">
            {TECH_STACK.map((item, idx) => (
              <motion.div
                key={item.name}
                className="exp-tech__item"
                initial={isReduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.65,
                  delay: isReduced ? 0 : idx * 0.04,
                  ease: EASE_APPLE,
                }}
              >
                <h3 className="exp-tech__name">{item.name}</h3>
                <span className="exp-tech__role">{item.role}</span>
                <p className="exp-tech__detail">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 07: FINAL CTA */}
      <section className="exp-cta" aria-labelledby="exp-cta-heading">
        <div className="exp-cta__glow" aria-hidden="true" />
        <motion.div
          className="exp-cta__inner container-max"
          initial={isReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: EASE_APPLE }}
        >
          <h2 id="exp-cta-heading" className="exp-cta__title">
            Let’s create something unforgettable.
          </h2>
          <p className="exp-cta__subtitle">
            Your next digital experience starts with an idea.
          </p>

          <div className="exp-cta__actions">
            <Link to="/contact" className="exp-cta__btn">
              <span>Start a Conversation</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/#websites" className="exp-cta__back">
              <span aria-hidden="true">←</span>
              <span>Return to PHANTOM LABS</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Interactive Native Top-Layer Inspection Dialog */}
      <InsideWebsiteModal
        selectedId={selectedInsideId}
        onSelectId={setSelectedInsideId}
        onClose={() => setSelectedInsideId(null)}
      />
    </motion.div>
  );
}
