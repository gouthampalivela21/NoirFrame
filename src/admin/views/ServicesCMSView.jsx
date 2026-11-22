import React, { useState, useEffect } from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import ImageUploadControl from "../components/ImageUploadControl.jsx";
import { Save, Plus, Trash2, Layers, Check } from "lucide-react";

export default function ServicesCMSView() {
  const { cmsData, updateCMSJourneys, saveCMSChanges, isLoading } = useStudioAdmin();
  const [journeys, setJourneys] = useState(
    cmsData.journeys || { headline: "Journeys & Commissions.", subtitle: "", packages: [] }
  );

  useEffect(() => {
    if (cmsData.journeys) {
      setJourneys(cmsData.journeys);
    }
  }, [cmsData.journeys]);

  const handleHeadlineChange = (field, val) => {
    const updated = { ...journeys, [field]: val };
    setJourneys(updated);
    updateCMSJourneys(updated);
  };

  const handlePackageUpdate = (idx, field, val) => {
    const pkgs = [...(journeys.packages || [])];
    pkgs[idx] = { ...pkgs[idx], [field]: val };
    const updated = { ...journeys, packages: pkgs };
    setJourneys(updated);
    updateCMSJourneys(updated);
  };

  const handleAddPackage = () => {
    const newPkg = {
      id: `j-${Date.now()}`,
      title: "New Commission Tier",
      category: "Portraits",
      price: "₹85,000",
      timeline: "2–3 Weeks",
      deliverables: "Curated high-res master plates, archival cotton rag prints, private digital gallery.",
      image: "/images/hero-villa-wide.jpg",
    };

    const pkgs = [...(journeys.packages || []), newPkg];
    const updated = { ...journeys, packages: pkgs };
    setJourneys(updated);
    updateCMSJourneys(updated);
  };

  const handleDeletePackage = (idx) => {
    if (!window.confirm("Remove this commission package?")) return;
    const pkgs = (journeys.packages || []).filter((_, i) => i !== idx);
    const updated = { ...journeys, packages: pkgs };
    setJourneys(updated);
    updateCMSJourneys(updated);
  };

  const packages = journeys.packages || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* View Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>WEBSITE CMS EDITOR</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Journeys & Commission Packages CMS
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            Edit live commission packages, starting prices in ₹ INR, deliverables, and photographic covers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="studio-btn-secondary"
            onClick={handleAddPackage}
          >
            <Plus size={14} />
            + Add Commission Package
          </button>
          <button
            type="button"
            className="studio-btn-primary"
            onClick={saveCMSChanges}
          >
            <Save size={14} />
            Save & Publish Live
          </button>
        </div>
      </div>

      {/* Journeys Page Header Settings */}
      <div className="studio-card">
        <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
          Page Masthead Typography
        </h3>

        <div className="studio-form-group">
          <label className="studio-form-label">Journeys Page Title</label>
          <input
            type="text"
            className="studio-input"
            style={{ fontSize: "16px", fontWeight: "600" }}
            value={journeys.headline || ""}
            onChange={(e) => handleHeadlineChange("headline", e.target.value)}
            placeholder="e.g. Journeys & Commissions."
          />
        </div>

        <div className="studio-form-group">
          <label className="studio-form-label">Page Subtitle / Mission Statement</label>
          <textarea
            className="studio-textarea"
            rows={2}
            value={journeys.subtitle || ""}
            onChange={(e) => handleHeadlineChange("subtitle", e.target.value)}
            placeholder="Bespoke photography and motion experiences designed around unhurried presence."
          />
        </div>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <AdminLoadingSkeleton rows={3} type="cards" />
      ) : packages.length === 0 ? (
        <div className="studio-card">
          <AdminEmptyState
            icon={Layers}
            title="No commission packages created"
            description="Create your first commission package with deliverables, pricing, and cover photography."
            actionLabel="+ Add Package"
            onAction={handleAddPackage}
          />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "20px" }}>
          {packages.map((pkg, idx) => (
            <div key={pkg.id || idx} className="studio-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="studio-badge studio-badge-subtle">
                  PACKAGE {idx + 1}
                </span>

                <button
                  type="button"
                  className="studio-btn-secondary studio-btn-sm"
                  onClick={() => handleDeletePackage(idx)}
                  title="Remove Package"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Package Title</label>
                  <input
                    type="text"
                    className="studio-input"
                    style={{ fontWeight: "600" }}
                    value={pkg.title || ""}
                    onChange={(e) => handlePackageUpdate(idx, "title", e.target.value)}
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Category</label>
                  <select
                    className="studio-select"
                    value={pkg.category || "Portraits"}
                    onChange={(e) => handlePackageUpdate(idx, "category", e.target.value)}
                  >
                    <option value="Portraits">Portraits</option>
                    <option value="Couples">Couples</option>
                    <option value="Events">Events</option>
                    <option value="Brands">Brands</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Editorial">Editorial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Starting Price</label>
                  <input
                    type="text"
                    className="studio-input studio-mono"
                    value={pkg.price || ""}
                    onChange={(e) => handlePackageUpdate(idx, "price", e.target.value)}
                    placeholder="e.g. ₹75,000"
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Turnaround Timeline</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={pkg.timeline || ""}
                    onChange={(e) => handlePackageUpdate(idx, "timeline", e.target.value)}
                    placeholder="e.g. 2–3 Weeks"
                  />
                </div>
              </div>

              {/* Cover Image Upload Control */}
              <ImageUploadControl
                label="Package Showcase Photo"
                value={pkg.image || ""}
                onChange={(url) => handlePackageUpdate(idx, "image", url)}
                aspectRatio="16/10"
                helperText="Cover photograph displayed on the /journeys page card."
              />

              <div className="studio-form-group">
                <label className="studio-form-label">Deliverables Checklist</label>
                <textarea
                  className="studio-textarea"
                  rows={3}
                  value={pkg.deliverables || ""}
                  onChange={(e) => handlePackageUpdate(idx, "deliverables", e.target.value)}
                  placeholder="Full afternoon daylight session, 20 hand-retouched master plates, 3 archival cotton rag prints..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
