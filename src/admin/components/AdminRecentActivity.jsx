import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext.jsx";

const TABS = ["All", "Inquiries", "Projects", "Bookings", "Payments"];

export default function AdminRecentActivity() {
  const { activities } = useAdmin();
  const [activeTab, setActiveTab] = useState("All");

  const filteredActivities = useMemo(() => {
    if (activeTab === "All") return activities;
    const tabLower = activeTab.toLowerCase();
    return activities.filter((act) => {
      const type = (act.type || "").toLowerCase();
      if (tabLower === "inquiries") return type === "inquiry" || type === "inquiries";
      if (tabLower === "projects") return type === "project" || type === "projects";
      if (tabLower === "bookings") return type === "booking" || type === "bookings";
      if (tabLower === "payments") return type === "payment" || type === "payments";
      return true;
    });
  }, [activities, activeTab]);

  const getPillClass = (status) => {
    const s = (status || "").toLowerCase();
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
        {filteredActivities.length === 0 ? (
          <div style={{ padding: "30px 0", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
            No recent activity found for {activeTab}.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div key={act.id} className="admin-activity-item">
              <div className="admin-activity-left">
                <img
                  src={act.thumbnail || "/images/dashboard/act-1.png"}
                  alt={act.headline}
                  className="admin-activity-thumb"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/images/dashboard/act-1.png";
                  }}
                />
                <div className="admin-activity-info">
                  <span className="admin-activity-headline">{act.headline}</span>
                  <span className="admin-activity-sub">{act.subText}</span>
                </div>
              </div>

              <div className="admin-activity-right">
                <span className="admin-activity-time">{act.timeAgo}</span>
                <span className={`admin-status-pill ${getPillClass(act.status)}`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

