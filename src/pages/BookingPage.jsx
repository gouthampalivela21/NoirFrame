import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../context/DataContext.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";
import {
  CATEGORIES_CONFIG,
  BOOKING_STEPS,
  INITIAL_FORM_STATE,
} from "../data/bookingQuestions.js";
import "../styles/bookingBrief.css";

const APPLE_EASE = [0.22, 1, 0.36, 1];

export default function BookingPage() {
  const { category: pathCategory } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addInquiry } = useData();
  const isReduced = prefersReducedMotion();

  // Detect preselected category from path param or query string (?category=... or ?service=...)
  const detectedCategory = useMemo(() => {
    const raw =
      pathCategory ||
      searchParams.get("category") ||
      searchParams.get("service") ||
      "portraits";
    const normalized = raw.toLowerCase().trim();
    return CATEGORIES_CONFIG[normalized] ? normalized : "portraits";
  }, [pathCategory, searchParams]);

  const [currentCategory, setCurrentCategory] = useState(detectedCategory);
  const [currentStep, setCurrentStep] = useState(1); // 1 to 5
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync category if URL param changes
  useEffect(() => {
    if (detectedCategory && CATEGORIES_CONFIG[detectedCategory]) {
      setCurrentCategory(detectedCategory);
    }
  }, [detectedCategory]);

  // Session storage key for saving progress
  const storageKey = `phantom_booking_state_${currentCategory}`;

  // Form State
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_FORM_STATE,
          ...parsed,
          category: currentCategory,
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      ...INITIAL_FORM_STATE,
      category: currentCategory,
    };
  });

  // Save to sessionStorage when state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(formData));
    } catch (e) {
      // ignore storage quota issues
    }
  }, [formData, storageKey]);

  // Update document title
  const categoryConfig = CATEGORIES_CONFIG[currentCategory] || CATEGORIES_CONFIG.portraits;
  useEffect(() => {
    document.title = `Book a Session: ${categoryConfig.label} — Phantom Labs`;
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [categoryConfig]);

  // Field change helpers
  const handleBriefChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      brief: {
        ...prev.brief,
        [questionId]: value,
      },
    }));
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleChipToggle = (questionId, chipValue, isMulti = false) => {
    setFormData((prev) => {
      const current = prev.brief[questionId];
      if (isMulti) {
        const arr = Array.isArray(current) ? [...current] : [];
        const index = arr.indexOf(chipValue);
        if (index > -1) {
          arr.splice(index, 1);
        } else {
          arr.push(chipValue);
        }
        return {
          ...prev,
          brief: { ...prev.brief, [questionId]: arr },
        };
      } else {
        return {
          ...prev,
          brief: { ...prev.brief, [questionId]: chipValue },
        };
      }
    });
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleScheduleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // References Link Management
  const handleLinkChange = (index, value) => {
    setFormData((prev) => {
      const nextLinks = [...(prev.references?.links || [""])];
      nextLinks[index] = value;
      return {
        ...prev,
        references: {
          ...prev.references,
          links: nextLinks,
        },
      };
    });
  };

  const addLinkRow = () => {
    setFormData((prev) => ({
      ...prev,
      references: {
        ...prev.references,
        links: [...(prev.references?.links || [""]), ""],
      },
    }));
  };

  const removeLinkRow = (index) => {
    setFormData((prev) => {
      const nextLinks = (prev.references?.links || [""]).filter((_, i) => i !== index);
      return {
        ...prev,
        references: {
          ...prev.references,
          links: nextLinks.length > 0 ? nextLinks : [""],
        },
      };
    });
  };

  // File Upload Handling
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target?.files || e.dataTransfer?.files || []);
    if (!selected.length) return;

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        const newFile = {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: file.type,
          base64Data,
          previewUrl: file.type.startsWith("image/") ? base64Data : null,
        };

        setFormData((prev) => ({
          ...prev,
          references: {
            ...prev.references,
            files: [...(prev.references?.files || []), newFile],
          },
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFormData((prev) => {
      const nextFiles = (prev.references?.files || []).filter((_, i) => i !== index);
      return {
        ...prev,
        references: {
          ...prev.references,
          files: nextFiles,
        },
      };
    });
  };

  // Step Validation
  const validateStep = (stepNumber) => {
    const errs = {};
    if (stepNumber === 1) {
      categoryConfig.questions.forEach((q) => {
        if (q.required) {
          const val = formData.brief[q.id];
          if (!val || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
            errs[q.id] = "This field is required to understand your project scope.";
          }
        }
      });
    } else if (stepNumber === 4) {
      if (!formData.contact.name.trim()) {
        errs.name = "Please provide your name or organization.";
      }
      if (!formData.contact.email.trim()) {
        errs.email = "Please provide a valid email address.";
      } else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
        errs.email = "Please provide a valid email address format.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  const jumpToStep = (stepNumber) => {
    if (stepNumber < currentStep || validateStep(currentStep)) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  // Final Brief Submission
  const handleSubmitBrief = async () => {
    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }
    setIsSubmitting(true);

    try {
      // Build a comprehensive, formatted creative brief summary
      const briefLines = Object.entries(formData.brief)
        .map(([key, val]) => {
          const qObj = categoryConfig.questions.find((q) => q.id === key);
          const label = qObj ? qObj.label : key;
          const valueStr = Array.isArray(val) ? val.join(", ") : String(val);
          return `${label}: ${valueStr}`;
        })
        .join("\n");

      const scheduleLine =
        formData.schedule.dateType === "specific" && formData.schedule.specificDate
          ? `Preferred Date: ${formData.schedule.specificDate}`
          : `Target Window: ${formData.schedule.flexibleTimeframe}`;

      const locationLine = `Location: ${formData.schedule.location || "To be discussed"}`;
      const contactChannel = `Preferred Contact: ${formData.contact.preferredChannel}`;
      const linksCount = (formData.references?.links || []).filter(Boolean).length;
      const filesCount = (formData.references?.files || []).length;
      const refSummary = `References: ${linksCount} links, ${filesCount} files attached`;

      const fullMessage = [
        `=== ${categoryConfig.kicker} ===`,
        `Client: ${formData.contact.name} (${formData.contact.email})`,
        contactChannel,
        scheduleLine,
        locationLine,
        refSummary,
        "\n--- Creative Brief Details ---",
        briefLines,
        formData.references?.notes ? `\nReference Notes:\n${formData.references.notes}` : "",
        formData.contact.additionalNotes ? `\nAdditional Notes:\n${formData.contact.additionalNotes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      // 1. Upload files to private server storage if any
      let uploadedFilesMeta = [];
      const rawFiles = formData.references?.files || [];
      if (rawFiles.length > 0) {
        try {
          const uploadPromises = rawFiles.map(async (file) => {
            if (file.fileId) return file; // already uploaded
            if (file.base64Data) {
              const res = await fetch("/api/uploads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  base64Data: file.base64Data,
                }),
              });
              if (res.ok) {
                const json = await res.json();
                return json.file;
              }
            }
            return {
              name: file.name,
              size: file.size,
              type: file.type,
            };
          });
          uploadedFilesMeta = await Promise.all(uploadPromises);
        } catch (uploadErr) {
          console.warn("[Booking] File upload warning:", uploadErr);
          uploadedFilesMeta = rawFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));
        }
      }

      // 2. Build complete persistent booking brief payload
      const bookingPayload = {
        category: categoryConfig.label,
        kicker: categoryConfig.kicker,
        subCategory:
          formData.brief.purpose ||
          formData.brief.occasion ||
          formData.brief.eventType ||
          formData.brief.campaignObjective ||
          formData.brief.projectObjective ||
          formData.brief.publicationStory ||
          "Creative Commission",
        contact: { ...formData.contact },
        clientName: formData.contact.name,
        email: formData.contact.email,
        phone: formData.contact.phone,
        location: formData.schedule.location || "Studio Consultation",
        preferredDate:
          formData.schedule.dateType === "specific"
            ? formData.schedule.specificDate
            : formData.schedule.flexibleTimeframe,
        schedule: { ...formData.schedule },
        brief: { ...formData.brief },
        references: {
          links: (formData.references?.links || []).filter(Boolean),
          files: uploadedFilesMeta,
          notes: formData.references?.notes || "",
        },
        clientMessage: fullMessage,
        budget: "Bespoke Creative Brief",
        status: "New",
        source: `Website Commission — ${categoryConfig.label}`,
      };

      setSubmitError("");
      // 3. Save to backend persistent API (/api/bookings)
      const apiRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (!apiRes.ok) {
        const errJson = await apiRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Unable to submit your project brief right now. Please try again.");
      }

      // 4. Save inquiry into studio DataContext
      if (typeof addInquiry === "function") {
        addInquiry({
          ...bookingPayload,
          message: fullMessage,
          notes: [
            contactChannel,
            scheduleLine,
            locationLine,
            refSummary,
            formData.references?.links?.filter(Boolean)?.length
              ? `Inspiration Links: ${formData.references.links.filter(Boolean).join(" | ")}`
              : null,
          ].filter(Boolean),
        });
      }

      // Clear session draft on successful submission
      try {
        sessionStorage.removeItem(storageKey);
      } catch (e) {
        // ignore
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 40, behavior: "smooth" });
    } catch (err) {
      console.error("Error submitting commission brief:", err);
      setSubmitError(err.message || "Unable to submit your project brief. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category switch handler (if visitor chooses to switch categories)
  const handleCategorySwitch = (newCat) => {
    if (CATEGORIES_CONFIG[newCat]) {
      setCurrentCategory(newCat);
      setShowCategoryPicker(false);
      navigate(`/book?category=${newCat}`, { replace: true });
    }
  };

  return (
    <motion.div
      className="booking-page"
      initial={isReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={isReduced ? false : { opacity: 0 }}
      transition={{ duration: 0.5, ease: APPLE_EASE }}
    >
      <div className="booking-container">
        
        {/* ================================================================
            CONFIRMATION SCREEN (STEP 6)
            ================================================================ */}
        {isSubmitted ? (
          <motion.div
            className="booking-form-card booking-confirmation-wrap"
            initial={isReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: APPLE_EASE }}
          >
            <div className="booking-confirm-icon" aria-hidden="true">
              ✓
            </div>
            <h1 className="booking-confirm-title">Project Brief Received.</h1>
            <p className="booking-confirm-message">
              Thank you, <strong>{formData.contact.name || "Client"}</strong>. Your commission brief for{" "}
              <strong>{categoryConfig.label}</strong> has been delivered to Maya Rao and the Phantom Labs team.
            </p>

            <div className="booking-confirm-timeline">
              <div className="booking-timeline-card">
                <span className="booking-timeline-step-num">Step 01 / Studio Review</span>
                <h3 className="booking-timeline-title">Artistic Evaluation</h3>
                <p className="booking-timeline-desc">
                  We review your brief, aesthetic direction, and scheduling within 24–48 hours.
                </p>
              </div>

              <div className="booking-timeline-card">
                <span className="booking-timeline-step-num">Step 02 / Consultation</span>
                <h3 className="booking-timeline-title">Tailored Proposal</h3>
                <p className="booking-timeline-desc">
                  We connect via {formData.contact.preferredChannel} with creative notes, date windows, and pricing scope.
                </p>
              </div>

              <div className="booking-timeline-card">
                <span className="booking-timeline-step-num">Step 03 / Alignment</span>
                <h3 className="booking-timeline-title">No Upfront Commitment</h3>
                <p className="booking-timeline-desc">
                  Final shot lists, locations, and fees are agreed upon together before any deposit is made.
                </p>
              </div>
            </div>

            <div className="booking-confirm-actions">
              <Link
                to={`/explore/${currentCategory}`}
                className="booking-btn-next"
              >
                <span>Explore {categoryConfig.label} Journal →</span>
              </Link>
              <Link to="/" className="booking-btn-back">
                <span>Return to Homepage</span>
              </Link>
              <button
                type="button"
                className="booking-btn-back"
                onClick={() => window.print()}
              >
                <span>Print Copy of Brief</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ================================================================
                HEADER & CATEGORY PRESELECTION INDICATOR
                ================================================================ */}
            <header className="booking-header">
              <div className="booking-top-meta">
                <span className="booking-kicker">
                  {categoryConfig.kicker}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="booking-category-badge">
                    {categoryConfig.label}
                  </span>
                  <button
                    type="button"
                    className="booking-switch-category-btn"
                    onClick={() => setShowCategoryPicker((prev) => !prev)}
                    aria-label="Switch photography category"
                  >
                    {showCategoryPicker ? "Close Switcher" : "Switch Category"}
                  </button>
                </div>
              </div>

              <h1 className="booking-headline">{categoryConfig.headline}</h1>
              <p className="booking-deck">{categoryConfig.deck}</p>

              {/* Optional Category Switcher Drawer */}
              <AnimatePresence>
                {showCategoryPicker && (
                  <motion.div
                    className="booking-category-selector-card"
                    initial={isReduced ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={isReduced ? false : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: APPLE_EASE }}
                  >
                    {Object.values(CATEGORIES_CONFIG).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`booking-cat-choice-btn ${cat.id === currentCategory ? "is-active" : ""}`}
                        onClick={() => handleCategorySwitch(cat.id)}
                      >
                        <span className="booking-cat-choice-title">{cat.label}</span>
                        <span className="booking-cat-choice-desc">{cat.headline}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            {/* ================================================================
                5-STEP PROGRESS INDICATOR
                ================================================================ */}
            <nav className="booking-progress-wrapper" aria-label="Commission brief progress">
              <div className="booking-progress-bar-track">
                <div
                  className="booking-progress-bar-fill"
                  style={{ width: `${((currentStep - 1) / (BOOKING_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              <ol className="booking-steps-list">
                {BOOKING_STEPS.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        className={`booking-step-item ${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
                        onClick={() => jumpToStep(step.id)}
                        disabled={step.id > currentStep}
                        aria-current={isActive ? "step" : undefined}
                      >
                        <span className="booking-step-num">
                          {isCompleted ? "✓" : step.id}
                        </span>
                        <span className="booking-step-label">{step.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* ================================================================
                MAIN MULTI-STEP FORM CARD
                ================================================================ */}
            <main className="booking-form-card">
              <AnimatePresence mode="wait">
                
                {/* ------------------------------------------------------------
                    STEP 1: PROJECT BRIEF (CATEGORY-SPECIFIC QUESTIONS)
                    ------------------------------------------------------------ */}
                {currentStep === 1 && (
                  <motion.div
                    key={`step-1-${currentCategory}`}
                    initial={isReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isReduced ? false : { opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: APPLE_EASE }}
                  >
                    <div className="booking-section-title-wrap">
                      <span className="booking-step-eyebrow">Step 01 / Creative Vision</span>
                      <h2 className="booking-step-title">The Project Brief</h2>
                      <p className="booking-step-sub">
                        Tailored questions for your <strong>{categoryConfig.label}</strong> commission. Help us understand the essence and intention of your project.
                      </p>
                    </div>

                    <div className="booking-fields-stack">
                      {categoryConfig.questions.map((q) => {
                        const val = formData.brief[q.id];
                        const err = errors[q.id];

                        return (
                          <div key={q.id} className="booking-field-group">
                            <div className="booking-label-row">
                              <label htmlFor={q.id} className="booking-field-label">
                                {q.label} {q.required && <span style={{ color: "var(--booking-gold)" }}>*</span>}
                              </label>
                              {!q.required && (
                                <span className="booking-optional-tag">Optional</span>
                              )}
                            </div>

                            {q.hint && (
                              <p className="booking-field-hint">{q.hint}</p>
                            )}

                            {/* Render based on field type */}
                            {q.type === "chips-text" && (
                              <div>
                                {q.chips && (
                                  <div className="booking-chips-grid">
                                    {q.chips.map((chip) => {
                                      const isSelected = val === chip || (typeof val === "string" && val.includes(chip));
                                      return (
                                        <button
                                          key={chip}
                                          type="button"
                                          className={`booking-chip-btn ${isSelected ? "is-selected" : ""}`}
                                          onClick={() => handleBriefChange(q.id, chip)}
                                        >
                                          {isSelected && <span className="booking-chip-icon">✓</span>}
                                          {chip}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                <input
                                  id={q.id}
                                  type="text"
                                  className="booking-input"
                                  placeholder={q.placeholder || "Enter details..."}
                                  value={typeof val === "string" ? val : ""}
                                  onChange={(e) => handleBriefChange(q.id, e.target.value)}
                                />
                              </div>
                            )}

                            {q.type === "text" && (
                              <input
                                id={q.id}
                                type="text"
                                className="booking-input"
                                placeholder={q.placeholder || "Enter details..."}
                                value={val || ""}
                                onChange={(e) => handleBriefChange(q.id, e.target.value)}
                              />
                            )}

                            {q.type === "textarea" && (
                              <textarea
                                id={q.id}
                                className="booking-textarea"
                                placeholder={q.placeholder || "Enter details..."}
                                value={val || ""}
                                onChange={(e) => handleBriefChange(q.id, e.target.value)}
                              />
                            )}

                            {q.type === "chips-select" && (
                              <div className="booking-chips-grid">
                                {q.chips.map((chip) => {
                                  const isSelected = val === chip;
                                  return (
                                    <button
                                      key={chip}
                                      type="button"
                                      className={`booking-chip-btn ${isSelected ? "is-selected" : ""}`}
                                      onClick={() => handleBriefChange(q.id, chip)}
                                    >
                                      {isSelected && <span className="booking-chip-icon">✓</span>}
                                      {chip}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {q.type === "multi-chips" && (
                              <div className="booking-chips-grid">
                                {q.chips.map((chip) => {
                                  const isSelected = Array.isArray(val) && val.includes(chip);
                                  return (
                                    <button
                                      key={chip}
                                      type="button"
                                      className={`booking-chip-btn ${isSelected ? "is-selected" : ""}`}
                                      onClick={() => handleChipToggle(q.id, chip, true)}
                                    >
                                      {isSelected && <span className="booking-chip-icon">✓</span>}
                                      {chip}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {err && (
                              <p style={{ color: "var(--booking-error)", fontSize: 12, marginTop: 6 }}>
                                {err}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------
                    STEP 2: SCHEDULE & LOGISTICS
                    ------------------------------------------------------------ */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={isReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isReduced ? false : { opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: APPLE_EASE }}
                  >
                    <div className="booking-section-title-wrap">
                      <span className="booking-step-eyebrow">Step 02 / Schedule & Logistics</span>
                      <h2 className="booking-step-title">Timeline, Setting & Production</h2>
                      <p className="booking-step-sub">
                        Let us know when and where you would like this production to take place.
                      </p>
                    </div>

                    <div className="booking-field-group">
                      <label className="booking-field-label">Date Preference Format</label>
                      <div className="booking-date-type-tabs">
                        <button
                          type="button"
                          className={`booking-tab-btn ${formData.schedule.dateType === "flexible" ? "is-active" : ""}`}
                          onClick={() => handleScheduleChange("dateType", "flexible")}
                        >
                          Flexible Timeframe / Season
                        </button>
                        <button
                          type="button"
                          className={`booking-tab-btn ${formData.schedule.dateType === "specific" ? "is-active" : ""}`}
                          onClick={() => handleScheduleChange("dateType", "specific")}
                        >
                          Specific Target Date
                        </button>
                      </div>

                      {formData.schedule.dateType === "specific" ? (
                        <div>
                          <input
                            type="date"
                            className="booking-input"
                            value={formData.schedule.specificDate}
                            onChange={(e) => handleScheduleChange("specificDate", e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="booking-chips-grid">
                          {[
                            "Next 2–4 Weeks",
                            "Next 1–2 Months",
                            "Next 3–6 Months",
                            "Late Autumn / Winter",
                            "Spring / Summer 2027",
                            "Flexible / Date Open",
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`booking-chip-btn ${formData.schedule.flexibleTimeframe === opt ? "is-selected" : ""}`}
                              onClick={() => handleScheduleChange("flexibleTimeframe", opt)}
                            >
                              {formData.schedule.flexibleTimeframe === opt && <span className="booking-chip-icon">✓</span>}
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="booking-field-group">
                      <div className="booking-label-row">
                        <label htmlFor="location" className="booking-field-label">
                          Target Location / Venue
                        </label>
                        <span className="booking-optional-tag">Optional</span>
                      </div>
                      <p className="booking-field-hint">
                        City, specific venue, studio, or "Undecided / Open to studio recommendations".
                      </p>
                      <input
                        id="location"
                        type="text"
                        className="booking-input"
                        placeholder="e.g., Eastern Docklands Studio, Mumbai / South Coast Beach / Private Residence"
                        value={formData.schedule.location}
                        onChange={(e) => handleScheduleChange("location", e.target.value)}
                      />
                    </div>

                    <div className="booking-field-group">
                      <div className="booking-label-row">
                        <label htmlFor="locationNotes" className="booking-field-label">
                          Production & Logistics Considerations
                        </label>
                        <span className="booking-optional-tag">Optional</span>
                      </div>
                      <p className="booking-field-hint">
                        Will travel outside Mumbai/studio be required? Any special venue permits, lighting constraints, or accessibility requirements?
                      </p>
                      <textarea
                        id="locationNotes"
                        className="booking-textarea"
                        placeholder="Detail any travel requirements, multi-location logistics, or special access..."
                        value={formData.schedule.locationNotes}
                        onChange={(e) => handleScheduleChange("locationNotes", e.target.value)}
                      />
                    </div>

                    <div className="booking-disclaimer-callout">
                      <span style={{ fontSize: 16 }}>ℹ</span>
                      <span>
                        <strong>Scheduling Policy:</strong> Dates are recorded as preferences rather than guaranteed availability. Maya Rao and the studio team coordinate every calendar individually around natural light, seasons, and production demands.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------
                    STEP 3: REFERENCES & INSPIRATION (OPTIONAL)
                    ------------------------------------------------------------ */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={isReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isReduced ? false : { opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: APPLE_EASE }}
                  >
                    <div className="booking-section-title-wrap">
                      <span className="booking-step-eyebrow">Step 03 / Visual Direction</span>
                      <h2 className="booking-step-title">Inspiration & References</h2>
                      <p className="booking-step-sub">
                        Optional step. If you have existing moodboards, Pinterest boards, Are.na channels, or files that capture the atmosphere you envision, share them here.
                      </p>
                    </div>

                    {/* Reference Links */}
                    <div className="booking-field-group">
                      <div className="booking-label-row">
                        <label className="booking-field-label">Inspiration Links & Moodboards</label>
                        <span className="booking-optional-tag">Optional</span>
                      </div>
                      <p className="booking-field-hint">
                        Paste links to Pinterest, Are.na, Figma, Dropbox, Google Drive, or reference websites.
                      </p>
                      
                      <div className="booking-links-list">
                        {(formData.references?.links || [""]).map((link, idx) => (
                          <div key={idx} className="booking-link-row">
                            <input
                              type="url"
                              className="booking-input"
                              placeholder="https://pinterest.com/... or https://are.na/..."
                              value={link}
                              onChange={(e) => handleLinkChange(idx, e.target.value)}
                            />
                            {(formData.references?.links || []).length > 1 && (
                              <button
                                type="button"
                                className="booking-file-remove-btn"
                                onClick={() => removeLinkRow(idx)}
                                title="Remove link"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="booking-add-link-btn"
                        onClick={addLinkRow}
                      >
                        + Add Another Reference Link
                      </button>
                    </div>

                    {/* File Upload Zone */}
                    <div className="booking-field-group">
                      <div className="booking-label-row">
                        <label className="booking-field-label">Upload Files or Moodboard PDFs</label>
                        <span className="booking-optional-tag">Optional</span>
                      </div>
                      
                      <div
                        className={`booking-upload-zone ${isDragging ? "is-dragging" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleFileSelect(e);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          className="booking-file-input"
                          onChange={handleFileSelect}
                        />
                        <span className="booking-upload-icon">✦</span>
                        <div className="booking-upload-title">
                          Click to upload or drag & drop files here
                        </div>
                        <div className="booking-upload-sub">
                          Supports PNG, JPG, WEBP, or PDF moodboards (up to 15MB each)
                        </div>
                      </div>

                      {/* Uploaded File Previews */}
                      {(formData.references?.files || []).length > 0 && (
                        <div className="booking-files-preview-grid">
                          {formData.references.files.map((file, idx) => (
                            <div key={idx} className="booking-file-card">
                              {file.previewUrl ? (
                                <img
                                  src={file.previewUrl}
                                  alt={file.name}
                                  style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }}
                                />
                              ) : (
                                <span style={{ fontSize: 20 }}>📄</span>
                              )}
                              <div className="booking-file-meta">
                                <span className="booking-file-name" title={file.name}>
                                  {file.name}
                                </span>
                                <span className="booking-file-size">{file.size}</span>
                              </div>
                              <button
                                type="button"
                                className="booking-file-remove-btn"
                                onClick={() => removeFile(idx)}
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes on references */}
                    <div className="booking-field-group">
                      <div className="booking-label-row">
                        <label htmlFor="refNotes" className="booking-field-label">
                          Notes on What Resonates
                        </label>
                        <span className="booking-optional-tag">Optional</span>
                      </div>
                      <p className="booking-field-hint">
                        What specifically draws you to these references? (e.g., the soft directional light, candid posture, film grain, framing)
                      </p>
                      <textarea
                        id="refNotes"
                        className="booking-textarea"
                        placeholder="Share any thoughts on what makes these references compelling for your project..."
                        value={formData.references?.notes || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            references: { ...prev.references, notes: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------
                    STEP 4: CONTACT DETAILS
                    ------------------------------------------------------------ */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={isReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isReduced ? false : { opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: APPLE_EASE }}
                  >
                    <div className="booking-section-title-wrap">
                      <span className="booking-step-eyebrow">Step 04 / Communication</span>
                      <h2 className="booking-step-title">How Should We Reach You?</h2>
                      <p className="booking-step-sub">
                        We respect your time. Share your preferred contact method and consultation availability.
                      </p>
                    </div>

                    <div className="booking-contact-grid">
                      <div className="booking-field-group">
                        <label htmlFor="contactName" className="booking-field-label">
                          Full Name / Lead Contact <span style={{ color: "var(--booking-gold)" }}>*</span>
                        </label>
                        <input
                          id="contactName"
                          type="text"
                          className="booking-input"
                          placeholder="Your name"
                          value={formData.contact.name}
                          onChange={(e) => handleContactChange("name", e.target.value)}
                        />
                        {errors.name && (
                          <p style={{ color: "var(--booking-error)", fontSize: 12, marginTop: 4 }}>
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="booking-field-group">
                        <div className="booking-label-row">
                          <label htmlFor="contactOrg" className="booking-field-label">
                            Brand / Organization / Agency
                          </label>
                          <span className="booking-optional-tag">Optional</span>
                        </div>
                        <input
                          id="contactOrg"
                          type="text"
                          className="booking-input"
                          placeholder="Company, publication, or studio name"
                          value={formData.contact.organization}
                          onChange={(e) => handleContactChange("organization", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="booking-contact-grid">
                      <div className="booking-field-group">
                        <label htmlFor="contactEmail" className="booking-field-label">
                          Email Address <span style={{ color: "var(--booking-gold)" }}>*</span>
                        </label>
                        <input
                          id="contactEmail"
                          type="email"
                          className="booking-input"
                          placeholder="your.email@domain.com"
                          value={formData.contact.email}
                          onChange={(e) => handleContactChange("email", e.target.value)}
                        />
                        {errors.email && (
                          <p style={{ color: "var(--booking-error)", fontSize: 12, marginTop: 4 }}>
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="booking-field-group">
                        <div className="booking-label-row">
                          <label htmlFor="contactPhone" className="booking-field-label">
                            Phone / WhatsApp
                          </label>
                          <span className="booking-optional-tag">Optional</span>
                        </div>
                        <input
                          id="contactPhone"
                          type="tel"
                          className="booking-input"
                          placeholder="+91 98765 43210"
                          value={formData.contact.phone}
                          onChange={(e) => handleContactChange("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="booking-field-group">
                      <label className="booking-field-label">Preferred Communication Channel</label>
                      <div className="booking-channel-options">
                        {["Email", "WhatsApp", "Phone Call"].map((channel) => (
                          <button
                            key={channel}
                            type="button"
                            className={`booking-channel-btn ${formData.contact.preferredChannel === channel ? "is-active" : ""}`}
                            onClick={() => handleContactChange("preferredChannel", channel)}
                          >
                            {channel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="booking-field-group">
                      <div className="booking-label-row">
                        <label htmlFor="addNotes" className="booking-field-label">
                          Additional Questions or Creative Notes
                        </label>
                        <span className="booking-optional-tag">Optional</span>
                      </div>
                      <textarea
                        id="addNotes"
                        className="booking-textarea"
                        placeholder="Anything else you'd like our studio team to know before we connect..."
                        value={formData.contact.additionalNotes}
                        onChange={(e) => handleContactChange("additionalNotes", e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ------------------------------------------------------------
                    STEP 5: REVIEW & SUBMIT
                    ------------------------------------------------------------ */}
                {currentStep === 5 && (
                  <motion.div
                    key="step-5"
                    initial={isReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isReduced ? false : { opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: APPLE_EASE }}
                  >
                    <div className="booking-section-title-wrap">
                      <span className="booking-step-eyebrow">Step 05 / Final Review</span>
                      <h2 className="booking-step-title">Review Project Brief</h2>
                      <p className="booking-step-sub">
                        Confirm your creative brief before sending. You can edit any section by clicking the Edit link.
                      </p>
                    </div>

                    <div className="booking-review-summary">
                      {/* Section 1: Creative Brief Summary */}
                      <div className="booking-review-card">
                        <div className="booking-review-card-header">
                          <span className="booking-review-card-title">
                            01 / {categoryConfig.label} Creative Brief
                          </span>
                          <button
                            type="button"
                            className="booking-review-edit-btn"
                            onClick={() => jumpToStep(1)}
                          >
                            Edit
                          </button>
                        </div>

                        {categoryConfig.questions.map((q) => {
                          const val = formData.brief[q.id];
                          if (!val || (Array.isArray(val) && val.length === 0)) return null;

                          return (
                            <div key={q.id} className="booking-review-row">
                              <span className="booking-review-label">{q.label}</span>
                              {Array.isArray(val) ? (
                                <div className="booking-review-chips">
                                  {val.map((chip) => (
                                    <span key={chip} className="booking-review-chip">
                                      {chip}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="booking-review-value">{val}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Section 2: Schedule & Logistics Summary */}
                      <div className="booking-review-card">
                        <div className="booking-review-card-header">
                          <span className="booking-review-card-title">02 / Schedule & Setting</span>
                          <button
                            type="button"
                            className="booking-review-edit-btn"
                            onClick={() => jumpToStep(2)}
                          >
                            Edit
                          </button>
                        </div>

                        <div className="booking-review-row">
                          <span className="booking-review-label">Timing Preference</span>
                          <span className="booking-review-value">
                            {formData.schedule.dateType === "specific" && formData.schedule.specificDate
                              ? `Specific Date: ${formData.schedule.specificDate} (Subject to consultation)`
                              : formData.schedule.flexibleTimeframe}
                          </span>
                        </div>

                        {formData.schedule.location && (
                          <div className="booking-review-row">
                            <span className="booking-review-label">Location</span>
                            <span className="booking-review-value">{formData.schedule.location}</span>
                          </div>
                        )}

                        {formData.schedule.locationNotes && (
                          <div className="booking-review-row">
                            <span className="booking-review-label">Production Logistics</span>
                            <span className="booking-review-value">{formData.schedule.locationNotes}</span>
                          </div>
                        )}
                      </div>

                      {/* Section 3: References Summary */}
                      <div className="booking-review-card">
                        <div className="booking-review-card-header">
                          <span className="booking-review-card-title">03 / References & Inspiration</span>
                          <button
                            type="button"
                            className="booking-review-edit-btn"
                            onClick={() => jumpToStep(3)}
                          >
                            Edit
                          </button>
                        </div>

                        <div className="booking-review-row">
                          <span className="booking-review-label">Inspiration Links</span>
                          <span className="booking-review-value">
                            {(formData.references?.links || []).filter(Boolean).length > 0 ? (
                              (formData.references.links || []).filter(Boolean).map((lnk, i) => (
                                <div key={i} style={{ wordBreak: "break-all" }}>
                                  <a
                                    href={lnk}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "var(--booking-gold)", textDecoration: "underline" }}
                                  >
                                    {lnk}
                                  </a>
                                </div>
                              ))
                            ) : (
                              <span style={{ color: "var(--booking-text-muted)" }}>None provided</span>
                            )}
                          </span>
                        </div>

                        <div className="booking-review-row">
                          <span className="booking-review-label">Attached Files</span>
                          <span className="booking-review-value">
                            {(formData.references?.files || []).length > 0
                              ? `${formData.references.files.length} file(s) attached`
                              : "None attached"}
                          </span>
                        </div>

                        {formData.references?.notes && (
                          <div className="booking-review-row">
                            <span className="booking-review-label">Resonance Notes</span>
                            <span className="booking-review-value">{formData.references.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Section 4: Contact Summary */}
                      <div className="booking-review-card">
                        <div className="booking-review-card-header">
                          <span className="booking-review-card-title">04 / Contact Details</span>
                          <button
                            type="button"
                            className="booking-review-edit-btn"
                            onClick={() => jumpToStep(4)}
                          >
                            Edit
                          </button>
                        </div>

                        <div className="booking-review-row">
                          <span className="booking-review-label">Contact Person</span>
                          <span className="booking-review-value">
                            {formData.contact.name}
                            {formData.contact.organization ? ` (${formData.contact.organization})` : ""}
                          </span>
                        </div>

                        <div className="booking-review-row">
                          <span className="booking-review-label">Email & Phone</span>
                          <span className="booking-review-value">
                            {formData.contact.email}
                            {formData.contact.phone ? ` · ${formData.contact.phone}` : ""}
                          </span>
                        </div>

                        <div className="booking-review-row">
                          <span className="booking-review-label">Preferred Contact Method</span>
                          <span className="booking-review-value">{formData.contact.preferredChannel}</span>
                        </div>
                      </div>

                      {/* Studio Policy Reassurance Notice */}
                      <div className="booking-review-notice">
                        <strong>Studio Policy:</strong> Submitting this creative brief initiates a conversation. Pricing and calendar availability remain unconfirmed until we personally review your scope. We will follow up within 24–48 hours with availability, creative direction notes, and a tailored proposal.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {submitError && (
                <div
                  role="alert"
                  style={{
                    marginTop: "20px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#FCA5A5",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* ================================================================
                  BOTTOM FORM NAVIGATION BUTTONS
                  ================================================================ */}
              <div className="booking-form-actions">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="booking-btn-back"
                    onClick={handleBack}
                  >
                    <span>← Previous Step</span>
                  </button>
                ) : (
                  <Link to="/" className="booking-btn-back">
                    <span>← Return to Home</span>
                  </Link>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    className="booking-btn-next"
                    onClick={handleNext}
                  >
                    <span>Continue to Step 0{currentStep + 1} →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="booking-btn-next"
                    onClick={handleSubmitBrief}
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? "Delivering Brief..." : "Send Project Brief →"}</span>
                  </button>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </motion.div>
  );
}
