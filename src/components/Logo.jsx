import React from "react";

/**
 * Official Phantom Labs Brand Logo
 * Displays the official custom Phantom Labs branding mark.
 */
export default function Logo({ size = 20, className = "", style = {}, inverted = false }) {
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
      title="PHANTOM LABS"
      aria-hidden="true"
    >
      <img
        src={inverted ? "/images/phantom-labs-logo-white.png" : "/images/phantom-labs-logo.png"}
        alt="PHANTOM LABS"
        style={{
          height: `${size}px`,
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </span>
  );
}
