import React, { useState, useEffect, useMemo } from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import AdminLoadingSkeleton from "../components/AdminLoadingSkeleton.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import ImageUploadControl from "../components/ImageUploadControl.jsx";
import DestructiveActionModal from "../components/DestructiveActionModal.jsx";
import { getCategoryPageContent } from "../../data/categoryPageContent.js";
import { EDITORIAL_STORIES } from "../../data/editorialStories.js";
import {
  Save,
  ArrowLeft,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  Edit3,
  X,
  Check,
} from "lucide-react";

function EditableStoryCards({ title, cards, fields, onUpdate, onAdd, onRemove, addLabel = "Add card" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <h5 style={{ margin: 0, fontSize: "13px", fontWeight: 650 }}>{title}</h5>
        <button type="button" className="studio-btn-secondary studio-btn-sm" onClick={onAdd}><Plus size={13} /> {addLabel}</button>
      </div>
      {cards.map((card, index) => (
        <div key={`${title}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "start", padding: "14px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {fields.map((field) => (
              <div className="studio-form-group" key={field.key} style={{ gridColumn: field.wide ? "1 / -1" : undefined, margin: 0 }}>
                <label className="studio-form-label">{field.label}</label>
                {field.multiline ? (
                  <textarea className="studio-textarea" rows={2} value={card[field.key] || ""} placeholder={field.placeholder || ""} onChange={(e) => onUpdate(index, field.key, e.target.value)} />
                ) : (
                  <input className="studio-input" type={field.type || "text"} min={field.min} max={field.max} value={card[field.key] ?? ""} placeholder={field.placeholder || ""} onChange={(e) => onUpdate(index, field.key, field.type === "number" ? e.target.value : e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <button type="button" className="studio-btn-secondary studio-btn-sm" aria-label={`Remove ${title} card ${index + 1}`} onClick={() => onRemove(index)}><Trash2 size={13} /></button>
        </div>
      ))}
    </div>
  );
}

function mergeMobileContent(base, overrides) {
  if (overrides === undefined || overrides === null) return base;
  if (Array.isArray(overrides)) return Array.isArray(base) ? overrides.map((item, index) => mergeMobileContent(base[index], item)) : overrides;
  if (typeof overrides !== "object") return overrides;
  const result = { ...(base && typeof base === "object" && !Array.isArray(base) ? base : {}) };
  for (const [key, value] of Object.entries(overrides)) result[key] = mergeMobileContent(result[key], value);
  return result;
}

export default function PortfolioCMSView({ mode = "desktop", onActiveStoryChange, initialCategoryId = "", fullPage = false, onExit }) {
  const { cmsData, updateCMSStories, updateCMSPath, saveCMSChanges, isLoading } = useStudioAdmin();
  const mobileMode = mode === "mobile";
  const storiesForMode = useMemo(() => mobileMode
    ? mergeMobileContent(cmsData.stories || [], cmsData.mobileContent?.stories)
    : (cmsData.stories || []), [cmsData.stories, cmsData.mobileContent?.stories, mobileMode]);
  const persistStories = (updated) => mobileMode
    ? updateCMSPath(["mobileContent", "stories"], updated)
    : updateCMSStories(updated);
  const [stories, setStories] = useState(storiesForMode);
  const [editingStory, setEditingStory] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteTargetStory, setDeleteTargetStory] = useState(null);
  const autoOpenedCategory = React.useRef("");
  const editorPreviewRef = React.useRef(null);

  useEffect(() => {
    if (Array.isArray(storiesForMode)) setStories(storiesForMode);
  }, [storiesForMode]);

  useEffect(() => {
    if (!initialCategoryId || isLoading || autoOpenedCategory.current === initialCategoryId || !storiesForMode.length) return;
    const existingStory = storiesForMode.find((story) => String(story.id || "").toLowerCase() === initialCategoryId.toLowerCase()
      || String(story.category || "").toLowerCase() === initialCategoryId.toLowerCase());
    const target = existingStory || EDITORIAL_STORIES[initialCategoryId.toLowerCase()];
    if (target) {
      autoOpenedCategory.current = initialCategoryId;
      handleOpenEdit(target);
      setIsCreatingNew(!existingStory);
    }
  }, [initialCategoryId, isLoading, storiesForMode]);

  useEffect(() => {
    onActiveStoryChange?.(editingStory?.id || "");
  }, [editingStory?.id, onActiveStoryChange]);

  useEffect(() => {
    if (!editingStory) return undefined;
    const draftStories = stories.map((story) => story.id === editingStory.id ? editingStory : story);
    const draftCms = mobileMode
      ? { ...cmsData, mobileContent: { ...(cmsData.mobileContent || {}), stories: draftStories } }
      : { ...cmsData, stories: draftStories };
    const sendDraft = () => editorPreviewRef.current?.contentWindow?.postMessage({ type: "studio-cms-preview", cms: draftCms }, window.location.origin);
    const onReady = (event) => {
      if (event.origin === window.location.origin && event.data?.type === "studio-cms-preview-ready") sendDraft();
    };
    window.addEventListener("message", onReady);
    const timer = window.setTimeout(sendDraft, 140);
    return () => { window.clearTimeout(timer); window.removeEventListener("message", onReady); };
  }, [cmsData, editingStory, mobileMode, stories]);

  const handleReorder = (idx, direction) => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= stories.length) return;

    const updated = [...stories];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);

    const reordered = updated.map((item, i) => ({ ...item, order: i + 1 }));
    setStories(reordered);
    persistStories(reordered);
  };

  const handleTogglePublish = (id) => {
    const updated = stories.map((s) =>
      s.id === id ? { ...s, published: s.published === false ? true : false } : s
    );
    setStories(updated);
    persistStories(updated);
  };

  const handleDelete = (story) => {
    setDeleteTargetStory(story);
  };

  const handleOpenEdit = (story) => {
    const copy = JSON.parse(JSON.stringify(story));
    setEditingStory({ ...copy, pageContent: getCategoryPageContent(copy) });
    setIsCreatingNew(false);
  };

  const updatePageContent = (key, value) => {
    setEditingStory((current) => ({
      ...current,
      pageContent: { ...getCategoryPageContent(current), [key]: value },
    }));
  };

  const updatePageColor = (section, target, color) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return {
        ...current,
        pageContent: {
          ...pageContent,
          sectionColors: {
            ...(pageContent.sectionColors || {}),
            [section]: { ...(pageContent.sectionColors?.[section] || {}), [target]: color },
          },
        },
      };
    });
  };

  const updateSectionImage = (section, updates) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return {
        ...current,
        pageContent: {
          ...pageContent,
          sectionImages: {
            ...(pageContent.sectionImages || {}),
            [section]: { ...(pageContent.sectionImages?.[section] || {}), ...updates },
          },
        },
      };
    });
  };

  const updateDisplaySetting = (viewport, section, key, value) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return {
        ...current,
        pageContent: {
          ...pageContent,
          displaySettings: {
            ...pageContent.displaySettings,
            [viewport]: {
              ...(pageContent.displaySettings?.[viewport] || {}),
              [section]: { ...(pageContent.displaySettings?.[viewport]?.[section] || {}), [key]: value },
            },
          },
        },
      };
    });
  };

  const updateMobileCopy = (key, value) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return {
        ...current,
        pageContent: {
          ...pageContent,
          mobileOverrides: {
            ...pageContent.mobileOverrides,
            copy: { ...pageContent.mobileOverrides.copy, [key]: value },
          },
        },
      };
    });
  };

  const updateMobileImage = (section, updates) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return {
        ...current,
        pageContent: {
          ...pageContent,
          mobileOverrides: {
            ...pageContent.mobileOverrides,
            images: {
              ...pageContent.mobileOverrides.images,
              [section]: { ...(pageContent.mobileOverrides.images?.[section] || {}), ...updates },
            },
          },
        },
      };
    });
  };

  const updateMobileGalleryCard = (index, key, value) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      const galleryCards = pageContent.mobileOverrides.galleryCards.length
        ? [...pageContent.mobileOverrides.galleryCards]
        : [...pageContent.galleryCards];
      galleryCards[index] = { ...(galleryCards[index] || {}), [key]: value };
      return {
        ...current,
        pageContent: {
          ...pageContent,
          mobileOverrides: { ...pageContent.mobileOverrides, galleryCards },
        },
      };
    });
  };

  const removeMobileGalleryCard = (index) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      const galleryCards = pageContent.mobileOverrides.galleryCards.length
        ? [...pageContent.mobileOverrides.galleryCards]
        : [...pageContent.galleryCards];
      galleryCards.splice(index, 1);
      return { ...current, pageContent: { ...pageContent, mobileOverrides: { ...pageContent.mobileOverrides, galleryCards } } };
    });
  };

  const updateMobileCard = (listKey, index, key, value) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      const sourceCards = pageContent.mobileOverrides.cards?.[listKey] || pageContent[listKey];
      const cards = [...sourceCards];
      cards[index] = { ...cards[index], [key]: value };
      return {
        ...current,
        pageContent: {
          ...pageContent,
          mobileOverrides: {
            ...pageContent.mobileOverrides,
            cards: { ...pageContent.mobileOverrides.cards, [listKey]: cards },
          },
        },
      };
    });
  };

  const addMobileCard = (listKey, template) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      const sourceCards = pageContent.mobileOverrides.cards?.[listKey] || pageContent[listKey];
      return {
        ...current,
        pageContent: {
          ...pageContent,
          mobileOverrides: {
            ...pageContent.mobileOverrides,
            cards: { ...pageContent.mobileOverrides.cards, [listKey]: [...sourceCards, { ...template }] },
          },
        },
      };
    });
  };

  const removeMobileCard = (listKey, index) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      const sourceCards = pageContent.mobileOverrides.cards?.[listKey] || pageContent[listKey];
      return {
        ...current,
        pageContent: {
          ...pageContent,
          mobileOverrides: {
            ...pageContent.mobileOverrides,
            cards: { ...pageContent.mobileOverrides.cards, [listKey]: sourceCards.filter((_, cardIndex) => cardIndex !== index) },
          },
        },
      };
    });
  };

  const updatePageCard = (listKey, index, field, value) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      const cards = [...pageContent[listKey]];
      cards[index] = { ...cards[index], [field]: value };
      return { ...current, pageContent: { ...pageContent, [listKey]: cards } };
    });
  };

  const removePageCard = (listKey, index) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return { ...current, pageContent: { ...pageContent, [listKey]: pageContent[listKey].filter((_, itemIndex) => itemIndex !== index) } };
    });
  };

  const addPageCard = (listKey, template) => {
    setEditingStory((current) => {
      const pageContent = getCategoryPageContent(current);
      return { ...current, pageContent: { ...pageContent, [listKey]: [...pageContent[listKey], { ...template }] } };
    });
  };

  const handleOpenCreate = () => {
    const newTemplate = {
      id: `story-${Date.now()}`,
      category: "Portraits",
      issueKicker: "FIELD NOTES / MONOGRAPH",
      backLabel: "← Stories",
      backTo: "/stories",
      headline: "New Editorial Field Note",
      deck: "An unhurried exploration of form, light, and presence.",
      byline: "Photography & Words by Phantom Labs",
      leadImage: {
        src: "/images/hero-villa-wide.jpg",
        alt: "Lead photographic plate",
        caption: "Natural daylight study in medium format.",
      },
      openingEssay: [
        "In the quiet margins between structured poses, human vulnerability emerges without rehearsal.",
        "We approach each session as an archival conversation rather than a commercial transaction.",
      ],
      subject: {
        tag: "02 / THE PROFILE",
        name: "Subject Name",
        role: "Artist & Creative",
        quote: "Stillness is not absence, but the presence of attention.",
        bioTitle: "In Unhurried Light",
        bio: "An intimate portrait session exploring natural window light and subtle cadence.",
        detailTitle: "Atmosphere",
        detailText: "North daylight loft, 120mm medium format.",
        image: {
          src: "/images/editorial/mira-studio-lead.jpg",
          alt: "Subject portrait",
          caption: "Natural window illumination.",
        },
      },
      moments: {
        tag: "03 / THE SEQUENCE",
        title: "The Session, in Moments",
        intro: "A chronological unfolding of light and gesture across the afternoon.",
        diptych: [
          {
            src: "/images/editorial/mira-studio-lead.jpg",
            alt: "First moment frame",
            caption: "The first hour: finding rhythm.",
          },
          {
            src: "/images/hero-villa-wide.jpg",
            alt: "Second moment frame",
            caption: "The second hour: settling into stillness.",
          },
        ],
        passage1: "Light moves slowly across the concrete sills, shifting from warm amber into soft charcoal shadows.",
        envFigure: {
          src: "/images/hero-villa-wide.jpg",
          alt: "Environmental architectural frame",
          caption: "Wide architectural overview of the daylight loft studio.",
        },
        passage2: "When the subject stops looking for the camera, the camera can finally see the subject.",
      },
      behind: {
        tag: "04 / BEHIND THE CRAFT",
        title: "Craft Notes & Technique",
        intro: "Technical notes on illumination, film emulation, and composition.",
        craftCards: [
          { kicker: "LIGHTING", title: "Single Source Daylight", text: "Filtered north daylight through sheer linen." },
          { kicker: "OPTICS", title: "Prime Lenses Only", text: "55mm and 80mm manual primes for natural perspective." },
          { kicker: "TONES", title: "Analog Color Response", text: "Subtle silver halide roll-off in highlights." },
        ],
      },
      pause: {
        quote: "The camera is an instrument that teaches people how to see without a camera.",
        reflections: [
          "True elegance in photography is the art of elimination.",
          "When you remove everything extraneous, what remains is unmistakable.",
        ],
      },
      final: {
        tag: "05 / THE EPILOGUE",
        title: "The Final Frames",
        image: {
          src: "/images/editorial/mira-studio-lead.jpg",
          alt: "Final master plate",
          caption: "Closing plate: Delivered in archival high resolution.",
        },
        conclusion: [
          "The session concluded as the sun dipped behind the western ridge.",
          "These frames remain as testimony to an afternoon of quiet observation.",
        ],
      },
      published: true,
      order: stories.length + 1,
    };

    setEditingStory({ ...newTemplate, pageContent: getCategoryPageContent(newTemplate) });
    setIsCreatingNew(true);
  };

  const handleSaveEditingStory = async (e) => {
    e.preventDefault();
    if (!editingStory || !editingStory.headline.trim()) return;

    let updated;
    if (isCreatingNew) {
      updated = [editingStory, ...stories];
    } else {
      updated = stories.map((s) => (s.id === editingStory.id ? editingStory : s));
    }

    setStories(updated);
    persistStories(updated);
    const publishableCms = mobileMode
      ? { ...cmsData, mobileContent: { ...(cmsData.mobileContent || {}), stories: updated } }
      : { ...cmsData, stories: updated };
    await saveCMSChanges(publishableCms);
    if (!fullPage) setEditingStory(null);
    setIsCreatingNew(false);
  };

  return (
    <div className={fullPage ? "category-editor-full-page" : undefined} style={{ display: "flex", flexDirection: "column", gap: fullPage ? 0 : "24px" }}>
      {!fullPage && <>
      {/* View Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>{mobileMode ? "MOBILE WEBSITE CMS" : "DESKTOP WEBSITE CMS"}</div>
          <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
            Category detail pages & visual stories
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
            {mobileMode ? "Mobile content, images, crops, color and text placement are saved only to Mobile CMS." : "Desktop content, images, crops, color and text placement are saved only to Desktop CMS."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="studio-btn-secondary"
            onClick={handleOpenCreate}
          >
            <Plus size={14} />
            + Create New Story
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

      {/* Stories List */}
      <div className="studio-card">
        {initialCategoryId && !editingStory && !isLoading && !stories.some((story) => String(story.id || "").toLowerCase() === initialCategoryId.toLowerCase() || String(story.category || "").toLowerCase() === initialCategoryId.toLowerCase()) && (
          <div role="status" style={{ padding: 14, marginBottom: 12, borderRadius: 8, background: "#fff8e8", color: "#70541e" }}>
            No full category page is configured for {initialCategoryId}. Create a page below; its content and media will be saved independently in this {mobileMode ? "Mobile" : "Desktop"} CMS.
            <button type="button" className="studio-btn-secondary studio-btn-sm" style={{ marginLeft: 12 }} onClick={() => handleOpenCreate()}><Plus size={13} /> Create category page</button>
          </div>
        )}
        {isLoading ? (
          <AdminLoadingSkeleton rows={4} type="cards" />
        ) : stories.length === 0 ? (
          <AdminEmptyState
            icon={BookOpen}
            title="No magazine stories or field notes created"
            description="Create your first editorial story with photos, essays, pull quotes, and craft notes to publish on the live site."
            actionLabel="+ Create First Story"
            onAction={handleOpenCreate}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {stories.map((story, idx) => {
              const coverImg =
                story.leadImage?.src ||
                story.leadImage ||
                story.coverImage ||
                "/images/hero-villa-wide.jpg";

              const isPublished = story.published !== false;

              return (
                <div
                  key={story.id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "#FAF9F6",
                    border: "1px solid var(--studio-border-crisp)",
                    borderRadius: "10px",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "280px", flex: 1 }}>
                    <img
                      src={coverImg}
                      alt={story.headline}
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        backgroundColor: "#111111",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/dashboard-mountains.png";
                      }}
                    />

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: "600", margin: 0, color: "var(--studio-text-primary)" }}>
                          {story.headline}
                        </h4>
                        <span className="studio-badge studio-badge-subtle" style={{ fontSize: "10px" }}>
                          {story.category || "Story"}
                        </span>
                        {!isPublished && (
                          <span style={{ fontSize: "11px", color: "#8E8E93", fontStyle: "italic" }}>
                            (Draft)
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "12.5px", color: "var(--studio-text-muted)", marginTop: "4px" }}>
                        {story.deck ? (story.deck.length > 75 ? story.deck.slice(0, 75) + "..." : story.deck) : story.issueKicker}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="studio-btn-secondary studio-btn-sm"
                      disabled={idx === 0}
                      onClick={() => handleReorder(idx, "up")}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>

                    <button
                      type="button"
                      className="studio-btn-secondary studio-btn-sm"
                      disabled={idx === stories.length - 1}
                      onClick={() => handleReorder(idx, "down")}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>

                    <button
                      type="button"
                      className="studio-btn-secondary studio-btn-sm"
                      onClick={() => handleTogglePublish(story.id)}
                    >
                      {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                      {isPublished ? "Published" : "Draft"}
                    </button>

                    <button
                      type="button"
                      className="studio-btn-primary studio-btn-sm"
                      onClick={() => handleOpenEdit(story)}
                    >
                      <Edit3 size={13} />
                      Edit Content & Photos
                    </button>

                    <button
                      type="button"
                      className="studio-btn-secondary studio-btn-sm"
                      onClick={() => handleDelete(story)}
                      title="Delete Story"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>}

      {/* Full Story Builder Modal */}
      {editingStory && (
        <div className={fullPage ? "category-editor-page-backdrop" : "studio-modal-backdrop category-builder-backdrop"} onClick={() => !fullPage && setEditingStory(null)}>
          <div
            className={fullPage ? "category-editor-page-panel" : "studio-modal-content category-builder-modal"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="studio-modal-header category-builder-header" style={{ position: "sticky", top: 0, backgroundColor: "#FFFFFF", zIndex: 10, paddingBottom: "12px", borderBottom: "1px solid var(--studio-border-crisp)" }}>
              <div>
                <div className="studio-eyebrow">{mobileMode ? "MOBILE PAGE STUDIO" : "DESKTOP PAGE STUDIO"} · {editingStory.category || "CATEGORY"}</div>
                <h3 className="studio-serif" style={{ fontSize: "22px", margin: "4px 0 0 0" }}>
                  {isCreatingNew ? "Create New Visual Story" : `Edit: ${editingStory.headline}`}
                </h3>
              </div>
              <button
                type="button"
                className="studio-btn-secondary studio-btn-sm"
                onClick={() => fullPage ? onExit?.() : setEditingStory(null)}
              >
                {fullPage ? <ArrowLeft size={14} /> : <X size={14} />}
                {fullPage ? "Back to CMS" : null}
              </button>
            </div>

            <form onSubmit={handleSaveEditingStory} className="category-builder-grid">
              <nav className="category-builder-rail" aria-label="Page editor sections">
                <span className="studio-eyebrow">PAGE MAP</span>
                <a href="#builder-story" className="category-builder-nav-link">01&nbsp; Story & cover</a>
                <a href="#builder-page-sections" className="category-builder-nav-link">02&nbsp; Page sections</a>
                {!mobileMode && <a href="#builder-desktop-layout" className="category-builder-nav-link">03&nbsp; Desktop layout</a>}
                {mobileMode && <a href="#builder-mobile-layout" className="category-builder-nav-link">03&nbsp; Mobile layout</a>}
                <div className="category-builder-rail-note">Changes save to<br /><strong>{mobileMode ? "Mobile CMS only" : "Desktop CMS only"}</strong></div>
              </nav>
              <div className="category-builder-form-scroll" id="builder-story">
              {/* Basic Meta */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="studio-form-group">
                  <label className="studio-form-label">Category / Genre</label>
                  <select
                    className="studio-select"
                    value={editingStory.category || "Portraits"}
                    onChange={(e) =>
                      setEditingStory({ ...editingStory, category: e.target.value })
                    }
                  >
                    <option value="Portraits">Portraits</option>
                    <option value="Couples">Couples</option>
                    <option value="Events">Events</option>
                    <option value="Brands">Brands</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Editorial">Editorial</option>
                  </select>
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Issue Kicker (Header Tag)</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={editingStory.issueKicker || ""}
                    onChange={(e) =>
                      setEditingStory({ ...editingStory, issueKicker: e.target.value })
                    }
                    placeholder="e.g. FIELD NOTES / PORTRAITURE / NO. 04"
                  />
                </div>
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Story Headline</label>
                <input
                  type="text"
                  className="studio-input"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                  required
                  value={editingStory.headline || ""}
                  onChange={(e) =>
                    setEditingStory({ ...editingStory, headline: e.target.value })
                  }
                  placeholder="e.g. The quiet art of being seen"
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Story Deck / Subtitle</label>
                <textarea
                  className="studio-textarea"
                  rows={2}
                  value={editingStory.deck || ""}
                  onChange={(e) =>
                    setEditingStory({ ...editingStory, deck: e.target.value })
                  }
                  placeholder="A thoughtful sentence summarizing the session atmosphere..."
                />
              </div>

              {/* Lead Photograph */}
              <div style={{ padding: "18px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                <h4 style={{ fontSize: "14.5px", fontWeight: "600", margin: "0 0 12px 0" }}>
                  1. Lead Hero Photograph
                </h4>

                <ImageUploadControl
                  label="Lead Master Photo"
                  value={editingStory.leadImage?.src || editingStory.leadImage || ""}
                  objectPosition={editingStory.leadImage?.objectPosition || "50% 50%"}
                  cropZoom={editingStory.leadImage?.cropZoom || 1}
                  onCropChange={(crop) => setEditingStory({
                    ...editingStory,
                    leadImage: { ...(typeof editingStory.leadImage === "object" ? editingStory.leadImage : {}), ...crop },
                  })}
                  onChange={(url) =>
                    setEditingStory({
                      ...editingStory,
                      leadImage: {
                        ...(typeof editingStory.leadImage === "object" ? editingStory.leadImage : {}),
                        src: url,
                      },
                    })
                  }
                  aspectRatio="16/9"
                  helperText="High-resolution hero photo for the article banner and gallery cover."
                />

                <div className="studio-form-group" style={{ marginTop: "10px" }}>
                  <label className="studio-form-label">Lead Photo Caption</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={editingStory.leadImage?.caption || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        leadImage: {
                          ...(typeof editingStory.leadImage === "object" ? editingStory.leadImage : {}),
                          caption: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Mira, 2:40 PM, natural north light through sheer linen."
                  />
                </div>
              </div>

              {/* Opening Essay */}
              <div style={{ padding: "18px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                <h4 style={{ fontSize: "14.5px", fontWeight: "600", margin: "0 0 12px 0" }}>
                  2. Opening Essay Paragraphs
                </h4>
                <div className="studio-form-group">
                  <label className="studio-form-label">Paragraph 1 (Drop-Cap Start)</label>
                  <textarea
                    className="studio-textarea"
                    rows={3}
                    value={editingStory.openingEssay?.[0] || ""}
                    onChange={(e) => {
                      const essay = [...(editingStory.openingEssay || ["", ""])];
                      essay[0] = e.target.value;
                      setEditingStory({ ...editingStory, openingEssay: essay });
                    }}
                  />
                </div>
                <div className="studio-form-group">
                  <label className="studio-form-label">Paragraph 2</label>
                  <textarea
                    className="studio-textarea"
                    rows={3}
                    value={editingStory.openingEssay?.[1] || ""}
                    onChange={(e) => {
                      const essay = [...(editingStory.openingEssay || ["", ""])];
                      essay[1] = e.target.value;
                      setEditingStory({ ...editingStory, openingEssay: essay });
                    }}
                  />
                </div>
              </div>

              {/* Subject Profile */}
              <div style={{ padding: "18px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                <h4 style={{ fontSize: "14.5px", fontWeight: "600", margin: "0 0 12px 0" }}>
                  3. Meet the Subject / Focus Profile
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Subject Name</label>
                    <input
                      type="text"
                      className="studio-input"
                      value={editingStory.subject?.name || ""}
                      onChange={(e) =>
                        setEditingStory({
                          ...editingStory,
                          subject: { ...(editingStory.subject || {}), name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Role / Context</label>
                    <input
                      type="text"
                      className="studio-input"
                      value={editingStory.subject?.role || ""}
                      onChange={(e) =>
                        setEditingStory({
                          ...editingStory,
                          subject: { ...(editingStory.subject || {}), role: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="studio-form-group">
                  <label className="studio-form-label">Subject Quote</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={editingStory.subject?.quote || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        subject: { ...(editingStory.subject || {}), quote: e.target.value },
                      })
                    }
                  />
                </div>

                <ImageUploadControl
                  label="Subject Portrait Frame"
                  value={editingStory.subject?.image?.src || editingStory.subject?.image || ""}
                  objectPosition={editingStory.subject?.image?.objectPosition || "50% 50%"}
                  cropZoom={editingStory.subject?.image?.cropZoom || 1}
                  onCropChange={(crop) => setEditingStory({
                    ...editingStory,
                    subject: { ...(editingStory.subject || {}), image: { ...(typeof editingStory.subject?.image === "object" ? editingStory.subject.image : {}), ...crop } },
                  })}
                  onChange={(url) =>
                    setEditingStory({
                      ...editingStory,
                      subject: {
                        ...(editingStory.subject || {}),
                        image: {
                          ...(typeof editingStory.subject?.image === "object" ? editingStory.subject.image : {}),
                          src: url,
                        },
                      },
                    })
                  }
                  aspectRatio="3/4"
                  helperText="Vertical portrait photo of the subject."
                />

                <div className="studio-form-group" style={{ marginTop: "10px" }}>
                  <label className="studio-form-label">Subject Narrative / Bio</label>
                  <textarea
                    className="studio-textarea"
                    rows={3}
                    value={editingStory.subject?.bio || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        subject: { ...(editingStory.subject || {}), bio: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Moments Diptych */}
              <div style={{ padding: "18px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                <h4 style={{ fontSize: "14.5px", fontWeight: "600", margin: "0 0 12px 0" }}>
                  4. The Session In Moments (Diptych & Environmental)
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <ImageUploadControl
                      label="Diptych Frame 1"
                      value={editingStory.moments?.diptych?.[0]?.src || ""}
                      objectPosition={editingStory.moments?.diptych?.[0]?.objectPosition || "50% 50%"}
                      cropZoom={editingStory.moments?.diptych?.[0]?.cropZoom || 1}
                      onCropChange={(crop) => {
                        const dip = [...(editingStory.moments?.diptych || [{}, {}])];
                        dip[0] = { ...(dip[0] || {}), ...crop };
                        setEditingStory({ ...editingStory, moments: { ...(editingStory.moments || {}), diptych: dip } });
                      }}
                      onChange={(url) => {
                        const dip = [...(editingStory.moments?.diptych || [{}, {}])];
                        dip[0] = { ...(dip[0] || {}), src: url };
                        setEditingStory({
                          ...editingStory,
                          moments: { ...(editingStory.moments || {}), diptych: dip },
                        });
                      }}
                      aspectRatio="3/4"
                    />
                    <input
                      type="text"
                      className="studio-input studio-btn-sm"
                      placeholder="Frame 1 Caption"
                      style={{ marginTop: "6px" }}
                      value={editingStory.moments?.diptych?.[0]?.caption || ""}
                      onChange={(e) => {
                        const dip = [...(editingStory.moments?.diptych || [{}, {}])];
                        dip[0] = { ...(dip[0] || {}), caption: e.target.value };
                        setEditingStory({
                          ...editingStory,
                          moments: { ...(editingStory.moments || {}), diptych: dip },
                        });
                      }}
                    />
                  </div>

                  <div>
                    <ImageUploadControl
                      label="Diptych Frame 2"
                      value={editingStory.moments?.diptych?.[1]?.src || ""}
                      objectPosition={editingStory.moments?.diptych?.[1]?.objectPosition || "50% 50%"}
                      cropZoom={editingStory.moments?.diptych?.[1]?.cropZoom || 1}
                      onCropChange={(crop) => {
                        const dip = [...(editingStory.moments?.diptych || [{}, {}])];
                        dip[1] = { ...(dip[1] || {}), ...crop };
                        setEditingStory({ ...editingStory, moments: { ...(editingStory.moments || {}), diptych: dip } });
                      }}
                      onChange={(url) => {
                        const dip = [...(editingStory.moments?.diptych || [{}, {}])];
                        dip[1] = { ...(dip[1] || {}), src: url };
                        setEditingStory({
                          ...editingStory,
                          moments: { ...(editingStory.moments || {}), diptych: dip },
                        });
                      }}
                      aspectRatio="3/4"
                    />
                    <input
                      type="text"
                      className="studio-input studio-btn-sm"
                      placeholder="Frame 2 Caption"
                      style={{ marginTop: "6px" }}
                      value={editingStory.moments?.diptych?.[1]?.caption || ""}
                      onChange={(e) => {
                        const dip = [...(editingStory.moments?.diptych || [{}, {}])];
                        dip[1] = { ...(dip[1] || {}), caption: e.target.value };
                        setEditingStory({
                          ...editingStory,
                          moments: { ...(editingStory.moments || {}), diptych: dip },
                        });
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <ImageUploadControl
                    label="Wide Environmental Frame"
                    value={editingStory.moments?.envFigure?.src || ""}
                    objectPosition={editingStory.moments?.envFigure?.objectPosition || "50% 50%"}
                    cropZoom={editingStory.moments?.envFigure?.cropZoom || 1}
                    onCropChange={(crop) => setEditingStory({
                      ...editingStory,
                      moments: { ...(editingStory.moments || {}), envFigure: { ...(editingStory.moments?.envFigure || {}), ...crop } },
                    })}
                    onChange={(url) =>
                      setEditingStory({
                        ...editingStory,
                        moments: {
                          ...(editingStory.moments || {}),
                          envFigure: {
                            ...(editingStory.moments?.envFigure || {}),
                            src: url,
                          },
                        },
                      })
                    }
                    aspectRatio="16/9"
                  />
                  <input
                    type="text"
                    className="studio-input studio-btn-sm"
                    placeholder="Environmental Photo Caption"
                    style={{ marginTop: "6px" }}
                    value={editingStory.moments?.envFigure?.caption || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        moments: {
                          ...(editingStory.moments || {}),
                          envFigure: {
                            ...(editingStory.moments?.envFigure || {}),
                            caption: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Category page sections added to the live experience */}
              <details id="builder-page-sections" open style={{ padding: "18px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                <summary style={{ cursor: "pointer", fontSize: "15px", fontWeight: 650 }}>Category page sections & gallery</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "18px" }}>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Closer look heading</label>
                    <input className="studio-input" value={editingStory.pageContent?.closerLookHeading || ""} onChange={(e) => updatePageContent("closerLookHeading", e.target.value)} />
                  </div>

                  <div style={{ padding: "16px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                      <h5 style={{ margin: 0, fontSize: "13px", fontWeight: 650 }}>Gallery cards (up to 6)</h5>
                      <button type="button" className="studio-btn-secondary studio-btn-sm" disabled={(editingStory.pageContent?.galleryCards?.length || 0) >= 6} onClick={() => addPageCard("galleryCards", { src: "", alt: "", caption: "" })}><Plus size={13} /> Add photo</button>
                    </div>
                    {(editingStory.pageContent?.galleryCards || []).map((image, index) => (
                      <div key={`gallery-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "12px", alignItems: "start", padding: "14px 0", borderTop: "1px solid var(--studio-border-crisp)" }}>
                        <div>
                          <ImageUploadControl
                            label={`Gallery photo ${index + 1}`}
                            value={image.src || ""}
                            objectPosition={image.objectPosition || "50% 50%"}
                            cropZoom={image.cropZoom || 1}
                            onCropChange={(crop) => {
                              updatePageCard("galleryCards", index, "objectPosition", crop.objectPosition);
                              updatePageCard("galleryCards", index, "cropZoom", crop.cropZoom);
                            }}
                            onChange={(url) => updatePageCard("galleryCards", index, "src", url)}
                            aspectRatio="4/5"
                            helperText="This photo appears in the large scrolling gallery on the category page."
                          />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                            <div className="studio-form-group" style={{ margin: 0 }}>
                              <label className="studio-form-label">Alt text</label>
                              <input className="studio-input" value={image.alt || ""} onChange={(e) => updatePageCard("galleryCards", index, "alt", e.target.value)} />
                            </div>
                            <div className="studio-form-group" style={{ margin: 0 }}>
                              <label className="studio-form-label">Caption</label>
                              <input className="studio-input" value={image.caption || ""} onChange={(e) => updatePageCard("galleryCards", index, "caption", e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <button type="button" className="studio-btn-secondary studio-btn-sm" aria-label={`Remove gallery photo ${index + 1}`} onClick={() => removePageCard("galleryCards", index)}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {[
                      ["experience", editingStory.category === "Editorial" ? "Editorial experience image" : "Experience section image", "16/9", editingStory.category === "Editorial" ? "Large image shown below the editorial typography." : "Background or lead image behind this section."],
                      ["approach", editingStory.category === "Editorial" ? "Editorial portrait image" : "Approach section image", "4/5", "Image used for the approach or editorial camera section."],
                      ["perspective", "Perspective section image", "16/9", "Large image used in the perspective section."],
                    ].map(([section, label, ratio, helperText]) => {
                      const image = editingStory.pageContent?.sectionImages?.[section] || {};
                      return (
                        <div key={section} style={{ padding: "14px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#fff" }}>
                          <ImageUploadControl
                            label={label}
                            value={image.src || ""}
                            objectPosition={image.objectPosition || "50% 50%"}
                            cropZoom={image.cropZoom || 1}
                            onCropChange={(crop) => updateSectionImage(section, crop)}
                            onChange={(src) => updateSectionImage(section, { src })}
                            aspectRatio={ratio}
                            helperText={helperText}
                          />
                          <div className="studio-form-group" style={{ marginTop: "8px" }}>
                            <label className="studio-form-label">Image description / alt text</label>
                            <input className="studio-input" value={image.alt || ""} onChange={(e) => updateSectionImage(section, { alt: e.target.value })} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="studio-form-group">
                    <label className="studio-form-label">Experience eyebrow</label>
                    <input className="studio-input" value={editingStory.pageContent?.experienceEyebrow || ""} onChange={(e) => updatePageContent("experienceEyebrow", e.target.value)} />
                  </div>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Experience headline (use a new line to split)</label>
                    <textarea className="studio-textarea" rows={2} value={editingStory.pageContent?.experienceHeading || ""} onChange={(e) => updatePageContent("experienceHeading", e.target.value)} />
                  </div>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Experience supporting copy</label>
                    <textarea className="studio-textarea" rows={3} value={editingStory.pageContent?.experienceDescription || ""} onChange={(e) => updatePageContent("experienceDescription", e.target.value)} />
                  </div>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Experience lead line</label>
                    <input className="studio-input" value={editingStory.pageContent?.experienceLead || ""} onChange={(e) => updatePageContent("experienceLead", e.target.value)} />
                  </div>

                  <EditableStoryCards
                    title="Feature cards"
                    cards={editingStory.pageContent?.featureCards || []}
                    fields={[{ key: "title", label: "Card title" }, { key: "imageIndex", label: "Gallery photo number (1–6)", type: "number", min: 1, max: 6 }, { key: "text", label: "Card copy", multiline: true, wide: true }]}
                    onUpdate={(index, field, value) => updatePageCard("featureCards", index, field, value)}
                    onAdd={() => addPageCard("featureCards", { title: "New feature.", text: "Add a short description.", imageIndex: 1 })}
                    onRemove={(index) => removePageCard("featureCards", index)}
                  />
                  <div className="studio-form-group">
                    <label className="studio-form-label">Feature cards section heading</label>
                    <input className="studio-input" value={editingStory.pageContent?.featureHeading || ""} onChange={(e) => updatePageContent("featureHeading", e.target.value)} />
                  </div>

                  <div className="studio-form-group">
                    <label className="studio-form-label">Approach heading</label>
                    <input className="studio-input" value={editingStory.pageContent?.approachHeading || ""} onChange={(e) => updatePageContent("approachHeading", e.target.value)} />
                  </div>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Approach introduction</label>
                    <textarea className="studio-textarea" rows={2} value={editingStory.pageContent?.approachDescription || ""} onChange={(e) => updatePageContent("approachDescription", e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[["perspectiveEyebrow", "Perspective section eyebrow"], ["perspectiveHeading", "Perspective section headline"]].map(([key, label]) => (
                      <div className="studio-form-group" key={key} style={{ margin: 0 }}>
                        <label className="studio-form-label">{label}</label>
                        <input className="studio-input" value={editingStory.pageContent?.[key] || ""} onChange={(e) => updatePageContent(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <EditableStoryCards
                    title="Approach cards"
                    cards={editingStory.pageContent?.approachCards || []}
                    fields={[{ key: "title", label: "Card title" }, { key: "text", label: "Card copy", multiline: true, wide: true }]}
                    onUpdate={(index, field, value) => updatePageCard("approachCards", index, field, value)}
                    onAdd={() => addPageCard("approachCards", { title: "New approach", text: "Describe the approach." })}
                    onRemove={(index) => removePageCard("approachCards", index)}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      ["cameraLabel", "Editorial camera label"],
                      ["cameraHeading", "Editorial camera headline (split with new lines)"],
                      ["cameraDescription", "Editorial camera supporting copy"],
                      ["collectionEyebrow", "Editorial collection eyebrow"],
                      ["collectionHeading", "Editorial collection headline (split with new lines)"],
                      ["collectionDescription", "Editorial collection description"],
                    ].map(([key, label]) => (
                      <div className="studio-form-group" key={key} style={{ margin: 0 }}>
                        <label className="studio-form-label">{label}</label>
                        {key.toLowerCase().includes("description") || key.toLowerCase().includes("heading") ? (
                          <textarea className="studio-textarea" rows={2} value={editingStory.pageContent?.[key] || ""} onChange={(e) => updatePageContent(key, e.target.value)} />
                        ) : (
                          <input className="studio-input" value={editingStory.pageContent?.[key] || ""} onChange={(e) => updatePageContent(key, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="studio-form-group">
                    <label className="studio-form-label">Why Phantom Labs heading</label>
                    <textarea className="studio-textarea" rows={2} value={editingStory.pageContent?.whyHeading || ""} onChange={(e) => updatePageContent("whyHeading", e.target.value)} />
                  </div>
                  <div className="studio-form-group">
                    <label className="studio-form-label">Why Phantom Labs introduction</label>
                    <input className="studio-input" value={editingStory.pageContent?.whyLead || ""} onChange={(e) => updatePageContent("whyLead", e.target.value)} />
                  </div>
                  <EditableStoryCards
                    title="Why Phantom Labs cards"
                    cards={editingStory.pageContent?.whyCards || []}
                    fields={[{ key: "title", label: "Card title" }, { key: "text", label: "Card copy", multiline: true, wide: true }]}
                    onUpdate={(index, field, value) => updatePageCard("whyCards", index, field, value)}
                    onAdd={() => addPageCard("whyCards", { title: "New reason", text: "Describe why clients choose Phantom Labs.", icon: 3 })}
                    onRemove={(index) => removePageCard("whyCards", index)}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      ["whyFooterHeading", "Why section closing title"],
                      ["whyFooterText", "Why section closing copy"],
                      ["whyExploreLabel", "Explore work link label"],
                      ["whyExploreLink", "Explore work link destination"],
                      ["whyCtaLabel", "Why section button label"],
                      ["whyCtaLink", "Why section button link"],
                      ["valuesHeading", "Values section heading"],
                    ].map(([key, label]) => (
                      <div className="studio-form-group" key={key} style={{ margin: 0 }}>
                        <label className="studio-form-label">{label}</label>
                        <input className="studio-input" value={editingStory.pageContent?.[key] || ""} onChange={(e) => updatePageContent(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <EditableStoryCards
                    title="Values cards"
                    cards={editingStory.pageContent?.valueCards || []}
                    fields={[
                      { key: "title", label: "Card title" },
                      { key: "text", label: "Card copy", multiline: true, wide: true },
                      { key: "linkLabel", label: "Link label" },
                      { key: "linkTo", label: "Link destination" },
                    ]}
                    onUpdate={(index, field, value) => updatePageCard("valueCards", index, field, value)}
                    onAdd={() => addPageCard("valueCards", { title: "New value.", text: "Describe this value.", linkLabel: "Learn more", linkTo: "/stories" })}
                    onRemove={(index) => removePageCard("valueCards", index)}
                  />

                  <div style={{ padding: "16px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#fff" }}>
                    <h5 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 650 }}>Text colors by section</h5>
                    <p style={{ margin: "0 0 14px", fontSize: "11px", color: "var(--studio-text-muted)" }}>Set heading and body text colors independently. Leave a color unchanged to keep the current design color.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                      {[
                        ["opening", "Opening headline and intro"],
                        ["gallery", "Closer look and captions"],
                        ["experience", "Experience section"],
                        ["approach", "Approach section"],
                        ["perspective", "Perspective section"],
                        ["featureCards", "Feature cards"],
                        ["why", "Why Phantom Labs"],
                        ["values", "Our values"],
                        ["collection", "Editorial collection"],
                      ].map(([section, label]) => (
                        <div key={section} style={{ padding: "10px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px" }}>
                          <strong style={{ display: "block", marginBottom: "8px", fontSize: "11px" }}>{label}</strong>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            {[["heading", "Heading", "#1d1d1f"], ["body", "Body", "#6e6e73"]].map(([target, targetLabel, fallback]) => (
                              <label key={target} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "10px", color: "var(--studio-text-muted)" }}>
                                {targetLabel}
                                <input type="color" value={editingStory.pageContent?.sectionColors?.[section]?.[target] || fallback} onChange={(e) => updatePageColor(section, target, e.target.value)} aria-label={`${label} ${targetLabel.toLowerCase()} color`} />
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>

              {!mobileMode && <details id="builder-desktop-layout" style={{ padding: "18px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#FAF9F6" }}>
                <summary style={{ cursor: "pointer", fontSize: "15px", fontWeight: 650 }}>Desktop layout controls</summary>
                <p style={{ margin: "12px 0", color: "var(--studio-text-muted)", fontSize: "12px" }}>Position text over the image on desktop. Choose colors for all section headings and supporting copy above.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                  {(editingStory.category === "Editorial" ? [["opening", "Opening image"]] : [["opening", "Opening image"], ["experience", "Experience image"], ["perspective", "Perspective image"]]).map(([section, label]) => {
                    const settings = editingStory.pageContent?.displaySettings?.desktop?.[section] || {};
                    return (
                      <div key={section} style={{ padding: "12px", background: "#fff", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px" }}>
                        <strong style={{ fontSize: "12px" }}>{label} text placement</strong>
                        {[["textX", "Horizontal position"], ["textY", "Vertical position"]].map(([key, title]) => (
                          <label key={key} style={{ display: "grid", gap: "4px", marginTop: "10px", fontSize: "11px" }}>{title} · {settings[key] ?? (key === "textX" ? 7 : 72)}%
                            <input type="range" min="0" max="100" value={settings[key] ?? (key === "textX" ? 7 : 72)} onChange={(e) => updateDisplaySetting("desktop", section, key, Number(e.target.value))} aria-label={`Desktop ${label} ${title.toLowerCase()}`} />
                          </label>
                        ))}
                        <label style={{ display: "grid", gap: "4px", marginTop: "10px", fontSize: "11px" }}>Text alignment
                          <select className="studio-input" value={settings.textAlign || "left"} onChange={(e) => updateDisplaySetting("desktop", section, "textAlign", e.target.value)}>
                            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                          </select>
                        </label>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "14px" }}>
                  {[["opening", "Opening"], ["gallery", "Gallery"], ["experience", "Experience"], ["approach", "Approach"], ["perspective", "Perspective"], ["featureCards", "Feature cards"], ["why", "Why Phantom Labs"], ["values", "Values"], ["collection", "Editorial collection"]].map(([section, label]) => {
                    const settings = editingStory.pageContent?.displaySettings?.desktop?.[section] || {};
                    return (
                      <div key={section} style={{ padding: "10px", background: "#fff", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px" }}>
                        <strong style={{ display: "block", marginBottom: "8px", fontSize: "11px" }}>{label} type size · px · blank = design default</strong>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                          {[ ["headingSize", "Heading", 12, 160], ["bodySize", "Body", 10, 48] ].map(([key, title, min, max]) => (
                            <label key={key} style={{ display: "grid", gap: "4px", fontSize: "10px" }}>{title}
                              <input className="studio-input" type="number" min={min} max={max} value={settings[key] ?? ""} onChange={(e) => updateDisplaySetting("desktop", section, key, e.target.value ? Number(e.target.value) : "")} aria-label={`Desktop ${label} ${title.toLowerCase()} font size`} />
                            </label>
                          ))}
                        </div>
                        {section === "featureCards" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
                          {[ ["cardTitleSize", "Card title px", 10, 80], ["cardBodySize", "Card text px", 10, 40] ].map(([key, title, min, max]) => (
                            <label key={key} style={{ display: "grid", gap: "4px", fontSize: "10px" }}>{title}
                              <input className="studio-input" type="number" min={min} max={max} value={settings[key] ?? ""} onChange={(e) => updateDisplaySetting("desktop", section, key, e.target.value ? Number(e.target.value) : "")} aria-label={`Desktop ${title}`} />
                            </label>
                          ))}
                        </div>}
                      </div>
                    );
                  })}
                </div>
              </details>}

              {mobileMode && <details id="builder-mobile-layout" open style={{ padding: "18px", border: "1px solid #c6d9f5", borderRadius: "8px", background: "#f5f8fd" }}>
                <summary style={{ cursor: "pointer", fontSize: "15px", fontWeight: 700 }}>Mobile appearance, images & text positioning</summary>
                <p style={{ margin: "12px 0", color: "var(--studio-text-muted)", fontSize: "12px" }}>These settings apply only below 680px. Leave mobile text blank to reuse desktop copy. Upload mobile-specific images and crop them independently.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "18px" }}>
                  {[
                    ["opening", "Opening / hero image"], ["experience", "Experience image"],
                    ["approach", "Approach image"], ["perspective", "Perspective image"],
                  ].map(([section, label]) => {
                    const image = editingStory.pageContent?.mobileOverrides?.images?.[section] || {};
                    return (
                      <div key={section} style={{ padding: "12px", background: "#fff", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px" }}>
                        <ImageUploadControl
                          label={label}
                          value={image.src || ""}
                          objectPosition={image.objectPosition || "50% 50%"}
                          cropZoom={image.cropZoom || 1}
                          onCropChange={(crop) => updateMobileImage(section, crop)}
                          onChange={(src) => updateMobileImage(section, { src })}
                          aspectRatio={section === "opening" || section === "experience" ? "4/5" : "3/4"}
                          helperText="Used on mobile only."
                        />
                        <div className="studio-form-group" style={{ marginTop: "8px" }}>
                          <label className="studio-form-label">Mobile image alt text</label>
                          <input className="studio-input" value={image.alt || ""} onChange={(e) => updateMobileImage(section, { alt: e.target.value })} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: "12px", background: "#fff", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "12px" }}>Mobile gallery images</strong>
                    <button type="button" className="studio-btn-secondary studio-btn-sm" disabled={(editingStory.pageContent?.mobileOverrides?.galleryCards?.length || editingStory.pageContent?.galleryCards?.length || 0) >= 6} onClick={() => updateMobileGalleryCard(editingStory.pageContent?.mobileOverrides?.galleryCards?.length || editingStory.pageContent?.galleryCards?.length || 0, "src", "")}><Plus size={13} /> Add mobile image</button>
                  </div>
                  {(editingStory.pageContent?.mobileOverrides?.galleryCards?.length ? editingStory.pageContent.mobileOverrides.galleryCards : editingStory.pageContent?.galleryCards || []).map((image, index) => {
                    const mobileImage = editingStory.pageContent?.mobileOverrides?.galleryCards?.[index] || {};
                    return (
                      <div key={`mobile-gallery-${index}`} style={{ padding: "12px 0", borderTop: "1px solid var(--studio-border-crisp)" }}>
                        <ImageUploadControl
                          label={`Mobile gallery image ${index + 1}`}
                          value={mobileImage.src || ""}
                          objectPosition={mobileImage.objectPosition || "50% 50%"}
                          cropZoom={mobileImage.cropZoom || 1}
                          onCropChange={(crop) => { updateMobileGalleryCard(index, "objectPosition", crop.objectPosition); updateMobileGalleryCard(index, "cropZoom", crop.cropZoom); }}
                          onChange={(src) => updateMobileGalleryCard(index, "src", src)}
                          aspectRatio="4/5"
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <input className="studio-input" aria-label={`Mobile gallery image ${index + 1} alt text`} placeholder="Alt text" value={mobileImage.alt || ""} onChange={(e) => updateMobileGalleryCard(index, "alt", e.target.value)} />
                          <input className="studio-input" aria-label={`Mobile gallery image ${index + 1} caption`} placeholder="Caption" value={mobileImage.caption || ""} onChange={(e) => updateMobileGalleryCard(index, "caption", e.target.value)} />
                        </div>
                        <button type="button" className="studio-btn-secondary studio-btn-sm" style={{ marginTop: "8px" }} aria-label={`Remove mobile gallery image ${index + 1}`} onClick={() => removeMobileGalleryCard(index)}><Trash2 size={13} /> Remove mobile image</button>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                  {[
                    ["openingLabel", "Opening label"], ["openingHeadline", "Opening headline"], ["openingDeck", "Opening supporting copy"],
                    ["closerLookHeading", "Gallery heading"], ["experienceEyebrow", "Experience eyebrow"], ["experienceHeading", "Experience headline"],
                    ["experienceLead", "Experience lead line"], ["experienceDescription", "Experience supporting copy"],
                    ["cameraLabel", "Approach label"], ["cameraHeading", "Approach headline"], ["cameraDescription", "Approach supporting copy"],
                    ["approachHeading", "Approach section heading"], ["approachDescription", "Approach section copy"],
                    ["perspectiveEyebrow", "Perspective eyebrow"], ["perspectiveHeading", "Perspective headline"], ["featureHeading", "Feature cards heading"],
                    ["whyHeading", "Why Phantom Labs heading"], ["whyLead", "Why Phantom Labs introduction"], ["whyExploreLabel", "Explore work link"], ["whyExploreLink", "Explore work link destination"],
                    ["whyFooterHeading", "Why section closing title"], ["whyFooterText", "Why section closing copy"], ["whyCtaLabel", "Why section button label"], ["whyCtaLink", "Why section button destination"],
                    ["valuesHeading", "Values heading"], ["collectionEyebrow", "Collection eyebrow"], ["collectionHeading", "Collection headline"], ["collectionDescription", "Collection description"],
                  ].map(([key, label]) => (
                    <label key={key} className="studio-form-group" style={{ margin: 0 }}>
                      <span className="studio-form-label">{label}</span>
                      {key.toLowerCase().includes("description") || key.toLowerCase().includes("deck") || key.toLowerCase().includes("copy") || key.toLowerCase().includes("headline") || key === "whyHeading" ? (
                        <textarea className="studio-textarea" rows={2} placeholder={`Desktop: ${editingStory.pageContent?.[key] || ""}`} value={editingStory.pageContent?.mobileOverrides?.copy?.[key] || ""} onChange={(e) => updateMobileCopy(key, e.target.value)} />
                      ) : (
                        <input className="studio-input" placeholder={`Desktop: ${editingStory.pageContent?.[key] || ""}`} value={editingStory.pageContent?.mobileOverrides?.copy?.[key] || ""} onChange={(e) => updateMobileCopy(key, e.target.value)} />
                      )}
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "18px", padding: "14px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#fff" }}>
                  <p style={{ margin: 0, color: "var(--studio-text-muted)", fontSize: "11px" }}>Card copy below is independent from the desktop cards and appears on phones only.</p>
                  {[
                    ["featureCards", "Mobile feature cards", [{ title: "New feature.", text: "Add a short description.", imageIndex: 1 }]],
                    ["approachCards", "Mobile approach cards", [{ title: "New approach", text: "Describe the approach." }]],
                    ["whyCards", "Mobile Why Phantom Labs cards", [{ title: "New reason", text: "Describe why clients choose Phantom Labs.", icon: 3 }]],
                    ["valueCards", "Mobile values cards", [{ title: "New value.", text: "Describe this value.", linkLabel: "Learn more", linkTo: "/stories" }]],
                  ].map(([key, title, template]) => {
                    const cards = editingStory.pageContent?.mobileOverrides?.cards?.[key] || editingStory.pageContent?.[key] || [];
                    return (
                      <EditableStoryCards
                        key={key}
                        title={title}
                        cards={cards}
                        fields={key === "featureCards"
                          ? [{ key: "title", label: "Card title" }, { key: "imageIndex", label: "Mobile gallery photo number", type: "number", min: 1, max: 6 }, { key: "text", label: "Card copy", multiline: true, wide: true }]
                          : [{ key: "title", label: "Card title" }, { key: "text", label: "Card copy", multiline: true, wide: true }, ...(key === "valueCards" ? [{ key: "linkLabel", label: "Link label" }, { key: "linkTo", label: "Link destination" }] : [])]}
                        onUpdate={(index, field, value) => updateMobileCard(key, index, field, value)}
                        onAdd={() => addMobileCard(key, template[0])}
                        onRemove={(index) => removeMobileCard(key, index)}
                      />
                    );
                  })}
                </div>

                <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                  {[["opening", "Opening"], ["experience", "Experience"], ["perspective", "Perspective"], ["gallery", "Gallery"], ["approach", "Approach"], ["featureCards", "Feature cards"], ["why", "Why Phantom Labs"], ["values", "Values"], ["collection", "Editorial collection"]].map(([section, label]) => {
                    const settings = editingStory.pageContent?.displaySettings?.mobile?.[section] || {};
                    const positionable = section === "opening" || (editingStory.category !== "Editorial" && ["experience", "perspective"].includes(section));
                    return (
                      <div key={section} style={{ padding: "12px", background: "#fff", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px" }}>
                        <strong style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>{label} appearance</strong>
                        {positionable && [["textX", "Horizontal text position"], ["textY", "Vertical text position"]].map(([key, title]) => (
                          <label key={key} style={{ display: "grid", gap: "4px", margin: "8px 0", fontSize: "11px" }}>{title} · {settings[key] ?? (section === "opening" ? (key === "textX" ? 6 : 80) : (key === "textX" ? 6 : 70))}%
                            <input type="range" min="0" max="100" value={settings[key] ?? (section === "opening" ? (key === "textX" ? 6 : 80) : (key === "textX" ? 6 : 70))} onChange={(e) => updateDisplaySetting("mobile", section, key, Number(e.target.value))} aria-label={`Mobile ${label} ${title.toLowerCase()}`} />
                          </label>
                        ))}
                        <label style={{ display: "grid", gap: "4px", fontSize: "11px" }}>Text alignment
                          <select className="studio-input" value={settings.textAlign || "left"} onChange={(e) => updateDisplaySetting("mobile", section, "textAlign", e.target.value)}>
                            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                          </select>
                        </label>
                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                          {[ ["headingColor", "Heading"], ["bodyColor", "Body"] ].map(([key, label]) => (
                            <label key={key} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px" }}>{label}<input type="color" value={settings[key] || (key === "headingColor" ? "#1d1d1f" : "#6e6e73")} onChange={(e) => updateDisplaySetting("mobile", section, key, e.target.value)} /></label>
                          ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "10px" }}>
                          {[ ["headingSize", "Heading px", 12, 120], ["bodySize", "Body px", 10, 40] ].map(([key, title, min, max]) => (
                            <label key={key} style={{ display: "grid", gap: "4px", fontSize: "10px" }}>{title}
                              <input className="studio-input" type="number" min={min} max={max} value={settings[key] ?? ""} onChange={(e) => updateDisplaySetting("mobile", section, key, e.target.value ? Number(e.target.value) : "")} aria-label={`Mobile ${label} ${title.toLowerCase()}`} />
                            </label>
                          ))}
                        </div>
                        {section === "featureCards" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
                          {[ ["cardTitleSize", "Card title px", 10, 64], ["cardBodySize", "Card text px", 10, 32] ].map(([key, title, min, max]) => (
                            <label key={key} style={{ display: "grid", gap: "4px", fontSize: "10px" }}>{title}
                              <input className="studio-input" type="number" min={min} max={max} value={settings[key] ?? ""} onChange={(e) => updateDisplaySetting("mobile", section, key, e.target.value ? Number(e.target.value) : "")} aria-label={`Mobile ${title}`} />
                            </label>
                          ))}
                        </div>}
                      </div>
                    );
                  })}
                </div>
              </details>}

              {/* Pause Pull Quote */}
              <div className="studio-form-group">
                <label className="studio-form-label">Prominent Pull Quote</label>
                <input
                  type="text"
                  className="studio-input"
                  value={editingStory.pause?.quote || ""}
                  onChange={(e) =>
                    setEditingStory({
                      ...editingStory,
                      pause: { ...(editingStory.pause || {}), quote: e.target.value },
                    })
                  }
                  placeholder="e.g. A portrait is not what someone looks like, but what they were thinking."
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--studio-border-crisp)" }}>
                <button
                  type="button"
                  className="studio-btn-secondary"
                  onClick={() => fullPage ? onExit?.() : setEditingStory(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="studio-btn-primary">
                  <Check size={14} />
                  Save & Publish Page
                </button>
              </div>

              </div>
              <aside className="category-builder-preview-panel">
                <div className="category-builder-preview-head"><span className="studio-eyebrow">LIVE CANVAS</span><span className="studio-badge studio-badge-subtle">{mobileMode ? "MOBILE · 390 PX" : "DESKTOP · 1440 PX"}</span></div>
                <div className={`category-builder-preview-frame ${mobileMode ? "is-mobile" : "is-desktop"}`}>
                  <iframe
                    ref={editorPreviewRef}
                    key={`${mode}-${editingStory.id}`}
                    title={`${mobileMode ? "Mobile" : "Desktop"} live category preview`}
                    src={`/explore/${encodeURIComponent(editingStory.id)}?cmsPreview=1`}
                    className={mobileMode ? "category-builder-phone-frame" : "category-builder-desktop-frame"}
                  />
                </div>
                <p className="category-builder-preview-caption">Unsaved edits render here as you work.</p>
              </aside>
            </form>
          </div>
        </div>
      )}

      {/* Destructive Action Modal */}
      <DestructiveActionModal
        isOpen={Boolean(deleteTargetStory)}
        title="Purge Editorial Story"
        itemDescription={
          deleteTargetStory
            ? `The monograph "${deleteTargetStory.headline || deleteTargetStory.id}" will be permanently removed from the CMS and live published pages.`
            : ""
        }
        onConfirm={async () => {
          if (deleteTargetStory) {
            const updated = stories.filter((s) => s.id !== deleteTargetStory.id);
            setStories(updated);
            persistStories(updated);
            setDeleteTargetStory(null);
          }
        }}
        onCancel={() => setDeleteTargetStory(null)}
      />
    </div>
  );
}
