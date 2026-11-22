import React, { useState } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import { Users, Mail, Phone, Plus } from "lucide-react";

export default function TeamView() {
  const { team, addTeamMember, isLoading } = useStudioAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "Associate Photographer",
    email: "",
    phone: "",
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    await addTeamMember(newMember);
    setNewMember({ name: "", role: "Associate Photographer", email: "", phone: "" });
    setModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>STUDIO PERSONNEL</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Creative Crew & Associate Photographers
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Photographers, cinematographers, master colorists, stylists, and set lighting technicians.
          </p>
        </div>

        <button
          type="button"
          className="studio-btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          + Add Crew Member
        </button>
      </div>

      <div className="studio-card">
        {isLoading ? (
          <AdminLoadingSkeleton rows={3} />
        ) : team.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="No creative crew members added"
            description="Add associate photographers, directors of photography, colorists, and stylists to your roster."
            actionLabel="+ Add Crew Member"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Creative</th>
                  <th>Role & Specialization</th>
                  <th>Contact Coordinates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--studio-text-primary)", fontSize: "14px" }}>
                        {member.name}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "13px", color: "var(--studio-text-secondary)" }}>
                        {member.role}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>{member.email || "—"}</div>
                      {member.phone && (
                        <div style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>{member.phone}</div>
                      )}
                    </td>

                    <td>
                      <span className="studio-badge studio-badge-solid" style={{ fontSize: "10.5px" }}>
                        {member.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Team Member */}
      {modalOpen && (
        <div className="studio-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="studio-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="studio-modal-header">
              <h3 className="studio-serif" style={{ fontSize: "20px", margin: 0 }}>
                Add Crew Member to Roster
              </h3>
              <button
                type="button"
                className="studio-btn-secondary studio-btn-sm"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="studio-form-group">
                <label className="studio-form-label">Full Name</label>
                <input
                  type="text"
                  className="studio-input"
                  required
                  placeholder="e.g. Kiran Rao"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Role & Specialization</label>
                <input
                  type="text"
                  className="studio-input"
                  placeholder="e.g. Lead Colorist & Digital Tech"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Email</label>
                  <input
                    type="email"
                    className="studio-input"
                    placeholder="kiran@studio.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Phone</label>
                  <input
                    type="text"
                    className="studio-input"
                    placeholder="+91 98..."
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="studio-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="studio-btn-primary">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
