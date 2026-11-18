import React, { useState, useMemo, useEffect } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconSearch, IconPlus, IconClose } from "../components/AdminIcons.jsx";
import { CATEGORIES_CONFIG } from "../../data/bookingQuestions.js";

const STATUS_OPTIONS = ["New", "In progress", "Responded", "Closed"];
const CATEGORY_OPTIONS = [
  "All",
  "Portraits",
  "Couples",
  "Events",
  "Brands",
  "Commercial",
  "Editorial",
];

function formatDate(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

function timeAgo(isoStr) {
  if (!isoStr) return "";
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function AdminInquiriesPage() {
  const {
    backendBookings,
    bookingsSummary,
    isBookingsLoading,
    bookingsError,
    fetchBookings,
    updateBookingStatus,
    toggleBookingRead,
    addBookingNote,
    removeBooking,
    convertInquiryToClient,
    permissions,
    token,
  } = useAdmin();

  const canEdit = Boolean(permissions?.canEditInquiries);

  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep selected inquiry state synced if backend list updates
  useEffect(() => {
    if (selectedInquiry) {
      const refreshed = backendBookings.find((b) => b.id === selectedInquiry.id);
      if (refreshed) {
        setSelectedInquiry(refreshed);
      }
    }
  }, [backendBookings]);

  // Client-side filtering & sorting
  const filteredBookings = useMemo(() => {
    return (backendBookings || [])
      .filter((inq) => {
        // Status filter
        const status = (inq.status || "New").toLowerCase();
        let matchStatus = true;
        if (activeStatus !== "All") {
          matchStatus = status === activeStatus.toLowerCase();
        }

        // Category filter
        let matchCategory = true;
        if (activeCategory !== "All") {
          const cat = (inq.category || "").toLowerCase();
          matchCategory = cat === activeCategory.toLowerCase();
        }

        // Search filter
        const q = searchTerm.toLowerCase().trim();
        let matchSearch = true;
        if (q) {
          const name = (inq.contact?.name || inq.clientName || "").toLowerCase();
          const email = (inq.contact?.email || inq.email || "").toLowerCase();
          const phone = (inq.contact?.phone || inq.phone || "").toLowerCase();
          const org = (inq.contact?.organization || "").toLowerCase();
          const loc = (inq.schedule?.location || inq.location || "").toLowerCase();
          const cat = (inq.category || "").toLowerCase();
          const sub = (inq.subCategory || "").toLowerCase();
          const msg = (inq.clientMessage || inq.message || "").toLowerCase();

          matchSearch =
            name.includes(q) ||
            email.includes(q) ||
            phone.includes(q) ||
            org.includes(q) ||
            loc.includes(q) ||
            cat.includes(q) ||
            sub.includes(q) ||
            msg.includes(q);
        }

        return matchStatus && matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "name") {
          const nameA = a.contact?.name || a.clientName || "";
          const nameB = b.contact?.name || b.clientName || "";
          return nameA.localeCompare(nameB);
        }
        if (sortBy === "status") {
          return (a.status || "").localeCompare(b.status || "");
        }
        // default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [backendBookings, activeStatus, activeCategory, searchTerm, sortBy]);

  const handleOpenDetail = (inq) => {
    setSelectedInquiry(inq);
    // Automatically mark as read when opened (only for roles with edit permission)
    if (canEdit && inq.isRead === false) {
      toggleBookingRead(inq.id, true);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings({
      status: activeStatus,
      category: activeCategory,
      search: searchTerm,
      sort: sortBy,
    });
    setIsRefreshing(false);
  };

  const handleAddNote = async (id) => {
    if (!newNote.trim()) return;
    const added = await addBookingNote(id, newNote);
    if (added) {
      setNewNote("");
    }
  };

  const handleConvert = (inquiry) => {
    if (typeof convertInquiryToClient === "function") {
      convertInquiryToClient(inquiry.id);
    }
    updateBookingStatus(inquiry.id, "Responded");
  };

  // Helper to render category-specific brief questions with real questions titles
  const renderBriefQuestions = (inq) => {
    const rawCat = (inq.category || "portraits").toLowerCase().trim();
    const config = CATEGORIES_CONFIG[rawCat] || CATEGORIES_CONFIG.portraits;
    const briefAnswers = inq.brief || {};

    if (!briefAnswers || Object.keys(briefAnswers).length === 0) {
      return (
        <div style={{ fontSize: "13px", color: "var(--admin-text-secondary)" }}>
          Standard commission inquiry submitted.
        </div>
      );
    }

    return (
      <div className="admin-qa-grid">
        {Object.entries(briefAnswers).map(([qId, answer]) => {
          const questionDef = config.questions?.find((q) => q.id === qId);
          const questionLabel = questionDef ? questionDef.label : qId;
          const displayAnswer = Array.isArray(answer) ? answer.join(", ") : String(answer || "—");

          return (
            <div key={qId} className="admin-qa-card">
              <div className="admin-qa-question">{questionLabel}</div>
              <div className="admin-qa-answer">{displayAnswer}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const getStatusPillClass = (status) => {
    const s = (status || "New").toLowerCase();
    if (s === "new") return "admin-status-pill--new";
    if (s === "in progress") return "admin-status-pill--in-progress";
    if (s === "responded" || s === "confirmed") return "admin-status-pill--responded";
    return "admin-status-pill--closed";
  };

  return (
    <div className="admin-content">
      {/* ------------------------------------------------------------------
          PAGE HEADER
          ------------------------------------------------------------------ */}
      <div className="admin-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 className="admin-page-title">Client Enquiries &amp; Bookings</h1>
            {!canEdit && (
              <span
                style={{
                  background: "rgba(107, 114, 128, 0.14)",
                  color: "#4B5563",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: "999px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Read-Only (Viewer)
              </span>
            )}
            {bookingsSummary.unread > 0 && (
              <span
                style={{
                  background: "#E5A93C",
                  color: "#151515",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  letterSpacing: "0.04em",
                }}
              >
                {bookingsSummary.unread} UNREAD
              </span>
            )}
          </div>
          <p className="admin-page-desc">
            Direct creative commissions and project briefs for Portraits, Couples, Events, Brands, Commercial, and Editorial.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-action-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isBookingsLoading}
            style={{ fontSize: "12px", padding: "8px 14px", background: "#FFFFFF" }}
          >
            {isRefreshing || isBookingsLoading ? "Syncing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          01. DASHBOARD SUMMARY: COUNTS BY STATUS & CATEGORY
          ------------------------------------------------------------------ */}
      <div className="admin-summary-grid">
        <div
          className={`admin-summary-card ${activeStatus === "All" && activeCategory === "All" ? "is-active" : ""}`}
          onClick={() => {
            setActiveStatus("All");
            setActiveCategory("All");
          }}
        >
          <span className="admin-summary-label">Total Commissions</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val">{bookingsSummary.total || 0}</span>
            <span className="admin-summary-sub">All-time</span>
          </div>
        </div>

        <div
          className={`admin-summary-card ${activeStatus === "New" ? "is-active" : ""}`}
          onClick={() => setActiveStatus(activeStatus === "New" ? "All" : "New")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="admin-summary-label">New / Pending</span>
            {bookingsSummary.unread > 0 && <span className="admin-unread-dot" />}
          </div>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#B45309" }}>
              {bookingsSummary.byStatus?.New || 0}
            </span>
            <span className="admin-summary-sub">
              {bookingsSummary.unread || 0} unread
            </span>
          </div>
        </div>

        <div
          className={`admin-summary-card ${activeStatus === "In progress" ? "is-active" : ""}`}
          onClick={() => setActiveStatus(activeStatus === "In progress" ? "All" : "In progress")}
        >
          <span className="admin-summary-label">In Progress</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#1D4ED8" }}>
              {bookingsSummary.byStatus?.["In progress"] || 0}
            </span>
            <span className="admin-summary-sub">Active scope</span>
          </div>
        </div>

        <div
          className={`admin-summary-card ${activeStatus === "Responded" ? "is-active" : ""}`}
          onClick={() => setActiveStatus(activeStatus === "Responded" ? "All" : "Responded")}
        >
          <span className="admin-summary-label">Responded</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#047857" }}>
              {bookingsSummary.byStatus?.Responded || 0}
            </span>
            <span className="admin-summary-sub">Proposal sent</span>
          </div>
        </div>

        <div
          className={`admin-summary-card ${activeStatus === "Closed" ? "is-active" : ""}`}
          onClick={() => setActiveStatus(activeStatus === "Closed" ? "All" : "Closed")}
        >
          <span className="admin-summary-label">Closed</span>
          <div className="admin-summary-val-wrap">
            <span className="admin-summary-val" style={{ color: "#666666" }}>
              {bookingsSummary.byStatus?.Closed || 0}
            </span>
            <span className="admin-summary-sub">Archived</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          02. CATEGORY BREAKDOWN PILLS
          ------------------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "18px",
          background: "#FFFFFF",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid var(--admin-border-subtle)",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", marginRight: 6 }}>
          Category:
        </span>
        {CATEGORY_OPTIONS.map((cat) => {
          const count = cat === "All" ? bookingsSummary.total : bookingsSummary.byCategory?.[cat] || 0;
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`admin-filter-pill ${isSelected ? "is-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              style={{ fontSize: "11.5px", padding: "5px 12px" }}
            >
              {cat} {count > 0 && <span style={{ opacity: 0.65, marginLeft: 4 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------
          03. FILTER, SEARCH & SORT CONTROLS
          ------------------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        {/* Status Tabs */}
        <div className="admin-filter-tabs">
          {["All", ...STATUS_OPTIONS].map((tab) => {
            const isTabActive = activeStatus === tab;
            const tabCount =
              tab === "All"
                ? bookingsSummary.total
                : bookingsSummary.byStatus?.[tab] || 0;

            return (
              <button
                key={tab}
                type="button"
                className={`admin-filter-pill ${isTabActive ? "is-active" : ""}`}
                onClick={() => setActiveStatus(tab)}
              >
                {tab}
                {tabCount > 0 && (
                  <span style={{ marginLeft: 6, fontSize: "10px", opacity: 0.75 }}>
                    {tabCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "240px" }}>
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
              placeholder="Search by client, email, brief..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "34px", background: "#FFFFFF", height: 36, fontSize: "12.5px" }}
            />
          </div>

          {/* Sort Dropdown */}
          <select
            className="admin-form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "auto", height: 36, fontSize: "12px", background: "#FFFFFF" }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="name">Sort: Client Name (A–Z)</option>
            <option value="status">Sort: By Status</option>
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          04. INQUIRIES DATA TABLE
          ------------------------------------------------------------------ */}
      {bookingsError && (
        <div
          style={{
            padding: "14px 18px",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
            color: "#991B1B",
            fontSize: "13px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{bookingsError}</span>
          <button
            type="button"
            onClick={handleManualRefresh}
            style={{ background: "transparent", border: "none", color: "#991B1B", fontWeight: 600, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {isBookingsLoading && backendBookings.length === 0 ? (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid var(--admin-border)",
          }}
        >
          <div style={{ fontSize: "14px", color: "var(--admin-text-secondary)", letterSpacing: "0.04em" }}>
            Loading incoming client enquiries from studio database...
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px dashed var(--admin-border)",
            margin: "12px 0",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>✧</div>
          <h3
            style={{
              margin: "0 0 6px",
              fontFamily: "var(--admin-font-serif)",
              fontSize: "20px",
              fontWeight: 500,
              color: "var(--admin-text-primary)",
            }}
          >
            {searchTerm || activeStatus !== "All" || activeCategory !== "All"
              ? "No booking requests match your filters"
              : "No booking requests received yet"}
          </h3>
          <p
            style={{
              margin: "0 auto",
              fontSize: "13px",
              color: "var(--admin-text-secondary)",
              maxWidth: "460px",
              lineHeight: "1.6",
            }}
          >
            {searchTerm || activeStatus !== "All" || activeCategory !== "All"
              ? "Try adjusting your search terms or clearing status and category filters."
              : "When patrons commission sessions through the public creative brief forms, their complete project briefs will appear here automatically."}
          </p>
          {(searchTerm || activeStatus !== "All" || activeCategory !== "All") && (
            <button
              type="button"
              className="admin-action-btn"
              onClick={() => {
                setActiveStatus("All");
                setActiveCategory("All");
                setSearchTerm("");
              }}
              style={{ marginTop: "16px", background: "#FFFFFF" }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-table-wrap" style={{ background: "#FFFFFF", borderRadius: "10px", border: "1px solid var(--admin-border)" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 28, paddingRight: 0 }}></th>
                <th>Client / Patron</th>
                <th>Category</th>
                <th>Target Timing &amp; Venue</th>
                <th>Submission Time</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((inq) => {
                const isUnread = inq.isRead === false;
                const contactName = inq.contact?.name || inq.clientName || "Anonymous Patron";
                const contactEmail = inq.contact?.email || inq.email || "—";
                const org = inq.contact?.organization;
                const location = inq.schedule?.location || inq.location || "Studio Consultation";
                const timing =
                  inq.schedule?.dateType === "specific" && inq.schedule?.specificDate
                    ? inq.schedule.specificDate
                    : inq.schedule?.flexibleTimeframe || inq.preferredDate || "Flexible";

                return (
                  <tr
                    key={inq.id}
                    style={{
                      background: isUnread ? "rgba(229, 169, 60, 0.04)" : "transparent",
                    }}
                  >
                    {/* Unread Indicator Dot */}
                    <td style={{ width: 28, paddingRight: 0, verticalAlign: "middle" }}>
                      {isUnread && (
                        <span
                          className="admin-unread-dot"
                          title="Unread booking request"
                        />
                      )}
                    </td>

                    {/* Client Information */}
                    <td>
                      <div style={{ fontWeight: isUnread ? 700 : 600, fontSize: "13.5px", color: "var(--admin-text-primary)" }}>
                        {contactName}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>
                        {contactEmail}
                        {org && <span> &middot; {org}</span>}
                      </div>
                    </td>

                    {/* Photography Category */}
                    <td>
                      <span className="admin-category-badge">
                        {inq.category || "Portraits"}
                      </span>
                      {inq.subCategory && (
                        <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: 2, maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {inq.subCategory}
                        </div>
                      )}
                    </td>

                    {/* Timing & Location */}
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: 500 }}>{timing}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>
                        {location}
                      </div>
                    </td>

                    {/* Time Ago / Date */}
                    <td>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-primary)" }}>
                        {timeAgo(inq.createdAt)}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--admin-text-muted)" }}>
                        {formatDate(inq.createdAt)}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span className={`admin-status-pill ${getStatusPillClass(inq.status)}`}>
                        {inq.status || "New"}
                      </span>
                      {inq.lastEditedBy?.name && (
                        <div style={{ fontSize: "10.5px", color: "var(--admin-text-muted)", marginTop: 3 }}>
                          By {inq.lastEditedBy.name}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => handleOpenDetail(inq)}
                          style={{
                            background: isUnread ? "#151515" : "#FFFFFF",
                            color: isUnread ? "#FFFFFF" : "var(--admin-text-primary)",
                            borderColor: isUnread ? "#151515" : "var(--admin-border)",
                            fontWeight: 600,
                          }}
                        >
                          {canEdit ? "Review Brief" : "View Brief"}
                        </button>

                        {canEdit && (
                          <button
                            type="button"
                            className="admin-action-btn"
                            title={isUnread ? "Mark as Read" : "Mark as Unread"}
                            onClick={() => toggleBookingRead(inq.id, !isUnread)}
                            style={{ padding: "6px 8px", fontSize: "11px" }}
                          >
                            {isUnread ? "✓ Read" : "● Unread"}
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
      )}

      {/* ------------------------------------------------------------------
          05. FULL DETAILS MODAL / DRAWER
          ------------------------------------------------------------------ */}
      {selectedInquiry && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedInquiry(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-modal-header" style={{ paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span className="admin-category-badge">{selectedInquiry.category}</span>
                  <span className={`admin-status-pill ${getStatusPillClass(selectedInquiry.status)}`}>
                    {selectedInquiry.status}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                    Submitted {timeAgo(selectedInquiry.createdAt)} ({formatDate(selectedInquiry.createdAt)})
                  </span>
                </div>
                <h2 className="admin-modal-title" style={{ fontSize: "22px" }}>
                  {selectedInquiry.contact?.name || selectedInquiry.clientName}
                </h2>
                {selectedInquiry.contact?.organization && (
                  <div style={{ fontSize: "12.5px", color: "var(--admin-text-secondary)" }}>
                    {selectedInquiry.contact.organization}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedInquiry(null)}
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="admin-modal-body" style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
              {/* Status Switcher Bar */}
              <div
                style={{
                  background: "#F4F3EE",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: selectedInquiry.lastEditedBy ? "8px" : "20px",
                }}
              >
                <span style={{ fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--admin-text-secondary)" }}>
                  Workflow Status {!canEdit && "(Read-Only)"}:
                </span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {STATUS_OPTIONS.map((st) => {
                    const isCur = (selectedInquiry.status || "New").toLowerCase() === st.toLowerCase();
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={!canEdit}
                        onClick={async () => {
                          if (!canEdit) return;
                          const res = await updateBookingStatus(selectedInquiry.id, st);
                          if (res?.success && res.booking) {
                            setSelectedInquiry(res.booking);
                          }
                        }}
                        style={{
                          fontSize: "11px",
                          fontWeight: isCur ? 700 : 500,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: isCur ? "1px solid #151515" : "1px solid #DEDDD9",
                          background: isCur ? "#151515" : "#FFFFFF",
                          color: isCur ? "#FFFFFF" : "var(--admin-text-primary)",
                          cursor: canEdit ? "pointer" : "not-allowed",
                          opacity: !canEdit && !isCur ? 0.55 : 1,
                        }}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedInquiry.lastEditedBy && (
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "var(--admin-text-secondary)",
                    marginBottom: "18px",
                    paddingLeft: "4px",
                  }}
                >
                  Last updated by <strong>{selectedInquiry.lastEditedBy.name}</strong> ({selectedInquiry.lastEditedBy.role})
                  {selectedInquiry.lastEditedAt ? ` · ${formatDate(selectedInquiry.lastEditedAt)}` : ""}
                </div>
              )}

              {/* Client Contact Details */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                  Client Contact Information
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    background: "#FAFAF8",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>EMAIL</span>
                    <a
                      href={`mailto:${selectedInquiry.contact?.email || selectedInquiry.email}`}
                      style={{ color: "#151515", fontWeight: 600, textDecoration: "underline" }}
                    >
                      {selectedInquiry.contact?.email || selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>PHONE / WHATSAPP</span>
                    <a
                      href={`tel:${selectedInquiry.contact?.phone || selectedInquiry.phone || ""}`}
                      style={{ color: "#151515", fontWeight: 600 }}
                    >
                      {selectedInquiry.contact?.phone || selectedInquiry.phone || "—"}
                    </a>
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>PREFERRED CONTACT CHANNEL</span>
                    <strong>{selectedInquiry.contact?.preferredChannel || "Email"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>COMMISSION SCOPE</span>
                    <strong>{selectedInquiry.budget || "Bespoke Creative Brief"}</strong>
                  </div>
                </div>
              </div>

              {/* Schedule & Location */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                  Target Timing &amp; Location
                </h4>
                <div
                  style={{
                    background: "#FAFAF8",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    fontSize: "13px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>DATE PREFERENCE</span>
                    <strong>
                      {selectedInquiry.schedule?.dateType === "specific" && selectedInquiry.schedule?.specificDate
                        ? selectedInquiry.schedule.specificDate
                        : selectedInquiry.schedule?.flexibleTimeframe || selectedInquiry.preferredDate || "Flexible"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>LOCATION / VENUE</span>
                    <strong>{selectedInquiry.schedule?.location || selectedInquiry.location || "Studio Consultation"}</strong>
                  </div>
                  {selectedInquiry.schedule?.productionNotes && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span style={{ color: "var(--admin-text-muted)", fontSize: "11px", display: "block" }}>PRODUCTION CONSIDERATIONS</span>
                      <span>{selectedInquiry.schedule.productionNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category-Specific Project Brief Answers */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                  {selectedInquiry.category} Questionnaire Answers
                </h4>
                {renderBriefQuestions(selectedInquiry)}
              </div>

              {/* References Links & Private Attachments */}
              {(selectedInquiry.references?.links?.length > 0 || selectedInquiry.references?.files?.length > 0) && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                    Inspiration References &amp; Uploaded Files
                  </h4>
                  <div
                    style={{
                      background: "#FAFAF8",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid var(--admin-border-subtle)",
                    }}
                  >
                    {/* Links */}
                    {selectedInquiry.references?.links?.length > 0 && (
                      <div style={{ marginBottom: selectedInquiry.references?.files?.length > 0 ? "14px" : "0" }}>
                        <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", display: "block", marginBottom: 6 }}>
                          INSPIRATION LINKS
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {selectedInquiry.references.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.startsWith("http") ? link : `https://${link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#151515",
                                textDecoration: "underline",
                                fontSize: "12.5px",
                                wordBreak: "break-all",
                              }}
                            >
                              ↗ {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Private Authenticated File Attachments */}
                    {selectedInquiry.references?.files?.length > 0 && (
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", display: "block", marginBottom: 6 }}>
                          CLIENT UPLOADED ATTACHMENTS (SECURE &amp; PRIVATE)
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {selectedInquiry.references.files.map((file, idx) => {
                            const downloadUrl = file.url
                              ? `${file.url}?token=${encodeURIComponent(token || "")}`
                              : file.previewUrl || "#";

                            return (
                              <a
                                key={idx}
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-file-attachment"
                                download={file.name}
                              >
                                <span>📄</span>
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: 600 }}>{file.name}</div>
                                  <div style={{ fontSize: "10.5px", color: "var(--admin-text-muted)" }}>{file.size} &middot; Private</div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Client Message / Compiled Brief */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                  Compiled Client Message
                </h4>
                <div
                  style={{
                    padding: "14px",
                    background: "#FAFAF8",
                    border: "1px solid var(--admin-border-subtle)",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-line",
                    fontFamily: "var(--admin-font-sans)",
                    color: "var(--admin-text-primary)",
                  }}
                >
                  {selectedInquiry.clientMessage || selectedInquiry.message || "No client notes provided."}
                </div>
              </div>

              {/* Internal Studio Notes */}
              <div>
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                  Internal Studio Notes
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {(selectedInquiry.notes || []).length === 0 ? (
                    <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontStyle: "italic" }}>
                      No internal studio notes yet.
                    </div>
                  ) : (
                    (selectedInquiry.notes || []).map((n, idx) => {
                      const noteAuthor = typeof n === "object" ? n.author : "Studio Admin";
                      const noteRole = typeof n === "object" && n.authorRole ? ` (${n.authorRole})` : "";
                      const noteText = typeof n === "object" ? n.text : String(n);
                      const noteTime = typeof n === "object" && n.createdAt ? formatDate(n.createdAt) : "";

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 12px",
                            background: "#F4F3EE",
                            borderRadius: "6px",
                            fontSize: "12.5px",
                            lineHeight: "1.5",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                            <strong>{noteAuthor}{noteRole}</strong>
                            {noteTime && <span>{noteTime}</span>}
                          </div>
                          <div>{noteText}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                {canEdit && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Log an internal consultation note..."
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
                      Add Note
                    </button>
                  </div>
                )}
              </div>

              {/* Activity & Audit Trail */}
              <div style={{ marginTop: "22px" }}>
                <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--admin-text-secondary)", margin: "0 0 10px 0" }}>
                  Audit History &amp; Activity Log
                </h4>
                {(selectedInquiry.auditLog || []).length === 0 ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#FAFAF8",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No status changes or edits recorded yet.
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#FAFAF8",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {(selectedInquiry.auditLog || []).map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                          fontSize: "12px",
                          paddingBottom: "8px",
                          borderBottom: "1px solid var(--admin-border-subtle)",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--admin-text-primary)", fontWeight: 500 }}>
                            {entry.summary}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--admin-text-secondary)", marginTop: 2 }}>
                            <strong>{entry.actor?.name || "System"}</strong>
                            {entry.actor?.role && ` · ${entry.actor.role}`}
                            {entry.actor?.email && ` (${entry.actor.email})`}
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", whiteSpace: "nowrap" }}>
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="admin-modal-footer" style={{ borderTop: "1px solid var(--admin-border)" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {canEdit ? (
                  <button
                    type="button"
                    className="admin-action-btn"
                    style={{ color: "#DC2626", borderColor: "#FCA5A5" }}
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete this booking request?")) {
                        removeBooking(selectedInquiry.id);
                        setSelectedInquiry(null);
                      }
                    }}
                  >
                    Delete Request
                  </button>
                ) : (
                  <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
                    Viewer mode: read-only access
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={`mailto:${selectedInquiry.contact?.email || selectedInquiry.email}?subject=${encodeURIComponent(`Phantom Labs: ${selectedInquiry.category} Commission Brief`)}`}
                  className="admin-action-btn"
                  style={{ background: "#FFFFFF" }}
                >
                  ✉ Email Client
                </a>

                {selectedInquiry.contact?.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${selectedInquiry.contact.name || ""}, thank you for your ${selectedInquiry.category} inquiry with Phantom Labs.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-action-btn"
                    style={{ background: "#FFFFFF", color: "#059669", borderColor: "#A7F3D0" }}
                  >
                    💬 WhatsApp
                  </a>
                )}

                {canEdit && (
                  <button
                    type="button"
                    className="admin-btn-black"
                    onClick={() => handleConvert(selectedInquiry)}
                  >
                    Convert to Client &amp; Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
