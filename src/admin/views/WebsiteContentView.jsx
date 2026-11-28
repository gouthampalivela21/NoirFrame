import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";

const CANVAS_PAGES = [
  { group: "Main pages", items: [["hero", "Home", "Edit the homepage and every element on it."], ["websiteExperience", "Website Experience", "Edit the showcase, details and calls to action."], ["journeys", "Journeys", "Edit journey content and imagery."], ["stories", "Stories", "Edit story listing and content."], ["studio", "The Studio", "Edit studio information and photography."], ["booking", "Booking", "Edit the booking page and its details."]] },
  { group: "Category pages", items: [["categoryPage:portraits", "Portraits", "Edit the complete Portraits page."], ["categoryPage:editorial", "Editorial", "Edit the complete Editorial page."], ["categoryPage:brands", "Brands", "Edit the complete Brands page."], ["categoryPage:commercial", "Commercial", "Edit the complete Commercial page."], ["categoryPage:couples", "Couples", "Edit the complete Couples page."], ["categoryPage:events", "Events", "Edit the complete Events page."]] },
];

export default function WebsiteContentView({ mode = "desktop" }) {
  const navigate = useNavigate();
  const { cmsData } = useStudioAdmin();
  const isMobile = mode === "mobile";
  const openEditor = (pageId) => navigate("/gouthamspace/cms/" + mode + "/canvas/" + encodeURIComponent(pageId));
  return <div className="canvas-cms-landing">
    <header className="canvas-cms-landing-header">
      <div><div className="studio-eyebrow">{isMobile ? "MOBILE WEBSITE STUDIO" : "DESKTOP WEBSITE STUDIO"}</div><h1 className="studio-serif">Edit your website.</h1><p>Choose a page, then click its text, images or details to edit them directly on the canvas.</p></div>
      <div className="canvas-mode-badge">{isMobile ? "390 px mobile canvas" : "1440 px desktop canvas"}</div>
    </header>
    {CANVAS_PAGES.map((group) => <section className="canvas-cms-group" key={group.group}>
      <div className="canvas-cms-group-heading"><h2>{group.group}</h2><span>{group.items.length} pages</span></div>
      <div className="canvas-cms-page-grid">{group.items.map(([id, title, description], index) => <button type="button" className="canvas-cms-page-card" key={id} onClick={() => openEditor(id)}><span className="canvas-cms-page-index">{String(index + 1).padStart(2, "0")}</span><span className="canvas-cms-page-title">{title}</span><span className="canvas-cms-page-description">{description}</span><span className="canvas-cms-open">Open canvas <ChevronRight size={14} /></span></button>)}</div>
    </section>)}
    <section className="canvas-cms-group"><div className="canvas-cms-group-heading"><h2>Homepage category tiles</h2><span>{cmsData.categories?.length || 0} tiles</span></div><div className="canvas-cms-page-grid">{(cmsData.categories || []).map((category, index) => <button type="button" className="canvas-cms-page-card" key={category.id || index} onClick={() => openEditor("category:" + index)}><span className="canvas-cms-page-index">{String(index + 1).padStart(2, "0")}</span><span className="canvas-cms-page-title">{category.title || category.id || "Category"}</span><span className="canvas-cms-page-description">Edit this category tile on the homepage canvas.</span><span className="canvas-cms-open">Open canvas <ChevronRight size={14} /></span></button>)}</div></section>
  </div>;
}
