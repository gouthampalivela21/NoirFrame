import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconSearch, IconPlus, IconClose } from "../components/AdminIcons.jsx";

export default function AdminInquiriesPage() {
  const { inquiries, addInquiry, updateInquiry, deleteInquiry, convertInquiryToClient } = useAdmin();
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    category: "Couples",
    subCategory: "Pre-Wedding",
    location: "",
    preferredDate: "",
    budget: "",
    message: "",
    status: "New",
  });

  const filteredInquiries = useMemo(() => {
    return (inquiries || []).filter((inq) => {
      const status = (inq.status || "New").toLowerCase();
      const matchTab =
        activeTab === "All" ||
        status === activeTab.toLowerCase();

      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (inq.clientName || "").toLowerCase().includes(q) ||
        (inq.location || "").toLowerCase().includes(q) ||
        (inq.category || "").toLowerCase().includes(q) ||
        (inq.subCategory || "").toLowerCase().includes(q) ||
        (inq.email || "").toLowerCase().includes(q);

      return matchTab && matchSearch;
    });
  }, [inquiries, activeTab, searchTerm]);

  const handleCreateInquiry = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) return;

    addInquiry({
      ...formData,
      timeAgo: "Just now",
      thumbnail: "/images/dashboard/act-1.png",
      notes: [],
    });

    setIsAddOpen(false);
    setFormData({
      clientName: "",
      email: "",
      phone: "",
      category: "Couples",
      subCategory: "Pre-Wedding",
      location: "",
      preferredDate: "",
      budget: "",
      message: "",
      status: "New",
    });
  };

  const handleAddNote = (inquiryId) => {
    if (!newNote.trim()) return;
    const inq = inquiries.find((i) => i.id === inquiryId);
    if (inq) {
      const updatedNotes = [...(inq.notes || []), newNote.trim()];
      updateInquiry(inquiryId, { notes: updatedNotes });
      setSelectedInquiry((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
      setNewNote("");
    }
  };

  const handleConvert = (inquiryId) => {
    convertInquiryToClient(inquiryId);
    setSelectedInquiry(null);
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Inquiries</h1>
          <p className="admin-page-desc">
            Incoming shoot requests, consultation leads, and pre-booking inquiries.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={() => setIsAddOpen(true)}
        >
          <IconPlus size={13} />
          <span>New Inquiry</span>
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
          {["All", "New", "In Progress", "Confirmed"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`admin-filter-pill ${activeTab === tab ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
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
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "34px", background: "#FFFFFF" }}
          />
        </div>
      </div>

      {/* Inquiries Table or Clean Empty State */}
      {inquiries.length === 0 ? (
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
            No inquiries received yet
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
            Prospective clients submitting the public contact form will appear here in real time. You can also log manual inquiries.
          </p>
          <button
            type="button"
            className="admin-btn-black"
            onClick={() => setIsAddOpen(true)}
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            <IconPlus size={13} />
            <span>+ Log New Inquiry</span>
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client / Couple</th>
                <th>Category</th>
                <th>Location</th>
                <th>Target Date</th>
                <th>Budget</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: "var(--admin-text-secondary)" }}>
                    No inquiries found matching criteria.
                  </td>
                </tr>
              ) : (
              filteredInquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inq.clientName}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>{inq.email}</div>
                  </td>
                  <td>
                    <span>{inq.subCategory || inq.category}</span>
                  </td>
                  <td>{inq.location}</td>
                  <td>{inq.preferredDate || "Flexible"}</td>
                  <td style={{ fontWeight: 500 }}>{inq.budget || "—"}</td>
                  <td>
                    <span className="admin-status-pill admin-status-pill--new">
                      {inq.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => setSelectedInquiry(inq)}
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn"
                        style={{ background: "#151515", color: "#FFFFFF", borderColor: "#151515" }}
                        onClick={() => handleConvert(inq.id)}
                      >
                        Convert
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedInquiry(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">{selectedInquiry.clientName}</h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  {selectedInquiry.subCategory || selectedInquiry.category} &middot; {selectedInquiry.location}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedInquiry(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <strong>Email:</strong> {selectedInquiry.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedInquiry.phone || "—"}
                </div>
                <div>
                  <strong>Budget:</strong> {selectedInquiry.budget || "—"}
                </div>
                <div>
                  <strong>Preferred Date:</strong> {selectedInquiry.preferredDate || "Flexible"}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Client Message / Vision</label>
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#FAFAF8",
                    border: "1px solid var(--admin-border-subtle)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedInquiry.message || "No initial message provided."}
                </div>
              </div>

              {/* Status Update */}
              <div className="admin-form-group">
                <label className="admin-form-label">Update Status</label>
                <select
                  className="admin-form-select"
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    const next = e.target.value;
                    updateInquiry(selectedInquiry.id, { status: next });
                    setSelectedInquiry({ ...selectedInquiry, status: next });
                  }}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Internal Studio Notes */}
              <div className="admin-form-group">
                <label className="admin-form-label">Studio Notes</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                  {(selectedInquiry.notes || []).map((n, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 12px",
                        background: "#F4F3EE",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Add an internal note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNote(selectedInquiry.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-black"
                    style={{ padding: "8px 14px", fontSize: "12px" }}
                    onClick={() => handleAddNote(selectedInquiry.id)}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn"
                style={{ color: "#DC3545", borderColor: "#F5C6CB" }}
                onClick={() => {
                  deleteInquiry(selectedInquiry.id);
                  setSelectedInquiry(null);
                }}
              >
                Delete Lead
              </button>
              <button
                type="button"
                className="admin-btn-black"
                onClick={() => handleConvert(selectedInquiry.id)}
              >
                Convert to Client &amp; Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Inquiry Modal */}
      {isAddOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Record New Inquiry</h2>
              <button className="admin-modal-close" onClick={() => setIsAddOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Client / Couple Name</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
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
                      <option value="Couples">Couples / Pre-Wedding</option>
                      <option value="Weddings">Wedding Coverage</option>
                      <option value="Brands">Brand Campaign</option>
                      <option value="Portraits">Portraits / Monograph</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Location</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Budget</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. ₹2,00,000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Target Date</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Inquiry Message</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

