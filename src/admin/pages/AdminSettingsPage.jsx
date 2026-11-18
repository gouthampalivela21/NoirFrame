import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminSettingsPage() {
  const {
    settings,
    updateSettings,
    store,
    permissions,
    teamSummary,
  } = useAdmin();

  const [studioForm, setStudioForm] = useState({
    studioName: settings.studioName || "Phantom Labs",
    studioTagline: settings.studioTagline || "Visual stories, framed differently.",
    studioEmail: settings.studioEmail || "teamphantomlabs@gmail.com",
    studioPhone: settings.studioPhone || "+91 98860 12345",
    studioAddress: settings.studioAddress || "Bengaluru · Worldwide",
    gstNumber: settings.gstNumber || "",
  });

  const [saveNotice, setSaveNotice] = useState("");

  const handleSaveStudio = (e) => {
    e.preventDefault();
    updateSettings(studioForm);
    setSaveNotice("Studio profile updated successfully.");
    setTimeout(() => setSaveNotice(""), 3500);
  };

  const handleExportBackup = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `phantom_labs_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!permissions.isFounder) {
    return (
      <div className="admin-content" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div className="admin-card" style={{ maxWidth: "540px", margin: "0 auto", padding: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 10px" }}>Access Restricted</h2>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0 }}>
            Studio settings and access control are reserved exclusively for the studio Founder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Settings</h1>
          <p className="admin-page-desc">
            Studio profile, branding details, role-based team access control, and database backups.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div
          style={{
            padding: "12px 18px",
            background: "#D1E7DD",
            color: "#0F5132",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          ✓ {saveNotice}
        </div>
      )}

      {/* SECTION 1: TEAM & ACCESS CONTROL SUMMARY (LINKED TO /admin/team) */}
      <div className="admin-card" style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 4px" }}>
              Team &amp; Role-Based Access Control
            </h2>
            <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0 }}>
              {teamSummary?.active || 1} Active · {teamSummary?.invited || 0} Pending Invites ·{" "}
              {teamSummary?.revoked || 0} Revoked — enforced on the backend for every request.
            </p>
          </div>

          <Link to="/admin/team" className="admin-btn-black" style={{ textDecoration: "none" }}>
            Manage Team &amp; Invitations →
          </Link>
        </div>
      </div>

      {/* SECTION 2: STUDIO PROFILE & LOCATION */}
      <div className="admin-card" style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 16px" }}>
          Studio Profile &amp; Location
        </h2>
        <form onSubmit={handleSaveStudio} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Studio Name</label>
              <input
                type="text"
                required
                className="admin-form-input"
                value={studioForm.studioName}
                onChange={(e) => setStudioForm({ ...studioForm, studioName: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Brand Tagline</label>
              <input
                type="text"
                className="admin-form-input"
                value={studioForm.studioTagline}
                onChange={(e) => setStudioForm({ ...studioForm, studioTagline: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Public Studio Email</label>
              <input
                type="email"
                required
                className="admin-form-input"
                value={studioForm.studioEmail}
                onChange={(e) => setStudioForm({ ...studioForm, studioEmail: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Studio Phone / WhatsApp</label>
              <input
                type="text"
                className="admin-form-input"
                value={studioForm.studioPhone}
                onChange={(e) => setStudioForm({ ...studioForm, studioPhone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Physical Studio Address</label>
              <input
                type="text"
                className="admin-form-input"
                value={studioForm.studioAddress}
                onChange={(e) => setStudioForm({ ...studioForm, studioAddress: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">GST / Tax Identification</label>
              <input
                type="text"
                className="admin-form-input"
                value={studioForm.gstNumber}
                onChange={(e) => setStudioForm({ ...studioForm, gstNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="admin-btn-black">
              Save Studio Profile
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: DATA PERSISTENCE & BACKUPS */}
      <div className="admin-card">
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>
          Data Persistence &amp; Backups
        </h2>
        <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 20px" }}>
          Export a complete JSON backup of all booking inquiries, team roster metadata, clients, projects, and studio settings.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
          <button type="button" className="admin-btn-black" onClick={handleExportBackup}>
            Export Studio Backup (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
