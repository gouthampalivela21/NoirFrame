import React from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import ImageUploadControl from "../components/ImageUploadControl.jsx";
import { Save, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const CMS_GROUPS = [
  {
    label: "Home page",
    sections: [
      ["hero", "Hero"],
      ["websiteSection", "Website showcase"],
      ["categories", "All category sections"],
    ],
  },
  {
    label: "Website pages",
    sections: [
      ["websiteExperience", "Digital experience page"],
      ["journeys", "Journeys"],
      ["stories", "Stories"],
      ["studio", "The Studio"],
      ["booking", "Booking briefs"],
      ["pages", "Page settings & SEO"],
    ],
  },
  {
    label: "Shared content",
    sections: [
      ["testimonials", "Testimonials"],
      ["branding", "Brand & header"],
      ["navigation", "Navigation"],
      ["footer", "Footer & contact"],
    ],
  },
];

const SECTION_INFO = {
  hero: { title: "Home · Hero", description: "Edit the homepage opening, calls to action and hero photography." },
  websiteSection: { title: "Home · Website showcase", description: "Edit the website showcase copy, links and desktop or mobile images." },
  websiteExperience: { title: "Digital experience page", description: "Edit each section, image and content list on the Website Experience page." },
  categories: { title: "Home · Category sections", description: "Edit each homepage category, including its text, links, layout and photography." },
  journeys: { title: "Journeys", description: "Edit journey page copy, chapter content, images and commission package details." },
  stories: { title: "Stories", description: "Edit story pages, copy, image captions and every nested story section." },
  booking: { title: "Booking briefs", description: "Customize every booking category, question, helper, placeholder and option." },
  studio: { title: "The Studio", description: "Edit the studio page, founder details, principles, spaces and images." },
  testimonials: { title: "Testimonials", description: "Edit the reviews and testimonials shown across the website." },
  navigation: { title: "Navigation", description: "Edit the labels and destinations in the website header navigation." },
  branding: { title: "Brand & header", description: "Edit the site logos, accessible logo text and primary navigation call to action." },
  footer: { title: "Footer & contact", description: "Edit the shared footer details, links and contact information." },
  pages: { title: "Page settings", description: "Edit page level content and search metadata." },
};

const imageKey = (key = "") => /image|photo|portrait|avatar|cover|thumbnail|logo|^src$/i.test(key);
const displayName = (key = "") => String(key)
  .replace(/([a-z])([A-Z])/g, "$1 $2")
  .replace(/[_-]+/g, " ")
  .replace(/^./, (char) => char.toUpperCase());

function emptyLike(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyLike(child)]));
  }
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return 0;
  return "";
}

