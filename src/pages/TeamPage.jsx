import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { routeTransition } from "../animations/pageTransitions.js";
import { teamSections } from "../data/teamMembers.js";
import TeamSection from "../components/team/TeamSection.jsx";

/**
 * TeamPage (/team)
 * 
 * Production-grade creative team presentation for Phantom Labs:
 * Exactly five distinct editorial sections in defined studio order:
 *   01 — THE FOUNDERS (Goutham & Harshith) — "Two perspectives. One vision."
 *   02 — CLIENT MANAGEMENT (Ravi Teja & Harsha JD) — "Every story begins with understanding."
 *   03 — UX & DESIGN (Harshith & Dhanush) — "Designed with intention. Built around the experience."
 *   04 — PHOTOGRAPHY & CINEMATOGRAPHY (Ganesh & Darshan DJ) — "Stories told through light, movement, and perspective."
 *   05 — EDITING & POST-PRODUCTION (Goutham) — "Every frame finds its final form."
 */
export default function TeamPage() {
  useEffect(() => {
    // Reset scroll on mount
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Document title & description
    const originalTitle = document.title;
    document.title = "The Collective — Creative Team | Phantom Labs";

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = "";
    if (metaDesc) {
      originalDesc = metaDesc.getAttribute("content") || "";
      metaDesc.setAttribute(
        "content",
        "Explore the creative collective behind Phantom Labs across five disciplines: Founders, Client Management, UX & Design, Photography & Cinematography, and Editing & Post-Production."
      );
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.article
      className="team-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Five Dedicated Studio Team Sections */}
      <div className="team-page__sections">
        {teamSections.map((section, idx) => (
          <TeamSection
            key={section.id}
            section={section}
            isFirst={idx === 0}
          />
        ))}
      </div>
    </motion.article>
  );
}
