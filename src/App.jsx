import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import { prefersReducedMotion, isTouchDevice } from "./utils/helpers.js";

const Home = lazy(() => import("./pages/Home.jsx"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage.jsx"));
const ProjectPage = lazy(() => import("./pages/ProjectPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CustomPageView = lazy(() => import("./pages/CustomPageView.jsx"));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const isTouch = isTouchDevice();
    const lenis = new Lenis({
      duration: isTouch ? 0.8 : 0.95,
      smoothWheel: !isTouch,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Expose for scrollToId() in utils/helpers.js
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    // Smooth over occasional main-thread stutters without jarring jumps
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    const targetId = location.hash ? location.hash.replace("#", "") : null;

    if (!targetId) {
      window.scrollTo(0, 0);
    }

    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el && window.__lenis) {
          window.__lenis.scrollTo(el, { offset: -80, duration: 1.2 });
        } else if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    });

    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.hash]);

  return (
    <>
      <div className="grain-layer" />
      <div className="vignette" />
      <Navbar />

      <main>
        <Suspense fallback={<div className="page-loader-placeholder" />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/page/:slug" element={<CustomPageView />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
