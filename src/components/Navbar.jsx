import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { scrollToId } from "../utils/helpers.js";

const LINKS = [
  { label: "Work", id: "portfolio", to: "/portfolio" },
  { label: "About", id: "about", to: "/about" },
  { label: "Services", id: "services", to: "/#services" },
  { label: "Contact", id: "contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 30);
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
    document.body.style.overflow = "";
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLinkClick = (e, link) => {
    // "Services" lives inline on the home page — scroll instead of
    // reloading the route when we're already there.
    if (link.id === "services" && location.pathname === "/") {
      e.preventDefault();
      scrollToId(link.id);
    }
  };

  return (
    <>
      <header ref={navRef} className={`glass-nav navbar ${scrolled ? "is-scrolled" : ""}`}>
        <div className="navbar__inner container-max">
          <Link to="/" className="navbar__brand label-sm" data-cursor="button">
            Noir Frame
          </Link>

          <nav className="nav-links">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={(e) => handleLinkClick(e, link)}
                className="nav-links__item label-sm"
                data-cursor="button"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className="navbar__menu-btn label-sm"
            data-cursor="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div className={`mobile-overlay glass-strong ${menuOpen ? "is-open" : ""}`}>
        <nav className="mobile-overlay__links">
          {LINKS.map((link, i) => (
            <Link
              key={link.label}
              to={link.to}
              className="mobile-overlay__link display-2"
              style={{ transitionDelay: `${i * 60}ms` }}
              onClick={(e) => {
                handleLinkClick(e, link);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
