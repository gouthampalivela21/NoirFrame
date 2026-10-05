import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Portfolio from "../components/Portfolio.jsx";

export default function PortfolioPage() {
  return (
    <motion.div variants={routeTransition} initial="initial" animate="animate" exit="exit">
      <div style={{ paddingTop: "calc(var(--nav-height) + 40px)" }}>
        <Portfolio />
      </div>
    </motion.div>
  );
}
