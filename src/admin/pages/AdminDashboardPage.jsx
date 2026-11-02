import React from "react";
import AdminHero from "../components/AdminHero.jsx";
import AdminStats from "../components/AdminStats.jsx";
import AdminRecentActivity from "../components/AdminRecentActivity.jsx";
import AdminUpcomingShoots from "../components/AdminUpcomingShoots.jsx";

export default function AdminDashboardPage() {
  return (
    <div className="admin-content">
      {/* 1. Hero Section (Greeting + Panorama + Date + New Project) */}
      <AdminHero />

      {/* 2. 6-Column Metrics Row */}
      <AdminStats />

      {/* 3. 2-Column Lower Section: Recent Activity (left) & Upcoming Shoots (right) */}
      <div className="admin-bottom-grid">
        <AdminRecentActivity />
        <AdminUpcomingShoots />
      </div>
    </div>
  );
}

