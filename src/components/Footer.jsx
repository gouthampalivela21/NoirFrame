import React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "Work", to: "/work" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-max footer__inner">
        <div className="footer__top">
          <div className="footer__brand-block">
            <Link to="/" className="footer__brand-link" aria-label="PHANTOM LABS">
              <img
                src="/images/phantom-labs-logo-white.png"
                alt="PHANTOM LABS"
                className="footer__brand-logo-img"
              />
            </Link>
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
                className="footer__link"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer__bottom">
          <div className="footer__bottom-links">
            <a
              href="https://instagram.com/phantomlabs.in"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="pointer"
              className="footer__link"
            >
              Instagram &mdash; @phantomlabs.in
            </a>
            <a
              href="mailto:teamphantomlabs@gmail.com"
              data-cursor="pointer"
              className="footer__link"
            >
              teamphantomlabs@gmail.com
            </a>
          </div>

          <span>&copy; 2026 Phantom Labs. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
