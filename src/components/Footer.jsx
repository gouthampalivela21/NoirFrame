import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-max footer__inner">
        <span className="heading-md footer__brand">Noir Frame</span>

        <div className="footer__links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="label-sm" data-cursor="button">
            Instagram
          </a>
          <a href="https://behance.net" target="_blank" rel="noreferrer" className="label-sm" data-cursor="button">
            Behance
          </a>
          <a href="mailto:teamnoirframe@gmail.com" className="label-sm" data-cursor="button">
            Email
          </a>
        </div>

        <span className="label-sm footer__copy">&copy; 2026 Noir Frame</span>
      </div>
    </footer>
  );
}
