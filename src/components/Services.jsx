import React, { useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import { services as defaultServices } from "../data/services.js";
import { useData } from "../context/DataContext.jsx";

export default function Services() {
  const sectionRef = useRef(null);
  const { services: cmsServices } = useData();

  const activeServices = useMemo(() => {
    const raw = Array.isArray(cmsServices) && cmsServices.length > 0
      ? cmsServices
      : defaultServices;
    return raw.filter((s) => s.active !== false && s.published !== false);
  }, [cmsServices]);

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, [activeServices]);

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
          {activeServices.map((service) => (
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
              <p className="service-card__desc">{service.description || service.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="services-section__cta-wrap reveal" style={{ marginTop: "48px", textAlign: "center" }}>
          <Link to="/services" className="btn btn-secondary" data-cursor="button">
            <span>DISCOVER ALL SERVICES</span>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
