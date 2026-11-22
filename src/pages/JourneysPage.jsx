import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";
import "../styles/journeys.css";

const chapterBlueprints = [
  {
    id: "portraits",
    category: "Portraits",
    number: "01",
    title: "Portraits, at your pace.",
    copy: "A considered portrait session, shaped around who you are and how you want to be seen.",
    image: "/images/editorial/mira-studio-lead.jpg",
    alt: "A portrait subject resting in warm afternoon window light",
    imagePosition: "center 42%",
  },
  {
    id: "couples",
    category: "Couples",
    number: "02",
    title: "A story made together.",
    copy: "Honest photographs of the small gestures, shared rituals and moments that feel like you.",
    image: "/images/tiles/tile-couples.jpg",
    alt: "A couple together in the last light of the day",
    imagePosition: "center 48%",
  },
  {
    id: "destinations",
    category: "Destination Stories",
    bookingCategory: "Events",
    number: "03",
    title: "Somewhere worth remembering.",
    copy: "A thoughtful record of the people, place and feeling that bring a gathering to life.",
    image: "/images/hero-villa-wide.jpg",
    alt: "A quiet architectural space in warm evening light",
    imagePosition: "center 55%",
  },
  {
    id: "creative-projects",
    category: "Creative Projects",
    bookingCategory: "Editorial",
    number: "04",
    title: "Ideas, made visible.",
    copy: "Photography and motion for brands, editorials and projects with a clear point of view.",
    image: "/images/tiles/tile-editorial.jpg",
    alt: "An editorial portrait shaped by shadow and soft natural light",
    imagePosition: "center 40%",
  },
];

function findPackage(packages, chapter) {
  const normalized = (value) => String(value || "").toLowerCase();
  const idMatch = packages.find((item) => normalized(item.id) === chapter.id);
  if (idMatch) return idMatch;

  const categoryMatch = packages.find((item) => {
    const category = normalized(item.category);
    const title = normalized(item.title);
    if (chapter.id === "destinations") {
      return category.includes("destination") || title.includes("destination") || category === "events";
    }
    if (chapter.id === "creative-projects") {
      return ["editorial", "brands", "commercial"].includes(category);
    }
    return category === chapter.category.toLowerCase();
  });

  return categoryMatch || null;
}

function JourneyChapter({ chapter, packageInfo, index, isReduced }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.025, 1, 1.015]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [0.82, 1, 1, 0.82]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0, 1, 1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [12, 0, 0, -10]);
  const image = packageInfo?.image || chapter.image;

  return (
    <section
      className={`journey-chapter${index % 2 ? " journey-chapter--reverse" : ""}`}
      id={`journey-${chapter.id}`}
      ref={sectionRef}
      aria-labelledby={`journey-title-${chapter.id}`}
    >
      <motion.div
        className="journey-chapter__photograph"
        style={isReduced ? undefined : { scale: imageScale, opacity: imageOpacity }}
      >
        <img
          src={image}
          alt={chapter.alt}
          style={{ objectPosition: chapter.imagePosition }}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      </motion.div>
      <div className="journey-chapter__shade" aria-hidden="true" />

      <motion.div
        className="journey-chapter__content"
        style={isReduced ? undefined : { opacity: copyOpacity, y: copyY }}
      >
        <p className="journey-chapter__eyebrow">
          <span>{chapter.category}</span>
        </p>
        <h2 id={`journey-title-${chapter.id}`}>{chapter.title}</h2>
        <p className="journey-chapter__copy">{chapter.copy}</p>
        <Link
          className="journey-chapter__link"
          to={`/book?category=${(chapter.bookingCategory || chapter.category).toLowerCase()}`}
        >
          Book now <span aria-hidden="true">↗</span>
        </Link>
      </motion.div>
    </section>
  );
}

export default function JourneysPage() {
  const { journeys } = useLiveCms();
  const isReduced = prefersReducedMotion();
  const packages = Array.isArray(journeys?.packages) ? journeys.packages : [];

  useEffect(() => {
    document.title = "Journeys — Phantom Labs";
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="journeys-page">
      <section className="journeys-opening" aria-labelledby="journeys-opening-title">
        <picture className="journeys-opening__photograph">
          <source media="(max-width: 680px)" srcSet="/images/hero-villa-mobile.webp" />
          <img src="/images/hero-villa-wide.webp" alt="A sunlit architectural space waiting for a story" />
        </picture>
        <div className="journeys-opening__shade" aria-hidden="true" />
        <div className="journeys-opening__content">
          <p className="journeys-opening__eyebrow">PHANTOM LABS</p>
          <h1 id="journeys-opening-title">Journeys.</h1>
          <p className="journeys-opening__intro">
            Portraits, celebrations, places and ideas — photographed with care.
          </p>
          <a className="journeys-opening__scroll" href="#journey-portraits">
            Explore the stories <span aria-hidden="true">↓</span>
          </a>
        </div>
        <nav className="journeys-opening__chapters" aria-label="Journey chapters">
          {chapterBlueprints.map((chapter) => (
            <a href={`#journey-${chapter.id}`} key={chapter.id}>
              {chapter.category}
            </a>
          ))}
        </nav>
      </section>

      <main className="journeys-chapters" aria-label="Four kinds of visual journeys">
        {chapterBlueprints.map((chapter, index) => (
          <JourneyChapter
            key={chapter.id}
            chapter={chapter}
            packageInfo={findPackage(packages, chapter)}
            index={index}
            isReduced={isReduced}
          />
        ))}
      </main>

      <section className="journeys-closing" aria-labelledby="journeys-closing-title">
        <p className="journeys-closing__eyebrow">PHANTOM LABS</p>
        <h2 id="journeys-closing-title">Let’s make something meaningful.</h2>
        <p>Tell us what you have in mind. We’ll take it from there.</p>
        <Link to="/book" className="journeys-closing__link">Start a conversation <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
