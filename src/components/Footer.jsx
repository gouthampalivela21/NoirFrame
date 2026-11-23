import React from "react";
import { Link } from "react-router-dom";
import { useLiveCms } from "../context/LiveCmsContext.jsx";

export default function Footer() {
  const { footer, navigation, branding } = useLiveCms();
  const links = Array.isArray(footer?.links) && footer.links.length
    ? footer.links
    : (navigation || []);
  const tagline = footer?.tagline || "Visual stories, framed differently.";
  const address = footer?.address || "Bangalore, India · Worldwide Inquiries";
  const email = footer?.email || "studio@phantomlabs.in";
  const phone = footer?.phone || "";
  const instagram = footer?.instagram || "https://instagram.com/phantomlabs.in";
  const linkedin = footer?.linkedin || "";
  const copyright = footer?.copyright || `© ${new Date().getFullYear()} Phantom Labs. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container-max footer__inner">
        <div className="footer__top">
          <div className="footer__brand-block">
            <Link to="/" className="footer__brand-link" aria-label="PHANTOM LABS">
              <img
                src={branding?.logoDark || "/images/phantom-labs-logo-white.png"}
                alt={branding?.logoAlt || "PHANTOM LABS"}
                className="footer__brand-logo-img"
              />
            </Link>
            <p className="footer__brand-tagline font-serif-italic">
              {tagline}
            </p>
            {address && (
              <span style={{ fontSize: "12px", color: "#8E8E93", marginTop: "4px", display: "block" }}>
                {address}
              </span>
            )}
          </div>

          <nav className="footer__links-nav" aria-label="Footer Navigation">
            {links.map((link) => (
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
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="pointer"
                className="footer__link"
              >
                Instagram &mdash; {instagram.includes("instagram.com/") ? "@" + instagram.split("instagram.com/")[1].replace(/\/$/, "") : "@phantomlabs.in"}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                data-cursor="pointer"
                className="footer__link"
              >
                {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} data-cursor="pointer" className="footer__link">
                {phone}
              </a>
            )}
            {linkedin && linkedin !== "https://linkedin.com" && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" data-cursor="pointer" className="footer__link">
                LinkedIn
              </a>
            )}
          </div>

          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
