import React from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

const STATUS_LIST = [
  { key: "New", label: "New", color: "#B45309", bg: "rgba(229, 169, 60, 0.12)" },
  { key: "In progress", label: "In progress", color: "#1D4ED8", bg: "rgba(59, 130, 246, 0.1)" },
  { key: "Responded", label: "Responded", color: "#047857", bg: "rgba(16, 185, 129, 0.1)" },
  { key: "Closed", label: "Closed", color: "#666666", bg: "#EFEFEA" },
];

const CATEGORIES_LIST = [
  "Portraits",
  "Couples",
  "Events",
  "Brands",
  "Commercial",
  "Editorial",
];

export default function AdminBookingSummary() {
  const { bookingsSummary, backendBookings, isBookingsLoading } = useAdmin();

  const total = bookingsSummary?.total || 0;
  const unread = bookingsSummary?.unread || 0;
  const recentUnread = (backendBookings || []).slice(0, 3);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--admin-border)",
        borderRadius: "12px",
        padding: "22px 24px",
        marginBottom: "28px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "18px",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--admin-border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2
            style={{
              fontFamily: "var(--admin-font-serif)",
              fontSize: "20px",
              fontWeight: 600,
              margin: 0,
              color: "var(--admin-text-primary)",
            }}
          >
            Booking Requests Overview
          </h2>
          {unread > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(229, 169, 60, 0.18)",
                color: "#925807",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: "999px",
              }}
            >
              <span className="admin-unread-dot" style={{ marginRight: 0 }} />
              {unread} Unread
            </span>
          )}
        </div>

        <Link
          to="/admin/inquiries"
          className="admin-btn-black"
          style={{ textDecoration: "none", fontSize: "12px", padding: "7px 14px" }}
        >
          Manage All Enquiries ({total}) &rarr;
        </Link>
      </div>

      {/* Status & Category Breakdown Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginBottom: recentUnread.length > 0 ? "20px" : "0",
        }}
      >
        {/* By Status */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--admin-text-secondary)",
              marginBottom: "10px",
            }}
          >
            Requests by Status
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
            {STATUS_LIST.map((st) => {
              const count = bookingsSummary?.byStatus?.[st.key] || 0;
              return (
                <Link
                  key={st.key}
                  to="/admin/inquiries"
                  style={{
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: st.bg,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 600, color: st.color }}>
                    {st.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--admin-font-serif)",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: st.color,
                    }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* By Category */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--admin-text-secondary)",
              marginBottom: "10px",
            }}
          >
            Requests by Photography Category
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {CATEGORIES_LIST.map((cat) => {
              const count = bookingsSummary?.byCategory?.[cat] || 0;
              return (
                <Link
                  key={cat}
                  to="/admin/inquiries"
                  style={{
                    textDecoration: "none",
                    padding: "9px 10px",
                    borderRadius: "8px",
                    background: "#FAFAF8",
                    border: "1px solid var(--admin-border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)", fontWeight: 500 }}>
                    {cat}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--admin-font-serif)",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: count > 0 ? "var(--admin-text-primary)" : "var(--admin-text-muted)",
                    }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Latest Incoming Requests Preview */}
      {isBookingsLoading && total === 0 ? (
        <div style={{ fontSize: "12.5px", color: "var(--admin-text-secondary)", padding: "8px 0" }}>
          Syncing latest enquiries...
        </div>
      ) : recentUnread.length > 0 ? (
        <div style={{ borderTop: "1px solid var(--admin-border-subtle)", paddingTop: "14px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--admin-text-secondary)",
              marginBottom: "8px",
            }}
          >
            Latest Incoming Briefs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {recentUnread.map((req) => (
              <Link
                key={req.id}
                to="/admin/inquiries"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: req.isRead === false ? "rgba(229, 169, 60, 0.06)" : "#FAFAF8",
                  border: "1px solid var(--admin-border-subtle)",
                  color: "var(--admin-text-primary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {req.isRead === false && <span className="admin-unread-dot" style={{ marginRight: 0 }} />}
                  <strong style={{ fontSize: "13px" }}>{req.contact?.name || req.clientName}</strong>
                  <span className="admin-category-badge">{req.category}</span>
                  <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    {req.schedule?.location || req.location}
                  </span>
                </div>
                <span style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>
                  {req.status || "New"} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
