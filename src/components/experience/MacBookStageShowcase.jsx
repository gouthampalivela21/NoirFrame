import React from "react";

const PROCESS_SCREEN_STATES = [
  {
    code: "01",
    label: "DISCOVERY",
    title: "Brand & Audience Immersion",
    metrics: [
      { k: "Positioning", v: "Quiet Architectural Luxury" },
      { k: "Focus", v: "Light, Proportion & Materiality" },
      { k: "Intent", v: "Private Residence Inquiries" },
    ],
    pillars: ["Brand Ethnography", "Visual Audit", "Competitive Whitespace", "Editorial Voice"],
  },
  {
    code: "02",
    label: "STRATEGY",
    title: "Narrative & Experience Architecture",
    metrics: [
      { k: "Cadence", v: "Hero → Monograph → Inquiry" },
      { k: "Copy Ratio", v: "Minimal High-Impact Restraint" },
      { k: "Flow", v: "Zero-Friction Conversion Path" },
    ],
    pillars: ["Information Hierarchy", "Keynote Story Arc", "Viewport Pacing", "Intent Mapping"],
  },
  {
    code: "03",
    label: "UI/UX ARCHITECTURE",
    title: "Spatial Blueprint & Wireframes",
    metrics: [
      { k: "Grid", v: "12-Col / 12px Editorial Gutter" },
      { k: "Breakpoints", v: "1440px · 1024px · 390px" },
      { k: "Navigation", v: "Focused Single-Row Surface" },
    ],
    pillars: ["Wireframe Systems", "Interactive States", "Touch Ergonomics", "Focus Order"],
  },
  {
    code: "04",
    label: "VISUAL DESIGN",
    title: "Typography, Lighting & Restraint",
    metrics: [
      { k: "Typeface", v: "Inter Display & Tight Tracking" },
      { k: "Palette", v: "#050505 · #111114 · #F5F4F1" },
      { k: "Depth", v: "Subtle Specular Glass Rims" },
    ],
    pillars: ["Display Scale", "Surface Contrast", "Art Direction", "Micro-Spacing"],
  },
  {
    code: "05",
    label: "DEVELOPMENT",
    title: "Motion Engineering & Performance",
    metrics: [
      { k: "Scroll", v: "GSAP ScrollTrigger + Lenis" },
      { k: "Compositor", v: "Transform & Opacity 60fps" },
      { k: "Media", v: "Responsive WebP Srcset" },
    ],
    pillars: ["Semantic DOM", "GPU Layering", "MatchMedia Choreography", "Reduced Motion"],
  },
  {
    code: "06",
    label: "TESTING & LAUNCH",
    title: "Precision Verification & Release",
    metrics: [
      { k: "Layout Shift", v: "0.00 CLS Verified" },
      { k: "A11y", v: "Keyboard & Focus Validated" },
      { k: "Browsers", v: "Safari · Chrome · iOS Tested" },
    ],
    pillars: ["Safari Polish", "Touch QA", "Bundle Hygiene", "Production Launch"],
  },
];

/**
 * Photorealistic Space-Black MacBook Pro Hardware & Live Velora Website Canvas
 * Separates outer camera/scroll rig (.mbp-rig), ambient float wrapper (.mbp-float),
 * and layered internal display scenes so GSAP timelines animate at 60fps with zero conflict.
 */
