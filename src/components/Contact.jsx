import React, { useState } from "react";
import GlassPanel from "./GlassPanel.jsx";

const PROJECT_TYPES = ["Wedding", "Portrait", "Editorial", "Fashion", "Event", "Other"];

const initialState = { name: "", email: "", projectType: "", message: "" };

export default function Contact({ isStandalone = false }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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
          projectType: form.projectType || "General Inquiry",
          message: form.message,
          _subject: `New Inquiry from ${form.name} — Noir Frame`,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setForm(initialState);
      } else {
        throw new Error("Network response error");
      }
    } catch (err) {
      console.warn("Direct form endpoint error, opening email client fallback:", err);
      // Fallback: trigger client email application directly with prefilled body
      const subject = encodeURIComponent(`Noir Frame Inquiry from ${form.name}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nProject Type: ${form.projectType || "Not specified"}\n\nMessage:\n${form.message}`
      );
      window.location.href = `mailto:teamnoirframe@gmail.com?subject=${subject}&body=${body}`;
      setSubmitted(true);
      setForm(initialState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`section contact ${isStandalone ? "contact--standalone" : ""}`} id="contact">
      <div className="container-max contact-grid">
        <div className="contact__intro">
          <span className="eyebrow">Get In Touch</span>
          <h2 className="heading-lg">Let&rsquo;s create something timeless.</h2>
          <p className="body-md">
            Tell us a little about your project and we&rsquo;ll respond within two business days.
          </p>
          <div className="contact__direct-info">
            <div className="contact__direct-item">
              <span className="label-sm">Inquiries</span>
              <a
                href="mailto:teamnoirframe@gmail.com"
                className="body-md"
                style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                teamnoirframe@gmail.com
              </a>
            </div>
            <div className="contact__direct-item">
              <span className="label-sm">Location</span>
              <span className="body-md">India &bull; Worldwide Commissions</span>
            </div>
          </div>
        </div>

        <GlassPanel as="form" className="contact__form" onSubmit={handleSubmit}>
          <label className="contact__field">
            <span className="label-sm">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="Your full name"
              required
            />
          </label>

          <label className="contact__field">
            <span className="label-sm">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@email.com"
              required
            />
          </label>

          <label className="contact__field">
            <span className="label-sm">Project Type</span>
            <select value={form.projectType} onChange={update("projectType")}>
              <option value="">Select one</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="contact__field">
            <span className="label-sm">Message</span>
            <textarea
              rows={3}
              value={form.message}
              onChange={update("message")}
              placeholder="Tell us about your story"
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            data-cursor="button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {submitted && (
            <p className="label-sm contact__success">
              Thank you &mdash; your message has been sent directly to teamnoirframe@gmail.com.
            </p>
          )}
        </GlassPanel>
      </div>
    </section>
  );
}
