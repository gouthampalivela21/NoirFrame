import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Portfolio from "../components/Portfolio.jsx";

export default function PortfolioPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = "Work & Portfolio — Visual Archive | Phantom Labs";

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = "";
    if (metaDesc) {
      originalDesc = metaDesc.getAttribute("content") || "";
      metaDesc.setAttribute(
        "content",
        "Explore the Phantom Labs portfolio. An editorial photography archive of portraits, intimate couples, events, brands, and conceptual studies."
      );
    }

    return () => {
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
    };
  }, []);

  return (
    <motion.article
      className="portfolio-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Editorial Header */}
      <header className="portfolio-page__header section">
        <div className="container-max">
          <div className="portfolio-page__header-inner">
            <span className="eyebrow portfolio-page__eyebrow">
              PORTFOLIO &bull; ARCHIVE 2026
            </span>

            <h1 className="portfolio-page__title display-1">
              Selected Works
            </h1>

            <p className="portfolio-page__lead body-lg font-serif-italic">
              &ldquo;Currently building our first body of work. One story at a time.&rdquo;
            </p>

            <p className="portfolio-page__sub body-md">
              A curated collection of quiet moments, sculptural natural light, and
              unposed human presence. Filter across disciplines to explore upcoming
              and completed photographic studies.
            </p>
          </div>
        </div>
      </header>

      {/* Main Portfolio Grid */}
      <Portfolio />

      {/* Bottom Commissions Banner */}
      <section className="section portfolio-page__cta-section">
        <div className="container-max portfolio-page__cta-inner">
          <span className="eyebrow">COMMISSIONS OPEN</span>
          <h2 className="portfolio-page__cta-title display-2">
            Have a story you want framed?
          </h2>
          <p className="portfolio-page__cta-text body-md">
            We collaborate with individuals, couples, and brands on a limited number
            of intentional commissions worldwide.
          </p>
          <div className="portfolio-page__cta-actions">
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
