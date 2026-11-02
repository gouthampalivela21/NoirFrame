import React, { useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import { services as defaultServices } from "../data/services.js";
import { useData } from "../context/DataContext.jsx";

const SERVICE_DETAILS = {
  Portraits: [
    "Individual creative portraiture & editorial sessions",
    "Tailored moodboards and lighting direction",
    "Natural light and architectural setting exploration",
    "Archival monochrome digital negatives and select proofing",
  ],
  Couples: [
    "Unscripted intimate documentary storytelling",
    "Relaxed, unhurried pacing with zero stiff posing",
    "Custom location scouting tailored to your shared story",
    "Complete high-resolution collection with analog color grading",
  ],
  Events: [
    "Discreet observation for intimate gatherings and celebrations",
    "Atmospheric documentation prioritizing candor over spectacle",
    "Low-light ambient capture preserving true venue warmth",
    "Chronological narrative sequencing and archival gallery",
  ],
  Brands: [
    "Tactile visual identity and campaign imagery for creators",
    "Art direction aligned with editorial publication standards",
    "Multi-format assets suited for web, editorial, and print",
    "Cohesive monochrome and muted color palette development",
  ],
  Editorial: [
    "Concept-driven visual exploration and monograph projects",
    "Full creative direction from concept to print layout",
    "Experimental composition, medium-format grain, and motion reels",
    "Exhibition-grade print curation and sequencing",
  ],
};

export default function ServicesPage() {
  const pageRef = useRef(null);
  const { services: cmsServices } = useData();

  const activeServices = useMemo(() => {
    const raw = Array.isArray(cmsServices) && cmsServices.length > 0
      ? cmsServices
      : defaultServices;
    return raw.filter((s) => s.active !== false && s.published !== false);
  }, [cmsServices]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = "Services & Studio Commissions | Phantom Labs";

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = "";
    if (metaDesc) {
      originalDesc = metaDesc.getAttribute("content") || "";
      metaDesc.setAttribute(
        "content",
        "Explore photography services and studio commissions by Phantom Labs. Portraits, couples, events, brand narratives, and editorial storytelling."
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
      className="services-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Editorial Header */}
      <header className="services-page__header section">
        <div className="container-max">
          <div className="services-page__header-inner">
            <span className="eyebrow services-page__eyebrow">
              STUDIO COMMISSIONS &bull; 2026
            </span>

            <h1 className="services-page__title display-1">
              What We Create
            </h1>

            <p className="services-page__lead body-lg font-serif-italic">
              &ldquo;We work across selected categories, bringing a cinematic,
              unhurried editorial direction to each commission.&rdquo;
            </p>

            <p className="services-page__sub body-md">
              Every commission is approached with patience, intentional composition, and an
              exclusive reliance on sculpted natural light. Rather than high-volume outputs,
              we focus on timeless visual permanence.
            </p>
          </div>
        </div>
      </header>

      {/* Services List Grid */}
      <section className="section services-page__list-section">
        <div className="container-max">
          <div className="services-page__grid">
            {activeServices.map((service, index) => {
              const details = (Array.isArray(service.deliverables) && service.deliverables.length > 0)
                ? service.deliverables
                : SERVICE_DETAILS[service.title] || [];
              return (
                <div
                  key={service.id || index}
                  className="services-page__item reveal"
                >
                  <div className="services-page__item-top">
                    <span className="services-page__num">{service.number}</span>
                    <span className="label-xs services-page__status">COMMISSIONS OPEN</span>
                  </div>

                  <div className="services-page__item-body">
                    <h2 className="services-page__item-title">
                      {service.title}
                    </h2>

                    <p className="services-page__item-tagline font-serif-italic">
                      {service.tagline}
                    </p>

                    <p className="services-page__item-desc body-md">
                      {service.description || service.subtitle}
                    </p>

                    {details.length > 0 && (
                      <div className="services-page__item-details">
                        <span className="services-page__details-label label-xs">
                          SCOPE &amp; DELIVERABLES
                        </span>
                        <ul className="services-page__details-list">
                          {details.map((point, i) => (
                            <li key={i} className="services-page__detail-point">
                              <span className="services-page__bullet" aria-hidden="true">&mdash;</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="services-page__item-action">
                      <Link
                        to={`/contact?service=${encodeURIComponent(service.title)}`}
                        className="services-page__inquire-link"
                        data-cursor="button"
                      >
                        <span>Inquire About {service.title}</span>
                        <span className="btn-arrow" aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Creative Process Section */}
      <section className="section services-page__process-section">
        <div className="container-max">
          <div className="services-page__process-header reveal">
            <span className="eyebrow">OUR METHODOLOGY</span>
            <h2 className="heading-lg">The Editorial Process</h2>
            <p className="body-md" style={{ maxWidth: "560px", color: "var(--color-fg-muted)" }}>
              A disciplined, unhurried progression from initial moodboard to museum-grade archival delivery.
            </p>
          </div>

          <div className="services-page__process-grid">
            {[
              {
                step: "01",
                title: "Discovery & Concept",
                desc: "We discuss your creative vision, aesthetic sensibilities, and narrative intentions over a dedicated conversation.",
              },
              {
                step: "02",
                title: "Direction & Scouting",
                desc: "Developing bespoke moodboards, architectural location scouting, and analyzing natural light geometry.",
              },
              {
                step: "03",
                title: "The Session",
                desc: "Quiet, unhurried documentation where subjects feel completely at ease without artificial posing.",
              },
              {
                step: "04",
                title: "Curation & Archival",
                desc: "Meticulous image sequencing, analog monochrome toning, and delivery of exhibition-ready collections.",
              },
            ].map((p) => (
              <div key={p.step} className="services-page__process-step reveal">
                <span className="services-page__process-num">{p.step}</span>
                <h3 className="services-page__process-title">{p.title}</h3>
                <p className="services-page__process-desc body-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section services-page__cta-section">
        <div className="container-max services-page__cta-inner">
          <span className="eyebrow">COMMISSION A STORY</span>
          <h2 className="services-page__cta-headline display-2">
            Every story begins with a conversation.
          </h2>
          <p className="services-page__cta-lead body-lg font-serif-italic">
            &ldquo;Let’s make something worth remembering.&rdquo;
          </p>
          <div className="services-page__cta-btn-wrap">
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

