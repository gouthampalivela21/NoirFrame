import React from "react";
import { useAdmin } from "../context/AdminContext.jsx";

function extractStatValue(stat, fallback = 0) {
  if (stat === null || stat === undefined) return fallback;
  if (typeof stat === "object") return stat.value ?? fallback;
  return stat;
}

function extractStatTrend(stat, explicitTrend, fallback = "—") {
  if (explicitTrend) return explicitTrend;
  if (typeof stat === "object" && stat !== null) return stat.change ?? stat.trend ?? fallback;
  return fallback;
}

export default function AdminStats() {
  const { stats } = useAdmin();

  const statItems = [
    {
      value: extractStatValue(stats?.totalInquiries, 0),
      label: "Total Inquiries",
      trend: extractStatTrend(stats?.totalInquiries, stats?.inquiriesTrend, "—"),
    },
    {
      value: extractStatValue(stats?.activeClients, 0),
      label: "Active Clients",
      trend: extractStatTrend(stats?.activeClients, stats?.clientsTrend, "—"),
    },
    {
      value: extractStatValue(stats?.ongoingProjects, 0),
      label: "Ongoing Projects",
      trend: extractStatTrend(stats?.ongoingProjects, stats?.projectsTrend, "—"),
    },
    {
      value: extractStatValue(stats?.upcomingShoots, 0),
      label: "Upcoming Shoots",
      trend: extractStatTrend(stats?.upcomingShoots, stats?.shootsTrend, "—"),
    },
    {
      value: extractStatValue(stats?.completedProjects, 0),
      label: "Completed Projects",
      trend: extractStatTrend(stats?.completedProjects, stats?.completedTrend, "—"),
    },
    {
      value: extractStatValue(stats?.monthlyRevenue, "₹0"),
      label: "Monthly Revenue",
      trend: extractStatTrend(stats?.monthlyRevenue, stats?.revenueTrend, "—"),
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
