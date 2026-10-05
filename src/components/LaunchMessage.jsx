import React, { useEffect, useRef } from "react";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";

export default function LaunchMessage() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, []);

  return (
    <section className="section launch-message" id="beginning" ref={sectionRef}>
      <div className="launch-message__inner reveal">
        <span className="eyebrow launch-message__eyebrow">THIS IS THE BEGINNING.</span>
        <h2 className="launch-message__title">
          We&rsquo;re currently building our first body of work.
        </h2>
        <p className="launch-message__quote font-serif-italic">
          &ldquo;Every frame begins here.&rdquo;
        </p>
      </div>
    </section>
  );
}
