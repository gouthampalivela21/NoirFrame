import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminSettingsPage() {
  const { settings, updateSettings, store } = useAdmin();

  const [studioForm, setStudioForm] = useState({
    studioName: settings.studioName || "Phantom Labs",
    studioTagline: settings.studioTagline || "Creative Cinematography & Editorial Monograph Studio",
    studioEmail: settings.studioEmail || "contact@phantomlabs.in",
    studioPhone: settings.studioPhone || "+91 98860 12345",
    studioAddress: settings.studioAddress || "No. 42, 4th Cross, Indiranagar, Bangalore 560038",
    gstNumber: settings.gstNumber || "29AABCP1234K1Z5",
  });

  const [adminForm, setAdminForm] = useState({
    adminName: settings.adminName || "Studio Admin",
    adminEmail: settings.adminEmail || "gouthampalivela26@gmail.com",
    newPassword: "",
    confirmPassword: "",
  });

  const [saveNotice, setSaveNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  const handleSaveStudio = (e) => {
    e.preventDefault();
    updateSettings(studioForm);
    setSaveNotice("Studio profile updated successfully.");
    setTimeout(() => setSaveNotice(""), 3500);
  };

  const handleSaveAdmin = (e) => {
    e.preventDefault();
    setErrorNotice("");

    if (adminForm.newPassword && adminForm.newPassword !== adminForm.confirmPassword) {
      setErrorNotice("Passwords do not match.");
      return;
    }

    const payload = {
      adminName: adminForm.adminName,
      adminEmail: adminForm.adminEmail,
    };
    if (adminForm.newPassword) {
      payload.adminPassword = adminForm.newPassword;
    }

    updateSettings(payload);
    setSaveNotice("Administrator credentials updated successfully.");
    setAdminForm({ ...adminForm, newPassword: "", confirmPassword: "" });
    setTimeout(() => setSaveNotice(""), 3500);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `phantom_labs_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        localStorage.setItem("phantom_admin_store_v1", JSON.stringify(parsed));
        window.location.reload();
      } catch {
        setErrorNotice("Failed to parse backup JSON file. Ensure it is a valid Phantom Labs export.");
      }
    };
    reader.readAsText(file);
  };

  // Factory reset
  const handleFactoryReset = () => {
    if (window.confirm("Are you sure you want to reset all dashboard data back to initial showcase defaults?")) {
      localStorage.removeItem("phantom_admin_store_v1");
      window.location.reload();
    }
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Settings</h1>
          <p className="admin-page-desc">
            Branding, administrator credentials, billing defaults, and studio database backups.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div style={{ padding: "10px 16px", background: "#D1E7DD", color: "#0F5132", borderRadius: "8px", fontSize: "13px" }}>
          ✓ {saveNotice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: "10px 16px", background: "#F8D7DA", color: "#842029", borderRadius: "8px", fontSize: "13px" }}>
          ✕ {errorNotice}
        </div>
      )}

      {/* Studio Profile Form */}
      <div className="admin-card">
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 16px" }}>Studio Profile &amp; Location</h2>
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

      {/* Administrator Credentials */}
      <div className="admin-card">
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 16px" }}>Administrator Account</h2>
        <form onSubmit={handleSaveAdmin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Admin Display Name</label>
              <input
                type="text"
                required
                className="admin-form-input"
                value={adminForm.adminName}
                onChange={(e) => setAdminForm({ ...adminForm, adminName: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Login Email</label>
              <input
                type="email"
                required
                className="admin-form-input"
                value={adminForm.adminEmail}
                onChange={(e) => setAdminForm({ ...adminForm, adminEmail: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">New Password (leave blank to keep current)</label>
              <input
                type="password"
                className="admin-form-input"
                placeholder="••••••••••••"
                value={adminForm.newPassword}
                onChange={(e) => setAdminForm({ ...adminForm, newPassword: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Confirm New Password</label>
              <input
                type="password"
                className="admin-form-input"
                placeholder="••••••••••••"
                value={adminForm.confirmPassword}
                onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="admin-btn-black">
              Update Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Studio Database & Backups */}
      <div className="admin-card">
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>Data Persistence &amp; Backups</h2>
        <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 20px" }}>
          Export a complete snapshot of all inquiries, client rosters, projects, call sheets, and studio financials.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
          <button type="button" className="admin-btn-black" onClick={handleExportBackup}>
            Export Studio Backup (JSON)
          </button>

          <label className="admin-action-btn" style={{ padding: "9px 16px", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
            <span>Import Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: "none" }} />
          </label>

          <button
            type="button"
            className="admin-action-btn"
            style={{ color: "#DC3545", borderColor: "#F5C6CB", padding: "9px 16px", marginLeft: "auto" }}
            onClick={handleFactoryReset}
          >
            Reset to Initial Showcase Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

