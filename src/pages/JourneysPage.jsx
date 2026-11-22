import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function JourneysPage() {
  const { journeys, isLoading } = useLiveCms();
  const isReduced = prefersReducedMotion();

  const headline = journeys?.headline || "Journeys & Commissions.";
  const subtitle =
    journeys?.subtitle ||
    "Bespoke photography and motion experiences designed around unhurried presence.";
  const packages = Array.isArray(journeys?.packages) ? journeys.packages : [];

  useEffect(() => {
    document.title = "Journeys & Commissions — Phantom Labs";
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ backgroundColor: "#FAF9F6", minHeight: "100vh", color: "#111111" }}>
      {/* Header */}
      <header
        style={{
          padding: "140px 24px 60px",
          maxWidth: "1280px",
          margin: "0 auto",
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
          Bespoke Commissions & Offerings
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
          {headline}
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 1.8vw, 20px)",
            lineHeight: 1.6,
            color: "#525252",
            maxWidth: "680px",
            margin: "0 0 40px 0",
            fontWeight: "300",
          }}
        >
          {subtitle}
        </p>
      </header>

      {/* Packages Grid */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "32px",
          }}
        >
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id || idx}
              initial={isReduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: (idx % 2) * 0.1, ease: APPLE_EASE }}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #EAEAEA",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              {/* Cover Image */}
              {pkg.image && (
                <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", backgroundColor: "#111" }}>
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      backgroundColor: "rgba(13, 13, 13, 0.75)",
                      backdropFilter: "blur(6px)",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: "600",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    {pkg.category || "Commission"}
                  </div>
                </div>
              )}

              {/* Package Content */}
              <div style={{ padding: "28px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                  <h2
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: "22px",
                      fontWeight: "500",
                      margin: 0,
                      color: "#0D0D0D",
                    }}
                  >
                    {pkg.title}
                  </h2>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "12px 0 20px 0" }}>
                  <span
                    style={{
                      fontSize: "26px",
                      fontWeight: "700",
                      letterSpacing: "-0.02em",
                      fontFamily: 'SF Mono, ui-monospace, monospace',
                      color: "#111111",
                    }}
                  >
                    {pkg.price}
                  </span>
                  {pkg.timeline && (
                    <span style={{ fontSize: "12.5px", color: "#8E8E93" }}>
                      &middot; Turnaround {pkg.timeline}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373", fontWeight: "600", marginBottom: "10px" }}>
                  What's Included:
                </div>

                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "#525252",
                    margin: "0 0 28px 0",
                  }}
                >
                  {pkg.deliverables}
                </p>

                <div style={{ marginTop: "auto" }}>
                  <Link
                    to={`/book?category=${pkg.category?.toLowerCase() || "portraits"}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "14px 20px",
                      backgroundColor: "#111111",
                      color: "#FFFFFF",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#262626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#111111";
                    }}
                  >
                    Commission This Journey &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process / Philosophy Section */}
        <div
          style={{
            marginTop: "100px",
            padding: "60px 40px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #EAEAEA",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: "700",
              color: "#737373",
              marginBottom: "12px",
            }}
          >
            THE COMMISSION PROCESS
          </div>
          <h3
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: "30px",
              fontWeight: "400",
              margin: "0 0 40px 0",
              color: "#0D0D0D",
            }}
          >
            How We Create Together.
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "32px",
            }}
          >
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px" }}>01 / BRIEF</div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Intent & Architecture</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#666666", margin: 0 }}>
                We align on atmosphere, emotional resonance, daylight windows, and specific artistic goals.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px" }}>02 / SESSION</div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Unhurried Production</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#666666", margin: 0 }}>
                No frantic timers or artificial rush. We work with changing sunlight and natural cadence.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px" }}>03 / ARCHIVE</div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Archival Color Grade</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#666666", margin: 0 }}>
                Every master frame receives bespoke analog tonal rendering and micro-contrast adjustments.
              </p>
            </div>

            <div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px" }}>04 / DELIVERY</div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Curated Master Plates</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#666666", margin: 0 }}>
                High-resolution digital vault alongside hand-bound heirlooms or archival cotton rag prints.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
