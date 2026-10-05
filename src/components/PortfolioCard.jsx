import React from "react";
import SmartImage from "./SmartImage.jsx";

export default function PortfolioCard({ item }) {
  return (
    <div className="story-card reveal" data-cursor="view">
      <div className="story-card__frame">
        {item.isPlaceholder ? (
          <div className="story-card__placeholder-inner">
            <span className="story-card__status-tag">{item.status || "In Production"}</span>
            <p className="font-serif-italic" style={{ fontSize: "15px", color: "var(--color-fg)" }}>
              {item.subtitle || item.tagline}
            </p>
            <span className="label-xs" style={{ color: "var(--color-fg-muted)" }}>
              {item.category} &bull; {item.year}
            </span>
          </div>
        ) : (
          <div className="story-card__image-wrap">
            <SmartImage
              seed={item.seed}
              aspect={item.aspect || 4 / 5}
              widths={[400, 750, 1100]}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              alt={item.title}
            />
          </div>
        )}
      </div>

      <div className="story-card__meta">
        <h3 className="story-card__title">{item.title}</h3>
        <p className="story-card__sub font-serif-italic">{item.tagline}</p>
      </div>
    </div>
  );
}
