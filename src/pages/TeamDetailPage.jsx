import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import {
  getTeamDepartmentBySlug,
  getAdjacentTeamDepartments,
} from "../data/teamMembers.js";
import TeamMemberFullProfile from "../components/team/TeamMemberFullProfile.jsx";

/**
 * TeamDetailPage (/team/:slug)
 * 
 * Grouped Department Profile Page:
 * - Displays the complete profiles of all members in that department, arranged vertically.
 * - Top Navigation: "← BACK TO OUR TEAM"
 * - Department Eyebrow, Title & Supporting Line.
 * - Vertically stacked individual member monographs (Full Hero, Philosophy Quote, About, Responsibilities).
 * - Subtle divider between members in the same department.
 * - Bottom Department Navigation: Previous Department (Left) and Next Department (Right).
 */
export default function TeamDetailPage() {
  const { slug } = useParams();
  const department = getTeamDepartmentBySlug(slug);
  const { prev, next } = getAdjacentTeamDepartments(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    if (department) {
      document.title = `${department.title} — Our Team | Phantom Labs`;
    } else {
      document.title = "Our Team | Phantom Labs";
    }
  }, [slug, department]);

  if (!department) {
    return (
      <motion.article
        className="team-detail-not-found"
        variants={routeTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="container-max team-detail-not-found__inner">
          <span className="eyebrow">PHANTOM LABS — THE COLLECTIVE</span>
          <h1 className="team-detail-not-found__title">Department Not Found</h1>
          <p className="team-detail-not-found__text">
            The requested studio department profile could not be located in our archive.
          </p>
          <Link to="/team" className="btn btn-primary">
            <span>RETURN TO OUR TEAM</span>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="team-detail-page team-dept-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Top Back Navigation Bar */}
      <header className="team-detail-nav-bar">
        <div className="container-max team-detail-nav-bar__inner">
          <Link
            to="/team"
            className="team-detail-back-link"
            data-cursor="button"
          >
            <span className="team-detail-back-arrow" aria-hidden="true">&larr;</span>
            <span>BACK TO OUR TEAM</span>
          </Link>

          <span className="team-detail-counter">
            {department.counter || "01 / 05"} &mdash; {department.title}
          </span>
        </div>
      </header>

      {/* Main Editorial Container */}
      <div className="container-max team-detail-container">
        {/* Department Introduction Banner */}
        <header className="team-dept-hero-header">
          <div className="team-dept-hero-header__eyebrow">
            <span className="team-sec__dot" aria-hidden="true" />
            <span>{department.label || department.title}</span>
          </div>

          <h1 className="team-dept-hero-header__title">
            {department.title}
          </h1>

          {department.supportingLine && (
            <p className="team-dept-hero-header__sub">
              &ldquo;{department.supportingLine}&rdquo;
            </p>
          )}
        </header>

        {/* Vertically Stacked Complete Member Profiles */}
        <div className="team-dept-members-stack">
          {department.members.map((member, idx) => (
            <TeamMemberFullProfile
              key={member.id || idx}
              member={member}
              department={department}
              index={idx}
              isLast={idx === department.members.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Bottom Department Pagination */}
      <nav className="team-detail-pagination team-dept-pagination" aria-label="Department Navigation">
        <div className="container-max team-detail-pagination__inner">
          {prev ? (
            <Link
              to={`/team/${prev.slug || prev.id}`}
              className="team-detail-pag-btn team-detail-pag-btn--prev"
            >
              <span className="team-detail-pag-dir">
                <span className="team-detail-pag-arrow" aria-hidden="true">&larr;</span>
                <span>PREVIOUS DEPARTMENT</span>
              </span>
              <span className="team-detail-pag-name">{prev.title}</span>
              <span className="team-detail-pag-role">{prev.supportingLine}</span>
            </Link>
          ) : (
            <div className="team-detail-pag-empty" />
          )}

          {next ? (
            <Link
              to={`/team/${next.slug || next.id}`}
              className="team-detail-pag-btn team-detail-pag-btn--next"
            >
              <span className="team-detail-pag-dir">
                <span>NEXT DEPARTMENT</span>
                <span className="team-detail-pag-arrow" aria-hidden="true">&rarr;</span>
              </span>
              <span className="team-detail-pag-name">{next.title}</span>
              <span className="team-detail-pag-role">{next.supportingLine}</span>
            </Link>
          ) : (
            <div className="team-detail-pag-empty" />
          )}
        </div>
      </nav>
    </motion.article>
  );
}
