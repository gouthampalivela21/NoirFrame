import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Portfolio from "../components/Portfolio.jsx";

export default function PortfolioPage() {
  return (
    <motion.div variants={routeTransition} initial="initial" animate="animate" exit="exit">
      <div className="page-header section" style={{ paddingBottom: 0 }}>
        <div className="container-max">
          <span className="eyebrow">Full Archive</span>
          <h1 className="display-2">Every story we&rsquo;ve told.</h1>
        </div>
      </div>
      <Portfolio hideHeader />
    </motion.div>
  );
}
