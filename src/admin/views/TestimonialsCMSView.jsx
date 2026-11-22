import React, { useState, useEffect } from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import { Save, Plus, Trash2, MessageSquare } from "lucide-react";

export default function TestimonialsCMSView() {
  const { cmsData, updateCMSTestimonials, saveCMSChanges, isLoading } = useStudioAdmin();
  const [reviews, setReviews] = useState(cmsData.testimonials || []);

  useEffect(() => {
    if (Array.isArray(cmsData.testimonials)) {
      setReviews(cmsData.testimonials);
    }
  }, [cmsData.testimonials]);

  const handleUpdate = (idx, field, val) => {
    const updated = [...reviews];
    updated[idx] = { ...updated[idx], [field]: val };
    setReviews(updated);
    updateCMSTestimonials(updated);
  };

  const handleAddReview = () => {
    const newRev = {
      id: `tst-${Date.now()}`,
      quote: "Working with Phantom Labs was a revelatory creative experience. The frames speak for themselves.",
      author: "Client Patron",
      client: "Private Client",
      shootType: "Editorial Portrait",
    };
    const updated = [...reviews, newRev];
    setReviews(updated);
    updateCMSTestimonials(updated);
  };

  const handleDelete = (id) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    updateCMSTestimonials(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>WEBSITE CMS EDITOR</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Patron Reviews & Testimonials CMS
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Curate quotes and patron testimonials featured on the public studio website.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="studio-btn-secondary"
            onClick={handleAddReview}
          >
            <Plus size={14} />
            + Add Review
          </button>
          <button
            type="button"
            className="studio-btn-primary"
            onClick={saveCMSChanges}
          >
            <Save size={14} />
            Save & Publish Live
          </button>
        </div>
      </div>

      <div className="studio-card">
        {isLoading ? (
          <AdminLoadingSkeleton rows={3} type="cards" />
        ) : reviews.length === 0 ? (
          <AdminEmptyState
            icon={MessageSquare}
            title="No client testimonials added"
            description="Add testimonials from patrons, creative directors, and couples to display on the live site."
            actionLabel="+ Add Review"
            onAction={handleAddReview}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reviews.map((rev, idx) => (
              <div
                key={rev.id}
                style={{
                  padding: "18px 20px",
                  background: "#FAF9F6",
                  border: "1px solid var(--studio-border-crisp)",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div className="studio-form-group" style={{ margin: 0 }}>
                  <label className="studio-form-label">Review Quote</label>
                  <textarea
                    className="studio-textarea studio-serif"
                    rows={2}
                    style={{ fontSize: "15px", fontStyle: "italic" }}
                    value={rev.quote}
                    onChange={(e) => handleUpdate(idx, "quote", e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
                  <div>
                    <label className="studio-form-label">Author Name</label>
                    <input
                      type="text"
                      className="studio-input studio-btn-sm"
                      value={rev.author}
                      onChange={(e) => handleUpdate(idx, "author", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="studio-form-label">Organization / Role</label>
                    <input
                      type="text"
                      className="studio-input studio-btn-sm"
                      value={rev.client}
                      onChange={(e) => handleUpdate(idx, "client", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="studio-form-label">Shoot Genre</label>
                    <input
                      type="text"
                      className="studio-input studio-btn-sm"
                      value={rev.shootType}
                      onChange={(e) => handleUpdate(idx, "shootType", e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="studio-btn-secondary studio-btn-sm"
                    style={{ height: "34px", padding: "0 10px" }}
                    onClick={() => handleDelete(rev.id)}
                    title="Delete Review"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
