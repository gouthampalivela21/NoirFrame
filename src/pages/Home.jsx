import React from "react";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import Hero from "../components/Hero.jsx";
import LaunchMessage from "../components/LaunchMessage.jsx";
import FirstFrame from "../components/FirstFrame.jsx";
import Services from "../components/Services.jsx";
import Process from "../components/Process.jsx";
import Portfolio from "../components/Portfolio.jsx";
import About from "../components/About.jsx";
import Contact from "../components/Contact.jsx";

export default function Home() {
  return (
    <motion.div variants={routeTransition} initial="initial" animate="animate" exit="exit">
      <Hero />
      <LaunchMessage />
      <FirstFrame />
      <Services />
      <Process />
      <Portfolio />
      <About />
      <Contact />
    </motion.div>
  );
}
