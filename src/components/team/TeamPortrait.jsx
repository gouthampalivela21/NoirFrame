import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * TeamPortrait
 * 
 * Coordinated, high-performance portrait image renderer:
 * - Pre-reserved 4:5 aspect ratio dimensions to eliminate layout shifts (CLS = 0).
 * - Tasteful dark placeholder background (#0A0A0A) with subtle initials.
 * - Eager loading & fetchPriority="high" for the first visible portrait; lazy loading for below-the-fold profiles.
 * - Smooth opacity transition once image data has fully decoded and loaded.
 * - Error boundary fallback with logged warning if an image fails to load.
 * - Customizable object-position per member profile.
 */
export default function TeamPortrait({ member, targetHref, isPriority = false }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    console.warn(`[Phantom Labs] Failed to load portrait for ${member.name} (${member.slug})`);
  };

  const initials = member.name
    ? member.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NF";

  const href = targetHref || `/team/${member.slug}`;

  return (
    <div className="team-portrait-container">
      <Link
        to={href}
        className="team-portrait-frame"
        aria-label={`View profile for ${member.name}, ${member.role}`}
      >
        {/* Skeleton / Initial Placeholder State */}
        <div
          className={`team-portrait-placeholder ${isLoaded ? "is-hidden" : ""}`}
          aria-hidden="true"
        >
          <span className="team-portrait-placeholder__initials">
            {initials}
          </span>
        </div>

        {/* Primary Monochrome Portrait */}
        {!hasError ? (
          <img
            ref={imgRef}
            src={member.portrait}
            alt={member.portraitAlt || `${member.name} — ${member.role}`}
            className={`team-portrait-img ${isLoaded ? "is-loaded" : ""}`}
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "auto"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              objectPosition: member.objectPosition || "center 20%",
            }}
          />
        ) : (
          <div
            className="team-portrait-fallback"
            role="img"
            aria-label={member.portraitAlt || member.name}
          >
            <span className="team-portrait-fallback__text">{member.name}</span>
            <span className="team-portrait-fallback__role">{member.role}</span>
          </div>
        )}

        {/* Subtle Frame Inset Border */}
        <div className="team-portrait-border" aria-hidden="true" />
      </Link>
    </div>
  );
}

