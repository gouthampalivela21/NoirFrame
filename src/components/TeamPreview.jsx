import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/helpers.js";

gsap.registerPlugin(ScrollTrigger);

const TEAM_PREVIEW_PORTRAITS = [
  {
    index: "01",
    label: "01 / FOUNDER",
    modifier: "team-preview__card--founder",
    portrait: "/images/collective-founder.png",
    alt: "Phantom Labs Founder",
  },
  {
    index: "02",
    label: "02 / WEBSITE & DESIGN",
    modifier: "team-preview__card--design",
    portrait: "/images/collective-design.png",
    alt: "Phantom Labs Website & Design Lead",
  },
  {
    index: "03",
    label: "03 / CREATIVE & PRODUCTION",
    modifier: "team-preview__card--creative",
    portrait: "/images/collective-creative.png",
    alt: "Phantom Labs Creative & Production Lead",
  },
];

export default function TeamPreview() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(
        sectionRef.current.querySelectorAll(
          ".team-preview__eyebrow, .team-preview__headline-line, .team-preview__body, .team-preview__watermark, .team-preview__card, .team-preview__cta-wrap"
        ),
        { autoAlpha: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      tl.fromTo(
        ".team-preview__eyebrow",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.55 }
      )
        .fromTo(
          ".team-preview__headline-line",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".team-preview__body",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          "-=0.25"
        )
        .fromTo(
          ".team-preview__watermark",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".team-preview__card",
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
          "-=0.55"
        )
        .fromTo(
          ".team-preview__cta-wrap",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          "-=0.3"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section team-preview" ref={sectionRef} id="team-preview">
      <div className="container-max team-preview__container">
        {/* Left Column: Eyebrow, Editorial Headline, Narrative, and CTA */}
        <div className="team-preview__left">
          <span className="team-preview__eyebrow">
            PHANTOM LABS — THE COLLECTIVE
          </span>

          <h2 className="team-preview__headline">
            <span className="team-preview__headline-line">Every frame</span>
            <span className="team-preview__headline-line">has a story.</span>
            <span className="team-preview__headline-line">Every story</span>
            <span className="team-preview__headline-line">has a team.</span>
          </h2>

          <p className="team-preview__body">
            Meet the creative minds shaping the Phantom Labs vision.
          </p>

          <div className="team-preview__cta-wrap">
            <Link
              to="/team"
              className="team-preview__btn"
              data-cursor="button"
            >
              <span>MEET OUR TEAM</span>
              <span className="team-preview__btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Outlined Watermark & 3 Staggered Portraits */}
        <div className="team-preview__right">
          {/* Subtle Outlined Watermark behind portraits */}
          <div className="team-preview__watermark" aria-hidden="true">
            THE COLLECTIVE
          </div>

          <div className="team-preview__gallery">
            {TEAM_PREVIEW_PORTRAITS.map((item) => (
              <div
                key={item.index}
                className={`team-preview__card ${item.modifier}`}
              >
                <div className="team-preview__image-wrapper">
                  <img
                    src={item.portrait}
                    alt={item.alt}
                    className="team-preview__image"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="team-preview__card-meta">
                  <span className="team-preview__card-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