function EditorValue({ name, value, path, onChange, onRemove, depth = 0 }) {
  const [open, setOpen] = React.useState(depth < 2);

  if (Array.isArray(value)) {
    return (
      <section className="studio-card" style={{ margin: "12px 0", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button type="button" onClick={() => setOpen((current) => !current)} style={toggleStyle}>
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            <strong>{displayName(name)} <span style={mutedStyle}>({value.length})</span></strong>
          </button>
          <button
            type="button"
            className="studio-btn-secondary studio-btn-sm"
            onClick={() => onChange(path, [...value, emptyLike(value[0] ?? { title: "", description: "", image: "" })])}
          >
            <Plus size={13} /> Add item
          </button>
        </div>
        {open && <div style={{ marginTop: 12, paddingLeft: depth ? 12 : 0, borderLeft: depth ? "1px solid var(--studio-border-crisp)" : 0 }}>
          {value.length === 0 && <p style={mutedStyle}>No items yet. Add one to get started.</p>}
          {value.map((item, index) => (
            <EditorValue
              key={item?.id || `${path.join(".")}-${index}`}
              name={item?.title || item?.headline || item?.id || `Item ${index + 1}`}
              value={item}
              path={[...path, index]}
              onChange={onChange}
              onRemove={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
              depth={depth + 1}
            />
          ))}
        </div>}
      </section>
    );
  }

  if (value && typeof value === "object") {
    return (
      <section className="studio-card" style={{ margin: "12px 0", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button type="button" onClick={() => setOpen((current) => !current)} style={toggleStyle}>
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            <strong>{displayName(name)}</strong>
          </button>
          {onRemove && <button type="button" className="studio-btn-secondary studio-btn-sm" onClick={onRemove} aria-label={`Remove ${displayName(name)}`}><Trash2 size={13} /></button>}
        </div>
        {open && <div style={{ marginTop: 12, paddingLeft: depth ? 12 : 0, borderLeft: depth ? "1px solid var(--studio-border-crisp)" : 0 }}>
          {Object.entries(value).filter(([key]) => key !== "textPosition").map(([key, child]) => (
            <EditorValue key={key} name={key} value={child} path={[...path, key]} onChange={onChange} depth={depth + 1} />
          ))}
          {Object.keys(value).length === 0 && <p style={mutedStyle}>This section has no fields yet.</p>}
        </div>}
      </section>
    );
  }

  const label = displayName(name);
  if (/originalurl$/i.test(name)) {
    return value ? <div className="studio-form-group" style={{ margin: "12px 0" }}><label className="studio-form-label">{label}</label><a href={value} target="_blank" rel="noreferrer" style={{ color: "var(--studio-text-secondary)", fontSize: 12, overflowWrap: "anywhere" }}>Open untouched original image ↗</a></div> : null;
  }
  if (imageKey(name)) {
    return <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}><div style={{ flex: 1 }}><ImageUploadControl label={label} value={value || ""} onChange={(next, details) => { onChange(path, next); if (details?.originalUrl && path.length) onChange([...path.slice(0, -1), `${path[path.length - 1]}OriginalUrl`], details.originalUrl); }} aspectRatio="16/9" helperText="Original upload is preserved; the site uses a lighter delivery copy when needed." /></div>{onRemove && <button type="button" className="studio-btn-secondary studio-btn-sm" onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 size={13} /></button>}</div>;
  }
  if (typeof value === "boolean") {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><label className="studio-form-group" style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
      <input type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} />
      <span className="studio-form-label">{label}</span>
    </label>{onRemove && <button type="button" className="studio-btn-secondary studio-btn-sm" onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 size={13} /></button>}</div>;
  }

  const isLong = String(value ?? "").length > 90 || /copy|description|subtitle|bio|quote|caption|deliverables|intro|conclusion|essay|passage|text/i.test(name);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <div className="studio-form-group" style={{ flex: 1, margin: "12px 0" }}>
        <label className="studio-form-label">{label}</label>
        {isLong ? (
          <textarea className="studio-textarea" rows={3} value={value ?? ""} onChange={(event) => onChange(path, event.target.value)} />
        ) : (
          <input className="studio-input" type={typeof value === "number" ? "number" : "text"} value={value ?? ""} onChange={(event) => onChange(path, typeof value === "number" ? Number(event.target.value) : event.target.value)} />
        )}
      </div>
      {onRemove && <button type="button" className="studio-btn-secondary studio-btn-sm" onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 size={13} /></button>}
    </div>
  );
}

function CategoryTextPositionEditor({ category, index, onChange }) {
  const previewRef = React.useRef(null);
  const [position, setPosition] = React.useState(category?.textPosition || { x: 50, y: 16 });
  const positionRef = React.useRef(position);
  const dragRef = React.useRef(false);
  React.useEffect(() => { const next = category?.textPosition || { x: 50, y: 16 }; positionRef.current = next; setPosition(next); }, [category?.textPosition, index]);
  const move = (event) => {
    if (!dragRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const next = {
      x: Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(7, Math.min(93, ((event.clientY - rect.top) / rect.height) * 100)),
    };
    positionRef.current = next;
    setPosition(next);
  };
  const stop = (event) => {
    if (!dragRef.current) return;
    dragRef.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    onChange(["categories", index, "textPosition"], positionRef.current);
  };
  return (
    <section className="studio-card" style={{ padding: 18 }}>
      <h3 style={{ margin: "0 0 6px" }}>Text position on image</h3>
      <p style={mutedStyle}>Drag the copy to place it over the photo. Position is saved with this category.</p>
      <div ref={previewRef} className={`cms-category-position-preview ${category?.theme === "dark" ? "is-dark" : "is-light"}`} onPointerDown={(event) => { dragRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); move(event); }} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} style={{ backgroundImage: category?.image ? `url("${category.image.replaceAll('"', '%22')}")` : "linear-gradient(145deg,#ddd,#aaa)" }}>
        <div className="cms-category-position-copy" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
          <strong>{category?.title || "Category title"}</strong>
          <span>{category?.tagline || "Category tagline"}</span>
          <div><i>{category?.primaryLabel || "Explore"}</i><i>{category?.secondaryLabel || "Book Now"}</i></div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--studio-text-muted)", marginTop: 8 }}>Horizontal {Math.round(position.x)}% · Vertical {Math.round(position.y)}%</div>
    </section>
  );
}

