import React, { useEffect, useRef } from "react";
import SmartImage from "./SmartImage.jsx";
import { scrollToId, prefersReducedMotion } from "../utils/helpers.js";
import { initParallax, killTriggers } from "../animations/scrollAnimations.js";

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const triggers = initParallax(sectionRef.current);
    return () => killTriggers(triggers);
  }, []);

  return (
    <section className="hero-split" id="hero" ref={sectionRef}>
      <div className="hero-split__inner container-max">
        {/* Left Column: Typography & Studio Narrative */}
        <div className="hero-split__content">
          <span className="eyebrow hero-split__eyebrow">
            Photography &amp; Cinematography Studio
          </span>
          <h1 className="display-1 hero-split__title">NOIR FRAME</h1>
          <p className="body-lg hero-split__subtitle">
            An editorial studio dedicated to quiet elegance, candid atmosphere, and cinematic visual stories crafted across continents.
          </p>

          <div className="hero-split__actions">
            <button
              className="btn btn-primary"
              data-cursor="button"
              onClick={() => scrollToId("portfolio")}
            >
              Selected Work &darr;
            </button>
            <button
              className="btn btn-ghost"
              data-cursor="button"
              onClick={() => scrollToId("gallery")}
            >
              Moments in Motion
            </button>
          </div>

          <div className="hero-split__stats">
            <div className="hero-split__stat">
              <span className="hero-split__stat-num">450+</span>
              <span className="hero-split__stat-label label-sm">Stories Documented</span>
            </div>
            <div className="hero-split__stat">
              <span className="hero-split__stat-num">12 Yrs</span>
              <span className="hero-split__stat-label label-sm">Editorial Craft</span>
            </div>
            <div className="hero-split__stat">
              <span className="hero-split__stat-num">Worldwide</span>
              <span className="hero-split__stat-label label-sm">Milan • Paris • Tokyo</span>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Visual Archive Frame */}
        <div className="hero-split__visual">
          <div className="hero-split__frame">
            <SmartImage
              seed="noir-hero-main"
              aspect={4 / 5}
              widths={[600, 1000, 1400]}
              sizes="(max-width: 900px) 100vw, 48vw"
              alt="Noir Frame Archival Photography"
              className="hero-split__image"
              priority
            />
            <div className="hero-split__badge label-sm">
              Featured Archive &mdash; 2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
