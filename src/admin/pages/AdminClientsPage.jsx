import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconSearch, IconPlus, IconClose } from "../components/AdminIcons.jsx";

export default function AdminClientsPage() {
  const { clients, addClient, updateClient, deleteClient, projects } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    category: "Commercial",
    tier: "Standard",
    notes: "",
  });

  const categories = ["All", "Commercial", "Couples", "Events", "Editorial", "Personal"];

  const filteredClients = useMemo(() => {
    return (clients || []).filter((c) => {
      const matchCat = categoryFilter === "All" || c.category === categoryFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.email || "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [clients, categoryFilter, searchTerm]);

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    addClient({
      ...formData,
      totalSpend: "₹0",
      projectsCount: 0,
      avatar: "/images/dashboard/act-5.png",
      status: "Active",
    });

    setIsAddOpen(false);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      category: "Commercial",
      tier: "Standard",
      notes: "",
    });
  };

  // Find projects belonging to selected client
  const clientProjects = selectedClient
    ? (projects || []).filter(
        (p) =>
          (p.client || "").toLowerCase() === (selectedClient.name || "").toLowerCase() ||
          (selectedClient.company && (p.client || "").toLowerCase() === selectedClient.company.toLowerCase())
      )
    : [];

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client Directory</h1>
          <p className="admin-page-desc">
            Studio clientele, brand partners, couples, and creative collaborators.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={() => setIsAddOpen(true)}
        >
          <IconPlus size={13} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div className="admin-filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`admin-filter-pill ${categoryFilter === cat ? "is-active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <IconSearch
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--admin-text-secondary)",
            }}
          />
          <input
            type="text"
            className="admin-form-input"
            placeholder="Search by client or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "34px", background: "#FFFFFF" }}
          />
        </div>
      </div>

      {/* Clients Table or Clean Empty State */}
      {clients.length === 0 ? (
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
            No client records found
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "13px",
              color: "var(--admin-text-secondary)",
              maxWidth: "460px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Clients will be automatically created when inquiries are converted, or you can add a client profile manually.
          </p>
          <button
            type="button"
            className="admin-btn-black"
            onClick={() => setIsAddOpen(true)}
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            <IconPlus size={13} />
            <span>+ Add Client</span>
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Total Projects</th>
                <th>Total Spend</th>
                <th>Tier</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: "var(--admin-text-secondary)" }}>
                    No clients found matching filter.
                  </td>
                </tr>
              ) : (
              filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={client.avatar || "/images/dashboard/act-5.png"}
                        alt={client.name}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }}
                        onError={(e) => {
                          e.currentTarget.src = "/images/dashboard/act-5.png";
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{client.name}</div>
                        {client.company && (
                          <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{client.category}</td>
                  <td>
                    <div style={{ fontSize: "12.5px" }}>{client.email}</div>
                    <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                      {client.phone}
                    </div>
                  </td>
                  <td>{client.projectsCount ?? 1}</td>
                  <td style={{ fontWeight: 500 }}>
                    {client.totalSpend || (client.totalSpent ? `₹${Number(client.totalSpent).toLocaleString("en-IN")}` : "—")}
                  </td>
                  <td>
                    <span className="admin-status-pill admin-status-pill--client">
                      {client.tier || "Standard"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="admin-action-btn"
                      onClick={() => setSelectedClient(client)}
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Client Dossier Modal */}
      {selectedClient && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedClient(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={selectedClient.avatar || "/images/dashboard/act-5.png"}
                  alt={selectedClient.name}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }}
                />
                <div>
                  <h2 className="admin-modal-title" style={{ fontSize: "20px" }}>{selectedClient.name}</h2>
                  <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    {selectedClient.company ? `${selectedClient.company} · ` : ""}
                    {selectedClient.category}
                  </span>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedClient(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <strong>Email:</strong> {selectedClient.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedClient.phone || "—"}
                </div>
                <div>
                  <strong>Total Spend:</strong> {selectedClient.totalSpend || "—"}
                </div>
                <div>
                  <strong>Client Tier:</strong> {selectedClient.tier || "Standard"}
                </div>
              </div>

              {selectedClient.notes && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Client Notes</label>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-text-secondary)" }}>
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Projects History */}
              <div className="admin-form-group">
                <label className="admin-form-label">Associated Projects</label>
                {clientProjects.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    No ongoing or completed projects logged under this name.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {clientProjects.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 12px",
                          background: "#FAFAF8",
                          borderRadius: "6px",
                          border: "1px solid var(--admin-border-subtle)",
                          fontSize: "12.5px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                            Stage: {p.stage} &middot; Budget: {p.budget}
                          </div>
                        </div>
                        <span className="admin-status-pill admin-status-pill--progress">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn"
                style={{ color: "#DC3545", borderColor: "#F5C6CB" }}
                onClick={() => {
                  deleteClient(selectedClient.id);
                  setSelectedClient(null);
                }}
              >
                Remove Client
              </button>
              <button
                type="button"
                className="admin-btn-black"
                onClick={() => setSelectedClient(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add Client Record</h2>
              <button className="admin-modal-close" onClick={() => setIsAddOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleAddClient}>
              <div className="admin-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Client Name</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      placeholder="e.g. Maya Sen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Company / Brand</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Sen Textiles"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Email</label>
                    <input
                      type="email"
                      required
                      className="admin-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Phone</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="+91..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Commercial">Commercial / Brand</option>
                      <option value="Couples">Couples / Wedding</option>
                      <option value="Editorial">Editorial / Fashion</option>
                      <option value="Personal">Personal Monograph</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Tier</label>
                    <select
                      className="admin-form-select"
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="VIP">VIP</option>
                      <option value="Retainer">Retainer</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Special Preferences / Notes</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black">
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

