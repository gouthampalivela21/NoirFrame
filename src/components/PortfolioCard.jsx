import React from "react";
import SmartImage from "./SmartImage.jsx";

export default function PortfolioCard({ item, onOpen }) {
  return (
    <button
      type="button"
      className={`portfolio-card portfolio-card--${item.size}`}
      onClick={() => onOpen(item)}
      data-cursor="view"
      aria-label={`View story: ${item.title}`}
    >
      <span className="portfolio-card__frame">
        <SmartImage
          seed={item.seed}
          aspect={item.aspect}
          widths={[400, 750, 1100]}
          sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={item.title}
        />
      </span>
      <span className="portfolio-card__meta">
        <span className="heading-md portfolio-card__title">{item.title}</span>
        <span className="label-sm portfolio-card__category">
          {item.category} — {item.year}
        </span>
      </span>
    </button>
  );
}
