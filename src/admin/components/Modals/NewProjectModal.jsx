import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext.jsx";
import { IconClose } from "../AdminIcons.jsx";

export default function NewProjectModal({ isOpen, onClose }) {
  const { addProject, clients } = useAdmin();
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    category: "Campaign",
    stage: "Inquiry",
    budget: "",
    deadline: "",
    coverImage: "/images/dashboard/shoot-1.png",
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.client.trim()) return;

    addProject({
      ...formData,
      status: "In Progress",
      progress: 10,
      deliverables: [
        { title: "Moodboard & Treatment", done: true },
        { title: "Production Shoot", done: false },
        { title: "Raw Selection Gallery", done: false },
        { title: "Final Retouched Master Files", done: false },
      ],
    });

    onClose();
    setFormData({
      title: "",
      client: "",
      category: "Campaign",
      stage: "Inquiry",
      budget: "",
      deadline: "",
      coverImage: "/images/dashboard/shoot-1.png",
      notes: "",
    });
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Create New Studio Project</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <IconClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Project Title</label>
              <input
                type="text"
                required
                className="admin-form-input"
                placeholder="e.g. Autumn Monograph Campaign"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Client Name</label>
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder="e.g. Veyra Studio"
                  list="client-suggestions"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
                <datalist id="client-suggestions">
                  {clients.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Category</label>
                <select
                  className="admin-form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Editorial">Editorial</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Lookbook">Lookbook</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Monograph">Monograph</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Budget (₹)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. ₹2,50,000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Target Completion</label>
                <input
                  type="date"
                  className="admin-form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Initial Stage</label>
              <select
                className="admin-form-select"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              >
                <option value="Inquiry">Inquiry & Briefing</option>
                <option value="Consultation">Consultation</option>
                <option value="Planning">Pre-Production Planning</option>
                <option value="Scheduled">Scheduled Shoot</option>
                <option value="Shooting">Active Production</option>
                <option value="Editing">Post-Production / Grading</option>
                <option value="Review">Client Review</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Creative Brief / Notes</label>
              <textarea
                className="admin-form-textarea"
                rows={3}
                placeholder="Key references, lighting cues, shot requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-action-btn"
              onClick={onClose}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn-black">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

