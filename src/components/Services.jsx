import React, { useEffect, useRef } from "react";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import { services } from "../data/services.js";

export default function Services() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, []);

  return (
    <section className="section services-section" id="services" ref={sectionRef}>
      <div className="container-max">
        <div className="services-section__header reveal">
          <span className="eyebrow services-section__eyebrow">WHAT WE CREATE</span>
          <p className="body-lg services-section__intro" style={{ maxWidth: "620px" }}>
            We work across selected categories, bringing a cinematic, unhurried
            editorial direction to each commission.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className="service-card reveal"
              data-cursor="pointer"
            >
              <div className="service-card__top">
                <span className="service-card__num">{service.number}</span>
                <span className="label-xs">AVAILABLE</span>
              </div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__tagline font-serif-italic">
                {service.tagline}
              </p>
              <p className="service-card__desc">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
