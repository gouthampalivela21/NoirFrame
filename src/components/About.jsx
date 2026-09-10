import React, { useEffect, useRef } from "react";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import { useData } from "../context/DataContext.jsx";

export default function About({ expanded = false, isStandalone = false }) {
  const sectionRef = useRef(null);
  const { aboutData } = useData();

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, []);

  const {
    eyebrow = "",
    title = "",
    studioSubtitle = "",
    bio1 = "",
    bio2 = "",
    stats = [],
  } = aboutData || {};

  return (
    <section
      className={`section about ${isStandalone ? "about--standalone" : ""}`}
      id="about"
      ref={sectionRef}
    >
      <div className="container-max split-layout about__grid">
        <div className="about__statement reveal">
          <span className="eyebrow about__eyebrow">{eyebrow}</span>
          <h2 className="display-2" style={{ whiteSpace: "pre-line" }}>
            {title}
          </h2>
        </div>

        <div className="about__description reveal">
          <span className="eyebrow">{studioSubtitle}</span>
          <p className="body-lg">{bio1}</p>
          <p className="body-md">{bio2}</p>

          {expanded && (
            <div className="about__stats">
              {stats.map((st, i) => (
                <div key={i} className="stat-item">
                  <span className="display-2">{st.num}</span>
                  <span className="label-sm">{st.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
