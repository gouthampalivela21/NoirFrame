import React from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";

export default function BookingsView() {
  const { bookings, setNewProjectModalOpen, isLoading } = useStudioAdmin();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>SCHEDULE & CALL SHEETS</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Shoot Calendar & Call Times
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Production call dates, on-location crew dispatches, and confirmed shooting slots.
          </p>
        </div>

        <button
          type="button"
          className="studio-btn-primary"
          onClick={() => setNewProjectModalOpen(true)}
        >
          <Plus size={14} />
          + Schedule Shoot
        </button>
      </div>

      <div className="studio-card">
        {isLoading ? (
          <AdminLoadingSkeleton rows={4} />
        ) : bookings.length === 0 ? (
          <AdminEmptyState
            icon={Calendar}
            title="No scheduled shoots on calendar"
            description="Commission a new shoot or schedule call times for booked projects to populate this production calendar."
            actionLabel="+ Schedule Shoot"
            onAction={() => setNewProjectModalOpen(true)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: "18px 20px",
                  background: "#FAF9F6",
                  border: "1px solid var(--studio-border-crisp)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      background: "#111111",
                      color: "#FFFFFF",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#A1A1AA" }}>
                      {b.date ? new Date(b.date).toLocaleDateString("en-US", { month: "short" }) : "TBD"}
                    </span>
                    <span style={{ fontSize: "18px", fontWeight: "700", lineHeight: 1 }}>
                      {b.date ? new Date(b.date).getDate() : "—"}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--studio-text-primary)", margin: 0 }}>
                      {b.shootName}
                    </h3>
                    <div style={{ fontSize: "12.5px", color: "var(--studio-text-muted)", marginTop: "3px" }}>
                      Client: <strong style={{ color: "var(--studio-text-primary)" }}>{b.client}</strong> · Call Time: <strong>{b.callTime || "09:00 AM"}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", fontSize: "12px", color: "var(--studio-text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <MapPin size={13} /> {b.location || "On Location"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="studio-badge studio-badge-solid">
                    {b.status || "Confirmed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
