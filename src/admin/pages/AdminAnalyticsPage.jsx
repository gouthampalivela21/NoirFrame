import React, { useMemo } from "react";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminAnalyticsPage() {
  const { stats, projects = [], inquiries = [], bookings = [], clients = [] } = useAdmin();

  // 1. Calculate Revenue from actual projects
  const { totalRevNum, formattedRevenue, avgInvestment } = useMemo(() => {
    let sum = 0;
    let count = 0;
    projects.forEach((p) => {
      const num = typeof p.budget === "number"
        ? p.budget
        : parseInt(String(p.budget || "").replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num) && num > 0) {
        sum += num;
        count += 1;
      }
    });

    const formatted = sum > 0
      ? sum >= 100000
        ? `₹${(sum / 100000).toFixed(1)}L`
        : `₹${sum.toLocaleString("en-IN")}`
      : "₹0";

    const avg = count > 0 ? Math.round(sum / count) : 0;
    const formattedAvg = avg > 0 ? `₹${avg.toLocaleString("en-IN")}` : "—";

    return { totalRevNum: sum, formattedRevenue: formatted, avgInvestment: formattedAvg };
  }, [projects]);

  // 2. Conversion rate
  const conversionRate = useMemo(() => {
    if (!inquiries.length) return "—";
    const converted = clients.length;
    return `${Math.min(100, Math.round((converted / inquiries.length) * 100))}%`;
  }, [inquiries.length, clients.length]);

  // 3. Category distribution computed dynamically from projects & inquiries
  const categoryShare = useMemo(() => {
    const counts = {};
    let total = 0;

    projects.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
        total += 1;
      }
    });

    inquiries.forEach((i) => {
      if (i.category) {
        counts[i.category] = (counts[i.category] || 0) + 1;
        total += 1;
      }
    });

    if (total === 0) return [];

    return Object.entries(counts).map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100),
    }));
  }, [projects, inquiries]);

  // 4. Locations from bookings and inquiries
  const topLocations = useMemo(() => {
    const counts = {};
    let total = 0;

    bookings.forEach((b) => {
      if (b.location && b.location.trim()) {
        const loc = b.location.trim();
        counts[loc] = (counts[loc] || 0) + 1;
        total += 1;
      }
    });

    inquiries.forEach((i) => {
      if (i.location && i.location.trim() && !i.location.toLowerCase().includes("online")) {
        const loc = i.location.trim();
        counts[loc] = (counts[loc] || 0) + 1;
        total += 1;
      }
    });

    if (total === 0) return [];

    return Object.entries(counts).map(([city, count]) => ({
      city,
      percentage: Math.round((count / total) * 100),
    }));
  }, [bookings, inquiries]);

  // 5. Monthly Revenue trajectory
  const monthlyRevenueData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        revenueNum: 0,
      });
    }

    projects.forEach((p) => {
      const num = typeof p.budget === "number"
        ? p.budget
        : parseInt(String(p.budget || "").replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num) && num > 0) {
        const targetMonth = months[months.length - 1]; // Current month
        if (targetMonth) {
          targetMonth.revenueNum += num;
        }
      }
    });

    const maxRev = Math.max(...months.map((m) => m.revenueNum), 1);

    return months.map((m) => ({
      month: m.month,
      revenue: m.revenueNum > 0
        ? m.revenueNum >= 100000
          ? `₹${(m.revenueNum / 100000).toFixed(1)}L`
          : `₹${m.revenueNum.toLocaleString("en-IN")}`
        : "₹0",
      height: m.revenueNum > 0 ? Math.max(20, Math.round((m.revenueNum / maxRev) * 100)) : 10,
      isCurrent: m.monthIndex === now.getMonth(),
    }));
  }, [projects]);

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Analytics &amp; Performance</h1>
          <p className="admin-page-desc">
            Revenue trends, lead conversion benchmarks, and production throughput computed from actual records.
          </p>
        </div>
      </div>

      {/* Top 3 Metric Highlight Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "8px" }}>
        <div className="admin-card">
          <span className="admin-stat-label">Total Commissions Volume</span>
          <div className="admin-stat-number" style={{ fontSize: "36px" }}>
            {formattedRevenue}
          </div>
          <span className="admin-stat-trend">
            {totalRevNum > 0 ? "From active & completed projects" : "— No revenue recorded yet"}
          </span>
        </div>

        <div className="admin-card">
          <span className="admin-stat-label">Inquiry to Client Conversion</span>
          <div className="admin-stat-number" style={{ fontSize: "36px" }}>
            {conversionRate}
          </div>
          <span className="admin-stat-trend">
            {inquiries.length > 0 ? `${clients.length} of ${inquiries.length} leads converted` : "— Awaiting first inquiry"}
          </span>
        </div>

        <div className="admin-card">
          <span className="admin-stat-label">Average Project Investment</span>
          <div className="admin-stat-number" style={{ fontSize: "36px" }}>
            {avgInvestment}
          </div>
          <span className="admin-stat-trend">
            {totalRevNum > 0 ? "Average across commissioned projects" : "— Calculated upon project creation"}
          </span>
        </div>
      </div>

      {/* 2-Column Section: Revenue Bar Chart & Category Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        {/* Revenue Growth Bar Chart */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>Revenue Trajectory (Last 6 Months)</h3>
            <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>Live INR from Projects</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: "220px",
              padding: "10px 10px 0 10px",
              borderBottom: "1px solid var(--admin-border)",
            }}
          >
            {monthlyRevenueData.map((d) => (
              <div
                key={d.month}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--admin-text-primary)" }}>
                  {d.revenue}
                </span>
                <div
                  style={{
                    width: "36px",
                    height: `${d.height * 1.5}px`,
                    background: d.isCurrent ? "#151515" : "#D4D2CD",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                  }}
                />
                <span style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>
                  {d.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shoot Category Distribution */}
        <div className="admin-card">
          <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "0 0 20px" }}>Category Production Share</h3>
          {categoryShare.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
              No category data recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {categoryShare.map((cat) => (
                <div key={cat.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ color: "var(--admin-text-secondary)" }}>{cat.percentage}%</span>
                  </div>
                  <div style={{ height: "6px", background: "#EAE9E5", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        height: "100%",
                        background: "#151515",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Production Locations */}
      <div className="admin-card">
        <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "0 0 18px" }}>Primary Production Destinations</h3>
        {topLocations.length === 0 ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
            No shoot destination data logged yet. Locations from scheduled bookings and inquiries will appear here.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {topLocations.map((loc) => (
              <div
                key={loc.city}
                style={{
                  padding: "16px",
                  background: "#FAFAF8",
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border-subtle)",
                }}
              >
                <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "4px" }}>
                  {loc.city}
                </div>
                <div style={{ fontSize: "20px", fontFamily: "var(--admin-font-serif)", color: "var(--admin-text-primary)" }}>
                  {loc.percentage}% of shoots
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