const toggleStyle = { display: "inline-flex", alignItems: "center", gap: 8, border: 0, background: "none", padding: 0, color: "inherit", textAlign: "left", cursor: "pointer" };
const mutedStyle = { color: "var(--studio-text-muted)", fontSize: 12, margin: "8px 0" };

export default function WebsiteContentView({ section = "hero", path }) {
  const { cmsData, updateCMSPath, saveCMSChanges, isLoading } = useStudioAdmin();
  const [selectedSection, setSelectedSection] = React.useState(section);
  const categories = Array.isArray(cmsData.categories) ? cmsData.categories : [];
  const isCategory = selectedSection.startsWith("category:");
  const categoryIndex = isCategory ? Number(selectedSection.split(":")[1]) : -1;
  const sectionKey = isCategory ? "categories" : selectedSection;
  const cmsPath = path || (isCategory ? ["categories", categoryIndex] : [sectionKey]);
  const category = isCategory ? categories[categoryIndex] : null;
  const meta = isCategory
    ? { title: category?.title || category?.id || `Category ${categoryIndex + 1}`, description: "Edit this homepage category’s copy, links, layout and photography." }
    : SECTION_INFO[sectionKey] || SECTION_INFO.hero;
  const value = cmsPath.reduce((current, part) => current?.[part], cmsData);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: 6 }}>WEBSITE CMS</div>
          <h1 className="studio-serif" style={{ fontSize: 28, color: "var(--studio-text-primary)", margin: 0 }}>{meta.title}</h1>
          <p style={{ fontSize: 13.5, color: "var(--studio-text-muted)", margin: "5px 0 0" }}>{meta.description}</p>
        </div>
        <button type="button" className="studio-btn-primary" onClick={saveCMSChanges}><Save size={14} /> Save & Publish</button>
      </header>
      <div className="studio-card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <label htmlFor="cms-section-picker" className="studio-form-label" style={{ margin: 0, whiteSpace: "nowrap" }}>Choose a section to edit</label>
        <select
          id="cms-section-picker"
          className="studio-input"
          value={selectedSection}
          onChange={(event) => setSelectedSection(event.target.value)}
          style={{ flex: "1 1 280px", maxWidth: 520 }}
        >
          {CMS_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.sections.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              {group.label === "Home page" && categories.map((item, index) => (
                <option key={item.id || index} value={`category:${index}`}>{item.title || item.id || `Category ${index + 1}`}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {isLoading ? <div className="studio-card">Loading website content…</div> : value === undefined ? (
        <div className="studio-card">
          <h3 style={{ marginTop: 0 }}>This section is ready to configure</h3>
          <p style={mutedStyle}>No saved content exists for this section yet. Add the first content item to start editing.</p>
          <button type="button" className="studio-btn-secondary" onClick={() => updateCMSPath(cmsPath, ["categories", "stories", "testimonials"].includes(sectionKey) ? [] : {})}><Plus size={14} /> Create section content</button>
        </div>
      ) : (
        <>
          {isCategory && <CategoryTextPositionEditor category={category} index={categoryIndex} onChange={updateCMSPath} />}
          <EditorValue name={meta.title} value={value} path={cmsPath} onChange={updateCMSPath} />
        </>
      )}
    </div>
  );
}
