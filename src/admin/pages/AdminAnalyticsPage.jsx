import React from "react";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminAnalyticsPage() {
  const { stats } = useAdmin();

  const monthlyRevenueData = [
    { month: "May", revenue: "₹8.4L", height: 50 },
    { month: "Jun", revenue: "₹9.2L", height: 58 },
    { month: "Jul", revenue: "₹7.8L", height: 45 },
    { month: "Aug", revenue: "₹10.5L", height: 72 },
    { month: "Sep", revenue: "₹11.2L", height: 80 },
    { month: "Oct", revenue: "₹12.8L", height: 100 },
  ];

  const categoryShare = [
    { name: "Brand Campaigns", percentage: 35 },
    { name: "Editorial & Lookbooks", percentage: 30 },
    { name: "Documentary Weddings", percentage: 22 },
    { name: "Private Monographs", percentage: 13 },
  ];

  const topLocations = [
    { city: "Bangalore (Studio & Urban)", percentage: 44 },
    { city: "Gokarna & Malpe Coast", percentage: 26 },
    { city: "Mumbai & Western Ghats", percentage: 18 },
    { city: "Goa & Heritage Locations", percentage: 12 },
  ];

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Analytics &amp; Performance</h1>
          <p className="admin-page-desc">
            Revenue trends, lead conversion benchmarks, and production throughput.
          </p>
        </div>
      </div>

      {/* Top 3 Metric Highlight Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "8px" }}>
        <div className="admin-card">
          <span className="admin-stat-label">Total Monthly Revenue</span>
          <div className="admin-stat-number" style={{ fontSize: "36px" }}>
            {stats.monthlyRevenue || "₹12.8L"}
          </div>
          <span className="admin-stat-trend">+27% vs previous month</span>
        </div>

        <div className="admin-card">
          <span className="admin-stat-label">Inquiry to Booking Rate</span>
          <div className="admin-stat-number" style={{ fontSize: "36px" }}>
            38.4%
          </div>
          <span className="admin-stat-trend">+5.2% industry average</span>
        </div>

        <div className="admin-card">
          <span className="admin-stat-label">Average Project Investment</span>
          <div className="admin-stat-number" style={{ fontSize: "36px" }}>
            ₹1,65,000
          </div>
          <span className="admin-stat-trend">Across all 4 tiers</span>
        </div>
      </div>

      {/* 2-Column Section: Revenue Bar Chart & Category Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        {/* Revenue Growth Bar Chart */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>Revenue Trajectory (Last 6 Months)</h3>
            <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>INR in Lakhs</span>
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
                    height: `${d.height * 1.6}px`,
                    background: d.month === "Oct" ? "#151515" : "#D4D2CD",
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
        </div>
      </div>

      {/* Top Production Locations */}
      <div className="admin-card">
        <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "0 0 18px" }}>Primary Production Destinations</h3>
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
      </div>
    </div>
  );
}

