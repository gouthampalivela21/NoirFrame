import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconClose } from "../components/AdminIcons.jsx";

export default function AdminServicesPage() {
  const { services = [], updateService } = useAdmin();
  const [editingService, setEditingService] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingService) return;
    updateService(editingService.id, {
      ...editingService,
      title: editingService.title,
      tagline: editingService.tagline,
      description: editingService.description,
      subtitle: editingService.description,
      price: editingService.price || editingService.startingPrice,
      startingPrice: editingService.startingPrice || editingService.price,
      turnaround: editingService.turnaround,
      active: editingService.active,
      published: editingService.active,
    });
    setEditingService(null);
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Service Packages</h1>
          <p className="admin-page-desc">
            Manage packages, starting investment tiers, deliverables, and production lead times.
          </p>
        </div>
      </div>

      {/* Services List or Clean Empty State */}
      {(services || []).length === 0 ? (
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
            No studio services found
          </h3>
          <p
            style={{
              margin: "0",
              fontSize: "13px",
              color: "var(--admin-text-secondary)",
              maxWidth: "460px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Studio packages defined in the database will appear here for customization and public visibility toggling.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {services.map((srv) => (
            <div
              key={srv.id}
              className="admin-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
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
                  <span
                    className={`admin-status-pill ${
                      srv.active !== false && srv.published !== false
                        ? "admin-status-pill--confirmed"
                        : "admin-status-pill--new"
                    }`}
                  >
                    {srv.active !== false && srv.published !== false ? "Active Offering" : "Paused"}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    Lead Time: {srv.turnaround || srv.duration || "Custom"}
                  </span>
                </div>

                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                  {srv.number ? `SERVICE ${srv.number}` : "COMMISSION"}
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 6px", color: "var(--admin-text-primary)" }}>
                  {srv.title}
                </h3>

                {srv.tagline && (
                  <p style={{ fontSize: "12.5px", fontStyle: "italic", color: "var(--admin-text-primary)", margin: "0 0 8px 0" }}>
                    &ldquo;{srv.tagline}&rdquo;
                  </p>
                )}

                <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0, lineHeight: "1.5" }}>
                  {srv.description || srv.subtitle || ""}
                </p>
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--admin-border-subtle)",
                  paddingTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", display: "block" }}>
                    Starting at
                  </span>
                  <span style={{ fontSize: "17px", fontWeight: 600, color: "var(--admin-text-primary)" }}>
                    {srv.startingPrice || srv.price || "Inquire"}
                  </span>
                </div>

                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() =>
                    setEditingService({
                      ...srv,
                      startingPrice: srv.startingPrice || srv.price || "",
                      tagline: srv.tagline || "",
                      description: srv.description || srv.subtitle || "",
                      turnaround: srv.turnaround || srv.duration || "2-3 Weeks",
                      active: srv.active !== false && srv.published !== false,
                    })
                  }
                >
                  Edit Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="admin-modal-backdrop" onClick={() => setEditingService(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit Package Details</h2>
              <button className="admin-modal-close" onClick={() => setEditingService(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Service Title</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={editingService.title}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tagline (Editorial Quote)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingService.tagline || ""}
                    onChange={(e) => setEditingService({ ...editingService, tagline: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description &amp; Scope</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={editingService.description || ""}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Starting Price</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingService.startingPrice || ""}
                      onChange={(e) => setEditingService({ ...editingService, startingPrice: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Turnaround Time</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingService.turnaround || ""}
                      onChange={(e) => setEditingService({ ...editingService, turnaround: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Public Status</label>
                  <select
                    className="admin-form-select"
                    value={editingService.active ? "active" : "paused"}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        active: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Active (Visible on public booking &amp; website)</option>
                    <option value="paused">Paused / Hidden</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setEditingService(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
