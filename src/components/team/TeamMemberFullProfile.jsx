import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../animations/pageTransitions.js";

/**
 * TeamMemberFullProfile
 * 
 * Production editorial profile section for grouped department pages:
 * - SECTION 01: Profile Hero (Large 4:5 Monochrome portrait on left, name, role, lead on right)
 * - SECTION 02: Personal Statement (Serif italic quotation block with "PHILOSOPHY" eyebrow)
 * - SECTION 03 & 04 & 06: Editorial Detail Grid (About, Connect & Inquiries, Core Responsibilities)
 * - Subtle divider between members when stacked vertically
 */
export default function TeamMemberFullProfile({
  member,
  department,
  index,
  isLast = false,
}) {
  return (
    <article
      id={`profile-${member.slug || member.id}`}
      className={`team-member-profile team-member-profile--${index + 1}`}
      aria-labelledby={`heading-member-${member.id || index}`}
    >
      {/* SECTION 01 — HERO COMPOSITION (Large portrait on LEFT, Profile intro on RIGHT) */}
      <section className="team-detail-hero" aria-labelledby={`heading-member-${member.id || index}`}>
        <div className="team-detail-hero__grid">
          {/* Left Media Column: Large Monochrome Portrait */}
          <motion.div
            className="team-detail-hero__media"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="team-detail-portrait-frame">
              <img
                src={member.portrait}
                alt={member.portraitAlt || `${member.name} — ${member.role}`}
                className="team-detail-portrait-img"
                style={{
                  objectPosition: member.objectPosition || "center 20%",
                }}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1200' viewBox='0 0 900 1200'%3E%3Crect fill='%23141414' width='900' height='1200'/%3E%3Ctext fill='%23555' font-family='sans-serif' font-size='26' x='50%25' y='50%25' text-anchor='middle'%3EPHANTOM LABS PORTRAIT%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </motion.div>

          {/* Right Content Column */}
          <motion.div
            className="team-detail-hero__content"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-40px" }}
          >
            <motion.div variants={fadeUp}>
              <span className="team-detail-eyebrow">
                {department ? department.label || department.title : "PHANTOM LABS"}
              </span>

              <h2 id={`heading-member-${member.id || index}`} className="team-detail-name">
                {member.name}
              </h2>

              <p className="team-detail-role">
                {member.role}
              </p>

              <p className="team-detail-lead">
                {member.shortIntro || member.introduction}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 02 — PERSONAL STATEMENT (Editorial Serif Italic Quote) */}
      {member.quote && (
        <motion.section
          className="team-detail-statement"
          aria-label={`Personal Statement by ${member.name}`}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="team-detail-statement__inner">
            <span className="team-detail-statement__tag" aria-hidden="true">
              PHILOSOPHY
            </span>
            <blockquote className="team-detail-statement__quote">
              &ldquo;{member.quote}&rdquo;
            </blockquote>
          </div>
        </motion.section>
      )}

      {/* SECTION 03 & 04 & 06 — EDITORIAL DETAIL GRID */}
      <motion.div
        className="team-detail-body-grid"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left Column: About & Connect */}
        <div className="team-detail-about-col">
          {member.introduction && (
            <section className="team-detail-about-section" aria-labelledby={`about-${member.id || index}`}>
              <h3 id={`about-${member.id || index}`} className="team-detail-section-label">
                ABOUT
              </h3>
              <div className="team-detail-about-text">
                <p>{member.introduction}</p>
                {member.bioExtended && <p>{member.bioExtended}</p>}
              </div>
            </section>
          )}

          {/* Connect & Inquiries */}
          <section className="team-detail-connect-section" aria-labelledby={`connect-${member.id || index}`}>
            <h3 id={`connect-${member.id || index}`} className="team-detail-section-label">
              CONNECT &amp; INQUIRIES
            </h3>
            <div className="team-detail-links">
              {member.socialLinks?.instagram && (
                <a
                  href={member.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-detail-link team-detail-link--external"
                >
                  <span className="team-detail-link__label">
                    Instagram <span className="team-detail-link__handle">— {member.socialLinks.instagramHandle || "@phantomlabs.in"}</span>
                  </span>
                  <span className="team-detail-link__arrow" aria-hidden="true">&nearr;</span>
                </a>
              )}
              <Link to="/contact" className="team-detail-link">
                <span className="team-detail-link__label">Initiate Commission</span>
                <span className="team-detail-link__arrow" aria-hidden="true">&rarr;</span>
              </Link>
              <Link to="/work" className="team-detail-link">
                <span className="team-detail-link__label">View Collective Works</span>
                <span className="team-detail-link__arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Core Responsibilities */}
        {member.responsibilities && member.responsibilities.length > 0 && (
          <section className="team-detail-resp-section" aria-labelledby={`resp-${member.id || index}`}>
            <h3 id={`resp-${member.id || index}`} className="team-detail-section-label">
              CORE RESPONSIBILITIES
            </h3>
            <div className="team-detail-resp-rows">
              {member.responsibilities.map((resp, i) => (
                <div className="team-detail-resp-row" key={resp.title || i}>
                  <div className="team-detail-resp-row__header">
                    <span className="team-detail-resp-row__num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="team-detail-resp-row__sep" aria-hidden="true">&mdash;</span>
                    <h4 className="team-detail-resp-row__title">
                      {resp.title}
                    </h4>
                  </div>
                  <p className="team-detail-resp-row__desc">
                    {resp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.div>

      {/* Subtle Inter-Profile Divider (if followed by another member in the department) */}
      {!isLast && (
        <div className="team-member-profile__divider" aria-hidden="true">
          <span className="team-member-profile__divider-line" />
          <span className="team-member-profile__divider-tag">
            CONTINUE TO NEXT PROFILE
          </span>
          <span className="team-member-profile__divider-line" />
        </div>
      )}
    </article>
  );
}

