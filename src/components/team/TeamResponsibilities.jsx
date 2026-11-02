import React from "react";

/**
 * TeamResponsibilities
 * 
 * Clean editorial numbered responsibilities block:
 * - Subtle divider line separating introduction and responsibilities
 * - Consistent vertical spacing
 * - Two-digit numbering (01, 02, 03)
 * - Muted description text with high contrast title
 */
export default function TeamResponsibilities({ responsibilities }) {
  if (!responsibilities || responsibilities.length === 0) return null;

  return (
    <div className="team-resp-block">
      <h3 className="team-resp-heading">CORE RESPONSIBILITIES</h3>
      <div className="team-resp-list">
        {responsibilities.map((resp, idx) => (
          <div key={idx} className="team-resp-item">
            <span className="team-resp-num">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="team-resp-body">
              <h4 className="team-resp-title">{resp.title}</h4>
              <p className="team-resp-desc">{resp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

