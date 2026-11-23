import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import HeroShowcase from "../components/HeroShowcase.jsx";
import WebsitesShowcase from "../components/WebsitesShowcase.jsx";
import Services from "../components/Services.jsx";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { setPageMetadata } from "../utils/pageMetadata.js";

export default function Home() {
  const { pages } = useLiveCms();
  useEffect(() => {
    setPageMetadata(
      pages?.seo?.title || "Phantom Labs — Photography. Framed Differently.",
      pages?.seo?.description || "Fine art portraits, editorial campaigns, and bespoke creative production."
    );
  }, [pages?.seo?.title, pages?.seo?.description]);

  return (
    <motion.div variants={routeTransition} initial="initial" animate="animate" exit="exit">
      {/* SECTION 01 — FULL-VIEWPORT PHOTOGRAPHIC HERO SHOWCASE */}
      <HeroShowcase />

      {/* SECTION 02 — WEBSITES & DIGITAL EXPERIENCE SHOWCASE */}
      <WebsitesShowcase />

      {/* SECTION 03 — TWO-COLUMN APPLE CATEGORY SHOWCASE GRID */}
      <Services />
    </motion.div>
  );
}
