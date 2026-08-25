import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { routeTransition } from "../animations/pageTransitions.js";
import { portfolioItems } from "../data/portfolio.js";
import SmartImage from "../components/SmartImage.jsx";
import StoryModal from "../components/StoryModal.jsx";
import GlassPanel from "../components/GlassPanel.jsx";

export default function ProjectPage() {
  const { id } = useParams();
  const [activeStory, setActiveStory] = useState(null);

  const currentIndex = useMemo(() => {
    const idx = portfolioItems.findIndex((item) => item.id === id);
    return idx !== -1 ? idx : 0;
  }, [id]);

  const project = portfolioItems[currentIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  return (
    <motion.article
      className="project-page"
      variants={routeTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <header className="project-header section">
        <div className="container-max">
          <div className="project-nav-bar">
            <Link to="/portfolio" className="project-back-link label-sm">
              ‹ Back to Archive
            </Link>
            <span className="eyebrow project-nav-pill">
              {project.category} — {project.year}
            </span>
          </div>

          <h1 className="display-1 project-title">{project.title}</h1>
          <p className="display-2 project-lead-quote font-serif-italic">
            "{project.intro?.quote || project.description}"
          </p>
        </div>
      </header>

      {/* Hero Image Showcase */}
      <section className="project-hero-wrap container-max">
        <div
          className="project-hero-image"
          onClick={() => setActiveStory(project)}
          role="button"
          tabIndex={0}
        >
          <SmartImage
            seed={project.seed}
            aspect={project.aspect || 16 / 10}
            widths={[900, 1400, 2000]}
            sizes="100vw"
            alt={project.title}
            priority
          />
          <div className="project-hero-badge label-sm">Explore Interactive Story</div>
        </div>
      </section>

      {/* Specifications Grid */}
      <section className="section project-specs-section">
        <div className="container-max">
          <GlassPanel className="project-specs-grid">
            {[
              { label: "Category", value: project.category },
              { label: "Year", value: String(project.year) },
              { label: "Format", value: "Medium Format Analog & 35mm" },
              { label: "Production", value: "Available Natural Light" },
            ].map((spec, i) => (
              <div key={i} className="project-spec-item">
                <span className="label-sm project-spec-label">{spec.label}</span>
                <span className="body-lg project-spec-val">{spec.value}</span>
              </div>
            ))}
          </GlassPanel>
        </div>
      </section>

      {/* Editorial Narrative */}
      {project.intro?.description && (
        <section className="section project-story-section">
          <div className="container-max split-layout">
            <div className="project-story-title">
              <span className="eyebrow">The Narrative</span>
              <h2 className="heading-lg">Restraint, Light & Composition</h2>
            </div>

            <div className="project-story-content">
              <p className="body-lg project-story-paragraph">{project.intro.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Multi-Photo Visual Gallery */}
      {project.sections && (
        <section className="section project-gallery-section">
          <div className="container-max">
            <span className="eyebrow project-gallery-eyebrow">Visual Archive</span>
            <h2 className="heading-lg project-gallery-title">Frames From The Story</h2>

            <div className="project-gallery-grid">
              {project.sections.map(
                (section, i) =>
                  section.image && (
                    <figure
                      key={i}
                      className={`project-gallery-item project-gallery-item--${i % 2 === 0 ? "wide" : "normal"}`}
                      onClick={() => setActiveStory(project)}
                      role="button"
                      tabIndex={0}
                    >
                      <SmartImage
                        seed={section.image.seed}
                        aspect={section.image.aspect || 16 / 10}
                        widths={[600, 1000, 1500]}
                        sizes="(max-width: 860px) 100vw, 50vw"
                        alt={section.image.caption || ""}
                      />
                      {section.image.caption && (
                        <figcaption className="label-sm">{section.image.caption}</figcaption>
                      )}
                    </figure>
                  )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Story Modal */}
      <StoryModal activeStory={activeStory} onClose={() => setActiveStory(null)} />
    </motion.article>
  );
}
