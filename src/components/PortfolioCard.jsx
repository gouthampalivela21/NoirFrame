import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SmartImage from "./SmartImage.jsx";

export default function PortfolioCard({ item, onOpen }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "60px 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className={`portfolio-card portfolio-card--${item.size} ${visible ? "is-visible" : ""}`}
      onClick={() => onOpen(item)}
      data-cursor="view"
    >
      <motion.span
        className="portfolio-card__frame"
        layoutId={`story-image-${item.id}`}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <SmartImage
          seed={item.seed}
          aspect={item.aspect}
          widths={[400, 750, 1100]}
          sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={item.title}
        />
      </motion.span>
      <span className="portfolio-card__meta">
        <span className="heading-md portfolio-card__title">{item.title}</span>
        <span className="label-sm portfolio-card__category">
          {item.category} — {item.year}
        </span>
      </span>
    </button>
  );
}
