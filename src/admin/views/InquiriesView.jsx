import React, { useState } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import DestructiveActionModal from "../components/DestructiveActionModal.jsx";
import { Search, Mail, Phone, MapPin, Trash2, Inbox } from "lucide-react";

export default function InquiriesView() {
  const {
    inquiries,
    inquiryStatusFilter,
    setInquiryStatusFilter,
    inquiryCategoryFilter,
    setInquiryCategoryFilter,
    updateInquiryStatus,
    deleteInquiry,
    convertInquiryToProject,
    isLoading,
  } = useStudioAdmin();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = inquiries.filter((inq) => {
    if (inquiryStatusFilter !== "All" && inq.status !== inquiryStatusFilter) return false;
    if (inquiryCategoryFilter !== "All" && inq.category !== inquiryCategoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (inq.clientName || "").toLowerCase().includes(q) ||
        (inq.email || "").toLowerCase().includes(q) ||
        (inq.category || "").toLowerCase().includes(q) ||
        (inq.location || "").toLowerCase().includes(q) ||
        (inq.message && inq.message.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>PIPELINE & BRIEFS</div>
        <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
          Client Booking Inquiries
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
          Review incoming creative briefs, update inquiry status, and convert leads into active commissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="studio-card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          {/* Status Pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["All", "New", "In progress", "Responded", "Closed"].map((st) => (
              <button
                key={st}
                type="button"
                className={`studio-btn-sm ${inquiryStatusFilter === st ? "studio-btn-primary" : "studio-btn-secondary"}`}
                onClick={() => setInquiryStatusFilter(st)}
              >
                {st} {st === "All" ? `(${inquiries.length})` : `(${inquiries.filter((i) => i.status === st).length})`}
              </button>
            ))}
          </div>

          {/* Category Dropdown & Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>Category:</span>
            <select
              className="studio-select studio-btn-sm"
              style={{ width: "auto" }}
              value={inquiryCategoryFilter}
              onChange={(e) => setInquiryCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Portraits">Portraits</option>
              <option value="Couples">Couples</option>
              <option value="Events">Events</option>
              <option value="Brands">Brands</option>
              <option value="Commercial">Commercial</option>
              <option value="Editorial">Editorial</option>
            </select>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="studio-input studio-btn-sm"
                style={{ width: "220px", paddingLeft: "12px" }}
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Table or Empty / Loading States */}
      <div className="studio-card">
        {isLoading ? (
          <AdminLoadingSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={Inbox}
            title={inquiries.length === 0 ? "No inquiries yet" : "No matching inquiries"}
            description={
              inquiries.length === 0
                ? "Incoming creative briefs submitted through the booking experience will appear here in real time."
                : "No inquiries matched the active filters or search terms."
            }
          />
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Patron / Contact</th>
                  <th>Category</th>
                  <th>Location & Timeframe</th>
                  <th>Estimated Budget</th>
                  <th>Creative Scope Brief</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--studio-text-primary)" }}>{item.clientName}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--studio-text-muted)", marginTop: "2px" }}>
                        {item.email}
                      </div>
                      {item.phone && (
                        <div style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>
                          {item.phone}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="studio-badge studio-badge-subtle">{item.category}</span>
                    </td>

                    <td>
                      <div style={{ fontSize: "12.5px", color: "var(--studio-text-secondary)" }}>{item.location}</div>
                      <div style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>{item.timeframe}</div>
                    </td>

                    <td>
                      <span className="studio-mono" style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--studio-text-primary)" }}>
                        {formatINR(item.budget)}
                      </span>
                    </td>

                    <td style={{ maxWidth: "260px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.5",
                          color: "var(--studio-text-secondary)",
                        }}
                      >
                        {item.message || "No specific brief message provided."}
                      </div>
                    </td>

                    <td>
                      <select
                        className="studio-select"
                        style={{ fontSize: "11.5px", padding: "4px 8px", width: "auto" }}
                        value={item.status}
                        onChange={(e) => updateInquiryStatus(item.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="In progress">In progress</option>
                        <option value="Responded">Responded</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        {item.status !== "Closed" ? (
                          <button
                            type="button"
                            className="studio-btn-primary studio-btn-sm"
                            onClick={() => convertInquiryToProject(item.id)}
                          >
                            Accept & Create Project
                          </button>
                        ) : (
                          <span className="studio-badge studio-badge-solid" style={{ fontSize: "11px" }}>
                            Archived
                          </span>
                        )}

                        <button
                          type="button"
                          className="studio-btn-secondary studio-btn-sm"
                          style={{ padding: "4px 8px" }}
                          onClick={() => setDeleteTarget(item)}
                          title="Delete inquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Destructive Action Security Re-Authentication Modal */}
      <DestructiveActionModal
        isOpen={Boolean(deleteTarget)}
        title="Purge Client Inquiry"
        itemDescription={
          deleteTarget
            ? `Client inquiry from "${deleteTarget.clientName || deleteTarget.name || "Anonymous"}" (${deleteTarget.category || "General"}) will be permanently purged from the database.`
            : ""
        }
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteInquiry(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
