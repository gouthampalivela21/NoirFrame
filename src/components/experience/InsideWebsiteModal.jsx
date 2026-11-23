import React, { useEffect, useId, useRef, useState } from "react";

export const INSIDE_WEBSITE_MODULES = [
  {
    id: "homepage",
    index: "01",
    title: "Homepage",
    tag: "FULL-BLEED ENTRY",
    summary:
      "Full-viewport sunset architectural composition where typography inhabits natural negative space without obstructing the subject.",
    specs: ["100dvh Stage", "Cover Focal Positioning", "Subtle Left Gradient Scrim"],
  },
  {
    id: "navigation",
    index: "02",
    title: "Navigation",
    tag: "RESTRAINED CHROME",
    summary:
      "Single-row 56px navigation glass bar with optical backdrop blur, centered destination links, and adaptive dark/light contrast.",
    specs: ["56px Optical Height", "Backdrop Blur 16px", "Keyboard Focus First"],
  },
  {
    id: "typography",
    index: "03",
    title: "Typography",
    tag: "EDITORIAL HIERARCHY",
    summary:
      "Tight display tracking (-0.03em) paired with disciplined body contrast and fluid clamp sizing across desktop and handsets.",
    specs: ["Inter Display 600–700", "Fluid CSS Clamp Scale", "Tabular Process Numerals"],
  },
  {
    id: "ui-components",
    index: "04",
    title: "UI Components",
    tag: "MODULAR SYSTEM",
    summary:
      "Tactile pill controls, hairline surface boundaries, and native top-layer dialogs designed to feel effortless under pointer or finger.",
    specs: ["Native Top-Layer Dialog", "Hairline 1px Borders", "Touch-Safe 44px Targets"],
  },
  {
    id: "mobile-experience",
    index: "05",
    title: "Mobile Experience",
    tag: "ADAPTIVE VIEWPORT",
    summary:
      "Purpose-cropped portrait photography and thumb-reachable CTAs that preserve editorial calm on narrow screens without scroll trapping.",
    specs: ["Portrait Art Direction", "Zero Horizontal Overflow", "Native Momentum Scroll"],
  },
  {
    id: "animations",
    index: "06",
    title: "Animations & Interactions",
    tag: "COMPOSITOR PHYSICS",
    summary:
      "GPU-composited transform and opacity choreography powered by GSAP ScrollTrigger, Lenis smoothing, and Framer Motion continuity.",
    specs: ["Apple Easing [0.22, 1, 0.36, 1]", "60fps Transform/Opacity", "Reduced-Motion Native"],
  },
];

function isPointerOutsideRect(event, rect) {
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

function ModuleStageInspection({ module, subVariant, onToggleSubVariant }) {
  switch (module.id) {
    case "homepage":
      return (
        <div className="inside-stage inside-stage--homepage">
          <div className="inside-stage__canvas">
            <img
              src={subVariant === 1 ? "/images/tiles/tile-brands.webp" : "/images/hero-villa-wide.webp"}
              alt={module.title}
              className="inside-stage__photo"
            />
            <div className="inside-stage__scrim" />
            <div className="inside-stage__hero-copy">
              <span>{subVariant === 1 ? "02 / MATERIALITY MONOGRAPH" : "01 / VELORA RESIDENCE"}</span>
              <h4>{subVariant === 1 ? "Warm Obsidian & Glass." : "Spaces That Inspire."}</h4>
            </div>
          </div>
          <div className="inside-stage__bar">
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 0 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(0)}
            >
              Daylight Dusk Frame
            </button>
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 1 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(1)}
            >
              Mood Monograph Frame
            </button>
          </div>
        </div>
      );

    case "navigation":
      return (
        <div className="inside-stage inside-stage--navigation">
          <div className={`inside-nav-sim ${subVariant === 1 ? "is-dark" : "is-light"}`}>
            <span className="inside-nav-sim__brand">PHANTOM LABS</span>
            <div className="inside-nav-sim__links">
              <span className="is-current">Home</span>
              <span>Stories</span>
              <span>Journeys</span>
              <span>The Studio</span>
            </div>
            <span className="inside-nav-sim__btn">Start a Conversation →</span>
          </div>
          <p className="inside-nav-sim__note">
            Automatically adapts surface luminance, hairline borders, and brand wordmark between light editorial galleries and deep-black product films.
          </p>
          <div className="inside-stage__bar">
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 0 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(0)}
            >
              Editorial Light Glass
            </button>
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 1 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(1)}
            >
              Experience Dark Glass
            </button>
          </div>
        </div>
      );

    case "typography":
      return (
        <div className="inside-stage inside-stage--typography">
          <div className="inside-type-specimen">
            <span className="inside-type-specimen__kicker">DISPLAY SPECIMEN · TRACKING -0.035EM</span>
            <p className="inside-type-specimen__hero" style={{ fontWeight: subVariant === 1 ? 500 : 700 }}>
              Websites that feel different.
            </p>
            <p className="inside-type-specimen__body">
              Every headline, supporting line, and caption is sized via fluid viewport math so line breaks stay balanced from 390px mobile to 1600px studio monitors.
            </p>
          </div>
          <div className="inside-stage__bar">
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 0 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(0)}
            >
              Keynote Bold (700)
            </button>
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 1 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(1)}
            >
              Editorial Medium (500)
            </button>
          </div>
        </div>
      );

    case "ui-components":
      return (
        <div className="inside-stage inside-stage--components">
          <div className="inside-comp-grid">
            <div className="inside-comp-card">
              <span className="inside-comp-label">PRIMARY CAPSULE</span>
              <span className="inside-comp-pill inside-comp-pill--solid">Start a Conversation ↗</span>
            </div>
            <div className="inside-comp-card">
              <span className="inside-comp-label">SECONDARY GHOST</span>
              <span className="inside-comp-pill inside-comp-pill--outline">Explore Work →</span>
            </div>
            <div className="inside-comp-card inside-comp-card--wide">
              <span className="inside-comp-label">STATUS INDICATOR</span>
              <span className="inside-comp-status">
                <i /> EXPLORE EXPERIENCE ↗
              </span>
            </div>
          </div>
        </div>
      );

    case "mobile-experience":
      return (
        <div className="inside-stage inside-stage--mobile">
          <div className="inside-phone-frame">
            <div className="inside-phone-frame__island" />
            <img src="/images/hero-villa-mobile.webp" alt="Mobile layout" />
            <div className="inside-phone-frame__copy">
              <span>PHANTOM LABS</span>
              <strong>Framed for palm ergonomics.</strong>
            </div>
          </div>
        </div>
      );

    case "animations":
    default:
      return (
        <div className="inside-stage inside-stage--animations">
          <div className={`inside-curve-stage ${subVariant === 1 ? "is-scrubbed" : ""}`}>
            <div className="inside-curve-track">
              <div className="inside-curve-puck" />
            </div>
            <div className="inside-curve-meta">
              <code>cubic-bezier(0.22, 1, 0.36, 1)</code>
              <span>Deceleration curve — zero elastic overshoot</span>
            </div>
          </div>
          <div className="inside-stage__bar">
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 0 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(0)}
            >
              Keynote Glide
            </button>
            <button
              type="button"
              className={`inside-stage__chip ${subVariant === 1 ? "is-active" : ""}`}
              onClick={() => onToggleSubVariant(1)}
            >
              Scroll-Scrub State
            </button>
          </div>
        </div>
      );
  }
}

