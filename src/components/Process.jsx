import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/helpers.js";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: "01",
    label: "DISCOVER",
    headline: "“Understand the story.”",
    desc: "Understand the person, place, brand or moment before making anything.",
  },
  {
    number: "02",
    label: "FRAME",
    headline: "“Find the visual language.”",
    desc: "Develop the mood, composition, light and visual direction.",
  },
  {
    number: "03",
    label: "CAPTURE",
    headline: "“Make the moment.”",
    desc: "Photograph with intention, allowing genuine moments to happen naturally.",
  },
  {
    number: "04",
    label: "DELIVER",
    headline: "“Shape the final story.”",
    desc: "Select, refine and present the images as a cohesive visual narrative.",
  },
];

export default function Process() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(
        sectionRef.current.querySelectorAll(
          ".process-section__eyebrow, .process-section__statement, .process-timeline__line-fill, .process-step"
        ),
        { autoAlpha: 1, y: 0, scaleX: 1 }
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

      // 1. “HOW WE WORK” fades in
      tl.fromTo(
        ".process-section__eyebrow",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.6 }
      );

      // 2. The main statement rises upward slightly
      tl.fromTo(
        ".process-section__statement",
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.8 },
        "-=0.3"
      );

      // 3. The connecting line draws from left to right
      tl.fromTo(
        ".process-timeline__line-fill",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.95, ease: "power2.inOut" },
        "-=0.25"
      );

      // 4 & 5. Process numbers, titles & descriptions reveal sequentially
      tl.fromTo(
        ".process-step",
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
        },
        "-=0.65"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section process-section" id="process" ref={sectionRef}>
      <div className="container-max process-section__container">
        <div className="process-section__header">
          <span className="eyebrow process-section__eyebrow">HOW WE WORK</span>
          <h2 className="process-section__statement">
            &ldquo;Every story begins with a conversation. What follows is a deliberate
            process of seeing, framing, capturing and refining.&rdquo;
          </h2>
        </div>

        <div className="process-timeline">
          <div className="process-timeline__track" aria-hidden="true">
            <div className="process-timeline__line-base" />
            <div className="process-timeline__line-fill" />
          </div>

          <div className="process-timeline__grid">
            {STEPS.map((step) => (
              <div key={step.number} className="process-step">
                <div className="process-step__header">
                  <span className="process-step__num">{step.number}</span>
                  <span className="process-step__label">{step.label}</span>
                </div>

                <div className="process-step__marker-slot">
                  <span className="process-step__dot" />
                </div>

                <div className="process-step__body">
                  <h3 className="process-step__headline">{step.headline}</h3>
                  <p className="process-step__desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
