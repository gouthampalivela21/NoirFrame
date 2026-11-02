import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconSearch, IconPlus, IconClose } from "../components/AdminIcons.jsx";

const STAGES = [
  "Inquiry",
  "Consultation",
  "Planning",
  "Scheduled",
  "Shooting",
  "Editing",
  "Review",
  "Delivered",
  "Completed",
];

export default function AdminProjectsPage() {
  const { projects, updateProject, deleteProject } = useAdmin();
  const [activeStage, setActiveStage] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [newDeliverable, setNewDeliverable] = useState("");

  const filteredProjects = useMemo(() => {
    return (projects || [])
      .map((p) => ({
        ...p,
        stage: p.stage || p.status || "Planning",
        client: p.client || p.clientName || "Studio Client",
        budget: typeof p.budget === "number" ? `₹${p.budget.toLocaleString("en-IN")}` : p.budget || "—",
        deliverables: (p.deliverables || []).map((d) => ({
          ...d,
          done: d.done ?? d.completed ?? false,
        })),
      }))
      .filter((p) => {
        const matchStage = activeStage === "All" || (p.stage || "").toLowerCase() === activeStage.toLowerCase();
        const q = searchTerm.toLowerCase();
        const matchSearch =
          !searchTerm ||
          (p.title || "").toLowerCase().includes(q) ||
          (p.client || "").toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q));
        return matchStage && matchSearch;
      });
  }, [projects, activeStage, searchTerm]);

  const handleOpenNewProject = () => {
    window.dispatchEvent(new CustomEvent("admin:new-project"));
  };

  const handleToggleDeliverable = (projId, index) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const deliverables = [...(proj.deliverables || [])];
    deliverables[index] = {
      ...deliverables[index],
      done: !deliverables[index].done,
    };
    const completedCount = deliverables.filter((d) => d.done).length;
    const progress = Math.round((completedCount / deliverables.length) * 100);

    updateProject(projId, { deliverables, progress });
    setSelectedProject((prev) =>
      prev ? { ...prev, deliverables, progress } : null
    );
  };

  const handleAddDeliverable = (projId) => {
    if (!newDeliverable.trim()) return;
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    const deliverables = [
      ...(proj.deliverables || []),
      { title: newDeliverable.trim(), done: false },
    ];
    const completedCount = deliverables.filter((d) => d.done).length;
    const progress = Math.round((completedCount / deliverables.length) * 100);

    updateProject(projId, { deliverables, progress });
    setSelectedProject((prev) =>
      prev ? { ...prev, deliverables, progress } : null
    );
    setNewDeliverable("");
  };

  const handleStageChange = (projId, newStage) => {
    const status = newStage === "Completed" ? "Completed" : "In Progress";
    updateProject(projId, { stage: newStage, status });
    setSelectedProject((prev) =>
      prev ? { ...prev, stage: newStage, status } : null
    );
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Production Pipeline</h1>
          <p className="admin-page-desc">
            Track projects from initial consultation to production and post-processing delivery.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={handleOpenNewProject}
        >
          <IconPlus size={13} />
          <span>New Project</span>
        </button>
      </div>

      {/* Stage Tabs & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="admin-filter-tabs" style={{ flexWrap: "wrap" }}>
          {["All", ...STAGES].map((stg) => (
            <button
              key={stg}
              type="button"
              className={`admin-filter-pill ${activeStage === stg ? "is-active" : ""}`}
              onClick={() => setActiveStage(stg)}
            >
              {stg}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <IconSearch
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--admin-text-secondary)",
            }}
          />
          <input
            type="text"
            className="admin-form-input"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "34px", background: "#FFFFFF" }}
          />
        </div>
      </div>

      {/* Projects Grid or Clean Empty State */}
      {(projects || []).length === 0 ? (
        <div
          style={{
            padding: "54px 24px",
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px dashed var(--admin-border)",
            margin: "12px 0",
          }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--admin-text-primary)",
            }}
          >
            No active production projects
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "13px",
              color: "var(--admin-text-secondary)",
              maxWidth: "460px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Create a new studio project to begin tracking client deliverables, shoot milestones, and post-production phases.
          </p>
          <button
            type="button"
            className="admin-btn-black"
            onClick={handleOpenNewProject}
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            <IconPlus size={13} />
            <span>+ Create First Project</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredProjects.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "48px 0",
                textAlign: "center",
                color: "var(--admin-text-secondary)",
                background: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid var(--admin-border)",
              }}
            >
              No projects in &quot;{activeStage}&quot; stage.
            </div>
          ) : (
          filteredProjects.map((p) => {
            const deliverables = p.deliverables || [];
            const doneCount = deliverables.filter((d) => d.done).length;

            return (
              <div
                key={p.id}
                className="admin-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onClick={() => setSelectedProject(p)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.02)";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      className="admin-status-pill admin-status-pill--progress"
                      style={{ fontSize: "10.5px" }}
                    >
                      {p.stage}
                    </span>
                    <span style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)", fontWeight: 500 }}>
                      {p.budget}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "var(--admin-text-primary)",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {p.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)", marginBottom: "16px" }}>
                    {p.client} &middot; {p.category}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "var(--admin-text-secondary)",
                        marginBottom: "6px",
                      }}
                    >
                      <span>Progress</span>
                      <span>{p.progress || 0}%</span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "#EAE9E5",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${p.progress || 0}%`,
                          background: "#151515",
                          borderRadius: "999px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--admin-border-subtle)",
                    paddingTop: "12px",
                    fontSize: "11.5px",
                    color: "var(--admin-text-secondary)",
                  }}
                >
                  <span>
                    {doneCount} of {deliverables.length} Deliverables
                  </span>
                  <span>Due {p.deadline || "TBD"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Project Workflow Management Modal */}
      {selectedProject && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="admin-modal" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">{selectedProject.title}</h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                  {selectedProject.client} &middot; {selectedProject.category}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedProject(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Stage Transition Bar */}
              <div className="admin-form-group">
                <label className="admin-form-label">Workflow Stage</label>
                <select
                  className="admin-form-select"
                  value={selectedProject.stage}
                  onChange={(e) => handleStageChange(selectedProject.id, e.target.value)}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <strong>Budget:</strong> {selectedProject.budget}
                </div>
                <div>
                  <strong>Target Deadline:</strong> {selectedProject.deadline || "Unscheduled"}
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div className="admin-form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="admin-form-label">Deliverables Checklist</label>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                    {selectedProject.progress}% complete
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "6px 0 12px" }}>
                  {(selectedProject.deliverables || []).map((deliv, idx) => (
                    <label
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        background: deliv.done ? "#F4F3EE" : "#FFFFFF",
                        border: "1px solid var(--admin-border-subtle)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        textDecoration: deliv.done ? "line-through" : "none",
                        color: deliv.done ? "var(--admin-text-secondary)" : "var(--admin-text-primary)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={deliv.done}
                        onChange={() => handleToggleDeliverable(selectedProject.id, idx)}
                      />
                      <span>{deliv.title}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Add deliverable (e.g. 4K Master Film)..."
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDeliverable(selectedProject.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-black"
                    style={{ padding: "8px 14px", fontSize: "12px" }}
                    onClick={() => handleAddDeliverable(selectedProject.id)}
                  >
                    Add
                  </button>
                </div>
              </div>

              {selectedProject.notes && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Creative Brief / Notes</label>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#FAFAF8",
                      border: "1px solid var(--admin-border-subtle)",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                    }}
                  >
                    {selectedProject.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn"
                style={{ color: "#DC3545", borderColor: "#F5C6CB" }}
                onClick={() => {
                  deleteProject(selectedProject.id);
                  setSelectedProject(null);
                }}
              >
                Archive Project
              </button>
              <button
                type="button"
                className="admin-btn-black"
                onClick={() => setSelectedProject(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