/**
 * Accessible Native Top-Layer Inspection Dialog for "Inside the Website"
 * Uses <dialog closedby="any"> + Safari coordinate outside-click fallback
 * and modal/backdrop scroll containment.
 */
export default function InsideWebsiteModal({
  selectedId,
  onSelectId,
  onClose,
  modules = INSIDE_WEBSITE_MODULES,
}) {
  const dialogRef = useRef(null);
  const pointerDownOutsideRef = useRef(false);
  const [subVariant, setSubVariant] = useState(0);
  const titleId = useId();

  const moduleList = Array.isArray(modules) ? modules : INSIDE_WEBSITE_MODULES;
  const currentIdx = moduleList.findIndex((m) => m.id === selectedId);
  const currentModule = currentIdx >= 0 ? moduleList[currentIdx] : null;

  useEffect(() => {
    setSubVariant(0);
  }, [selectedId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (currentModule && !dialog.open) {
      window.__lenis?.stop?.();
      dialog.showModal();
    } else if (!currentModule && dialog.open) {
      dialog.close();
      window.__lenis?.start?.();
    }

    return () => {
      if (dialog.open) {
        window.__lenis?.start?.();
      }
    };
  }, [currentModule]);

  // Mandatory Safari light-dismiss fallback (closedby unsupported on Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || "closedBy" in HTMLDialogElement.prototype) return undefined;

    const handlePointerDown = (e) => {
      if (!dialog.open) return;
      const rect = dialog.getBoundingClientRect();
      pointerDownOutsideRef.current = isPointerOutsideRect(e, rect);
    };

    const handlePointerUp = (e) => {
      if (!dialog.open) return;
      const rect = dialog.getBoundingClientRect();
      const pointerUpOutside = isPointerOutsideRect(e, rect);
      if (pointerDownOutsideRef.current && pointerUpOutside) {
        dialog.close();
      }
      pointerDownOutsideRef.current = false;
    };

    dialog.addEventListener("pointerdown", handlePointerDown);
    dialog.addEventListener("pointerup", handlePointerUp);
    return () => {
      dialog.removeEventListener("pointerdown", handlePointerDown);
      dialog.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleNativeClose = () => {
    window.__lenis?.start?.();
    onClose();
  };

  const stepModule = (delta) => {
    if (currentIdx < 0) return;
    const nextIdx =
      (currentIdx + delta + moduleList.length) %
      moduleList.length;
    onSelectId(moduleList[nextIdx].id);
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={titleId}
      className="inside-modal"
      onClose={handleNativeClose}
    >
      {currentModule && (
        <div className="inside-modal__shell">
          <header className="inside-modal__header">
            <div className="inside-modal__meta">
              <span className="inside-modal__index">{currentModule.index}</span>
              <span className="inside-modal__tag">{currentModule.tag}</span>
            </div>
            <button
              type="button"
              className="inside-modal__close"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close inspection dialog"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div className="inside-modal__body">
            <div className="inside-modal__info">
              <h3 id={titleId} className="inside-modal__title">
                {currentModule.title}
              </h3>
              <p className="inside-modal__summary">{currentModule.summary}</p>
              <ul className="inside-modal__specs">
                {currentModule.specs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </div>

            <div className="inside-modal__stage-wrap">
              <ModuleStageInspection
                module={currentModule}
                subVariant={subVariant}
                onToggleSubVariant={setSubVariant}
              />
            </div>
          </div>

          <footer className="inside-modal__footer">
            <button
              type="button"
              className="inside-modal__step-btn"
              onClick={() => stepModule(-1)}
            >
              ← Previous
            </button>
            <span className="inside-modal__counter">
              {currentModule.index} / {String(moduleList.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              className="inside-modal__step-btn"
              onClick={() => stepModule(1)}
            >
              Next →
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
