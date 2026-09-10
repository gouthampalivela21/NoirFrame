import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext.jsx";
import SmartImage from "../components/SmartImage.jsx";
import GlassPanel from "../components/GlassPanel.jsx";
import { routeTransition } from "../animations/pageTransitions.js";

export default function CustomPageView() {
  const { slug } = useParams();
  const { customPages } = useData();

  const page = (customPages || []).find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="container-max" style={{ textAlign: "center" }}>
          <span className="eyebrow">404</span>
          <h1 className="heading-lg" style={{ margin: "16px 0" }}>Page Not Found</h1>
          <p className="body-md" style={{ color: "var(--color-fg-muted)", marginBottom: "24px" }}>
            The bespoke page you are looking for does not exist in the archive.
          </p>
          <Link to="/" className="btn btn-primary" data-cursor="button">
            &larr; Return to Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      className="page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={routeTransition}
    >
      <header className="section" style={{ paddingTop: "calc(var(--nav-height) + 32px)", paddingBottom: "32px" }}>
        <div className="container-max">
          <Link to="/" className="label-sm" style={{ display: "inline-block", marginBottom: "16px", color: "var(--color-fg-muted)" }}>
            &larr; Return to Studio
          </Link>
          <span className="eyebrow" style={{ display: "block", marginBottom: "8px" }}>EDITORIAL ARCHIVE</span>
          <h1 className="display-1" style={{ marginBottom: "16px" }}>{page.title}</h1>
          {page.subtitle && (
            <p className="display-2 font-serif-italic" style={{ color: "var(--color-fg-dim)", maxWidth: "800px" }}>
              &ldquo;{page.subtitle}&rdquo;
            </p>
          )}
        </div>
      </header>

      {page.heroImage && (
        <section className="container-max" style={{ marginBottom: "48px" }}>
          <div style={{ borderRadius: "6px", overflow: "hidden", maxHeight: "60vh" }}>
            <SmartImage
              seed={page.heroImage}
              aspect={16 / 9}
              widths={[900, 1500, 2200]}
              sizes="92vw"
              alt={page.title}
              priority
            />
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0, paddingBottom: "80px" }}>
        <div className="container-max" style={{ maxWidth: "800px" }}>
          <GlassPanel style={{ padding: "clamp(24px, 4vw, 40px)", borderRadius: "6px" }}>
            <div style={{ whiteSpace: "pre-line", fontSize: "16px", lineHeight: "1.8", color: "var(--color-fg)" }}>
              {page.content}
            </div>
          </GlassPanel>
        </div>
      </section>
    </motion.main>
  );
}
