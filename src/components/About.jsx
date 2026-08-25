import React, { useEffect, useRef } from "react";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";

export default function About({ expanded = false, isStandalone = false }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, []);

  return (
    <section
      className={`section about ${isStandalone ? "about--standalone" : ""}`}
      id="about"
      ref={sectionRef}
    >
      <div className="container-max split-layout about__grid">
        <div className="about__statement reveal">
          <span className="eyebrow about__eyebrow">Studio Ethos</span>
          <h2 className="display-2">
            We capture
            <br />
            what words
            <br />
            cannot.
          </h2>
        </div>

        <div className="about__description reveal">
          <span className="eyebrow">The Studio</span>
          <p className="body-lg">
            Noir Frame is an international photography studio working across weddings, portraiture,
            editorial and fashion. We build every commission around restraint &mdash; natural light,
            considered composition, and frames that hold up in silence.
          </p>
          <p className="body-md">
            Founded on the belief that a photograph should feel like a memory rather than a
            performance, our work favours long exposures of trust over quick, styled moments.
          </p>

          {expanded && (
            <div className="about__stats">
              <div className="stat-item">
                <span className="display-2">12+</span>
                <span className="label-sm">Years shooting</span>
              </div>
              <div className="stat-item">
                <span className="display-2">450+</span>
                <span className="label-sm">Stories told</span>
              </div>
              <div className="stat-item">
                <span className="display-2">18</span>
                <span className="label-sm">Countries</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
