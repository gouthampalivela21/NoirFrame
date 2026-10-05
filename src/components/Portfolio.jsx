import React, { useState, useEffect, useMemo, useRef } from "react";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import { portfolioItems, categories } from "../data/portfolio.js";
import PortfolioCard from "./PortfolioCard.jsx";

export default function Portfolio({ limit }) {
  const sectionRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const list =
      activeCategory === "All"
        ? portfolioItems
        : portfolioItems.filter((item) => item.category === activeCategory);
    return limit ? list.slice(0, limit) : list;
  }, [activeCategory, limit]);

  useEffect(() => {
    const triggers = initScrollReveals(sectionRef.current);
    return () => killTriggers(triggers);
  }, [filtered]);

  return (
    <section className="section portfolio-section" id="portfolio" ref={sectionRef}>
      <div className="container-max">
        <span className="eyebrow portfolio-section__eyebrow">PORTFOLIO</span>

        <div className="portfolio-section__header reveal">
          <p className="body-md portfolio-section__desc">
            Currently building the first Noir Frame collection. Every frame begins with intentional observation.
          </p>

          <div className="portfolio-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-cursor="button"
                className={`portfolio-filter-btn ${
                  activeCategory === cat ? "is-active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="portfolio-grid-cards">
          {filtered.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
