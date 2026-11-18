import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconPlus, IconClose } from "../components/AdminIcons.jsx";

function formatShortDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminTeamPage() {
  const {
    user,
    permissions,
    teamMembers = [],
    teamSummary,
    isTeamLoading,
    teamError,
    fetchTeam,
    inviteTeamMember,
    updateTeamMember,
    resendTeamInvite,
    removeTeamMember,
  } = useAdmin();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Admin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [busyMemberId, setBusyMemberId] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [latestInviteBanner, setLatestInviteBanner] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!permissions.isFounder) {
    return (
      <div className="admin-content" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div className="admin-card" style={{ maxWidth: "520px", margin: "0 auto", padding: "40px" }}>
          <h2 style={{ fontFamily: "var(--admin-font-serif)", fontSize: "22px", margin: "0 0 10px" }}>
            Founder Access Required
          </h2>
          <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Only the studio Founder can view team invitations, assign roles, or revoke access.
          </p>
        </div>
      </div>
    );
  }

  const showNotice = (msg) => {
    setErrorMsg("");
    setNotice(msg);
    setTimeout(() => setNotice(""), 4500);
  };

  const showError = (msg) => {
    setNotice("");
    setErrorMsg(msg);
  };

  const buildFullInviteUrl = (invitePath) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${invitePath}`;
  };

  const handleCopyInviteLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy invitation link:", url);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      showError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await inviteTeamMember({
        email: cleanEmail,
        name: inviteName.trim() || cleanEmail.split("@")[0],
        role: inviteRole,
      });

      if (res.success) {
        const fullUrl = buildFullInviteUrl(res.invitePath);
        setLatestInviteBanner({
          email: res.member.email,
          name: res.member.name,
          role: res.member.role,
          url: fullUrl,
          expiresAt: res.expiresAt,
        });
        setCopied(false);
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        setInviteRole("Admin");
        showNotice(`Invitation created for ${res.member.email} as ${res.member.role}.`);
      } else {
        showError(res.error || "Could not invite team member.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (member, nextRole) => {
    if (member.role === nextRole) return;
    setBusyMemberId(member.id);
    try {
      const res = await updateTeamMember(member.id, { role: nextRole });
      if (res.success) {
        showNotice(`Updated ${member.name}'s role to ${nextRole}.`);
      } else {
        showError(res.error || "Could not update role.");
      }
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleResendInvite = async (member) => {
    setBusyMemberId(member.id);
    try {
      const res = await resendTeamInvite(member.id);
      if (res.success) {
        const fullUrl = buildFullInviteUrl(res.invitePath);
        setLatestInviteBanner({
          email: res.member.email,
          name: res.member.name,
          role: res.member.role,
          url: fullUrl,
          expiresAt: res.expiresAt,
          resent: true,
        });
        setCopied(false);
        showNotice(`Generated a fresh invitation link for ${member.email}. Previous link invalidated.`);
      } else {
        showError(res.error || "Could not resend invitation.");
      }
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleToggleRevoke = async (member) => {
    const nextStatus = member.status === "Revoked" ? "Active" : "Revoked";
    if (
      nextStatus === "Revoked" &&
      !window.confirm(
        `Revoke access for ${member.name} (${member.email})? Their active sessions will be invalidated immediately.`
      )
    ) {
      return;
    }

    setBusyMemberId(member.id);
    try {
      const res = await updateTeamMember(member.id, { status: nextStatus });
      if (res.success) {
        showNotice(
          nextStatus === "Revoked"
            ? `Access revoked for ${member.email}. Active sessions invalidated.`
            : `Access restored for ${member.email}.`
        );
      } else {
        showError(res.error || "Could not change access status.");
      }
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRemoveMember = async (member) => {
    if (
      !window.confirm(
        `Permanently remove ${member.name} (${member.email}) from the studio team? They will lose all access immediately.`
      )
    ) {
      return;
    }
    setBusyMemberId(member.id);
    try {
      const res = await removeTeamMember(member.id);
      if (res.success) {
        showNotice(`Removed ${member.email} from the team.`);
      } else {
        showError(res.error || "Could not remove team member.");
      }
    } finally {
      setBusyMemberId(null);
    }
  };

  const getRoleBadgeStyle = (role) => {
    if (role === "Founder") {
      return { background: "#151515", color: "#FFFFFF" };
    }
    if (role === "Admin") {
      return { background: "rgba(29, 78, 216, 0.1)", color: "#1D4ED8" };
    }
    return { background: "rgba(107, 114, 128, 0.12)", color: "#4B5563" };
  };

  const getStatusBadgeStyle = (member) => {
    if (member.status === "Active") {
      return { background: "#DCFCE7", color: "#166534", label: "Active" };
    }
    if (member.status === "Invited") {
      return member.isInviteExpired
        ? { background: "#FEF3C7", color: "#92400E", label: "Invite Expired" }
        : { background: "#DBEAFE", color: "#1E40AF", label: "Invited" };
    }
    return { background: "#FEE2E2", color: "#991B1B", label: "Revoked" };
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Team &amp; Access Control</h1>
          <p className="admin-page-desc">
            Invite studio members by email, assign backend-enforced roles, resend invitations, and revoke access.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => fetchTeam()}
            disabled={isTeamLoading}
            style={{ background: "#FFFFFF", fontSize: "12px", padding: "8px 14px" }}
          >
            {isTeamLoading ? "Syncing..." : "↻ Refresh"}
          </button>
          <button
            type="button"
            className="admin-btn-black"
            onClick={() => {
              setErrorMsg("");
              setIsInviteOpen(true);
            }}
          >
            <IconPlus size={13} />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="admin-summary-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="admin-summary-card">
          <span className="admin-summary-label">Total Members</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val">{teamSummary.total || teamMembers.length}</span>
            <span className="admin-summary-sub">Studio roster</span>
          </div>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-label">Active Access</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#047857" }}>
              {teamSummary.active || 0}
            </span>
            <span className="admin-summary-sub">Verified accounts</span>
          </div>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-label">Pending Invites</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#1D4ED8" }}>
              {teamSummary.invited || 0}
            </span>
            <span className="admin-summary-sub">Awaiting activation</span>
          </div>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-label">Revoked</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#991B1B" }}>
              {teamSummary.revoked || 0}
            </span>
            <span className="admin-summary-sub">Blocked sessions</span>
          </div>
        </div>
      </div>

      {/* Notices & Errors */}
      {notice && (
        <div
          style={{
            padding: "12px 16px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          ✓ {notice}
        </div>
      )}

      {(errorMsg || teamError) && (
        <div
          style={{
            padding: "12px 16px",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          ✕ {errorMsg || teamError}
        </div>
      )}

      {/* Newly Generated One-Time Invitation Link Banner */}
      {latestInviteBanner && (
        <div
          style={{
            background: "#141414",
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "18px 20px",
            marginBottom: "20px",
            border: "1px solid #2A2A2A",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#c5a47e", fontWeight: 600 }}>
                {latestInviteBanner.resent ? "Fresh Invitation Link Generated" : "One-Time Invitation Link Ready"}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>
                {latestInviteBanner.name} ({latestInviteBanner.email}) · {latestInviteBanner.role}
              </div>
              <div style={{ fontSize: "12px", color: "#A09E97", marginTop: "2px" }}>
                Share this private activation link directly with them. Expires {formatShortDate(latestInviteBanner.expiresAt)}.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLatestInviteBanner(null)}
              style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", padding: 4 }}
              aria-label="Dismiss invitation link"
            >
              <IconClose size={16} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "14px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <code
              style={{
                flex: 1,
                minWidth: "240px",
                background: "#080808",
                border: "1px solid #2C2C2C",
                padding: "9px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#E5E4DF",
                wordBreak: "break-all",
              }}
            >
              {latestInviteBanner.url}
            </code>
            <button
              type="button"
              onClick={() => handleCopyInviteLink(latestInviteBanner.url)}
              style={{
                background: "#c5a47e",
                color: "#0A0A0A",
                border: "none",
                borderRadius: "6px",
                padding: "9px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {copied ? "✓ Copied!" : "Copy Invite Link"}
            </button>
            <a
              href={`mailto:${encodeURIComponent(latestInviteBanner.email)}?subject=${encodeURIComponent(
                `Phantom Labs Studio Invitation (${latestInviteBanner.role})`
              )}&body=${encodeURIComponent(
                `Hello ${latestInviteBanner.name},\n\nYou have been invited to join the Phantom Labs Admin Workspace as ${latestInviteBanner.role}.\n\nActivate your account and set your password using this private one-time link:\n${latestInviteBanner.url}\n\nThis invitation expires on ${formatShortDate(latestInviteBanner.expiresAt)}.`
              )}`}
              style={{
                background: "#262626",
                color: "#FFFFFF",
                textDecoration: "none",
                borderRadius: "6px",
                padding: "9px 14px",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              ✉ Send via Email
            </a>
          </div>
        </div>
      )}

      {/* Role Permissions Legend */}
      <div
        className="admin-card"
        style={{
          marginBottom: "22px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          padding: "18px 20px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: "#151515",
              color: "#FFFFFF",
            }}
          >
            Founder
          </span>
          <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>
            Highest permission level. Full access to bookings, studio settings, and exclusive control over inviting, editing, or revoking team members. Protected from modification.
          </p>
        </div>
        <div>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: "rgba(29, 78, 216, 0.1)",
              color: "#1D4ED8",
            }}
          >
            Admin
          </span>
          <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>
            Manages client bookings and enquiries—can update workflow statuses, toggle read state, add studio notes, and delete requests. All actions are audit-logged.
          </p>
        </div>
        <div>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: "rgba(107, 114, 128, 0.12)",
              color: "#4B5563",
            }}
          >
            Viewer
          </span>
          <p style={{ fontSize: "12px", color: "var(--admin-text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>
            Read-only workspace access. Can review dashboard counts, client project briefs, attachments, and audit history. Blocked on the backend from modifying or deleting records.
          </p>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {isTeamLoading && teamMembers.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", fontSize: "13px", color: "var(--admin-text-secondary)" }}>
            Loading team roster...
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Access Status</th>
                  <th>Activity</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => {
                  const isFounderRow = Boolean(member.isPrimaryFounder || member.role === "Founder");
                  const isSelf = member.email?.toLowerCase() === user?.email?.toLowerCase();
                  const roleStyle = getRoleBadgeStyle(member.role);
                  const statusStyle = getStatusBadgeStyle(member);
                  const isBusy = busyMemberId === member.id;

                  return (
                    <tr key={member.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--admin-text-primary)" }}>
                          {member.name}
                          {isSelf && (
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
                          {isFounderRow && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "1px 6px",
                                marginLeft: "6px",
                                borderRadius: "3px",
                                background: "#151515",
                                color: "#c5a47e",
                              }}
                            >
                              Primary
                            </span>
                          )}
                        </div>
                        {member.invitedBy?.name && (
                          <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: 2 }}>
                            Invited by {member.invitedBy.name}
                          </div>
                        )}
                      </td>

                      <td>
                        <span style={{ fontSize: "13px", fontFamily: "var(--admin-font-mono, monospace)" }}>
                          {member.email}
                        </span>
                      </td>

                      <td>
                        {isFounderRow ? (
                          <span
                            style={{
                              ...roleStyle,
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Founder
                          </span>
                        ) : (
                          <select
                            aria-label={`Role for ${member.email}`}
                            className="admin-form-select"
                            value={member.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(member, e.target.value)}
                            style={{
                              width: "auto",
                              minWidth: "108px",
                              height: "30px",
                              padding: "2px 26px 2px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        )}
                      </td>

                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: statusStyle.background,
                            color: statusStyle.color,
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                          {member.lastLoginAt
                            ? `Last login ${formatShortDate(member.lastLoginAt)}`
                            : member.status === "Invited"
                            ? `Invited ${formatShortDate(member.invitedAt || member.createdAt)}`
                            : `Added ${formatShortDate(member.createdAt)}`}
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {isFounderRow ? (
                          <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", fontStyle: "italic" }}>
                            Protected Founder
                          </span>
                        ) : (
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {(member.status === "Invited" || !member.hasPassword) && (
                              <button
                                type="button"
                                className="admin-action-btn"
                                disabled={isBusy}
                                onClick={() => handleResendInvite(member)}
                                style={{ fontSize: "11.5px", padding: "5px 10px", background: "#FFFFFF" }}
                              >
                                Resend Invite
                              </button>
                            )}

                            {member.hasPassword && (
                              <button
                                type="button"
                                className="admin-action-btn"
                                disabled={isBusy}
                                onClick={() => handleToggleRevoke(member)}
                                style={{
                                  fontSize: "11.5px",
                                  padding: "5px 10px",
                                  background: "#FFFFFF",
                                  color: member.status === "Revoked" ? "#047857" : "#B45309",
                                }}
                              >
                                {member.status === "Revoked" ? "Restore Access" : "Revoke Access"}
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleRemoveMember(member)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#DC2626",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: isBusy ? "wait" : "pointer",
                                padding: "5px 6px",
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVITE TEAM MEMBER MODAL */}
      {isInviteOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsInviteOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Invite Team Member</h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  Generates a secure one-time invitation link valid for 7 days.
                </span>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => setIsInviteOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@phantomlabs.in"
                    className="admin-form-input"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Rao"
                    className="admin-form-input"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Assigned Role</label>
                  <select
                    className="admin-form-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="Admin">Admin — Manage bookings &amp; client enquiries</option>
                    <option value="Viewer">Viewer — Read-only access</option>
                  </select>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "5px", display: "block" }}>
                    Only the Founder can manage team access. Roles are enforced on every backend request.
                  </span>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Invitation..." : "Create Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
