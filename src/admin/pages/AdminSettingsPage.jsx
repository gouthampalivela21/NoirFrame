import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconPlus, IconClose } from "../components/AdminIcons.jsx";

export default function AdminSettingsPage() {
  const {
    settings,
    updateSettings,
    store,
    user,
    administrators = [],
    addAdministrator,
    updateAdministrator,
    toggleAdministratorStatus,
    deleteAdministrator,
  } = useAdmin();

  const isFounder = user?.role === "Founder";

  const [studioForm, setStudioForm] = useState({
    studioName: settings.studioName || "Phantom Labs",
    studioTagline: settings.studioTagline || "Visual stories, framed differently.",
    studioEmail: settings.studioEmail || "teamphantomlabs@gmail.com",
    studioPhone: settings.studioPhone || "+91 98860 12345",
    studioAddress: settings.studioAddress || "Bengaluru · Worldwide",
    gstNumber: settings.gstNumber || "",
  });

  const [saveNotice, setSaveNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  // Add Administrator Modal State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Admin");

  // Edit Role Modal State
  const [editingAdmin, setEditingAdmin] = useState(null);

  const handleSaveStudio = (e) => {
    e.preventDefault();
    updateSettings(studioForm);
    setSaveNotice("Studio profile updated successfully.");
    setTimeout(() => setSaveNotice(""), 3500);
  };

  const handleAddAdminSubmit = (e) => {
    e.preventDefault();
    setErrorNotice("");

    const email = newAdminEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setErrorNotice("Please enter a valid Google email address.");
      return;
    }

    try {
      addAdministrator({
        email,
        name: newAdminName.trim() || email.split("@")[0],
        role: newAdminRole,
      });

      setSaveNotice(`Administrator account (${email}) authorized successfully as ${newAdminRole}.`);
      setIsAddAdminOpen(false);
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminRole("Admin");
      setTimeout(() => setSaveNotice(""), 4000);
    } catch (err) {
      setErrorNotice(err.message || "Failed to add administrator.");
    }
  };

  const handleRoleChange = (adminId, newRole) => {
    try {
      updateAdministrator(adminId, { role: newRole });
      setSaveNotice("Administrator role updated successfully.");
      setEditingAdmin(null);
      setTimeout(() => setSaveNotice(""), 3500);
    } catch (err) {
      setErrorNotice(err.message || "Failed to update role.");
    }
  };

  const handleToggleStatus = (admin) => {
    if (admin.isPrimaryFounder) {
      setErrorNotice("The primary Founder account cannot be deactivated.");
      setTimeout(() => setErrorNotice(""), 3500);
      return;
    }

    try {
      toggleAdministratorStatus(admin.id);
      const next = admin.status === "Active" ? "deactivated" : "activated";
      setSaveNotice(`Account for ${admin.name} has been ${next}.`);
      setTimeout(() => setSaveNotice(""), 3500);
    } catch (err) {
      setErrorNotice(err.message || "Failed to change status.");
    }
  };

  const handleDeleteAdmin = (admin) => {
    if (admin.isPrimaryFounder) {
      setErrorNotice("The primary Founder account cannot be deleted.");
      setTimeout(() => setErrorNotice(""), 3500);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to remove ${admin.name} (${admin.email}) from authorized administrators? They will no longer be able to log in.`
      )
    ) {
      try {
        deleteAdministrator(admin.id);
        setSaveNotice(`Administrator access for ${admin.email} has been revoked.`);
        setTimeout(() => setSaveNotice(""), 3500);
      } catch (err) {
        setErrorNotice(err.message || "Failed to remove administrator.");
      }
    }
  };

  // Export JSON backup
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

  if (!isFounder) {
    return (
      <div className="admin-content" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div className="admin-card" style={{ maxWidth: "540px", margin: "0 auto", padding: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 10px" }}>Access Restricted</h2>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: "0 0 20px" }}>
            Studio settings and administrator allowlist management are reserved exclusively for the studio Founder.
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
            Administrator allowlist, role-based access control, branding profiles, and studio database backups.
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span>
          <span>{saveNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div
          style={{
            padding: "12px 18px",
            background: "#F8D7DA",
            color: "#842029",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✕</span>
          <span>{errorNotice}</span>
        </div>
      )}

      {/* SECTION 1: AUTHORIZED ADMINISTRATORS & ROLE-BASED ACCESS CONTROL */}
      <div className="admin-card" style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--admin-border-subtle)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 4px" }}>
              Authorised Administrators &amp; Access Control
            </h2>
            <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0 }}>
              Only Google accounts registered here are granted access. Roles govern operational permissions.
            </p>
          </div>

          <button
            type="button"
            className="admin-btn-black"
            onClick={() => {
              setErrorNotice("");
              setIsAddAdminOpen(true);
            }}
          >
            <IconPlus size={13} />
            <span>Add Administrator</span>
          </button>
        </div>

        {/* Administrators Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Google Email</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Date Added</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {administrators.map((admin) => {
                const isCurrentLoggedIn = admin.email?.toLowerCase() === user?.email?.toLowerCase();
                const isPrimary = Boolean(admin.isPrimaryFounder);

                return (
                  <tr key={admin.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={admin.avatar || "/images/admin-avatar.png"}
                          alt={admin.name}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            background: "#222",
                            border: "1px solid var(--admin-border)",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "/images/admin-avatar.png";
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "13.5px" }}>
                            {admin.name}
                            {isCurrentLoggedIn && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "1px 6px",
                                  marginLeft: "6px",
                                  borderRadius: "3px",
                                  background: "#EAE9E5",
                                  color: "#333",
                                }}
                              >
                                You
                              </span>
                            )}
                            {isPrimary && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "1px 6px",
                                  marginLeft: "6px",
                                  borderRadius: "3px",
                                  background: "#111111",
                                  color: "#FFFFFF",
                                }}
                              >
                                Primary
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                            ID: {admin.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "13px", fontFamily: "var(--admin-font-mono, monospace)" }}>
                        {admin.email}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          background:
                            admin.role === "Founder"
                              ? "rgba(17, 17, 17, 0.1)"
                              : admin.role === "Co-Founder"
                              ? "rgba(13, 110, 253, 0.1)"
                              : "rgba(108, 117, 125, 0.1)",
                          color:
                            admin.role === "Founder"
                              ? "#111111"
                              : admin.role === "Co-Founder"
                              ? "#0D6EFD"
                              : "#495057",
                        }}
                      >
                        {admin.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-status-pill ${
                          admin.status === "Active"
                            ? "admin-status-pill--confirmed"
                            : "admin-status-pill--new"
                        }`}
                        style={{
                          background: admin.status === "Active" ? "#D1E7DD" : "#F8D7DA",
                          color: admin.status === "Active" ? "#0F5132" : "#842029",
                        }}
                      >
                        {admin.status}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                        {admin.dateAdded
                          ? new Date(admin.dateAdded).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Initial"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        {/* Change Role Button */}
                        {!isPrimary ? (
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => setEditingAdmin(admin)}
                          >
                            Change Role
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--admin-text-muted)",
                              padding: "4px 8px",
                            }}
                          >
                            Permanent Role
                          </span>
                        )}

                        {/* Toggle Active Status */}
                        {!isPrimary && (
                          <button
                            type="button"
                            className="admin-action-btn"
                            style={{
                              color: admin.status === "Active" ? "#842029" : "#0F5132",
                            }}
                            onClick={() => handleToggleStatus(admin)}
                          >
                            {admin.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        )}

                        {/* Delete Admin Button */}
                        {!isPrimary && (
                          <button
                            type="button"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#DC3545",
                              fontSize: "12px",
                              cursor: "pointer",
                              padding: "4px 6px",
                            }}
                            onClick={() => handleDeleteAdmin(admin)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          Export a complete encrypted JSON backup of all inquiries, clients, projects, bookings, portfolio studies, and administrator allowlists.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
          <button type="button" className="admin-btn-black" onClick={handleExportBackup}>
            Export Studio Backup (JSON)
          </button>
        </div>
      </div>

      {/* MODAL: ADD ADMINISTRATOR (GOOGLE ACCOUNT) */}
      {isAddAdminOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddAdminOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Authorize Administrator</h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  Only this verified Google account will be permitted studio access.
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setIsAddAdminOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Google Account Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    className="admin-form-input"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "4px", display: "block" }}>
                    The team member must sign in with this exact Google account.
                  </span>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Team Member Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="admin-form-input"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Assigned Role</label>
                  <select
                    className="admin-form-select"
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                  >
                    <option value="Admin">Admin — Operational access (Inquiries, Projects, Bookings)</option>
                    <option value="Co-Founder">Co-Founder — Studio management &amp; Analytics</option>
                    <option value="Founder">Founder — Full administrative access</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsAddAdminOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black">
                  Authorize Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ROLE */}
      {editingAdmin && (
        <div className="admin-modal-backdrop" onClick={() => setEditingAdmin(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Change Role</h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  {editingAdmin.name} ({editingAdmin.email})
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setEditingAdmin(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Select Role</label>
                <select
                  className="admin-form-select"
                  defaultValue={editingAdmin.role}
                  onChange={(e) => handleRoleChange(editingAdmin.id, e.target.value)}
                >
                  <option value="Admin">Admin — Operational dashboard</option>
                  <option value="Co-Founder">Co-Founder — Operations &amp; Analytics</option>
                  <option value="Founder">Founder — Full access</option>
                </select>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn"
                onClick={() => setEditingAdmin(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
