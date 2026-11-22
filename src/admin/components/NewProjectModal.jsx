import React, { useState } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import { X, Plus, Camera } from "lucide-react";

export default function NewProjectModal() {
  const { newProjectModalOpen, setNewProjectModalOpen, createProject } = useStudioAdmin();

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    category: "Portraits",
    quote: "",
    advance: "",
    shootDate: "",
    location: "",
    deliverables: "",
    notes: "",
  });

  if (!newProjectModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim()) return;

    createProject({
      ...formData,
      quote: Number(formData.quote) || 0,
      advance: Number(formData.advance) || 0,
    });
  };

  return (
    <div className="studio-modal-overlay" onClick={() => setNewProjectModalOpen(false)}>
      <div className="studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="studio-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Camera size={18} style={{ color: "#111111" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111111", margin: 0 }}>
              Commission New Studio Shoot
            </h3>
          </div>
          <button
            type="button"
            className="studio-btn-secondary studio-btn-sm"
            style={{ width: "28px", height: "28px", padding: 0, justifyContent: "center" }}
            onClick={() => setNewProjectModalOpen(false)}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="studio-modal-body">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Project / Shoot Title *</label>
                <input
                  type="text"
                  required
                  className="studio-input"
                  placeholder="e.g. Winter Monograph Editorial"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Client / Patron *</label>
                <input
                  type="text"
                  required
                  className="studio-input"
                  placeholder="e.g. Meridian Atelier"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Photography Category</label>
                <select
                  className="studio-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Portraits">Portraits (Studio & Daylight)</option>
                  <option value="Couples">Couples & Intimate Monographs</option>
                  <option value="Editorial">Editorial & Fashion</option>
                  <option value="Brands">Brands & Luxury Still-Life</option>
                  <option value="Commercial">Commercial & Architecture</option>
                  <option value="Events">Events & Galas</option>
                </select>
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Scheduled Shoot Date</label>
                <input
                  type="date"
                  className="studio-input studio-mono"
                  value={formData.shootDate}
                  onChange={(e) => setFormData({ ...formData, shootDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Agreed Quote (₹ INR) *</label>
                <input
                  type="number"
                  required
                  className="studio-input studio-mono"
                  placeholder="e.g. 75000"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Advance Retainer Collected (₹ INR)</label>
                <input
                  type="number"
                  className="studio-input studio-mono"
                  placeholder="e.g. 35000"
                  value={formData.advance}
                  onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
                />
              </div>
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Shoot Location / Set</label>
              <input
                type="text"
                className="studio-input"
                placeholder="Studio / Location address"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Deliverables Scope</label>
              <input
                type="text"
                className="studio-input"
                placeholder="e.g. 20 Hand-Retouched Master Plates + 4K Cinema Teaser"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Creative Brief & Internal Production Notes</label>
              <textarea
                className="studio-textarea"
                rows={3}
                placeholder="Notes on moodboard, color palette, lighting setups..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="studio-modal-footer">
            <button
              type="button"
              className="studio-btn-secondary"
              onClick={() => setNewProjectModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="studio-btn-primary">
              <Plus size={14} />
              Commission Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
