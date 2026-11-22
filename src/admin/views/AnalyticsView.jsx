import React from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";

export default function AnalyticsView() {
  const {
    monthlyRevenueHistory,
    categoryDistribution,
    kpiStats,
    isLoading,
  } = useStudioAdmin();

  if (isLoading) {
    return <AdminLoadingSkeleton rows={4} type="cards" />;
  }

  const maxCollected = Math.max(
    ...monthlyRevenueHistory.map((item) => item.collected),
    100000
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>METRICS & PERFORMANCE</div>
        <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
          Studio Performance & Revenue Trajectory
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
          Real-time financial metrics, genre revenue contribution, and inquiry conversion rates.
        </p>
      </div>

      {/* Top 3 Dynamic Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
        <div className="studio-card">
          <span className="studio-eyebrow">TOTAL COLLECTED REVENUE</span>
          <div className="studio-metric-value" style={{ marginTop: "8px" }}>
            {formatINR(kpiStats.totalRevenue)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--studio-text-muted)", marginTop: "4px" }}>
            Total cash settlements recorded to date
          </div>
        </div>

        <div className="studio-card">
          <span className="studio-eyebrow">INQUIRY CONVERSION RATE</span>
          <div className="studio-metric-value" style={{ marginTop: "8px" }}>
            {kpiStats.conversionRate}
          </div>
          <div style={{ fontSize: "12px", color: "var(--studio-text-muted)", marginTop: "4px" }}>
            From received creative briefs to signed commissions
          </div>
        </div>

        <div className="studio-card">
          <span className="studio-eyebrow">AVERAGE COMMISSION VALUE</span>
          <div className="studio-metric-value" style={{ marginTop: "8px" }}>
            {formatINR(kpiStats.averageCommission)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--studio-text-muted)", marginTop: "4px" }}>
            Average quote across active commissions
          </div>
        </div>
      </div>

      {/* Dynamic Revenue Trajectory Bar Chart */}
      <div className="studio-card">
        <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111111" }}>
          6-Month Invoicing & Cash Collections (₹ INR)
        </h3>

        {kpiStats.totalRevenue === 0 ? (
          <AdminEmptyState
            icon={TrendingUp}
            title="No revenue logged yet"
            description="Milestone payments logged against commissions will populate this trajectory chart."
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "14px",
              height: "180px",
              paddingTop: "20px",
              borderBottom: "1px solid var(--studio-border-crisp)",
              paddingBottom: "10px",
            }}
          >
            {monthlyRevenueHistory.map((item) => {
              const heightPct = Math.round((item.collected / maxCollected) * 100);
              return (
                <div
                  key={item.month}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    className="studio-mono"
                    style={{ fontSize: "10px", color: "var(--studio-text-muted)" }}
                  >
                    {item.collected > 0 ? `${Math.round(item.collected / 1000)}k` : "₹0"}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(item.collected > 0 ? heightPct : 4, 4)}%`,
                      backgroundColor: item.collected > 0 ? "#111111" : "#E5E5EA",
                      borderRadius: "4px 4px 0 0",
                      minHeight: "4px",
                    }}
                    title={`${item.month}: ${formatINR(item.collected)}`}
                  />
                  <span
                    style={{
                      fontSize: "10.5px",
                      color: "var(--studio-text-muted)",
                      fontFamily: "var(--studio-font-mono)",
                    }}
                  >
                    {item.month.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Category Revenue Contribution */}
      <div className="studio-card">
        <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111111" }}>
          Revenue Contribution by Photography Stream
        </h3>

        {categoryDistribution.every((c) => c.revenue === 0) ? (
          <div style={{ padding: "16px 0", textAlign: "center", color: "var(--studio-text-muted)", fontSize: "13px" }}>
            No project commissions recorded across streams yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {categoryDistribution.map((cat) => (
              <div key={cat.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#111111" }}>
                    {cat.name}
                  </span>
                  <div style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                    <span className="studio-mono" style={{ fontSize: "12.5px" }}>
                      {formatINR(cat.revenue)}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--studio-text-muted)", width: "32px", textAlign: "right" }}>
                      {cat.share}%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#FAF9F6",
                    borderRadius: "3px",
                    overflow: "hidden",
                    border: "1px solid var(--studio-border-crisp)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cat.share}%`,
                      backgroundColor: "#111111",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
