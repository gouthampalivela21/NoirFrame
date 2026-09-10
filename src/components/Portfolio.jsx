import React, { useEffect, useMemo, useRef, useState } from "react";
import PortfolioCard from "./PortfolioCard.jsx";
import StoryModal from "./StoryModal.jsx";
import { initScrollReveals, killTriggers } from "../animations/scrollAnimations.js";
import { preloadImage } from "../utils/imageRegistry.js";
import { useData } from "../context/DataContext.jsx";

export default function Portfolio({ limit, hideHeader = false }) {
  const sectionRef = useRef(null);
  const { portfolioItems = [], categories = ["All"] } = useData();
  const [category, setCategory] = useState("All");
  const [activeStory, setActiveStory] = useState(null);

  const filtered = useMemo(() => {
    const list =
      category === "All"
        ? portfolioItems
        : portfolioItems.filter((item) => item.category === category);
    return limit ? list.slice(0, limit) : list;
  }, [category, limit, portfolioItems]);

  useEffect(() => {
    // Preload visible work in background
    filtered.forEach((item) => {
      preloadImage(item.seed, 1400);
    });

    const triggers = initScrollReveals(sectionRef.current, ".reveal");
    return () => killTriggers(triggers);
  }, [filtered]);

  return (
    <section className="section portfolio" id="portfolio" ref={sectionRef}>
      <div className="container-max">
        <div className="portfolio__header reveal">
          {!hideHeader ? (
            <div>
              <span className="eyebrow">Selected Work</span>
              <h2 className="heading-lg">Portfolio</h2>
            </div>
          ) : (
            <div />
          )}

          <div className="portfolio__filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`portfolio__filter label-sm ${category === cat ? "is-active" : ""}`}
                onClick={() => setCategory(cat)}
                data-cursor="button"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="portfolio-grid">
          {filtered.map((item) => (
            <PortfolioCard key={item.id} item={item} onOpen={setActiveStory} />
          ))}
        </div>
      </div>

      <StoryModal activeStory={activeStory} onClose={() => setActiveStory(null)} />
    </section>
  );
}
