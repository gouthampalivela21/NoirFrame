import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Hero from "../components/Hero.jsx";
import Portfolio from "../components/Portfolio.jsx";
import Gallery from "../components/Gallery.jsx";
import Services from "../components/Services.jsx";
import About from "../components/About.jsx";
import Contact from "../components/Contact.jsx";

export default function Home() {
  return (
    <motion.div variants={routeTransition} initial="initial" animate="animate" exit="exit">
      <Hero />
      <Portfolio limit={6} />
      <Gallery />
      <Services />
      <About />
      <Contact />
    </motion.div>
  );
}
