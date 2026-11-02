import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";
import { attachMagnetic } from "../animations/hoverAnimations.js";
import Logo from "./Logo.jsx";

const NAV_LINKS = [
  { label: "Work", to: "/work", match: ["/work", "/portfolio", "/project"] },
  { label: "Services", to: "/services", match: ["/services"] },
  { label: "About", to: "/about", match: ["/about"] },
  { label: "Contact", to: "/contact", match: ["/contact"] },
];

const APPLE_EASE = [0.22, 1, 0.36, 1];

const menuVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.26,
      ease: APPLE_EASE,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.42,
      ease: APPLE_EASE,
    },
  },
};

const itemVariants = {
  closed: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: APPLE_EASE,
    },
  },
  open: (idx) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      delay: 0.05 + idx * 0.045,
      ease: APPLE_EASE,
    },
  }),
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ctaBtnRef = useRef(null);
  const location = useLocation();

  const isLinkActive = (link) => {
    if (link.to === "/") {
      return location.pathname === "/";
    }
    return link.match?.some((prefix) => location.pathname.startsWith(prefix));
  };

  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change & restore scroll
  useEffect(() => {
    setMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [location.pathname]);

  // Keyboard accessibility: Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const cleanCTA = attachMagnetic(ctaBtnRef.current, 0.12);
    return () => cleanCTA();
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.body.style.overflow = next ? "hidden" : "";
        document.documentElement.style.overflow = next ? "hidden" : "";
      }
      return next;
    });
  };

  const isReduced = prefersReducedMotion();
  const isDarkPage = location.pathname.startsWith("/team");

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? "is-scrolled" : ""} ${isDarkPage ? "navbar--dark" : ""} ${menuOpen ? "navbar--open" : ""}`}
        initial={isReduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: APPLE_EASE }}
      >
        <div className="navbar__inner container-max">
          {/* Brand Logo */}
          <Link
            to="/"
            className="navbar__brand"
            data-cursor="pointer"
            aria-label="Phantom Labs Homepage"
            onClick={() => setMenuOpen(false)}
          >
            <motion.span
              animate={menuOpen ? { opacity: [0.75, 1] } : { opacity: 1 }}
              transition={{ duration: 0.4, ease: APPLE_EASE }}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <img
                src="/images/phantom-labs-logo.png"
                alt="PHANTOM LABS"
                className="navbar__brand-logo-img navbar__brand-logo-img--light"
              />
              <img
                src="/images/phantom-labs-logo-white.png"
                alt="PHANTOM LABS"
                className="navbar__brand-logo-img navbar__brand-logo-img--dark"
              />
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="navbar__center-nav" aria-label="Primary Navigation">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  data-cursor="pointer"
                  className={`nav-link ${active ? "is-active active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Primary CTA Button */}
          <Link
            to="/contact"
            ref={ctaBtnRef}
            className="btn btn-primary navbar__cta-btn"
            data-cursor="button"
            onClick={() => setMenuOpen(false)}
          >
            <span>Start a Conversation</span>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </Link>

          {/* Mobile Hamburger / X Toggle */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={isReduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={isReduced ? false : { opacity: 0 }}
                  transition={{ duration: 0.25, ease: APPLE_EASE }}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  key="hamburger"
                  initial={isReduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={isReduced ? false : { opacity: 0 }}
                  transition={{ duration: 0.25, ease: APPLE_EASE }}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="20" y2="16" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Full-Width Apple-Style Mobile Navigation Surface directly below header */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-apple-nav"
              initial={isReduced ? { opacity: 0 } : "closed"}
              animate={isReduced ? { opacity: 1 } : "open"}
              exit={isReduced ? { opacity: 0 } : "closed"}
              variants={menuVariants}
            >
              <div className="mobile-apple-nav__inner">
                {/* Navigation Links Stack */}
                <nav className="mobile-apple-nav__links" aria-label="Mobile Navigation">
                  {NAV_LINKS.map((link, idx) => {
                    const active = isLinkActive(link);
                    return (
                      <motion.div
                        key={link.label}
                        custom={idx}
                        variants={itemVariants}
                        initial={isReduced ? false : "closed"}
                        animate={isReduced ? { opacity: 1 } : "open"}
                        exit={isReduced ? false : "closed"}
                      >
                        <Link
                          to={link.to}
                          className={`mobile-apple-nav__link ${active ? "is-active active" : ""}`}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
