import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { scrollToId, prefersReducedMotion } from "../utils/helpers.js";
import { attachMagnetic } from "../animations/hoverAnimations.js";
import Logo from "./Logo.jsx";

const NAV_LINKS = [
  { label: "Work", to: "/#portfolio", id: "portfolio" },
  { label: "Services", to: "/#services", id: "services" },
  { label: "About", to: "/#about", id: "about" },
  { label: "Contact", to: "/#contact", id: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ctaBtnRef = useRef(null);
  const location = useLocation();

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

  useEffect(() => {
    setMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [location]);

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

  const handleLinkClick = (e, link) => {
    setMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    if (location.pathname === "/" && link.id) {
      e.preventDefault();
      scrollToId(link.id);
    }
  };

  const isReduced = prefersReducedMotion();

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "navbar--open" : ""}`}
        initial={isReduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar__inner container-max">
          {/* Brand */}
          <Link
            to="/"
            className="navbar__brand"
            data-cursor="pointer"
            aria-label="Noir Frame Homepage"
          >
            <span className="navbar__brand-logo">
              <Logo size={18} />
            </span>
            <span>NOIR FRAME</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="navbar__center-nav" aria-label="Primary Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                data-cursor="pointer"
                onClick={(e) => handleLinkClick(e, link)}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Primary CTA Button */}
          <button
            ref={ctaBtnRef}
            type="button"
            className="btn btn-primary navbar__cta-btn"
            data-cursor="button"
            onClick={(e) => handleLinkClick(e, { to: "/#contact", id: "contact" })}
          >
            <span>Start a Conversation</span>
            <span className="btn-arrow">&rarr;</span>
          </button>

          {/* Mobile Hamburger / X Toggle */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
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
            ) : (
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
            )}
          </button>
        </div>

        {/* Full-Width Apple-Style Mobile Navigation Surface directly below header */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-apple-nav"
              initial={isReduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={isReduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mobile-apple-nav__inner">
                {/* Navigation Links Stack */}
                <nav className="mobile-apple-nav__links" aria-label="Mobile Navigation">
                  {NAV_LINKS.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={isReduced ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.28,
                        delay: isReduced ? 0 : 0.03 + idx * 0.035,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <Link
                        to={link.to}
                        className="mobile-apple-nav__link"
                        onClick={(e) => handleLinkClick(e, link)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Bottom Actions & Contact Info */}
                <motion.div
                  className="mobile-apple-nav__footer"
                  initial={isReduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: isReduced ? 0 : 0.18,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary mobile-apple-nav__cta"
                    onClick={(e) => handleLinkClick(e, { to: "/#contact", id: "contact" })}
                  >
                    <span>Start a Conversation</span>
                    <span className="btn-arrow">&rarr;</span>
                  </button>

                  <div className="mobile-apple-nav__contact">
                    <a
                      href="mailto:teamnoirframe@gmail.com"
                      className="mobile-apple-nav__email"
                    >
                      teamnoirframe@gmail.com
                    </a>
                    <span className="mobile-apple-nav__meta">
                      DIRECT INQUIRIES &bull; AVAILABLE WORLDWIDE &bull; 2026
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
