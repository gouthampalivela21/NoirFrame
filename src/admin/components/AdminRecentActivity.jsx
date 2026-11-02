import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext.jsx";

const TABS = ["All", "Inquiries", "Projects", "Bookings", "Payments"];

export default function AdminRecentActivity() {
  const { activities } = useAdmin();
  const [activeTab, setActiveTab] = useState("All");

  const activityList = Array.isArray(activities) ? activities : [];

  const filteredActivities = useMemo(() => {
    if (activeTab === "All") return activityList;
    const tabLower = activeTab.toLowerCase();
    return activityList.filter((act) => {
      const type = (act.type || "").toLowerCase();
      if (tabLower === "inquiries") return type === "inquiry" || type === "inquiries";
      if (tabLower === "projects") return type === "project" || type === "projects";
      if (tabLower === "bookings") return type === "booking" || type === "bookings";
      if (tabLower === "payments") return type === "payment" || type === "payments";
      return true;
    });
  }, [activityList, activeTab]);

  const getPillClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("new")) return "admin-status-pill--new";
    if (s.includes("progress")) return "admin-status-pill--progress";
    if (s.includes("confirm")) return "admin-status-pill--confirmed";
    if (s.includes("paid")) return "admin-status-pill--paid";
    if (s.includes("client")) return "admin-status-pill--client";
    return "";
  };

  return (
    <div className="admin-section-block">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Recent Activity</h2>

        {/* Filter Tabs */}
        <div className="admin-filter-tabs">
          {TABS.map((tab) => (
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
      </div>

      {/* Activity List */}
      <div className="admin-activity-list">
        {activityList.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              background: "#FFFFFF",
              borderRadius: "10px",
              border: "1px dashed var(--admin-border)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--admin-text-primary)",
              }}
            >
              No recent activity recorded
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "12.5px",
                color: "var(--admin-text-secondary)",
              }}
            >
              Incoming website inquiries, confirmed shoots, and client updates will appear here automatically.
            </p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ padding: "30px 0", color: "var(--admin-text-secondary)", fontSize: "13px", textAlign: "center" }}>
            No recent activity found for &ldquo;{activeTab}&rdquo;.
          </div>
        ) : (
          filteredActivities.map((act) => {
            const headline = act.headline || act.title || "Studio Event";
            const sub = act.subText || act.details || "";
            const time = act.timeAgo || act.timestamp || "";
            const status = act.status || act.statusBadge || "New";

            return (
              <div key={act.id} className="admin-activity-item">
                <div className="admin-activity-left">
                  <img
                    src={act.thumbnail || "/images/dashboard/act-1.png"}
                    alt={headline}
                    className="admin-activity-thumb"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/dashboard/act-1.png";
                    }}
                  />
                  <div className="admin-activity-info">
                    <span className="admin-activity-headline">{headline}</span>
                    <span className="admin-activity-sub">{sub}</span>
                  </div>
                </div>

                <div className="admin-activity-right">
                  <span className="admin-activity-time">{time}</span>
                  <span className={`admin-status-pill ${getPillClass(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
