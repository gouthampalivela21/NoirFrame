import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { routeTransition, reducedMotionTransition } from "../animations/pageTransitions.js";
import { prefersReducedMotion } from "../utils/helpers.js";

export default function PlaceholderPage({ title }) {
  useEffect(() => {
    document.title = `${title} | Phantom Labs`;
  }, [title]);

  const variants = prefersReducedMotion() ? reducedMotionTransition : routeTransition;

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit">
      <section className="placeholder-page">
        <div className="container-max placeholder-page__inner">
          <p className="eyebrow placeholder-page__eyebrow">Phantom Labs</p>
          <h1 className="placeholder-page__title">{title}</h1>
          <p className="body-md placeholder-page__note">
            This foundation page is ready for upcoming creative direction.
          </p>
          <div className="placeholder-page__actions">
            <Link to="/" className="btn btn-secondary">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
