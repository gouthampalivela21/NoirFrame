import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion, scrollToId } from "../../utils/helpers.js";

/**
 * TeamIntro
 * 
 * Editorial introduction for the Phantom Labs Team page:
 * - Eyebrow: THE PEOPLE BEHIND THE FRAME
 * - Headline: "Every frame has a story. Every story has a team."
 * - Supporting text: "Meet the creative minds shaping the Phantom Labs vision."
 * - CTA Button: "MEET OUR TEAM →" with smooth scroll to #founder
 * - Apple-inspired sequential entrance animation (Eyebrow -> Headline -> Desc -> CTA)
 * - Wide 1440px balanced composition with intentional whitespace
 */
export default function TeamIntro() {
  const introRef = useRef(null);

  useEffect(() => {
    if (!introRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(
        introRef.current.querySelectorAll(
          ".team-intro__eyebrow, .team-intro__headline-line, .team-intro__desc, .team-intro__cta"
        ),
        { autoAlpha: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const eyebrow = introRef.current.querySelector(".team-intro__eyebrow");
      const headlineLines = introRef.current.querySelectorAll(".team-intro__headline-line");
      const desc = introRef.current.querySelector(".team-intro__desc");
      const cta = introRef.current.querySelector(".team-intro__cta");

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.1,
      });

      // 1. Eyebrow fades in first
      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.6 }
        );
      }

      // 2. Headline appears with slight upward movement
      if (headlineLines.length > 0) {
        tl.fromTo(
          headlineLines,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.1 },
          "-=0.35"
        );
      }

      // 3. Supporting text fades in next
      if (desc) {
        tl.fromTo(
          desc,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
      }

      // 4. CTA appears last
      if (cta) {
        tl.fromTo(
          cta,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          "-=0.35"
        );
      }
    }, introRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToTeam = (e) => {
    e.preventDefault();
    scrollToId("founder", 60);
  };

  return (
    <section ref={introRef} className="team-intro" aria-label="Team introduction">
      <div className="team-intro__container">
        <div className="team-intro__content">
          {/* Eyebrow */}
          <div className="team-intro__eyebrow">
            <span className="team-intro__eyebrow-dot" aria-hidden="true" />
            <span>THE PEOPLE BEHIND THE FRAME</span>
          </div>

          {/* Large Dominant Headline */}
          <h1 className="team-intro__headline">
            <span className="team-intro__headline-line">Every frame has a story.</span>
            <span className="team-intro__headline-line team-intro__headline-line--accent">
              Every story has a team.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="team-intro__desc">
            Meet the creative minds shaping the Phantom Labs vision.
          </p>

          {/* Black Pill-Shaped CTA Button */}
          <div className="team-intro__actions">
            <a
              href="#founder"
              onClick={handleScrollToTeam}
              className="team-intro__cta"
              aria-label="Scroll down to meet the team"
            >
              <span>MEET OUR TEAM</span>
              <span className="team-intro__cta-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

