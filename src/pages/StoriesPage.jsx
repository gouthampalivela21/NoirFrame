import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";
import { setPageMetadata } from "../utils/pageMetadata.js";
import { optimizedImageSrc } from "../utils/optimizedImageSrc.js";
import "../styles/editorialMagazine.css";

const APPLE_EASE = [0.22, 1, 0.36, 1];
const conciseCopy = (value, limit = 22) => {
  if (typeof value !== "string") return "";
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length <= limit ? value : `${words.slice(0, limit).join(" ").replace(/[,:;.!?]+$/, "")}…`;
};

export default function StoriesPage() {
  const { stories, pages, isLoading } = useLiveCms();
  const storyPage = pages?.stories || {};
  const [selectedGenre, setSelectedGenre] = useState("All");
  const isReduced = prefersReducedMotion();

  useEffect(() => {
    setPageMetadata(storyPage.seoTitle || "Stories & Field Notes — Phantom Labs", storyPage.seoDescription);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [storyPage.seoTitle, storyPage.seoDescription]);

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

  const [featuredStory, ...otherStories] = filteredStories;
  const getImage = (story) => optimizedImageSrc(
    story.leadImage?.src || story.coverImage || story.image || "/images/hero-villa-wide.jpg"
  );
  const getStoryUrl = (story) => `/explore/${story.id || story.category?.toLowerCase() || "portraits"}`;

  return (
    <main className="stories-magazine-page">
      <div className="stories-magazine-container">
        <header className="stories-magazine-header">
          <div className="stories-magazine-issue-line">
            <span>{storyPage.eyebrow || "Phantom Labs · The Journal"}</span>
            <span>Photography &amp; Culture</span>
          </div>
          <div className="stories-magazine-title-block">
            <span className="stories-magazine-kicker">The visual issue · 2026</span>
            <h1>{storyPage.headline || "Stories Framed in Light."}</h1>
            <p>{conciseCopy(storyPage.intro || "A journal of portraiture, light and human connection.", 24)}</p>
          </div>
          <nav className="stories-category-nav" aria-label="Filter stories by category">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                className={selectedGenre === genre ? "is-active" : ""}
                aria-pressed={selectedGenre === genre}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </nav>
        </header>

        {isLoading ? (
          <div className="stories-magazine-empty" role="status">Opening the journal…</div>
        ) : !featuredStory ? (
          <div className="stories-magazine-empty">No stories published under this category yet.</div>
        ) : (
          <>
            <motion.article
              className="stories-magazine-feature"
              initial={isReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: APPLE_EASE }}
            >
              <Link to={getStoryUrl(featuredStory)} className="stories-magazine-feature-image">
                <img src={getImage(featuredStory)} alt={featuredStory.leadImage?.alt || featuredStory.headline} fetchPriority="high" />
                <span className="stories-magazine-image-index">01 / {featuredStory.category || "The feature"}</span>
              </Link>
              <div className="stories-magazine-feature-copy">
                <span className="stories-magazine-kicker">{featuredStory.issueKicker || "The cover story"}</span>
                <h2><Link to={getStoryUrl(featuredStory)}>{featuredStory.headline}</Link></h2>
                {featuredStory.deck && <p>{conciseCopy(featuredStory.deck, 26)}</p>}
                <div className="stories-magazine-byline">
                  <span>{featuredStory.byline?.replace("Photography & Words by ", "") || "Phantom Labs"}</span>
                  <Link to={getStoryUrl(featuredStory)}>Read the story <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </motion.article>

            {otherStories.length > 0 && (
              <section className="stories-magazine-collection" aria-label="More stories">
                <div className="stories-magazine-section-heading">
                  <span>In this issue</span>
                  <h2>More perspectives</h2>
                </div>
                <div className="stories-magazine-grid">
                  {otherStories.map((story, idx) => (
                    <motion.article
                      key={story.id || idx}
                      className="stories-magazine-card"
                      initial={isReduced ? false : { opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.55, delay: (idx % 3) * 0.06, ease: APPLE_EASE }}
                    >
                      <Link to={getStoryUrl(story)} className="stories-magazine-card-image">
                        <img src={getImage(story)} alt={story.leadImage?.alt || story.headline} loading="lazy" decoding="async" />
                        <span>{story.category || "Editorial"}</span>
                      </Link>
                      <div className="stories-magazine-card-copy">
                        <span className="stories-magazine-kicker">{story.issueKicker || "Field note"}</span>
                        <h3><Link to={getStoryUrl(story)}>{story.headline}</Link></h3>
                        {story.deck && <p>{conciseCopy(story.deck, 18)}</p>}
                        <Link className="stories-magazine-read-link" to={getStoryUrl(story)}>Read story <span aria-hidden="true">↗</span></Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
