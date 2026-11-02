import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../utils/helpers.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * TeamSection
 * 
 * Minimal, cinematic text-only department overview for the Our Team page:
 * - Displays department pill number tag, heading, serif italic subtitle, description, and Explore Profile button.
 * - Outlined background typography behind text.
 * - Entirely text-based: Zero individual names, role labels, or portraits.
 * - Explore Profile button opens the corresponding department's grouped profile page.
 */
export default function TeamSection({ section, isFirst = false }) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== "undefined" && window.innerWidth <= 768) return;

    if (prefersReducedMotion()) {
      gsap.set(
        sectionRef.current.querySelectorAll(
          ".team-sec__outlined-bg, .team-sec__text-card"
        ),
        { autoAlpha: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Watermark typography reveal
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: isFirst ? "top 95%" : "top 85%",
              once: true,
            },
          }
        );
      }

      // 2. Department Content Reveal
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: isFirst ? "top 90%" : "top 82%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isFirst]);

  const deptHref = `/team/${section.slug || section.id}`;

  return (
    <section
      ref={sectionRef}
      id={section.id}
      className={`team-sec team-sec--overview team-sec--${section.id} ${isFirst ? "team-sec--first" : ""}`}
      aria-labelledby={`heading-${section.id}`}
    >
      {/* Background Architectural Outlined Typography */}
      <div
        ref={headlineRef}
        className="team-sec__outlined-bg"
        aria-hidden="true"
      >
        <div className="team-sec__outlined-line">
          {section.watermark || (section.heading ? section.heading.join(" ") : section.title.toUpperCase())}
        </div>
      </div>

      <div className="container-max team-sec__inner">
        <div ref={contentRef} className="team-sec__text-card">
          {/* Section Number Pill Tag (e.g. 01 — THE FOUNDERS) */}
          <div className="team-sec__tag-wrap">
            <span className="team-sec__pill-tag">
              {section.label || `${section.index} — ${section.title.toUpperCase()}`}
            </span>
          </div>

          {/* Department Title */}
          <h2 id={`heading-${section.id}`} className="team-sec__title">
            {section.title}
          </h2>

          {/* Subtitle in quotes */}
          {section.supportingLine && (
            <p className="team-sec__subtitle">
              &ldquo;{section.supportingLine}&rdquo;
            </p>
          )}

          {/* Department Description */}
          {section.description && (
            <p className="team-sec__desc">
              {section.description}
            </p>
          )}

          {/* Dedicated "EXPLORE PROFILE →" Button for Department */}
          <div className="team-sec__cta-wrap">
            <Link
              to={deptHref}
              className="team-sec__explore-link"
              aria-label={`Explore profile for ${section.title}`}
            >
              <span>EXPLORE PROFILE</span>
              <span className="team-sec__explore-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
