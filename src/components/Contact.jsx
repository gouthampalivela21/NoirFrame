import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils/helpers.js";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ["Portraits", "Couples", "Events", "Brands", "Editorial", "Other"];

const initialState = {
  name: "",
  email: "",
  phone: "",
  lookingFor: "",
  preferredDate: "",
  message: "",
};

export default function Contact() {
  const sectionRef = useRef(null);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(
        sectionRef.current.querySelectorAll(
          ".contact-section__eyebrow, .contact-section__headline, .contact-section__sub, .contact-section__divider, .contact-section__direct, .contact-section__footnote, .editorial-field, .contact-editorial-form__submit"
        ),
        { autoAlpha: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      // 1. COMMISSIONS OPEN fades in
      tl.fromTo(
        ".contact-section__eyebrow",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.55 }
      );

      // 2. Headline rises upward subtly
      tl.fromTo(
        ".contact-section__headline",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.75 },
        "-=0.25"
      );

      // 3. Supporting copy, divider & direct inquiries fade in
      tl.fromTo(
        [
          ".contact-section__sub",
          ".contact-section__divider",
          ".contact-section__direct",
          ".contact-section__footnote",
        ],
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
        "-=0.35"
      );

      // 4. Form fields reveal sequentially
      tl.fromTo(
        ".editorial-field",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 },
        "-=0.45"
      );

      // 5. CTA appears last
      tl.fromTo(
        ".contact-editorial-form__submit",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        "-=0.1"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setLoading(true);

    try {
      const res = await fetch("https://formsubmit.co/ajax/teamnoirframe@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || "Not provided",
          lookingFor: form.lookingFor || "General Inquiry",
          preferredDate: form.preferredDate || "Flexible",
          message: form.message,
          _subject: `New Noir Frame Inquiry from ${form.name}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setForm(initialState);
      } else {
        throw new Error("Submission endpoint response not ok");
      }
    } catch (err) {
      console.warn("Direct form submission fallback:", err);
      const subject = encodeURIComponent(
        `Inquiry: ${form.lookingFor || "First Story"} — ${form.name}`
      );
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "N/A"}\nLooking For: ${form.lookingFor || "N/A"}\nPreferred Date: ${form.preferredDate || "Flexible"}\n\nMessage:\n${form.message}`
      );
      window.location.href = `mailto:teamnoirframe@gmail.com?subject=${subject}&body=${body}`;
      setSubmitted(true);
      setForm(initialState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section contact-section" id="contact" ref={sectionRef}>
      <div className="container-max">
        <div className="contact-section__grid">
          {/* Left Side — Editorial Introduction */}
          <div className="contact-editorial__intro">
            <span className="eyebrow contact-section__eyebrow">COMMISSIONS OPEN</span>

            <h2 className="contact-section__headline">
              &ldquo;Let’s make something<br />worth remembering.&rdquo;
            </h2>

            <p className="contact-section__sub">
              Every project begins with a conversation. Tell us what you’re imagining,
              and we’ll take it from there.
            </p>

            <div className="contact-section__divider" />

            <div className="contact-section__direct">
              <div className="contact-section__direct-block">
                <span className="label-xs">LOCATION &amp; TRAVEL</span>
                <p className="contact-section__loc">
                  Available for local &amp; destination commissions
                </p>
              </div>
            </div>

            <p className="contact-section__footnote">
              &ldquo;Based in Bengaluru &middot; Available worldwide&rdquo;
            </p>
          </div>

          {/* Right Side — Editorial Form */}
          <form className="contact-editorial-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact-editorial-form__success">
                <h3 className="heading-md" style={{ color: "var(--color-dark)", marginBottom: "8px" }}>
                  THANK YOU.
                </h3>
                <p
                  className="font-serif-italic"
                  style={{ fontSize: "16px", color: "var(--color-fg)", marginBottom: "16px" }}
                >
                  &ldquo;Your story has entered the frame.&rdquo;
                </p>
                <p className="body-md" style={{ color: "var(--color-fg-muted)", marginBottom: "24px" }}>
                  We have received your message and will respond within 24–48 hours.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-cursor="button"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="editorial-field">
                  <label htmlFor="contact-name" className="editorial-field__label">
                    01 — NAME
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Your full name"
                    value={form.name}
                    onChange={update("name")}
                    className="editorial-input"
                  />
                </div>

                <div className="editorial-field">
                  <label htmlFor="contact-email" className="editorial-field__label">
                    02 — EMAIL
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={update("email")}
                    className="editorial-input"
                  />
                </div>

                <div className="editorial-field">
                  <label htmlFor="contact-phone" className="editorial-field__label">
                    03 — PHONE
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={update("phone")}
                    className="editorial-input"
                  />
                </div>

                <div className="editorial-field">
                  <label htmlFor="contact-looking-for" className="editorial-field__label">
                    04 — PROJECT TYPE
                  </label>
                  <select
                    id="contact-looking-for"
                    value={form.lookingFor}
                    onChange={update("lookingFor")}
                    className="editorial-input editorial-select"
                  >
                    <option value="" disabled>Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="editorial-field">
                  <label htmlFor="contact-date" className="editorial-field__label">
                    05 — PREFERRED DATE / TIMELINE
                  </label>
                  <input
                    id="contact-date"
                    type="text"
                    placeholder="e.g. October 2026 or Flexible"
                    value={form.preferredDate}
                    onChange={update("preferredDate")}
                    className="editorial-input"
                  />
                </div>

                <div className="editorial-field">
                  <label htmlFor="contact-message" className="editorial-field__label">
                    06 — TELL US ABOUT THE STORY
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={3}
                    placeholder="Tell us about your project, idea or moment..."
                    value={form.message}
                    onChange={update("message")}
                    className="editorial-input editorial-textarea"
                  />
                </div>

                <button
                  type="submit"
                  className="contact-editorial-form__submit"
                  data-cursor="button"
                  disabled={loading}
                >
                  <span>{loading ? "Sending..." : "Start a Conversation"}</span>
                  <span className="editorial-btn__arrow" aria-hidden="true">&rarr;</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
