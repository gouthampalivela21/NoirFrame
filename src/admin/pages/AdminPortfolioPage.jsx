import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";
import { IconPlus, IconClose } from "../components/AdminIcons.jsx";

export default function AdminPortfolioPage() {
  const { portfolioItems = [], updatePortfolioItem, addPortfolioItem, deletePortfolioItem } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [newItem, setNewItem] = useState({
    title: "",
    category: "Portraits",
    tagline: "",
    description: "",
    coverImage: "",
    year: "2026",
    published: true,
  });

  const categories = ["All", "Portraits", "Couples", "Events", "Brands", "Editorial"];

  const filteredItems = (portfolioItems || []).filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  const handleTogglePublish = (itemId, currentPublished) => {
    updatePortfolioItem(itemId, { published: !currentPublished });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    const id = `story-${Date.now().toString().slice(-4)}`;
    addPortfolioItem({
      ...newItem,
      id,
      image: newItem.coverImage || "/images/dashboard/shoot-1.png",
      images: [newItem.coverImage || "/images/dashboard/shoot-1.png"],
      published: true,
    });

    setIsAddOpen(false);
    setNewItem({
      title: "",
      category: "Portraits",
      tagline: "",
      description: "",
      coverImage: "",
      year: "2026",
      published: true,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    updatePortfolioItem(editingItem.id, {
      title: editingItem.title,
      category: editingItem.category,
      tagline: editingItem.tagline,
      description: editingItem.description,
      image: editingItem.coverImage || editingItem.image,
      published: editingItem.published,
    });

    setEditingItem(null);
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Portfolio &amp; Public Showcase</h1>
          <p className="admin-page-desc">
            Curate photographs and photographic studies visible on the public website.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-black"
          onClick={() => setIsAddOpen(true)}
        >
          <IconPlus size={13} />
          <span>Add Study</span>
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

      {/* Portfolio Grid or Clean Empty State */}
      {(portfolioItems || []).length === 0 ? (
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
            No portfolio studies found
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
            Publish monographs, studio portraits, and campaign series to showcase your work on the public website.
          </p>
          <button
            type="button"
            className="admin-btn-black"
            onClick={() => setIsAddOpen(true)}
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            <IconPlus size={13} />
            <span>+ Add First Study</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredItems.map((item) => {
            const isPublished = item.published !== false;
            const cover =
              item.image ||
              item.coverImage ||
              (Array.isArray(item.images) && typeof item.images[0] === "string" ? item.images[0] : item.images?.[0]?.src) ||
              "/images/dashboard/shoot-1.png";

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
                <div style={{ position: "relative", height: "220px", background: "#111" }}>
                  <img
                    src={cover}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
                    {isPublished ? "Live on Site" : "Unpublished / Draft"}
                  </span>
                </div>

                <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--admin-text-secondary)",
                      }}
                    >
                      {item.category}
                    </div>
                    <h3
                      style={{
                        fontSize: "17px",
                        fontWeight: 600,
                        margin: "3px 0 6px",
                        color: "var(--admin-text-primary)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--admin-text-secondary)",
                        margin: 0,
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.tagline || item.subtitle || item.description || ""}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--admin-border-subtle)",
                      paddingTop: "14px",
                      marginTop: "12px",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => handleTogglePublish(item.id, isPublished)}
                      >
                        {isPublished ? "Unpublish" : "Publish to Site"}
                      </button>

                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() =>
                          setEditingItem({
                            ...item,
                            coverImage: cover,
                            published: isPublished,
                          })
                        }
                      >
                        Edit
                      </button>
                    </div>

                    <Link
                      to={`/project/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "var(--admin-text-secondary)",
                        textDecoration: "none",
                      }}
                    >
                      View ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Portfolio Modal */}
      {editingItem && (
        <div className="admin-modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit Study Details</h2>
              <button className="admin-modal-close" onClick={() => setEditingItem(null)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Study Title</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-select"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    >
                      <option value="Portraits">Portraits</option>
                      <option value="Couples">Couples</option>
                      <option value="Events">Events</option>
                      <option value="Brands">Brands</option>
                      <option value="Editorial">Editorial</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Visibility</label>
                    <select
                      className="admin-form-select"
                      value={editingItem.published ? "published" : "draft"}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          published: e.target.value === "published",
                        })
                      }
                    >
                      <option value="published">Published (Visible on site)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tagline (Editorial Quote)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingItem.tagline || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Cover Image Path / URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingItem.coverImage || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, coverImage: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-black">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Portfolio Modal */}
      {isAddOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add Photographic Study</h2>
              <button className="admin-modal-close" onClick={() => setIsAddOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Study Title</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    placeholder="e.g. The Seventh Study — Golden Hour"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-select"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                      <option value="Portraits">Portraits</option>
                      <option value="Couples">Couples</option>
                      <option value="Events">Events</option>
                      <option value="Brands">Brands</option>
                      <option value="Editorial">Editorial</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Year</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newItem.year}
                      onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tagline (Editorial Quote)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Whispers in the stillness of dusk."
                    value={newItem.tagline}
                    onChange={(e) => setNewItem({ ...newItem, tagline: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    placeholder="Write a brief background regarding the study..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Cover Image Path / URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="/images/portfolio/study-01.jpg"
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
                  Publish Study
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
