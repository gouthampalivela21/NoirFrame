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
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  }, [location]);

  useEffect(() => {
    const cleanCTA = attachMagnetic(ctaBtnRef.current, 0.12);
    return () => cleanCTA();
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "";
      return next;
    });
  };

  const handleLinkClick = (e, link) => {
    if (menuOpen) toggleMenu();
    if (location.pathname === "/" && link.id) {
      e.preventDefault();
      scrollToId(link.id);
    }
  };

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? "is-scrolled" : ""}`}
        initial={prefersReducedMotion() ? false : { opacity: 0, y: -6 }}
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

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-menu-header">
              <Link to="/" className="navbar__brand" onClick={toggleMenu} style={{ color: "#FFF" }}>
                <Logo size={20} />
                <span>NOIR FRAME</span>
              </Link>
              <button
                type="button"
                className="mobile-menu-close"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-body">
              {NAV_LINKS.map((link, idx) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={link.to}
                    className="mobile-menu-link"
                    onClick={(e) => handleLinkClick(e, link)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mobile-menu-footer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="btn btn-white"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={(e) => handleLinkClick(e, { to: "/#contact", id: "contact" })}
              >
                <span>Start a Conversation</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
              <a href="mailto:teamnoirframe@gmail.com" style={{ textAlign: "center", marginTop: "8px" }}>
                teamnoirframe@gmail.com
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
