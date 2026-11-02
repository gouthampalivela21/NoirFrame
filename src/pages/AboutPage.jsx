import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import About from "../components/About.jsx";
import Process from "../components/Process.jsx";

export default function AboutPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = "About Phantom Labs — Creative Philosophy & Studio Ethos";

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = "";
    if (metaDesc) {
      originalDesc = metaDesc.getAttribute("content") || "";
      metaDesc.setAttribute(
        "content",
        "Learn about the creative philosophy behind Phantom Labs. A creative visual studio specializing in natural light, unposed intimacy, and timeless cinematic storytelling."
      );
    }

    const triggers = initScrollReveals(pageRef.current, ".reveal");

    return () => {
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
      killTriggers(triggers);
    };
  }, []);

  return (
    <motion.article
      ref={pageRef}
      className="about-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Editorial Header */}
      <header className="about-page__header section">
        <div className="container-max">
          <div className="about-page__header-inner">
            <span className="eyebrow about-page__eyebrow">
              ABOUT PHANTOM LABS &bull; STUDIO ETHOS
            </span>

            <h1 className="about-page__title display-1">
              Visual Stories,<br />
              Framed Differently.
            </h1>

            <p className="about-page__lead body-lg font-serif-italic">
              &ldquo;Phantom Labs was created around a simple belief: the best photographs aren’t simply seen &mdash; they’re remembered.&rdquo;
            </p>
          </div>
        </div>
      </header>

      {/* Brand Identity & Studio Ethos Component */}
      <About />

      {/* Visual Philosophy Pillars */}
      <section className="section about-page__pillars-section">
        <div className="container-max">
          <div className="about-page__pillars-header reveal">
            <span className="eyebrow">CORE PRINCIPLES</span>
            <h2 className="heading-lg">Our Visual Philosophy</h2>
          </div>

          <div className="about-page__pillars-grid">
            {[
              {
                number: "01",
                title: "Light as Architecture",
                desc: "We work exclusively with sculpted natural daylight and ambient contrast. Shadow is not an absence of light; it is the dimension that gives a frame its tactile depth.",
              },
              {
                number: "02",
                title: "Unhurried Observation",
                desc: "We prioritize patient documentation over artificial posing. By creating a relaxed, unhurried atmosphere, we reveal the quiet glances and candid moments that matter most.",
              },
              {
                number: "03",
                title: "Archival Permanence",
                desc: "Every collection is toned with analog film color science, velvety blacks, and fine organic grain. We produce imagery built to endure long after digital trends pass.",
              },
            ].map((pillar) => (
              <div key={pillar.number} className="about-page__pillar-card reveal">
                <span className="about-page__pillar-num">{pillar.number}</span>
                <h3 className="about-page__pillar-title">{pillar.title}</h3>
                <p className="about-page__pillar-desc body-md">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Creative Process */}
      <Process />

      {/* Team Invitation Banner */}
      <section className="section about-page__team-invite">
        <div className="container-max about-page__team-invite-inner reveal">
          <div className="about-page__team-invite-content">
            <span className="eyebrow">THE COLLECTIVE</span>
            <h2 className="heading-lg">Meet the People Behind the Frame</h2>
            <p className="body-md" style={{ color: "var(--color-fg-muted)", maxWidth: "520px" }}>
              Explore the creative team, diverse disciplines, and distinct perspectives
              collaborating under one standard of visual precision.
            </p>
          </div>
          <div className="about-page__team-invite-btn-wrap">
            <Link
              to="/team"
              className="btn btn-secondary"
              data-cursor="button"
            >
              <span>DISCOVER THE COLLECTIVE</span>
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final Inquiry CTA */}
      <section className="section about-page__cta-section">
        <div className="container-max about-page__cta-inner">
          <span className="eyebrow">BEGIN A PROJECT</span>
          <h2 className="about-page__cta-title display-2">
            Let’s frame your next chapter.
          </h2>
          <div className="about-page__cta-btn-wrap">
            <Link
              to="/contact"
              className="btn btn-primary"
              data-cursor="button"
            >
              <span>START A CONVERSATION</span>
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </motion.article>
  );
}
