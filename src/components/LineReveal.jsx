import React from "react";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../utils/helpers.js";

const EASE_CINEMA = [0.22, 1, 0.36, 1];

export default function LineReveal({
  children,
  className = "",
  as: Component = "h2",
  delay = 0,
  stagger = 0.08,
}) {
  const isReduced = prefersReducedMotion();

  const lines = typeof children === "string" ? children.split("\n") : [children];

  return (
    <Component className={className}>
      {lines.map((line, idx) => (
        <span
          key={idx}
          style={{
            display: "block",
            overflow: "hidden",
            lineHeight: "inherit",
          }}
        >
          <motion.span
            style={{ display: "block", willChange: "transform, opacity" }}
            initial={isReduced ? false : { y: "105%", opacity: 0 }}
            whileInView={isReduced ? false : { y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.8,
              delay: delay + idx * stagger,
              ease: EASE_CINEMA,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
