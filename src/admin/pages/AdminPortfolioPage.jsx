import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconPlus, IconClose } from "../components/AdminIcons.jsx";

export default function AdminPortfolioPage() {
  const { projects, updateProject, addProject } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    title: "",
    client: "",
    category: "Editorial",
    year: "2025",
    coverImage: "/images/dashboard/shoot-1.png",
    published: true,
  });

  const categories = ["All", "Editorial", "Monograph", "Campaign", "Wedding", "Lookbook"];

  const filteredItems = projects.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  const handleTogglePublish = (projId, current) => {
    updateProject(projId, { published: !current });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    addProject({
      ...newItem,
      stage: "Delivered",
      status: "Completed",
      progress: 100,
      budget: "₹2,50,000",
      deadline: "2025-10-31",
      deliverables: [{ title: "Monograph Master", done: true }],
    });

    setIsAddOpen(false);
    setNewItem({
      title: "",
      client: "",
      category: "Editorial",
      year: "2025",
      coverImage: "/images/dashboard/shoot-1.png",
      published: true,
    });
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Portfolio &amp; Public Showcase</h1>
          <p className="admin-page-desc">
            Curate monographs, campaigns, and film works visible on the public website.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={() => setIsAddOpen(true)}
        >
          <IconPlus size={13} />
          <span>Add Showcase</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="admin-filter-tabs" style={{ marginBottom: "24px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`admin-filter-pill ${selectedCategory === cat ? "is-active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {filteredItems.map((item) => {
          const isPublished = item.published !== false;
          return (
            <div
              key={item.id}
              className="admin-card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ position: "relative", height: "200px", background: "#111" }}>
                <img
                  src={item.coverImage || "/images/dashboard/shoot-1.png"}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "grayscale(100%)",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/dashboard/shoot-1.png";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: isPublished ? "rgba(0,0,0,0.75)" : "rgba(220,53,69,0.85)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 500,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {isPublished ? "Live on Site" : "Draft"}
                </span>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--admin-text-secondary)" }}>
                    {item.category}
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "2px 0 4px", color: "var(--admin-text-primary)" }}>
                    {item.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                    Client: {item.client}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--admin-border-subtle)",
                    paddingTop: "14px",
                    marginTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={() => handleTogglePublish(item.id, isPublished)}
                  >
                    {isPublished ? "Unpublish" : "Publish to Site"}
                  </button>

                  <a
                    href={`/project/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "12px", color: "var(--admin-text-secondary)", textDecoration: "none" }}
                  >
                    View Page ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Portfolio Modal */}
      {isAddOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add Portfolio Showcase</h2>
              <button className="admin-modal-close" onClick={() => setIsAddOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Project Title</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g. Monograph Vol. V"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Client / Subject</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      placeholder="e.g. Studio Editorial"
                      value={newItem.client}
                      onChange={(e) => setNewItem({ ...newItem, client: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-select"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                      <option value="Editorial">Editorial</option>
                      <option value="Monograph">Monograph</option>
                      <option value="Campaign">Campaign</option>
                      <option value="Lookbook">Lookbook</option>
                      <option value="Wedding">Wedding</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Cover Image URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newItem.coverImage}
                    onChange={(e) => setNewItem({ ...newItem, coverImage: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black">
                  Save Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

