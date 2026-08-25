import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import About from "../components/About.jsx";

export default function AboutPage() {
  return (
    <motion.div
      className="page-screen-fit about-screen-fit"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <About expanded isStandalone />
    </motion.div>
  );
}
