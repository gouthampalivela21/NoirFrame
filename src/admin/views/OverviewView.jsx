import React from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import { useAdminAuth } from "../auth/AdminAuthContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import AdminErrorState from "../components/AdminErrorState.jsx";
import {
  Calendar,
  Plus,
  Camera,
  FolderOpen,
  Receipt,
  TrendingUp,
} from "lucide-react";

export default function OverviewView() {
  const {
    kpiStats,
    projects,
    invoices,
    monthlyRevenueHistory,
    filterInquiriesByStatus,
    filterInquiriesByCategory,
    setActiveView,
    setNewProjectModalOpen,
    setNewInvoiceModalOpen,
    setLogPaymentModalOpen,
    setPaymentTargetProject,
    updateProjectStage,
    isLoading,
    error,
    refreshData,
  } = useStudioAdmin();

  const { user } = useAdminAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    const displayName = user?.displayName?.trim() || "";
    const firstName = displayName
      ? displayName.split(" ")[0]
      : (user?.email ? user.email.split("@")[0] : "Founder");
    return `${timeOfDay}, ${firstName}.`;
  };

  const handleOpenPayment = (proj) => {
    setPaymentTargetProject(proj);
    setLogPaymentModalOpen(true);
  };

  const activeProjects = projects.filter((p) => p.stage !== "Delivered");

  if (error) {
    return <AdminErrorState message={error} onRetry={refreshData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ====================================================================
          A. EDITORIAL GREETING & HEADER
          ==================================================================== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>
            STUDIO DASHBOARD
          </div>
          <h1 className="studio-serif" style={{ fontSize: "32px", color: "var(--studio-text-primary)", margin: 0, lineHeight: 1.15 }}>
            {getGreeting()}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Live overview of active commissions, client briefs, and production revenue.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="studio-date-pill">
            <Calendar size={14} style={{ color: "var(--studio-text-muted)" }} />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <button
            type="button"
            className="studio-btn-primary"
            onClick={() => setNewProjectModalOpen(true)}
          >
            <Plus size={14} />
            New Project
          </button>
        </div>
      </div>

      {/* ====================================================================
          6-COLUMN KPI STRIP SEPARATED BY CLEAN VERTICAL HAIRLINES
          ==================================================================== */}
      {isLoading ? (
        <AdminLoadingSkeleton type="metrics" />
      ) : (
        <div className="studio-metrics-strip">
          <div className="studio-metric-col">
            <span className="studio-eyebrow">TOTAL INQUIRIES</span>
            <div className="studio-metric-value">{kpiStats.totalInquiries}</div>
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>Pipeline requests</span>
          </div>

          <div className="studio-metric-col">
            <span className="studio-eyebrow">ACTIVE CLIENTS</span>
            <div className="studio-metric-value">{kpiStats.activeClients}</div>
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>Registered patrons</span>
          </div>

          <div className="studio-metric-col">
            <span className="studio-eyebrow">ONGOING PROJECTS</span>
            <div className="studio-metric-value">{kpiStats.ongoingProjects}</div>
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>In production</span>
          </div>

          <div className="studio-metric-col">
            <span className="studio-eyebrow">UPCOMING SHOOTS</span>
            <div className="studio-metric-value">{kpiStats.upcomingShoots}</div>
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>On calendar</span>
          </div>

          <div className="studio-metric-col">
            <span className="studio-eyebrow">COMPLETED PROJECTS</span>
            <div className="studio-metric-value">{kpiStats.completedProjects}</div>
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>Delivered archives</span>
          </div>

          <div className="studio-metric-col">
            <span className="studio-eyebrow">MONTHLY REVENUE</span>
            <div className="studio-metric-value" style={{ fontSize: "26px" }}>
              {formatINR(kpiStats.monthlyRevenue)}
            </div>
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>Collected this month</span>
          </div>
        </div>
      )}

      {/* ====================================================================
          B. BOOKING REQUESTS OVERVIEW CARD (SPLIT 2x2 STATUS & 3x2 CATEGORY)
          ==================================================================== */}
      <div className="studio-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "18px",
            borderBottom: "1px solid var(--studio-border-crisp)",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 className="studio-serif" style={{ fontSize: "20px", margin: 0, color: "var(--studio-text-primary)" }}>
              Booking Requests Overview
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--studio-text-muted)", margin: "3px 0 0 0" }}>
              Live distribution of client requests across current operational stages and photography genres
            </p>
          </div>

          <button
            type="button"
            className="studio-btn-primary studio-btn-sm"
            onClick={() => setActiveView("inquiries")}
          >
            Manage All Enquiries ({kpiStats.totalInquiries}) →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "28px" }}>
          {/* LEFT HALF — REQUESTS BY STATUS (2x2 Grid) */}
          <div>
            <div className="studio-eyebrow" style={{ marginBottom: "12px" }}>
              REQUESTS BY STATUS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[
                { status: "New", count: kpiStats.statusCounts["New"], desc: "Requires initial review" },
                { status: "In progress", count: kpiStats.statusCounts["In progress"], desc: "Creative consultation" },
                { status: "Responded", count: kpiStats.statusCounts["Responded"], desc: "Proposal delivered" },
                { status: "Closed", count: kpiStats.statusCounts["Closed"], desc: "Commissioned or archived" },
              ].map((item) => (
                <div
                  key={item.status}
                  onClick={() => filterInquiriesByStatus(item.status)}
                  style={{
                    padding: "16px",
                    background: "#FAF9F6",
                    border: "1px solid var(--studio-border-crisp)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F2ED";
                    e.currentTarget.style.borderColor = "#D1D1D6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAF9F6";
                    e.currentTarget.style.borderColor = "var(--studio-border-crisp)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--studio-text-primary)" }}>
                      {item.status}
                    </span>
                    <span className="studio-serif" style={{ fontSize: "24px", color: "var(--studio-text-primary)", fontWeight: "600" }}>
                      {item.count}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--studio-text-muted)", marginTop: "4px" }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT HALF — REQUESTS BY PHOTOGRAPHY CATEGORY (3x2 Grid) */}
          <div>
            <div className="studio-eyebrow" style={{ marginBottom: "12px" }}>
              REQUESTS BY PHOTOGRAPHY CATEGORY
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                { cat: "Portraits", count: kpiStats.categoryCounts["Portraits"] },
                { cat: "Couples", count: kpiStats.categoryCounts["Couples"] },
                { cat: "Events", count: kpiStats.categoryCounts["Events"] },
                { cat: "Brands", count: kpiStats.categoryCounts["Brands"] },
                { cat: "Commercial", count: kpiStats.categoryCounts["Commercial"] },
                { cat: "Editorial", count: kpiStats.categoryCounts["Editorial"] },
              ].map((item) => (
                <div
                  key={item.cat}
                  onClick={() => filterInquiriesByCategory(item.cat)}
                  style={{
                    padding: "14px 16px",
                    background: "#FFFFFF",
                    border: "1px solid var(--studio-border-crisp)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAF9F6";
                    e.currentTarget.style.borderColor = "#111111";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.borderColor = "var(--studio-border-crisp)";
                  }}
                >
                  <div style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--studio-text-secondary)" }}>
                    {item.cat}
                  </div>
                  <div className="studio-serif" style={{ fontSize: "22px", color: "var(--studio-text-primary)", fontWeight: "600", marginTop: "4px" }}>
                    {item.count}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--studio-text-muted)" }}>
                    Enquiries
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          C. PROJECTS & REVENUE TRACKING SECTION
          ==================================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        {/* ACTIVE PROJECTS & SHOOTS TABLE */}
        <div className="studio-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 className="studio-serif" style={{ fontSize: "18px", margin: 0, color: "var(--studio-text-primary)" }}>
                Active Commissions & Production Pipeline
              </h3>
              <p style={{ fontSize: "12px", color: "var(--studio-text-muted)", margin: "2px 0 0 0" }}>
                Current shoots, editing status, quotes & client balances
              </p>
            </div>

            <button
              type="button"
              className="studio-btn-secondary studio-btn-sm"
              onClick={() => setActiveView("projects")}
            >
              All Projects ({projects.length}) →
            </button>
          </div>

          {isLoading ? (
            <AdminLoadingSkeleton rows={3} />
          ) : activeProjects.length === 0 ? (
            <AdminEmptyState
              icon={FolderOpen}
              title="No active commissions"
              description="There are currently no active shoots in production."
              actionLabel="Create First Project"
              onAction={() => setNewProjectModalOpen(true)}
            />
          ) : (
            <div className="studio-table-container">
              <table className="studio-table">
                <thead>
                  <tr>
                    <th>Shoot / Client</th>
                    <th>Genre</th>
                    <th>Date</th>
                    <th>Production Stage</th>
                    <th>Quote & Balance</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProjects.slice(0, 4).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: "600", color: "var(--studio-text-primary)" }}>{p.name}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--studio-text-muted)" }}>{p.client}</div>
                      </td>

                      <td>
                        <span className="studio-badge studio-badge-subtle">{p.category}</span>
                      </td>

                      <td className="studio-mono" style={{ fontSize: "12px" }}>
                        {p.shootDate}
                      </td>

                      <td>
                        <select
                          className="studio-select"
                          style={{ fontSize: "11px", padding: "3px 6px", width: "auto" }}
                          value={p.stage}
                          onChange={(e) => updateProjectStage(p.id, e.target.value)}
                        >
                          <option value="Pre-Production">Pre-Production</option>
                          <option value="Shoot Done">Shoot Done</option>
                          <option value="Editing/Grading">Editing/Grading</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>

                      <td>
                        <div className="studio-mono" style={{ fontWeight: "600", color: "var(--studio-text-primary)" }}>
                          {formatINR(p.quote)}
                        </div>
                        <div style={{ fontSize: "11px", color: p.due > 0 ? "#111111" : "var(--studio-text-muted)" }}>
                          Due: {formatINR(p.due)}
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {p.due > 0 ? (
                          <button
                            type="button"
                            className="studio-btn-primary studio-btn-sm"
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            onClick={() => handleOpenPayment(p)}
                          >
                            Log Payment
                          </button>
                        ) : (
                          <span className="studio-badge studio-badge-solid" style={{ fontSize: "10.5px" }}>
                            ✓ Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* REVENUE & INVOICING TRACKER */}
        <div className="studio-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 className="studio-serif" style={{ fontSize: "18px", margin: 0, color: "var(--studio-text-primary)" }}>
                Monthly Invoicing & Collections
              </h3>
              <p style={{ fontSize: "12px", color: "var(--studio-text-muted)", margin: "2px 0 0 0" }}>
                Recent client milestone settlements
              </p>
            </div>

            <button
              type="button"
              className="studio-btn-secondary studio-btn-sm"
              onClick={() => setNewInvoiceModalOpen(true)}
            >
              + Issue Invoice
            </button>
          </div>

          {/* Simple Clean Bar Chart Representation */}
          <div style={{ padding: "14px", background: "#FAF9F6", borderRadius: "8px", border: "1px solid var(--studio-border-crisp)", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
              <span className="studio-eyebrow">REVENUE TRAJECTORY (LAST 6 MONTHS)</span>
              <span className="studio-mono" style={{ fontSize: "13px", fontWeight: "600", color: "#111111" }}>
                {formatINR(kpiStats.monthlyRevenue)}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "80px", paddingTop: "8px" }}>
              {monthlyRevenueHistory.map((item) => {
                const maxVal = Math.max(...monthlyRevenueHistory.map((m) => m.collected), 100000);
                const heightPct = Math.round((item.collected / maxVal) * 100);
                return (
                  <div key={item.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(item.collected > 0 ? heightPct : 4, 4)}%`,
                        backgroundColor: item.collected > 0 ? "#111111" : "#E5E5EA",
                        borderRadius: "3px 3px 0 0",
                        minHeight: "4px",
                      }}
                      title={`${item.month}: ${formatINR(item.collected)}`}
                    />
                    <span style={{ fontSize: "10px", color: "var(--studio-text-muted)", fontFamily: "var(--studio-font-mono)" }}>
                      {item.month.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice status list */}
          {invoices.length === 0 ? (
            <div style={{ padding: "16px 0", textAlign: "center", color: "var(--studio-text-muted)", fontSize: "12px" }}>
              No client invoices issued yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {invoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    padding: "10px 12px",
                    background: "#FFFFFF",
                    border: "1px solid var(--studio-border-crisp)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--studio-text-primary)" }}>
                      {inv.client}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>
                      {inv.id} · Due {inv.dueDate}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="studio-mono" style={{ fontSize: "13px", fontWeight: "600" }}>
                      {formatINR(inv.amount)}
                    </span>
                    <span
                      className={`studio-badge ${
                        inv.status === "Paid"
                          ? "studio-badge-solid"
                          : inv.status === "Overdue"
                          ? "studio-badge-overdue"
                          : "studio-badge-subtle"
                      }`}
                      style={{ fontSize: "10px" }}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
