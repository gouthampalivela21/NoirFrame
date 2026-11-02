import React from "react";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminStats() {
  const { stats } = useAdmin();

  const statItems = [
    {
      value: stats.totalInquiries ?? 128,
      label: "Total Inquiries",
      trend: stats.inquiriesTrend ?? "+12% ↗",
    },
    {
      value: stats.activeClients ?? 46,
      label: "Active Clients",
      trend: stats.clientsTrend ?? "+8% ↗",
    },
    {
      value: stats.ongoingProjects ?? 18,
      label: "Ongoing Projects",
      trend: stats.projectsTrend ?? "+20% ↗",
    },
    {
      value: stats.upcomingShoots ?? 6,
      label: "Upcoming Shoots",
      trend: stats.shootsTrend ?? "+50% ↗",
    },
    {
      value: stats.completedProjects ?? 92,
      label: "Completed Projects",
      trend: stats.completedTrend ?? "+14% ↗",
    },
    {
      value: stats.monthlyRevenue ?? "₹12.8L",
      label: "Monthly Revenue",
      trend: stats.revenueTrend ?? "+27% ↗",
    },
  ];

  return (
    <section className="admin-stats-grid" aria-label="Studio Statistics">
      {statItems.map((item, index) => (
        <div key={index} className="admin-stat-col">
          <div className="admin-stat-number">{item.value}</div>
          <div className="admin-stat-label">{item.label}</div>
          <div className="admin-stat-trend">{item.trend}</div>
        </div>
      ))}
    </section>
  );
}

