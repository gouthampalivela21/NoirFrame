import React, { useEffect, useRef } from "react";
import { initScrollReveals, initParallax, killTriggers } from "../animations/scrollAnimations.js";
import { scrollToId } from "../utils/helpers.js";

export default function FirstFrame() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const scrollTriggers = initScrollReveals(sectionRef.current);
    const parallaxTriggers = initParallax(sectionRef.current, "[data-speed]");
    return () => {
      killTriggers(scrollTriggers);
      killTriggers(parallaxTriggers);
    };
  }, []);

  return (
    <section className="section first-frame" id="first-frame" ref={sectionRef}>
      <div className="container-max first-frame__inner">
        <div className="first-frame__content reveal">
          <span className="eyebrow first-frame__eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
            OUR APPROACH
          </span>

          <div className="first-frame__copy">
            <p className="body-lg first-frame__lead" style={{ color: "rgba(255,255,255,0.85)" }}>
              &ldquo;Noir Frame is beginning with a simple idea &mdash; photography
              should make you feel something before it tells you anything.&rdquo;
            </p>
            <p className="body-md first-frame__sub" style={{ color: "rgba(255,255,255,0.65)" }}>
              &ldquo;Rather than building a library of images just to fill a
              website, we&rsquo;re building our portfolio one story at a time.&rdquo;
            </p>
          </div>

          <div className="first-frame__cta">
            <button
              type="button"
              className="btn btn-white"
              data-cursor="button"
              onClick={() => scrollToId("contact")}
            >
              <span>Create the first story</span>
              <span className="btn-arrow">&rarr;</span>
            </button>
          </div>
        </div>

        <div
          className="first-frame__visual-composition reveal"
          data-speed="0.04"
          data-cursor="explore"
        >
          <span className="first-frame__grid-cross first-frame__grid-cross--tl" />
          <span className="first-frame__grid-cross first-frame__grid-cross--tr" />
          <span className="first-frame__grid-cross first-frame__grid-cross--bl" />
          <span className="first-frame__grid-cross first-frame__grid-cross--br" />

          <p className="first-frame__aperture-text">One story at a time.</p>
          <span className="label-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            NOIR FRAME / COMMISSIONS OPEN
          </span>
        </div>
      </div>
    </section>
  );
}
