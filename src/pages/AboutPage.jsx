import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import About from "../components/About.jsx";
import Process from "../components/Process.jsx";

export default function AboutPage() {
  return (
    <motion.div
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ paddingTop: "calc(var(--nav-height) + 20px)" }}
    >
      <About />
      <Process />
    </motion.div>
  );
}
