import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../utils/helpers.js";
import TeamPortrait from "./TeamPortrait.jsx";

gsap.registerPlugin(ScrollTrigger);

/**
 * TeamMemberSection
 * 
 * Minimal, editorial team member introduction section for the main Our Team page:
 * - Displays ONLY: 1) Portrait, 2) Name/Role, 3) Professional Title, 4) One short introductory sentence, 5) Explore Profile link.
 * - Deep black background with oversized, subtle outlined typography in the background.
 * - Desktop: Descriptive text on LEFT, Monochrome portrait on RIGHT.
 * - Mobile: Clean single-column layout with text, portrait, and Explore link.
 */
export default function TeamMemberSection({
  member,
  categoryLabel,
  mobileCategoryLabel,
  heading,
  sectionId,
  isFirst = false,
}) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const mobileCardRef = useRef(null);

  const shortIntro =
    member.shortIntro ||
    (member.introduction ? member.introduction.split(". ")[0] + "." : "");

  // Desktop GSAP scroll animations
  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof window !== "undefined" && window.innerWidth <= 768) return;

    if (prefersReducedMotion()) {
      gsap.set(
        sectionRef.current.querySelectorAll(
          ".team-sec__outlined-bg, .team-sec__member-label, .team-sec__member-name, .team-sec__member-role, .team-sec__member-intro, .team-sec__member-cta, .team-portrait-container"
        ),
        { autoAlpha: 1, y: 0, scale: 1 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Background outlined typography reveal
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: isFirst ? "top 92%" : "top 85%",
              once: true,
            },
          }
        );
      }

      // 2. Coordinated text and portrait reveal timeline
      const label = sectionRef.current.querySelector(".team-sec__member-label");
      const nameAndRole = sectionRef.current.querySelectorAll(
        ".team-sec__member-name, .team-sec__member-role"
      );
      const intro = sectionRef.current.querySelector(".team-sec__member-intro");
      const cta = sectionRef.current.querySelector(".team-sec__member-cta");
      const portrait = sectionRef.current.querySelector(".team-portrait-container");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isFirst ? "top 90%" : "top 84%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      if (label) {
        tl.fromTo(
          label,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55 }
        );
      }

      if (nameAndRole.length > 0) {
        tl.fromTo(
          nameAndRole,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06 },
          "-=0.35"
        );
      }

      if (intro) {
        tl.fromTo(
          intro,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );
      }

      if (cta) {
        tl.fromTo(
          cta,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          "-=0.25"
        );
      }

      if (portrait) {
        tl.fromTo(
          portrait,
          { autoAlpha: 0, y: 22, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1.0, duration: 0.75 },
          "-=0.6"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isFirst]);

  // Mobile Apple-inspired entrance animation (IntersectionObserver)
  useEffect(() => {
    const el = mobileCardRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={`team-sec team-sec--${member.slug} ${isFirst ? "team-sec--first" : ""}`}
      aria-labelledby={`heading-${member.slug}`}
    >
      {/* Background Architectural Outlined Typography (z-index: 0, behind content) */}
      <div
        ref={headlineRef}
        className="team-sec__outlined-bg"
        aria-hidden="true"
      >
        <div className="team-sec__outlined-line">{heading[0]}</div>
        <div className="team-sec__outlined-line team-sec__outlined-line--indent">
          {heading[1]}
        </div>
      </div>

      <div className="container-max team-sec__inner">
        {/* DESKTOP ROW (min-width: 769px) — Two-column: Text on Left (55%), Portrait on Right (38%) */}
        <article className="team-sec__member-row team-sec__desktop-row" aria-labelledby={`heading-${member.slug}`}>
          {/* LEFT SIDE: Minimal Introduction */}
          <div className="team-sec__text-col">
            {/* Small uppercase category label */}
            <div className="team-sec__member-label">
              <span className="team-sec__dot" aria-hidden="true" />
              <span className="team-sec__category-tag">{categoryLabel}</span>
            </div>

            {/* Member name */}
            <h2 id={`heading-${member.slug}`} className="team-sec__member-name">
              {member.name}
            </h2>

            {/* Concise professional title */}
            <p className="team-sec__member-role">{member.role}</p>

            {/* One short introductory sentence */}
            <p className="team-sec__member-intro">{shortIntro}</p>

            {/* Minimal Explore Profile link */}
            <div className="team-sec__member-cta">
              <Link
                to={`/team/${member.slug}`}
                className="team-sec__profile-link"
                aria-label={`Explore profile for ${member.name}`}
              >
                <span>EXPLORE PROFILE</span>
                <span className="team-sec__link-arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Team Member Portrait (4:5 Monochrome) */}
          <div className="team-sec__media-col">
            <TeamPortrait
              member={member}
              isPriority={isFirst}
            />
          </div>
        </article>

        {/* MOBILE SINGLE-COLUMN LAYOUT (max-width: 768px) */}
        <article
          ref={mobileCardRef}
          className="team-sec__mobile-card"
          aria-labelledby={`mobile-heading-${member.slug}`}
        >
          {/* 1. Category Tag */}
          <div className="team-mobile-card__label">
            <span className="team-mobile-card__tag">
              {mobileCategoryLabel || categoryLabel}
            </span>
          </div>

          {/* 2. Heading and Concise Description */}
          <div className="team-mobile-card__info">
            <h2 id={`mobile-heading-${member.slug}`} className="team-mobile-card__name">
              {member.name}
            </h2>
            <p className="team-mobile-card__role">{member.role}</p>
            <p className="team-mobile-card__intro">{shortIntro}</p>
          </div>

          {/* 3. Portrait */}
          <div className="team-mobile-card__media">
            <TeamPortrait
              member={member}
              isPriority={isFirst}
            />
          </div>

          {/* 4. Explore Profile Link */}
          <div className="team-mobile-card__cta">
            <Link
              to={`/team/${member.slug}`}
              className="team-sec__profile-link"
              aria-label={`Explore profile for ${member.name}`}
            >
              <span>EXPLORE PROFILE</span>
              <span className="team-sec__link-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
