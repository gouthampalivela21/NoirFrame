import React from "react";
import logoImage from "../assets/logo.png";

/**
 * Official Noir Frame Brand Logo
 * Renders the exact uploaded aperture brand mark without modification.
 */
export default function Logo({ size = 18, className = "", style = {} }) {
  return (
    <span
      className={`site-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        ...style,
      }}
      title="Noir Frame"
    >
      <img
        src={logoImage}
        alt="Noir Frame"
        width={size}
        height={size}
        className="site-logo__image"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "contain",
          display: "block",
          flexShrink: 0,
        }}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
