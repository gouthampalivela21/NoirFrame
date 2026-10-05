import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Contact from "../components/Contact.jsx";

export default function ContactPage() {
  return (
    <motion.div
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ paddingTop: "calc(var(--nav-height) + 20px)" }}
    >
      <Contact />
    </motion.div>
  );
}
