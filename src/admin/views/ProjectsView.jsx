import React, { useState } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import DestructiveActionModal from "../components/DestructiveActionModal.jsx";
import { Plus, Camera, Search, Trash2, FolderOpen } from "lucide-react";

export default function ProjectsView() {
  const {
    projects,
    setNewProjectModalOpen,
    setLogPaymentModalOpen,
    setPaymentTargetProject,
    updateProjectStage,
    deleteProject,
    isLoading,
  } = useStudioAdmin();

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deleteTargetProj, setDeleteTargetProj] = useState(null);

  const filtered = projects.filter((p) => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (stageFilter !== "All" && p.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.client || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenPayment = (proj) => {
    setPaymentTargetProject(proj);
    setLogPaymentModalOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>COMMISSIONS & PRODUCTIONS</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Active Projects & Shoots Pipeline
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Production pipeline across Pre-Production, Shoot Wrap, Editing/Grading, and Final Delivery.
          </p>
        </div>

        <button
          type="button"
          className="studio-btn-primary"
          onClick={() => setNewProjectModalOpen(true)}
        >
          <Plus size={14} />
          + New Shoot Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="studio-card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["All", "Pre-Production", "Shoot Done", "Editing/Grading", "Delivered"].map((stg) => (
              <button
                key={stg}
                type="button"
                className={`studio-btn-sm ${stageFilter === stg ? "studio-btn-primary" : "studio-btn-secondary"}`}
                onClick={() => setStageFilter(stg)}
              >
                {stg} {stg === "All" ? `(${projects.length})` : `(${projects.filter((p) => p.stage === stg).length})`}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="studio-select studio-btn-sm"
              style={{ width: "auto" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Portraits">Portraits</option>
              <option value="Couples">Couples</option>
              <option value="Events">Events</option>
              <option value="Brands">Brands</option>
              <option value="Commercial">Commercial</option>
              <option value="Editorial">Editorial</option>
            </select>

            <input
              type="text"
              className="studio-input studio-btn-sm"
              style={{ width: "200px" }}
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="studio-card">
        {isLoading ? (
          <AdminLoadingSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={FolderOpen}
            title={projects.length === 0 ? "No project commissions yet" : "No matching projects"}
            description={
              projects.length === 0
                ? "Start a new shoot commission or convert an incoming client inquiry to track production and balances."
                : "No projects match the selected filter criteria."
            }
            actionLabel={projects.length === 0 ? "+ Create Commission" : undefined}
            onAction={projects.length === 0 ? () => setNewProjectModalOpen(true) : undefined}
          />
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Shoot / Commission</th>
                  <th>Genre</th>
                  <th>Target Shoot Date</th>
                  <th>Production Stage</th>
                  <th>Financial Quote</th>
                  <th>Paid & Balance</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => (
                  <tr key={proj.id}>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--studio-text-primary)", fontSize: "14px" }}>
                        {proj.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--studio-text-muted)", marginTop: "2px" }}>
                        Client: <strong>{proj.client}</strong> · {proj.location}
                      </div>
                    </td>

                    <td>
                      <span className="studio-badge studio-badge-subtle">{proj.category}</span>
                    </td>

                    <td className="studio-mono" style={{ fontSize: "12.5px" }}>
                      {proj.shootDate}
                    </td>

                    <td>
                      <select
                        className="studio-select"
                        style={{ fontSize: "12px", padding: "4px 8px", width: "auto" }}
                        value={proj.stage}
                        onChange={(e) => updateProjectStage(proj.id, e.target.value)}
                      >
                        <option value="Pre-Production">Pre-Production</option>
                        <option value="Shoot Done">Shoot Done</option>
                        <option value="Editing/Grading">Editing/Grading</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    <td>
                      <span className="studio-mono" style={{ fontSize: "13.5px", fontWeight: "600" }}>
                        {formatINR(proj.quote)}
                      </span>
                    </td>

                    <td>
                      <div className="studio-mono" style={{ fontSize: "12.5px", color: "var(--studio-text-secondary)" }}>
                        Paid: {formatINR(proj.paid)}
                      </div>
                      <div
                        className="studio-mono"
                        style={{
                          fontSize: "12.5px",
                          fontWeight: proj.due > 0 ? "600" : "normal",
                          color: proj.due > 0 ? "#111111" : "var(--studio-text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        Due: {formatINR(proj.due)}
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        {proj.due > 0 ? (
                          <button
                            type="button"
                            className="studio-btn-primary studio-btn-sm"
                            onClick={() => handleOpenPayment(proj)}
                          >
                            Log Payment
                          </button>
                        ) : (
                          <span className="studio-badge studio-badge-solid" style={{ fontSize: "11px" }}>
                            ✓ Paid in Full
                          </span>
                        )}

                        <button
                          type="button"
                          className="studio-btn-secondary studio-btn-sm"
                          style={{ padding: "4px 8px" }}
                          onClick={() => setDeleteTargetProj(proj)}
                          title="Delete commission"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Destructive Action Modal */}
      <DestructiveActionModal
        isOpen={Boolean(deleteTargetProj)}
        title="Purge Shoot Project"
        itemDescription={
          deleteTargetProj
            ? `Production shoot "${deleteTargetProj.name}" for client "${deleteTargetProj.client}" will be permanently removed.`
            : ""
        }
        onConfirm={async () => {
          if (deleteTargetProj) {
            await deleteProject(deleteTargetProj.id);
            setDeleteTargetProj(null);
          }
        }}
        onCancel={() => setDeleteTargetProj(null)}
      />
    </div>
  );
}
