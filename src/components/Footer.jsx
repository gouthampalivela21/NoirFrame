import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext.jsx";
import Logo from "./Logo.jsx";

export default function Footer() {
  const { siteSettings, contactData } = useData();
  const studioName = siteSettings?.studioName || "Noir Frame";
  const inquiryEmail = contactData?.inquiryEmail || "teamnoirframe@gmail.com";

  return (
    <footer className="footer">
      <div className="container-max footer__inner">
        <Link to="/" className="footer__brand" data-cursor="button" aria-label="Noir Frame">
          <Logo size={28} />
        </Link>

        <div className="footer__links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="label-sm" data-cursor="button">
            Instagram
          </a>
          <a href="https://behance.net" target="_blank" rel="noreferrer" className="label-sm" data-cursor="button">
            Behance
          </a>
          <a href={`mailto:${inquiryEmail}`} className="label-sm" data-cursor="button">
            Email
          </a>
        </div>

        <span className="label-sm footer__copy">&copy; {new Date().getFullYear()} {studioName}</span>
      </div>
    </footer>
  );
}
