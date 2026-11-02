import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconPlus, IconClose, IconCalendar } from "../components/AdminIcons.jsx";

export default function AdminBookingsPage() {
  const { bookings, addBooking, cancelBooking, deleteBooking } = useAdmin();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [conflictWarning, setConflictWarning] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: "",
    client: "",
    location: "Bangalore",
    date: todayStr,
    time: "07:00 AM",
    crew: "Lead Photographer, 1 Assistant",
    equipment: "Sony A7IV, 24-70mm GM, Profoto B10X",
    status: "Confirmed",
  });

  const handleCreateBooking = (e) => {
    e.preventDefault();
    setConflictWarning("");

    // Double-booking check on same date and location
    const conflict = bookings.find(
      (b) => b.date === formData.date && b.status !== "Cancelled"
    );

    if (conflict) {
      setConflictWarning(
        `Warning: An active shoot ("${conflict.title}" for ${conflict.client}) is already scheduled on ${formData.date}. Proceed with caution.`
      );
    }

    addBooking({
      ...formData,
      dateFormatted: `${formData.date} · ${formData.time}`,
      thumbnail: "/images/dashboard/shoot-1.png",
    });

    if (!conflict) {
      setIsAddOpen(false);
      setFormData({
        title: "",
        client: "",
        location: "Bangalore",
        date: todayStr,
        time: "07:00 AM",
        crew: "Lead Photographer, 1 Assistant",
        equipment: "Sony A7IV, 24-70mm GM, Profoto B10X",
        status: "Confirmed",
      });
    }
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Shoot Calendar &amp; Schedule</h1>
          <p className="admin-page-desc">
            Production schedules, on-location call sheets, and gear allocations.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={() => {
            setConflictWarning("");
            setIsAddOpen(true);
          }}
        >
          <IconPlus size={13} />
          <span>Schedule Shoot</span>
        </button>
      </div>

      {/* Shoots Table or Clean Empty State */}
      {(bookings || []).length === 0 ? (
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
            No upcoming shoots scheduled
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
            Confirmed client sessions, on-location call times, and gear allocations will appear here on your production calendar.
          </p>
          <button
            type="button"
            className="admin-btn-black"
            onClick={() => {
              setConflictWarning("");
              setIsAddOpen(true);
            }}
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            <IconPlus size={13} />
            <span>+ Schedule First Shoot</span>
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shoot Title</th>
                <th>Client</th>
                <th>Date &amp; Call Time</th>
                <th>Location</th>
                <th>Crew</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={b.thumbnail || "/images/dashboard/shoot-1.png"}
                        alt={b.title}
                        style={{
                          width: "48px",
                          height: "30px",
                          borderRadius: "4px",
                          objectFit: "cover",
                          filter: "grayscale(100%)",
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>{b.title}</span>
                    </div>
                  </td>
                  <td>{b.client}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <IconCalendar size={13} style={{ color: "var(--admin-text-secondary)" }} />
                      <span>{b.dateFormatted || `${b.date} · ${b.time}`}</span>
                    </div>
                  </td>
                  <td>{b.location}</td>
                  <td style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    {b.crew || "Full Studio Crew"}
                  </td>
                  <td>
                    <span
                      className={`admin-status-pill ${
                        b.status === "Confirmed"
                          ? "admin-status-pill--confirmed"
                          : "admin-status-pill--progress"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => setSelectedBooking(b)}
                      >
                        Call Sheet
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Call Sheet / Shoot Modal */}
      {selectedBooking && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">{selectedBooking.title}</h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  {selectedBooking.client} &middot; {selectedBooking.location}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedBooking(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <strong>Call Date:</strong> {selectedBooking.date}
                </div>
                <div>
                  <strong>Call Time:</strong> {selectedBooking.time || "06:00 AM"}
                </div>
                <div>
                  <strong>Location:</strong> {selectedBooking.location}
                </div>
                <div>
                  <strong>Status:</strong> {selectedBooking.status}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Production Crew Assigned</label>
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FAFAF8",
                    border: "1px solid var(--admin-border-subtle)",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  {selectedBooking.crew || "Lead Cinematographer, Focus Puller, Sound Engineer"}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Equipment Kit Allocated</label>
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FAFAF8",
                    border: "1px solid var(--admin-border-subtle)",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  {selectedBooking.equipment || "Sony FX3 Cinema Line, G Master Primes, Aputure 600d, Wireless Lavalier"}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn"
                style={{ color: "#DC3545", borderColor: "#F5C6CB" }}
                onClick={() => {
                  cancelBooking(selectedBooking.id);
                  setSelectedBooking(null);
                }}
              >
                Cancel Shoot
              </button>
              <button
                type="button"
                className="admin-btn-black"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Shoot Modal */}
      {isAddOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Schedule New Shoot</h2>
              <button className="admin-modal-close" onClick={() => setIsAddOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="admin-modal-body">
                {conflictWarning && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      background: "rgba(234, 179, 8, 0.15)",
                      border: "1px solid rgba(234, 179, 8, 0.35)",
                      color: "#854D0E",
                      fontSize: "12px",
                    }}
                  >
                    {conflictWarning}
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-form-label">Shoot Title</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g. Coastal Lookbook Campaign"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Client</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      placeholder="e.g. Maya Sen"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Location</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      placeholder="e.g. Gokarna"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Shoot Date</label>
                    <input
                      type="date"
                      required
                      className="admin-form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Call Time</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      placeholder="e.g. 05:30 AM"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Crew Assignment</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 2 Cinematographers, 1 Gaffer"
                    value={formData.crew}
                    onChange={(e) => setFormData({ ...formData, crew: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Equipment Kit Checklist</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={2}
                    placeholder="e.g. RED Komodo, Primes, DJI Ronin RS3..."
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
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
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

