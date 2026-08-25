import React from "react";

/**
 * Reusable glass surface. `strength` selects between the subtle and
 * slightly-stronger glass tokens defined in glassmorphism.css.
 */
export default function GlassPanel({
  as: Tag = "div",
  strength = "regular",
  pill = false,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    strength === "strong" ? "glass-strong" : "glass",
    pill ? "glass-pill" : "glass-panel",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