export default function MacBookStageShowcase({
  activeProcessIdx = null,
  interactiveMode = false,
}) {
  return (
    <div className="mbp-stage" aria-label="MacBook Pro displaying the Velora Architecture digital experience">
      <div className="mbp-rig">
        <div className="mbp-float">
          <div className="mbp-chassis">
            {/* Upper Anodized Aluminum Lid & Glass Display */}
            <div className="mbp-lid">
              <div className="mbp-bezel">
                {/* Hardware Camera Housing Notch */}
                <div className="mbp-notch" aria-hidden="true">
                  <span className="mbp-camera-lens" />
                </div>

                {/* Live 16:10 Retina Viewport */}
                <div className="mbp-screen">
                  {/* Persistent Velora Website Chrome inside Screen */}
                  <div className="mbp-velora-chrome">
                    <div className="mbp-velora-brand">
                      <span className="mbp-velora-brand__title">VELORA</span>
                      <span className="mbp-velora-brand__sub">ARCHITECTURE</span>
                    </div>
                    <div className="mbp-velora-links" aria-hidden="true">
                      <span>Projects</span>
                      <span>Studio</span>
                      <span>Journal</span>
                      <span>Contact</span>
                    </div>
                  </div>

                  {/* Scene 1: Velora Signature Dusk Villa Hero (matches homepage laptop aesthetic) */}
                  <div className="mbp-scene mbp-scene--hero">
                    <picture className="mbp-scene__bg-picture">
                      <source type="image/webp" srcSet="/images/hero-villa-wide.webp" />
                      <img
                        src="/images/hero-villa-wide.jpg"
                        alt=""
                        className="mbp-scene__bg-img"
                        decoding="async"
                      />
                    </picture>
                    <div className="mbp-scene__scrim" aria-hidden="true" />
                    <div className="mbp-scene--hero__copy">
                      <p className="mbp-scene--hero__headline">
                        Spaces
                        <br />
                        That Inspire.
                      </p>
                      <p className="mbp-scene--hero__meta">
                        ARCHITECTURE &nbsp;/&nbsp; INTERIORS &nbsp;/&nbsp; DESIGN
                      </p>
                    </div>
                  </div>

                  {/* Scene 2: Scrolled Spatial Archive Section (Phase 3 Reveal) */}
                  <div className="mbp-scene mbp-scene--archive">
                    <div className="mbp-archive__header">
                      <span className="mbp-archive__kicker">01 — SELECTED MONOGRAPH</span>
                      <h3 className="mbp-archive__heading">Crafted for permanence.</h3>
                    </div>
                    <div className="mbp-archive__grid">
                      <div className="mbp-archive__card mbp-archive__card--lead">
                        <img src="/images/hero-villa-mobile.webp" alt="" loading="lazy" />
                        <div className="mbp-archive__card-meta">
                          <span>Karuizawa Cliff House</span>
                          <span>2026</span>
                        </div>
                      </div>
                      <div className="mbp-archive__card">
                        <img src="/images/tiles/tile-brands.webp" alt="" loading="lazy" />
                        <div className="mbp-archive__card-meta">
                          <span>Stone &amp; Amber Study</span>
                          <span>Materials</span>
                        </div>
                      </div>
                      <div className="mbp-archive__card">
                        <img src="/images/tiles/tile-editorial.webp" alt="" loading="lazy" />
                        <div className="mbp-archive__card-meta">
                          <span>Gallery Monograph</span>
                          <span>Editorial</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scene 3: Responsive Multi-Viewport Split (Phase 3 Reveal) */}
                  <div className="mbp-scene mbp-scene--responsive">
                    <div className="mbp-resp__copy">
                      <span className="mbp-resp__kicker">ADAPTIVE SYSTEM</span>
                      <h3 className="mbp-resp__title">
                        Fluid from studio display to palm.
                      </h3>
                      <div className="mbp-resp__tokens">
                        <div>
                          <span>Grid</span>
                          <strong>12-Col Elastic</strong>
                        </div>
                        <div>
                          <span>Scale</span>
                          <strong>CSS Clamp</strong>
                        </div>
                        <div>
                          <span>Framerate</span>
                          <strong>60 fps</strong>
                        </div>
                      </div>
                    </div>
                    <div className="mbp-resp__phone" aria-hidden="true">
                      <div className="mbp-resp__phone-island" />
                      <img src="/images/hero-villa-mobile.webp" alt="" />
                      <div className="mbp-resp__phone-caption">
                        <span>VELORA</span>
                        <strong>Spaces That Inspire.</strong>
                      </div>
                    </div>
                  </div>

                  {/* Scene 4: Sequential 6-Stage Process Screen States (Phase 5) */}
                  <div className="mbp-scene mbp-scene--process">
                    {PROCESS_SCREEN_STATES.map((proc, idx) => {
                      const isActive = interactiveMode && activeProcessIdx === idx;
                      return (
                        <div
                          key={proc.code}
                          className={`mbp-proc-view mbp-proc-view--${idx} ${isActive ? "is-active" : ""}`}
                        >
                          <div className="mbp-proc__top">
                            <span className="mbp-proc__badge">
                              STAGE {proc.code} / {proc.label}
                            </span>
                            <span className="mbp-proc__dot-row" aria-hidden="true">
                              {PROCESS_SCREEN_STATES.map((_, dIdx) => (
                                <i key={dIdx} className={dIdx === idx ? "is-lit" : ""} />
                              ))}
                            </span>
                          </div>
                          <h3 className="mbp-proc__title">{proc.title}</h3>
                          <div className="mbp-proc__metrics">
                            {proc.metrics.map((m) => (
                              <div key={m.k} className="mbp-proc__metric-card">
                                <span className="mbp-proc__metric-k">{m.k}</span>
                                <strong className="mbp-proc__metric-v">{m.v}</strong>
                              </div>
                            ))}
                          </div>
                          <div className="mbp-proc__pillars">
                            {proc.pillars.map((p) => (
                              <span key={p} className="mbp-proc__pill">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scene 5: Final Presentation Glow State (Phase 6 Reveal) */}
                  <div className="mbp-scene mbp-scene--final">
                    <picture className="mbp-scene__bg-picture">
                      <source type="image/webp" srcSet="/images/hero-villa-wide.webp" />
                      <img
                        src="/images/hero-villa-wide.jpg"
                        alt=""
                        className="mbp-scene__bg-img"
                        decoding="async"
                      />
                    </picture>
                    <div className="mbp-scene__scrim mbp-scene__scrim--final" aria-hidden="true" />
                    <div className="mbp-scene--final__overlay">
                      <span className="mbp-scene--final__tag">FINAL PRODUCTION BUILD</span>
                      <p className="mbp-scene--final__headline">
                        Built to hold attention.
                      </p>
                      <span className="mbp-scene--final__url">velora-architecture.studio</span>
                    </div>
                  </div>

                  {/* Subtle Optical Glass Sheen */}
                  <div className="mbp-glass-sheen" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Lower Anodized Unibody Deck & Hinge */}
            <div className="mbp-base" aria-hidden="true">
              <div className="mbp-base__hinge" />
              <div className="mbp-base__cutout" />
              <div className="mbp-base__chamfer" />
            </div>

            {/* Subtle Surface Floor Reflection */}
            <div className="mbp-floor-reflection" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
