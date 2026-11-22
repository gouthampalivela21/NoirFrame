import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function StoriesPage() {
  const { stories, isLoading } = useLiveCms();
  const [selectedGenre, setSelectedGenre] = useState("All");
  const isReduced = prefersReducedMotion();

  useEffect(() => {
    document.title = "Stories & Field Notes — Phantom Labs";
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const genres = useMemo(() => {
    const set = new Set(["All"]);
    (stories || []).forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [stories]);

  const filteredStories = useMemo(() => {
    if (!Array.isArray(stories)) return [];
    if (selectedGenre === "All") return stories;
    return stories.filter(
      (s) => s.category?.toLowerCase() === selectedGenre.toLowerCase()
    );
  }, [stories, selectedGenre]);

  return (
    <div style={{ backgroundColor: "#FAF9F6", minHeight: "100vh", color: "#111111" }}>
      {/* Editorial Header */}
      <header
        style={{
          padding: "140px 24px 60px",
          maxWidth: "1280px",
          margin: "0 auto",
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: "700",
            color: "#737373",
            marginBottom: "16px",
          }}
        >
          Visual Monographs & Field Notes
        </div>
        <h1
          style={{
            fontFamily: 'Playfair Display, Georgia, "Times New Roman", serif',
            fontSize: "clamp(36px, 6vw, 68px)",
            lineHeight: 1.05,
            fontWeight: "400",
            letterSpacing: "-0.02em",
            margin: "0 0 20px 0",
            color: "#0D0D0D",
          }}
        >
          Stories Framed in Light.
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 1.8vw, 20px)",
            lineHeight: 1.6,
            color: "#525252",
            maxWidth: "680px",
            margin: "0 0 36px 0",
            fontWeight: "300",
          }}
        >
          A continuous journal of editorial portraiture, natural light observations, and unhurried human encounters.
        </p>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            paddingTop: "12px",
            borderTop: "1px solid #EAEAEA",
          }}
        >
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              style={{
                padding: "8px 18px",
                borderRadius: "30px",
                fontSize: "12.5px",
                fontWeight: "500",
                letterSpacing: "0.02em",
                border: "1px solid",
                borderColor: selectedGenre === genre ? "#111111" : "#D4D4D4",
                backgroundColor: selectedGenre === genre ? "#111111" : "transparent",
                color: selectedGenre === genre ? "#FFFFFF" : "#525252",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </header>

      {/* Stories Grid */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 120px" }}>
        {filteredStories.length === 0 ? (
          <div
            style={{
              padding: "80px 24px",
              textAlign: "center",
              border: "1px dashed #D4D4D4",
              borderRadius: "12px",
              color: "#737373",
            }}
          >
            No stories published under this category yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "40px 32px",
            }}
          >
            {filteredStories.map((story, idx) => {
              const imageSrc =
                story.leadImage?.src ||
                story.coverImage ||
                story.image ||
                "/images/hero-villa-wide.jpg";

              return (
                <motion.article
                  key={story.id || idx}
                  initial={isReduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, delay: (idx % 3) * 0.08, ease: APPLE_EASE }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Link
                    to={`/explore/${story.id || story.category?.toLowerCase() || "portraits"}`}
                    style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "16/10",
                        backgroundColor: "#E5E5E5",
                        borderRadius: "8px",
                        overflow: "hidden",
                        marginBottom: "16px",
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt={story.headline}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.03)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          backgroundColor: "rgba(13, 13, 13, 0.75)",
                          backdropFilter: "blur(8px)",
                          color: "#FFFFFF",
                          fontSize: "10.5px",
                          fontWeight: "600",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "4px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        {story.category || "Editorial"}
                      </div>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#8E8E93",
                          marginBottom: "6px",
                        }}
                      >
                        {story.issueKicker || "FIELD NOTE"}
                      </div>

                      <h2
                        style={{
                          fontFamily: 'Playfair Display, Georgia, serif',
                          fontSize: "22px",
                          fontWeight: "500",
                          lineHeight: 1.3,
                          margin: "0 0 10px 0",
                          color: "#0D0D0D",
                        }}
                      >
                        {story.headline}
                      </h2>

                      {story.deck && (
                        <p
                          style={{
                            fontSize: "14px",
                            lineHeight: 1.55,
                            color: "#666666",
                            margin: "0 0 16px 0",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {story.deck}
                        </p>
                      )}

                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: "12px",
                          borderTop: "1px solid #EAEAEA",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                          color: "#737373",
                        }}
                      >
                        <span>{story.byline ? story.byline.replace("Photography & Words by ", "") : "Phantom Labs"}</span>
                        <span style={{ fontWeight: "600", color: "#111111" }}>Read Field Note &rarr;</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
