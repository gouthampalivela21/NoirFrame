import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function StudioPage() {
  const { studio, isLoading } = useLiveCms();
  const isReduced = prefersReducedMotion();

  const headline = studio?.headline || "The Studio.";
  const subtitle =
    studio?.subtitle ||
    "A sanctuary for deliberate photography, medium format discipline, and unhurried observation.";
  const leadImage = studio?.leadImage || "/images/editorial/mira-studio-lead.jpg";
  const philosophy =
    studio?.philosophy ||
    "We believe photography is not the act of taking, but of receiving. In an era dominated by hyper-acceleration and instant gratification, Phantom Labs was founded on the radical premise of slowing down.";
  const principles = Array.isArray(studio?.principles) ? studio.principles : [];
  const spaces = Array.isArray(studio?.spaces) ? studio.spaces : [];
  const founder = studio?.founder || {};

  useEffect(() => {
    document.title = "The Studio & Philosophy — Phantom Labs";
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ backgroundColor: "#FAF9F6", minHeight: "100vh", color: "#111111" }}>
      {/* Masthead */}
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
          Philosophy & Physical Spaces
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
            maxWidth: "720px",
            margin: "0 0 40px 0",
            fontWeight: "300",
          }}
        >
          {subtitle}
        </p>
      </header>

      {/* Lead Image */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            maxHeight: "680px",
            boxShadow: "0 6px 30px rgba(0,0,0,0.06)",
          }}
        >
          <img
            src={leadImage}
            alt="The Studio Space"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="eager"
          />
        </div>
      </div>

      {/* Manifesto / Philosophy */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
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
          OUR MANIFESTO
        </div>
        <blockquote
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: "clamp(22px, 3.2vw, 36px)",
            lineHeight: 1.4,
            fontWeight: "400",
            color: "#0D0D0D",
            margin: "0 0 32px 0",
          }}
        >
          &ldquo;{philosophy}&rdquo;
        </blockquote>
      </section>

      {/* Core Principles */}
      {principles.length > 0 && (
        <section
          style={{
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #EAEAEA",
            borderBottom: "1px solid #EAEAEA",
            padding: "100px 24px",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
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
              DISCIPLINE
            </div>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: "36px",
                fontWeight: "400",
                margin: "0 0 60px 0",
                color: "#0D0D0D",
              }}
            >
              The Three Tenets.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "48px 36px",
              }}
            >
              {principles.map((pr, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontFamily: "SF Mono, monospace",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#A1A1AA",
                      marginBottom: "12px",
                    }}
                  >
                    {pr.number || `0${idx + 1}`}
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      margin: "0 0 12px 0",
                      color: "#111111",
                    }}
                  >
                    {pr.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: "#666666",
                      margin: 0,
                    }}
                  >
                    {pr.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Studio Spaces Gallery */}
      {spaces.length > 0 && (
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 24px" }}>
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
            THE ARCHITECTURE
          </div>
          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: "36px",
              fontWeight: "400",
              margin: "0 0 40px 0",
              color: "#0D0D0D",
            }}
          >
            Curated Spaces.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "32px",
            }}
          >
            {spaces.map((sp, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    aspectRatio: "16/10",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "#111",
                    marginBottom: "14px",
                  }}
                >
                  <img
                    src={sp.image}
                    alt={sp.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
                <h4 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 6px 0", color: "#111" }}>
                  {sp.title}
                </h4>
                {sp.caption && (
                  <p style={{ fontSize: "13.5px", color: "#737373", margin: 0, lineHeight: 1.5 }}>
                    {sp.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Founder Profile */}
      {founder.name && (
        <section
          style={{
            maxWidth: "1000px",
            margin: "0 auto 120px",
            padding: "48px 36px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #EAEAEA",
            display: "grid",
            gridTemplateColumns: "minmax(180px, 240px) 1fr",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {founder.portrait && (
            <div
              style={{
                aspectRatio: "1/1",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #EAEAEA",
                maxWidth: "220px",
                margin: "0 auto",
              }}
            >
              <img
                src={founder.portrait}
                alt={founder.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: "700",
                color: "#737373",
                marginBottom: "6px",
              }}
            >
              THE FOUNDER
            </div>
            <h3
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: "28px",
                fontWeight: "500",
                margin: "0 0 4px 0",
                color: "#0D0D0D",
              }}
            >
              {founder.name}
            </h3>
            {founder.role && (
              <div style={{ fontSize: "13.5px", color: "#8E8E93", marginBottom: "16px" }}>
                {founder.role}
              </div>
            )}

            {founder.quote && (
              <blockquote
                style={{
                  fontStyle: "italic",
                  fontSize: "16px",
                  lineHeight: 1.5,
                  color: "#111111",
                  margin: "0 0 16px 0",
                  paddingLeft: "14px",
                  borderLeft: "2px solid #111111",
                }}
              >
                &ldquo;{founder.quote}&rdquo;
              </blockquote>
            )}

            {founder.bio && (
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#666666", margin: 0 }}>
                {founder.bio}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Start a Conversation CTA */}
      <div
        style={{
          borderTop: "1px solid #EAEAEA",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: "32px",
            fontWeight: "400",
            margin: "0 0 16px 0",
          }}
        >
          Start a Conversation.
        </h3>
        <p style={{ color: "#737373", fontSize: "16px", margin: "0 0 28px 0" }}>
          We take a limited number of commissions each quarter.
        </p>
        <Link
          to="/book"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            backgroundColor: "#111111",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Inquire for Commissions &rarr;
        </Link>
      </div>
    </div>
  );
}
