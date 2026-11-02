import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconPlus, IconClose } from "../components/AdminIcons.jsx";

export default function AdminTestimonialsPage() {
  const { testimonials, updateTestimonial, addTestimonial, deleteTestimonial } = useAdmin();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    author: "",
    role: "Client",
    company: "",
    quote: "",
    rating: 5,
    published: true,
  });

  const handleToggle = (id, current) => {
    updateTestimonial(id, { published: !current });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.author.trim() || !form.quote.trim()) return;

    addTestimonial(form);
    setIsAddOpen(false);
    setForm({
      author: "",
      role: "Client",
      company: "",
      quote: "",
      rating: 5,
      published: true,
    });
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client Reviews &amp; Testimonials</h1>
          <p className="admin-page-desc">
            Endorsements and testimonials from brands, designers, and monograph clients.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={() => setIsAddOpen(true)}
        >
          <IconPlus size={13} />
          <span>Add Review</span>
        </button>
      </div>

      {/* Testimonials List or Clean Empty State */}
      {(testimonials || []).length === 0 ? (
        <div
          style={{
            padding: "54px 24px",
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px dashed var(--admin-border)",
            margin: "12px 0",
          }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--admin-text-primary)",
            }}
          >
            No client reviews recorded yet
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "13px",
              color: "var(--admin-text-secondary)",
              maxWidth: "460px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Add authentic client testimonials, client reviews, and published endorsements to showcase on your public website.
          </p>
          <button
            type="button"
            className="admin-btn-black"
            onClick={() => setIsAddOpen(true)}
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            <IconPlus size={13} />
            <span>+ Add First Review</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="admin-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span className="admin-status-pill admin-status-pill--new">
                    {t.published ? "Published" : "Hidden"}
                  </span>
                  <span style={{ fontSize: "13px", color: "#151515", letterSpacing: "2px" }}>
                    {"★".repeat(t.rating || 5)}
                  </span>
                </div>

                <blockquote
                  style={{
                    fontFamily: "var(--admin-font-serif)",
                    fontSize: "17px",
                    lineHeight: "1.45",
                    color: "var(--admin-text-primary)",
                    margin: "0 0 16px 0",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div style={{ fontSize: "13px", fontWeight: 600 }}>{t.author || t.clientName || "Studio Client"}</div>
                <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>
                  {t.company ? `${t.company} · ` : ""}{t.role || t.shootType || "Client"}
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--admin-border-subtle)",
                  paddingTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => handleToggle(t.id, t.published)}
                >
                  {t.published ? "Hide from Site" : "Publish to Site"}
                </button>

                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "#DC3545", fontSize: "12px", cursor: "pointer" }}
                  onClick={() => deleteTestimonial(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add Client Review</h2>
              <button className="admin-modal-close" onClick={() => setIsAddOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="admin-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Client Name</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Company / Brand</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Testimonial Quote</label>
                  <textarea
                    required
                    rows={4}
                    className="admin-form-textarea"
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

