import React from "react";
import { Link, useLocation } from "react-router-dom";
import { scrollToId } from "../utils/helpers.js";

const LINKS = [
  { label: "Work", to: "/#portfolio", id: "portfolio" },
  { label: "Services", to: "/#services", id: "services" },
  { label: "About", to: "/#about", id: "about" },
  { label: "Contact", to: "/#contact", id: "contact" },
];

export default function Footer() {
  const location = useLocation();

  const handleLinkClick = (e, link) => {
    if (location.pathname === "/" && link.id) {
      e.preventDefault();
      scrollToId(link.id);
    }
  };

  return (
    <footer className="footer">
      <div className="container-max footer__inner">
        <div className="footer__top">
          <div className="footer__brand-block">
            <span className="footer__brand-title">NOIR FRAME</span>
            <p className="footer__brand-tagline font-serif-italic">
              Visual stories, framed differently.
            </p>
          </div>

          <nav className="footer__links-nav" aria-label="Footer Navigation">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                data-cursor="pointer"
                onClick={(e) => handleLinkClick(e, link)}
                className="footer__link"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer__bottom">
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              data-cursor="pointer"
              className="footer__link"
            >
              Instagram &mdash; Follow the journey
            </a>
            <a
              href="mailto:teamnoirframe@gmail.com"
              data-cursor="pointer"
              className="footer__link"
            >
              teamnoirframe@gmail.com
            </a>
          </div>

          <span>&copy; 2026 Noir Frame. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
