import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/helpers.js";
import phantomLogo from "../assets/phantom-labs-logo.jpg";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!sectionRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(
        sectionRef.current.querySelectorAll(
          ".about-ethos__identity, .about-ethos__eyebrow, .about-ethos__quote, .about-ethos__lead, .about-ethos__body"
        ),
        { autoAlpha: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 76%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      // 1. Logo fades in with slight upward movement
      tl.fromTo(
        ".about-ethos__identity",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.85 }
      );

      // 2. Studio Ethos label fades in
      tl.fromTo(
        ".about-ethos__eyebrow",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.65 },
        "-=0.55"
      );

      // 3. Quote reveals smoothly
      tl.fromTo(
        ".about-ethos__quote",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );

      // 4. Supporting copy follows
      tl.fromTo(
        [".about-ethos__lead", ".about-ethos__body"],
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.12 },
        "-=0.4"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section about-section" id="about" ref={sectionRef}>
      <div className="about-section__container">
        <div className="about-section__grid">
          {/* Left Column — Phantom Labs Brand Identity */}
          <div className="about-ethos__identity">
            <div className="about-ethos__logo-wrap">
              <img
                src={phantomLogo}
                alt="PHANTOM LABS"
                width={360}
                className="about-ethos__logo-mark"
                loading="lazy"
                decoding="async"
                style={{ width: "100%", maxWidth: "340px", height: "auto", objectFit: "contain", borderRadius: "2px" }}
              />
            </div>
            <div className="about-ethos__identity-caption">
              <span className="about-ethos__identity-name">PHANTOM LABS</span>
              <span className="about-ethos__identity-sub">
                PHOTOGRAPHY / STORIES / 2026
              </span>
            </div>
          </div>

          {/* Right Column — Editorial Statement & Ethos */}
          <div className="about-ethos__content">
            <span className="eyebrow about-ethos__eyebrow">STUDIO ETHOS</span>

            <blockquote className="about-ethos__quote">
              &ldquo;PHANTOM LABS WAS CREATED AROUND A SIMPLE BELIEF: THE BEST PHOTOGRAPHS AREN’T SIMPLY SEEN &mdash; THEY’RE REMEMBERED.&rdquo;
            </blockquote>

            <div className="about-ethos__narrative">
              <p className="about-ethos__lead">
                Built at the intersection of photography, design and storytelling, Phantom
                Labs aims to create images with atmosphere, emotion and intention.
              </p>

              <p className="about-ethos__body">
                We focus on natural light, unhurried observation, and frames that stand
                the test of time. Rather than producing high-volume, generic shoots, we
                collaborate closely on a limited number of projects.
              </p>

              {location.pathname === "/" && (
                <div style={{ marginTop: "24px" }}>
                  <Link to="/about" className="btn btn-secondary" data-cursor="button">
                    <span>READ FULL STUDIO ETHOS</span>
                    <span className="btn-arrow" aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
