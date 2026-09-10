import React, { useEffect, useRef, useState } from "react";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import SmartImage from "./SmartImage.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Services() {
  const sectionRef = useRef(null);
  const { services = [] } = useData();
  const [activeId, setActiveId] = useState(() => services[0]?.id || "s01");

  useEffect(() => {
    if (services.length > 0 && !services.find((s) => s.id === activeId)) {
      setActiveId(services[0].id);
    }
  }, [services, activeId]);

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, []);

  return (
    <section className="section services" id="services" ref={sectionRef}>
      <div className="container-max">
        <div className="services__header reveal">
          <span className="eyebrow">What We Do</span>
          <h2 className="heading-lg">Services &amp; Commissions</h2>
        </div>

        <div className="services-list">
          {services.map((service) => {
            const isActive = activeId === service.id;
            return (
              <div
                key={service.id}
                className={`services-item reveal ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => setActiveId(service.id)}
                onClick={() => setActiveId(service.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId(service.id);
                  }
                }}
              >
                <div className="services-item__main">
                  <span className="services-item__num label-sm">{service.number}</span>
                  
                  <div className="services-item__title-col">
                    <h3 className="heading-lg services-item__title">{service.title}</h3>
                    <p className="body-md services-item__tagline">{service.tagline}</p>
                  </div>

                  <div className="services-item__desc-col">
                    <p className="body-md services-item__desc">{service.description}</p>
                  </div>

                  <div className="services-item__image-col">
                    <div className="services-item__image-wrap">
                      <SmartImage
                        seed={service.seed}
                        aspect={service.aspect}
                        widths={[400, 700]}
                        sizes="(max-width: 860px) 100vw, 240px"
                        alt={service.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
