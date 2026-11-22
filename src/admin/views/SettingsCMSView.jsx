import React, { useState, useEffect } from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import ImageUploadControl from "../components/ImageUploadControl.jsx";
import {
  Save,
  Home,
  Grid,
  Building,
  Mail,
  Globe,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

export default function SettingsCMSView() {
  const {
    cmsData,
    updateCMSHero,
    updateCMSWebsiteSection,
    updateCMSCategories,
    updateCMSStudio,
    updateCMSFooter,
    saveCMSChanges,
  } = useStudioAdmin();

  const [activeTab, setActiveTab] = useState("home");

  // Local state mirrors
  const [hero, setHero] = useState(cmsData.hero || {});
  const [websiteSection, setWebsiteSection] = useState(cmsData.websiteSection || {});
  const [categories, setCategories] = useState(cmsData.categories || []);
  const [studio, setStudio] = useState(cmsData.studio || {});
  const [footer, setFooter] = useState(cmsData.footer || {});

  useEffect(() => {
    if (cmsData.hero) setHero(cmsData.hero);
    if (cmsData.websiteSection) setWebsiteSection(cmsData.websiteSection);
    if (Array.isArray(cmsData.categories)) setCategories(cmsData.categories);
    if (cmsData.studio) setStudio(cmsData.studio);
    if (cmsData.footer) setFooter(cmsData.footer);
  }, [cmsData]);

  // Home Handlers
  const handleHeroChange = (field, val) => {
    const updated = { ...hero, [field]: val };
    setHero(updated);
    updateCMSHero(updated);
  };

  const handleWebsiteSectionChange = (field, val) => {
    const updated = { ...websiteSection, [field]: val };
    setWebsiteSection(updated);
    updateCMSWebsiteSection(updated);
  };

  // Categories Handlers
  const handleCategoryChange = (idx, field, val) => {
    const updated = [...categories];
    updated[idx] = { ...updated[idx], [field]: val };
    setCategories(updated);
    updateCMSCategories(updated);
  };

  // Studio Handlers
  const handleStudioChange = (field, val) => {
    const updated = { ...studio, [field]: val };
    setStudio(updated);
    updateCMSStudio(updated);
  };

  const handleFounderChange = (field, val) => {
    const updatedFounder = { ...(studio.founder || {}), [field]: val };
    const updated = { ...studio, founder: updatedFounder };
    setStudio(updated);
    updateCMSStudio(updated);
  };

  const handlePrincipleChange = (idx, field, val) => {
    const princs = [...(studio.principles || [])];
    princs[idx] = { ...(princs[idx] || {}), [field]: val };
    const updated = { ...studio, principles: princs };
    setStudio(updated);
    updateCMSStudio(updated);
  };

  const handleSpaceChange = (idx, field, val) => {
    const sps = [...(studio.spaces || [])];
    sps[idx] = { ...(sps[idx] || {}), [field]: val };
    const updated = { ...studio, spaces: sps };
    setStudio(updated);
    updateCMSStudio(updated);
  };

  // Footer Handlers
  const handleFooterChange = (field, val) => {
    const updated = { ...footer, [field]: val };
    setFooter(updated);
    updateCMSFooter(updated);
  };

  const TABS = [
    { id: "home", label: "Home Page", icon: Home },
    { id: "categories", label: "Categories Showcase", icon: Grid },
    { id: "studio", label: "The Studio Page", icon: Building },
    { id: "footer", label: "Footer & Contact", icon: Mail },
    { id: "seo", label: "Global SEO", icon: Globe },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* View Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>WEBSITE CMS EDITOR</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Site Content & Pages Editor CMS
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            100% no-code editor for all public website text, headlines, quotes, captions, and photography.
          </p>
        </div>

        <button
          type="button"
          className="studio-btn-primary"
          onClick={saveCMSChanges}
        >
          <Save size={14} />
          Save & Publish Live
        </button>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--studio-border-crisp)",
          paddingBottom: "12px",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? "studio-btn-primary studio-btn-sm" : "studio-btn-secondary studio-btn-sm"}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOME PAGE */}
      {activeTab === "home" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="studio-card">
            <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
              Homepage Hero Section
            </h3>

            <div className="studio-form-group">
              <label className="studio-form-label">Primary Hero Headline</label>
              <input
                type="text"
                className="studio-input"
                style={{ fontSize: "16px", fontWeight: "600" }}
                value={hero.headline || ""}
                onChange={(e) => handleHeroChange("headline", e.target.value)}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Hero Subheadline / Mission</label>
              <textarea
                className="studio-textarea"
                rows={2}
                value={hero.subheadline || ""}
                onChange={(e) => handleHeroChange("subheadline", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Seasonal Booking Availability Badge</label>
                <input
                  type="text"
                  className="studio-input"
                  value={hero.availabilityBadge || ""}
                  onChange={(e) => handleHeroChange("availabilityBadge", e.target.value)}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Hero Image Alt Text</label>
                <input
                  type="text"
                  className="studio-input"
                  value={hero.altText || ""}
                  onChange={(e) => handleHeroChange("altText", e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
              <ImageUploadControl
                label="Desktop Widescreen Hero Image"
                value={hero.heroImageWide || hero.bannerImage || ""}
                onChange={(url) => {
                  handleHeroChange("heroImageWide", url);
                  handleHeroChange("bannerImage", url);
                }}
                aspectRatio="16/9"
                helperText="Primary hero image displayed across desktop screens."
              />

              <ImageUploadControl
                label="Mobile Portrait Hero Image"
                value={hero.heroImageMobile || ""}
                onChange={(url) => handleHeroChange("heroImageMobile", url)}
                aspectRatio="3/4"
                helperText="Responsive vertical hero frame for mobile devices."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "16px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Primary Button Text & Link</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="studio-input"
                    value={hero.primaryButtonText || "Book a Session"}
                    onChange={(e) => handleHeroChange("primaryButtonText", e.target.value)}
                    placeholder="Text"
                  />
                  <input
                    type="text"
                    className="studio-input"
                    value={hero.primaryButtonLink || "/book"}
                    onChange={(e) => handleHeroChange("primaryButtonLink", e.target.value)}
                    placeholder="Link"
                  />
                </div>
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Secondary Button Text & Link</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="studio-input"
                    value={hero.secondaryButtonText || "Explore Works"}
                    onChange={(e) => handleHeroChange("secondaryButtonText", e.target.value)}
                    placeholder="Text"
                  />
                  <input
                    type="text"
                    className="studio-input"
                    value={hero.secondaryButtonLink || "/stories"}
                    onChange={(e) => handleHeroChange("secondaryButtonLink", e.target.value)}
                    placeholder="Link"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Digital Website Experience Section */}
          <div className="studio-card">
            <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
              Homepage "Website." Experience Showcase
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Section Title</label>
                <input
                  type="text"
                  className="studio-input"
                  value={websiteSection.title || "Website."}
                  onChange={(e) => handleWebsiteSectionChange("title", e.target.value)}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Section Subtitle</label>
                <input
                  type="text"
                  className="studio-input"
                  value={websiteSection.subtitle || "A better way to experience the web."}
                  onChange={(e) => handleWebsiteSectionChange("subtitle", e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
              <ImageUploadControl
                label="Desktop Mockup Graphic"
                value={websiteSection.imageDesktop || ""}
                onChange={(url) => handleWebsiteSectionChange("imageDesktop", url)}
                aspectRatio="16/10"
              />

              <ImageUploadControl
                label="Mobile Mockup Graphic"
                value={websiteSection.imageMobile || ""}
                onChange={(url) => handleWebsiteSectionChange("imageMobile", url)}
                aspectRatio="16/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHOWCASE CATEGORIES */}
      {activeTab === "categories" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "20px" }}>
          {categories.map((cat, idx) => (
            <div key={cat.id || idx} className="studio-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="studio-badge studio-badge-subtle">
                  CATEGORY 0{idx + 1} &middot; {cat.id}
                </span>
                <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>
                  {cat.theme === "dark" ? "Dark Theme" : "Light Theme"} &middot; {cat.layout === "split" ? "Split Layout" : "Stacked Layout"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Theme Mode</label>
                  <select
                    className="studio-input"
                    value={cat.theme || "light"}
                    onChange={(e) => handleCategoryChange(idx, "theme", e.target.value)}
                  >
                    <option value="light">Light (Charcoal Text / High Contrast)</option>
                    <option value="dark">Dark (White Text)</option>
                  </select>
                </div>
                <div className="studio-form-group">
                  <label className="studio-form-label">Showcase Layout</label>
                  <select
                    className="studio-input"
                    value={cat.layout || "stacked"}
                    onChange={(e) => handleCategoryChange(idx, "layout", e.target.value)}
                  >
                    <option value="stacked">Stacked (Centered Top Copy)</option>
                    <option value="split">Split (Left Copy, Right Visual)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Title</label>
                  <input
                    type="text"
                    className="studio-input"
                    style={{ fontWeight: "600" }}
                    value={cat.title || ""}
                    onChange={(e) => handleCategoryChange(idx, "title", e.target.value)}
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Tagline</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={cat.tagline || ""}
                    onChange={(e) => handleCategoryChange(idx, "tagline", e.target.value)}
                  />
                </div>
              </div>

              <ImageUploadControl
                label="Showcase Photography Tile"
                value={cat.image || ""}
                onChange={(url) => handleCategoryChange(idx, "image", url)}
                aspectRatio="16/10"
                helperText="Photograph shown on the homepage 2-column promo grid."
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Explore Link</label>
                  <input
                    type="text"
                    className="studio-input studio-btn-sm"
                    value={cat.primaryTo || `/explore/${cat.id}`}
                    onChange={(e) => handleCategoryChange(idx, "primaryTo", e.target.value)}
                  />
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Booking Link</label>
                  <input
                    type="text"
                    className="studio-input studio-btn-sm"
                    value={cat.secondaryTo || `/book?category=${cat.id}`}
                    onChange={(e) => handleCategoryChange(idx, "secondaryTo", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: THE STUDIO PAGE */}
      {activeTab === "studio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Masthead & Philosophy */}
          <div className="studio-card">
            <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
              The Studio Masthead & Manifesto
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Page Headline</label>
                <input
                  type="text"
                  className="studio-input"
                  value={studio.headline || "The Studio."}
                  onChange={(e) => handleStudioChange("headline", e.target.value)}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Page Subtitle</label>
                <input
                  type="text"
                  className="studio-input"
                  value={studio.subtitle || ""}
                  onChange={(e) => handleStudioChange("subtitle", e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <ImageUploadControl
                label="Full-Bleed Studio Lead Photo"
                value={studio.leadImage || ""}
                onChange={(url) => handleStudioChange("leadImage", url)}
                aspectRatio="16/9"
                helperText="Primary architectural photograph shown at the top of /studio."
              />
            </div>

            <div className="studio-form-group" style={{ marginTop: "16px" }}>
              <label className="studio-form-label">Manifesto / Philosophy Statement</label>
              <textarea
                className="studio-textarea"
                rows={3}
                value={studio.philosophy || ""}
                onChange={(e) => handleStudioChange("philosophy", e.target.value)}
              />
            </div>
          </div>

          {/* Three Core Principles */}
          <div className="studio-card">
            <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
              The Three Tenets / Principles
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {(studio.principles || []).map((pr, idx) => (
                <div key={idx} style={{ padding: "14px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#A1A1AA", marginBottom: "6px" }}>
                    TENET 0{idx + 1}
                  </div>
                  <input
                    type="text"
                    className="studio-input"
                    style={{ fontWeight: "600", marginBottom: "8px" }}
                    value={pr.title || ""}
                    onChange={(e) => handlePrincipleChange(idx, "title", e.target.value)}
                  />
                  <textarea
                    className="studio-textarea"
                    rows={3}
                    value={pr.desc || ""}
                    onChange={(e) => handlePrincipleChange(idx, "desc", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Founder Profile */}
          <div className="studio-card">
            <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
              Founder & Principal Profile
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Founder Full Name</label>
                <input
                  type="text"
                  className="studio-input"
                  value={studio.founder?.name || ""}
                  onChange={(e) => handleFounderChange("name", e.target.value)}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Title / Role</label>
                <input
                  type="text"
                  className="studio-input"
                  value={studio.founder?.role || ""}
                  onChange={(e) => handleFounderChange("role", e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <ImageUploadControl
                label="Founder Portrait Photograph"
                value={studio.founder?.portrait || ""}
                onChange={(url) => handleFounderChange("portrait", url)}
                aspectRatio="1/1"
                helperText="Square circular avatar photo of the founder."
              />
            </div>

            <div className="studio-form-group" style={{ marginTop: "16px" }}>
              <label className="studio-form-label">Founder Editorial Quote</label>
              <input
                type="text"
                className="studio-input"
                value={studio.founder?.quote || ""}
                onChange={(e) => handleFounderChange("quote", e.target.value)}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Founder Biography</label>
              <textarea
                className="studio-textarea"
                rows={3}
                value={studio.founder?.bio || ""}
                onChange={(e) => handleFounderChange("bio", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FOOTER & CONTACT */}
      {activeTab === "footer" && (
        <div className="studio-card">
          <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
            Footer Copy & Contact Coordinates
          </h3>

          <div className="studio-form-group">
            <label className="studio-form-label">Brand Tagline</label>
            <input
              type="text"
              className="studio-input"
              value={footer.tagline || ""}
              onChange={(e) => handleFooterChange("tagline", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="studio-form-group">
              <label className="studio-form-label">Inquiries Email</label>
              <input
                type="email"
                className="studio-input"
                value={footer.email || hero.studioEmail || ""}
                onChange={(e) => {
                  handleFooterChange("email", e.target.value);
                  handleHeroChange("studioEmail", e.target.value);
                }}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Studio Telephone</label>
              <input
                type="text"
                className="studio-input"
                value={footer.phone || ""}
                onChange={(e) => handleFooterChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="studio-form-group">
            <label className="studio-form-label">Physical Address & Base Location</label>
            <input
              type="text"
              className="studio-input"
              value={footer.address || hero.location || ""}
              onChange={(e) => {
                handleFooterChange("address", e.target.value);
                handleHeroChange("location", e.target.value);
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="studio-form-group">
              <label className="studio-form-label">Instagram URL</label>
              <input
                type="url"
                className="studio-input"
                value={footer.instagram || hero.instagram || ""}
                onChange={(e) => {
                  handleFooterChange("instagram", e.target.value);
                  handleHeroChange("instagram", e.target.value);
                }}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">LinkedIn URL</label>
              <input
                type="url"
                className="studio-input"
                value={footer.linkedin || hero.linkedin || ""}
                onChange={(e) => {
                  handleFooterChange("linkedin", e.target.value);
                  handleHeroChange("linkedin", e.target.value);
                }}
              />
            </div>
          </div>

          <div className="studio-form-group">
            <label className="studio-form-label">Copyright Notice</label>
            <input
              type="text"
              className="studio-input"
              value={footer.copyright || ""}
              onChange={(e) => handleFooterChange("copyright", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* TAB 5: GLOBAL SEO */}
      {activeTab === "seo" && (
        <div className="studio-card">
          <h3 className="studio-serif" style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#111" }}>
            Search Engine Optimization (SEO) Meta Tags
          </h3>

          <div className="studio-form-group">
            <label className="studio-form-label">Page Title</label>
            <input
              type="text"
              className="studio-input"
              value={hero.seoTitle || ""}
              onChange={(e) => handleHeroChange("seoTitle", e.target.value)}
            />
          </div>

          <div className="studio-form-group">
            <label className="studio-form-label">Meta Description</label>
            <textarea
              className="studio-textarea"
              rows={3}
              value={hero.seoDescription || ""}
              onChange={(e) => handleHeroChange("seoDescription", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
