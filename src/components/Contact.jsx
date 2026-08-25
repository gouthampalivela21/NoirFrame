import React, { useState } from "react";
import GlassPanel from "./GlassPanel.jsx";

const PROJECT_TYPES = ["Wedding", "Portrait", "Editorial", "Fashion", "Event", "Other"];

const initialState = { name: "", email: "", projectType: "", message: "" };

export default function Contact({ isStandalone = false }) {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setForm(initialState);
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
              <span className="body-md">commissions@noirframe.com</span>
            </div>
            <div className="contact__direct-item">
              <span className="label-sm">Locations</span>
              <span className="body-md">Milan &bull; Paris &bull; Tokyo</span>
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

          <button type="submit" className="btn btn-primary" data-cursor="button">
            Send Message
          </button>

          {submitted && (
            <p className="label-sm contact__success">
              Thank you &mdash; your message has been sent.
            </p>
          )}
        </GlassPanel>
      </div>
    </section>
  );
}
