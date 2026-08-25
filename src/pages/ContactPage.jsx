import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Contact from "../components/Contact.jsx";

export default function ContactPage() {
  return (
    <motion.div
      className="page-screen-fit contact-screen-fit"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Contact isStandalone />
    </motion.div>
  );
}
