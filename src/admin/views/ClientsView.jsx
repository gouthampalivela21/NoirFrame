import React, { useState } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import DestructiveActionModal from "../components/DestructiveActionModal.jsx";
import { Users, Mail, Phone, Plus, Trash2 } from "lucide-react";

export default function ClientsView() {
  const { clients, createClient, deleteClient, isLoading } = useStudioAdmin();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetClient, setDeleteTargetClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    organization: "",
  });

  const filtered = clients.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.contactPerson || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    await createClient(newClient);
    setNewClient({ name: "", contactPerson: "", email: "", phone: "", organization: "" });
    setModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>PATRONS & DIRECTORY</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Client Roster & Accounts Directory
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Directory of fashion houses, luxury ateliers, couples, and corporate patrons.
          </p>
        </div>

        <button
          type="button"
          className="studio-btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          + New Client
        </button>
      </div>

      <div className="studio-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <input
            type="text"
            className="studio-input studio-btn-sm"
            style={{ width: "260px" }}
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
            Showing {filtered.length} patrons
          </span>
        </div>

        {isLoading ? (
          <AdminLoadingSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title={clients.length === 0 ? "No clients registered yet" : "No matching clients"}
            description={
              clients.length === 0
                ? "Register a new client account or accept booking inquiries to populate this patron directory."
                : "No clients matched your search query."
            }
            actionLabel={clients.length === 0 ? "+ Register Client" : undefined}
            onAction={clients.length === 0 ? () => setModalOpen(true) : undefined}
          />
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Client / Account</th>
                  <th>Primary Contact</th>
                  <th>Direct Communication</th>
                  <th>Lifetime Spend (₹)</th>
                  <th>Commissions</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cli) => (
                  <tr key={cli.id}>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--studio-text-primary)", fontSize: "14px" }}>
                        {cli.name}
                      </div>
                      {cli.organization && (
                        <div style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>
                          {cli.organization}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ color: "var(--studio-text-secondary)" }}>
                        {cli.contactPerson || cli.name}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>{cli.email || "—"}</div>
                      <div style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>{cli.phone || "—"}</div>
                    </td>

                    <td>
                      <span className="studio-mono" style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--studio-text-primary)" }}>
                        {formatINR(cli.totalSpend || 0)}
                      </span>
                    </td>

                    <td>
                      <span className="studio-mono" style={{ fontSize: "12.5px" }}>
                        {cli.commissionsCount || 1} shoots
                      </span>
                    </td>

                    <td>
                      <span className="studio-badge studio-badge-solid" style={{ fontSize: "10.5px" }}>
                        {cli.status || "Active"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="studio-btn-secondary studio-btn-sm"
                        style={{ padding: "4px 8px" }}
                        onClick={() => setDeleteTargetClient(cli)}
                        title="Delete client"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Client */}
      {modalOpen && (
        <div className="studio-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="studio-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="studio-modal-header">
              <h3 className="studio-serif" style={{ fontSize: "20px", margin: 0 }}>
                Register New Client Patron
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
                <label className="studio-form-label">Client / Patron Name</label>
                <input
                  type="text"
                  className="studio-input"
                  required
                  placeholder="e.g. Sabyasachi Heritage / Aria & Dev"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Contact Person</label>
                  <input
                    type="text"
                    className="studio-input"
                    placeholder="Lead contact name"
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Organization</label>
                  <input
                    type="text"
                    className="studio-input"
                    placeholder="Atelier / Brand name"
                    value={newClient.organization}
                    onChange={(e) => setNewClient({ ...newClient, organization: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Email Address</label>
                  <input
                    type="email"
                    className="studio-input"
                    placeholder="contact@patron.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Phone Number</label>
                  <input
                    type="text"
                    className="studio-input"
                    placeholder="+91 98..."
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
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
                  Save Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Destructive Action Modal */}
      <DestructiveActionModal
        isOpen={Boolean(deleteTargetClient)}
        title="Purge Client Account"
        itemDescription={
          deleteTargetClient
            ? `Client account "${deleteTargetClient.name}" (${deleteTargetClient.organization || "Independent"}) will be permanently purged from the database.`
            : ""
        }
        onConfirm={async () => {
          if (deleteTargetClient) {
            await deleteClient(deleteTargetClient.id);
            setDeleteTargetClient(null);
          }
        }}
        onCancel={() => setDeleteTargetClient(null)}
      />
    </div>
  );
}
