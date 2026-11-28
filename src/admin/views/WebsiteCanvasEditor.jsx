import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Eye, EyeOff, Image as ImageIcon, Monitor, RotateCcw, Smartphone, Type } from "lucide-react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import ImageUploadControl from "../components/ImageUploadControl.jsx";

const PAGES = [
  { id: "hero", label: "Home", route: "/" },
  { id: "websiteExperience", label: "Website Experience", route: "/experiences/website-design" },
  { id: "journeys", label: "Journeys", route: "/journeys" },
  { id: "stories", label: "Stories", route: "/stories" },
  { id: "studio", label: "The Studio", route: "/studio" },
  { id: "booking", label: "Booking", route: "/book" },
  { id: "categoryPage:portraits", label: "Portraits", route: "/explore/portraits", category: true },
  { id: "categoryPage:editorial", label: "Editorial", route: "/explore/editorial", category: true },
  { id: "categoryPage:brands", label: "Brands", route: "/explore/brands", category: true },
  { id: "categoryPage:commercial", label: "Commercial", route: "/explore/commercial", category: true },
  { id: "categoryPage:couples", label: "Couples", route: "/explore/couples", category: true },
  { id: "categoryPage:events", label: "Events", route: "/explore/events", category: true },
];

const normalizeRoute = (route) => route.replace(/\/$/, "") || "/";
const editKey = (mode, route, selector) => mode + "|" + normalizeRoute(route) + "|" + selector;
const getPage = (id) => PAGES.find((item) => item.id === id) || PAGES[0];

function applyImageZoom(element, zoom, view = window) {
  const amount = Number(zoom);
  if (!Number.isFinite(amount)) return;
  if (element.matches("img,video")) {
    if (amount === 1) element.style.removeProperty("scale");
    else element.style.scale = String(amount);
    return;
  }
  if (view.getComputedStyle(element).backgroundImage !== "none") {
    element.style.backgroundSize = amount === 1 ? "cover" : `${amount * 100}%`;
  }
}

function applyImageRatio(doc, edit) {
  if (edit.ratio === undefined || !edit.selector) return;
  let frame;
  try { frame = doc.querySelector(edit.frameSelector || edit.selector); } catch { return; }
  if (!frame) return;
  const properties = ["aspect-ratio", "width", "height", "min-height", "max-height", "object-fit"];
  if (!frame.dataset.cmsRatioOriginal) {
    frame.dataset.cmsRatioOriginal = JSON.stringify(Object.fromEntries(properties.map((property) => [property, frame.style.getPropertyValue(property)])));
  }
  if (edit.ratio) {
    frame.style.aspectRatio = edit.ratio;
    frame.style.height = "auto";
    frame.style.minHeight = "0";
    frame.style.maxHeight = "none";
    if (frame !== doc.querySelector(edit.selector)) return;
    else {
      frame.style.width = "100%";
      frame.style.objectFit = "cover";
    }
  } else {
    try {
      const original = JSON.parse(frame.dataset.cmsRatioOriginal);
      for (const property of properties) {
        if (original[property]) frame.style.setProperty(property, original[property]);
        else frame.style.removeProperty(property);
      }
    } catch {
      frame.style.removeProperty("aspect-ratio");
      frame.style.removeProperty("height");
    }
    delete frame.dataset.cmsRatioOriginal;
  }
}

// Apply edits directly to the same-origin preview document. The CMS data is
// still the source of truth; this immediate DOM write keeps the canvas in sync
// while the editor state and autosave catch up.
function applyEditToFrame(frame, edit) {
  const doc = frame?.contentDocument;
  if (!doc || !edit?.selector) return;
  let element;
  try { element = doc.querySelector(edit.selector); } catch { return; }
  if (!element) return;

  if (typeof edit.text === "string") {
    const walker = doc.createTreeWalker(element, doc.defaultView.NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const index = Number.isInteger(edit.textNodeIndex) ? edit.textNodeIndex : 0;
    const target = nodes[index];
    if (target) target.nodeValue = edit.text;
    else if (edit.text) element.appendChild(doc.createTextNode(edit.text));
  }
  if (edit.src) {
    if (element.matches("img,source,video")) {
      element.setAttribute("src", edit.src);
      element.removeAttribute("srcset");
    } else {
      element.style.backgroundImage = `url(${JSON.stringify(edit.src)})`;
    }
  }
  if (edit.alt !== undefined && element.matches("img")) element.alt = edit.alt;
  if (edit.href && edit.linkSelector) {
    try { doc.querySelector(edit.linkSelector)?.setAttribute("href", edit.href); } catch {}
  }
  Object.entries(edit.styles || {}).forEach(([key, value]) => {
    const isMedia = element.matches("img,video,source");
    const styleKey = key === "objectPosition" && !isMedia ? "backgroundPosition" : key === "objectFit" && !isMedia ? "backgroundSize" : key;
    if (key === "translate" && value && doc.defaultView.getComputedStyle(element).display === "inline") element.style.display = "inline-block";
    if (value === "" || value === null || value === undefined) element.style.removeProperty(styleKey.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()));
    else element.style[styleKey] = value;
  });
  if (edit.zoom !== undefined) applyImageZoom(element, edit.zoom, doc.defaultView);
  applyImageRatio(doc, edit);
}

function Inspector({ selection, value, onChange, onClose }) {
  if (!selection) return <aside className="canvas-inspector canvas-inspector-empty"><div className="canvas-empty-icon"><Type size={20} /></div><strong>Select something on the page</strong><span>Click any text, image or detail in the preview to edit it.</span></aside>;
  const isImage = selection.kind === "image";
  const isVector = ["svg", "path", "circle", "rect", "line", "polygon", "polyline"].includes(selection.tag);
  const currentStyles = { ...selection.styles, ...(value?.styles || {}) };
  const cropPosition = String(currentStyles.objectPosition || "50% 50%");
  const imageZoom = Math.max(1, Math.min(3, Number(value?.zoom) || 1));
  const imageRatio = value?.ratio || "";
  const update = (patch) => onChange({ ...value, ...patch, selector: selection.selector, frameSelector: selection.frameSelector || selection.selector, route: selection.route, viewport: selection.viewport, linkSelector: selection.linkSelector, textNodeIndex: selection.textNodeIndex });
  const style = (key, next) => update({ styles: { ...(value?.styles || {}), [key]: next } });
  return (
    <aside className="canvas-inspector">
      <div className="canvas-inspector-heading"><div><div className="canvas-eyebrow">SELECTED ELEMENT</div><h2>{isImage ? "Image" : selection.tag === "button" || selection.tag === "a" ? "Link / button" : "Text & style"}</h2></div><button className="canvas-icon-button" type="button" title="Clear selection" onClick={onClose}>×</button></div>
      <div className="canvas-element-chip">{isImage ? <ImageIcon size={14} /> : <Type size={14} />}<span>{selection.tag.toUpperCase()}</span><code>{selection.selector.split(">").slice(-2).join(" › ")}</code></div>
      {isImage ? <div className="canvas-inspector-section"><div className="canvas-image-device-scope"><strong>{selection.viewport === "mobile" ? "Mobile image settings" : "Desktop image settings"}</strong><span>Image, crop, ratio and zoom are saved separately for each device.</span></div><label className="canvas-field-label">Image ratio<select className="studio-input" value={imageRatio} onChange={(event) => update({ ratio: event.target.value, frameSelector: selection.frameSelector || selection.selector })}><option value="">Original layout</option><option value="1 / 1">Square · 1:1</option><option value="4 / 3">Landscape · 4:3</option><option value="3 / 2">Classic · 3:2</option><option value="16 / 9">Widescreen · 16:9</option><option value="3 / 4">Portrait · 3:4</option><option value="2 / 3">Portrait · 2:3</option><option value="9 / 16">Tall · 9:16</option></select></label><ImageUploadControl label="Replace image" value={value?.src || selection.src} onChange={(src) => update({ src })} aspectRatio={imageRatio || selection.aspectRatio || "16/9"} helperText="Upload a replacement or paste an image URL." objectPosition={cropPosition} cropZoom={imageZoom} showZoomControl={false} onCropChange={({ objectPosition }) => update({ styles: { ...(value?.styles || {}), objectPosition, objectFit: "cover" } })} /><label className="canvas-field-label">Image URL<input className="studio-input" value={value?.src || selection.src || ""} onChange={(event) => update({ src: event.target.value })} placeholder="Paste image URL" /></label><label className="canvas-field-label">Alternative text<input className="studio-input" value={value?.alt ?? selection.alt ?? ""} onChange={(event) => update({ alt: event.target.value })} /></label></div> : <div className="canvas-inspector-section"><label className="canvas-field-label">Text<textarea className="studio-textarea" rows={5} value={value?.text ?? selection.text ?? ""} onChange={(event) => update({ text: event.target.value })} placeholder="Edit the selected text" /></label>{selection.href && <label className="canvas-field-label">Link destination<input className="studio-input" value={value?.href ?? selection.href} onChange={(event) => update({ href: event.target.value })} /></label>}<p className="canvas-help">Text is changed in place; the rest of the page remains intact.</p></div>}
      <div className="canvas-inspector-section">
        <div className="canvas-section-title">Appearance</div>
        {!isImage && <label className="canvas-field-label">Text color<div className="canvas-color-row"><input type="color" value={currentStyles.color || "#ffffff"} onChange={(event) => style("color", event.target.value)} /><input className="studio-input" value={currentStyles.color || ""} placeholder="Original color" onChange={(event) => style("color", event.target.value)} /></div></label>}
        {isVector && <label className="canvas-field-label">Icon fill<div className="canvas-color-row"><input type="color" value={currentStyles.fill || "#ffffff"} onChange={(event) => style("fill", event.target.value)} /><input className="studio-input" value={currentStyles.fill || ""} placeholder="Original fill" onChange={(event) => style("fill", event.target.value)} /></div></label>}
        {!isImage && <>
          <label className="canvas-field-label">Font size<div className="canvas-range-row"><input type="range" min="10" max="120" value={parseInt(currentStyles.fontSize, 10) || selection.fontSize || 32} onChange={(event) => style("fontSize", event.target.value + "px")} /><span>{parseInt(currentStyles.fontSize, 10) || selection.fontSize || 32}px</span></div></label>
          <label className="canvas-field-label">Font weight<select className="studio-input" value={currentStyles.fontWeight || ""} onChange={(event) => style("fontWeight", event.target.value)}><option value="">Use page style</option><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option></select></label>
          <label className="canvas-field-label">Font family<select className="studio-input" value={currentStyles.fontFamily || ""} onChange={(event) => style("fontFamily", event.target.value)}><option value="">Use page style</option><option value="Arial, sans-serif">System sans</option><option value="Georgia, serif">Editorial serif</option><option value="'Helvetica Neue', sans-serif">Helvetica Neue</option></select></label>
          <label className="canvas-field-label">Alignment<select className="studio-input" value={currentStyles.textAlign || ""} onChange={(event) => style("textAlign", event.target.value)}><option value="">Use page style</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="canvas-field-label">Background color<div className="canvas-color-row"><input type="color" value={currentStyles.backgroundColor || "#ffffff"} onChange={(event) => style("backgroundColor", event.target.value)} /><input className="studio-input" value={currentStyles.backgroundColor || ""} placeholder="No background" onChange={(event) => style("backgroundColor", event.target.value)} /></div></label>
          <label className="canvas-field-label">Opacity<div className="canvas-range-row"><input type="range" min="10" max="100" value={Math.round((parseFloat(currentStyles.opacity) || 1) * 100)} onChange={(event) => style("opacity", String(Number(event.target.value) / 100))} /><span>{Math.round((parseFloat(currentStyles.opacity) || 1) * 100)}%</span></div></label>
          <label className="canvas-field-label">Corner radius<div className="canvas-range-row"><input type="range" min="0" max="64" value={parseInt(currentStyles.borderRadius, 10) || 0} onChange={(event) => style("borderRadius", event.target.value + "px")} /><span>{parseInt(currentStyles.borderRadius, 10) || 0}px</span></div></label>
          <label className="canvas-field-label">Move text horizontally<div className="canvas-range-row"><input type="range" min="-240" max="240" value={parseInt(currentStyles.translate?.split(" ")[0], 10) || 0} onChange={(event) => style("translate", event.target.value + "px " + (parseInt(currentStyles.translate?.split(" ")[1], 10) || 0) + "px")} /><span>{parseInt(currentStyles.translate?.split(" ")[0], 10) || 0}px</span></div></label>
          <label className="canvas-field-label">Move text vertically<div className="canvas-range-row"><input type="range" min="-240" max="240" value={parseInt(currentStyles.translate?.split(" ")[1], 10) || 0} onChange={(event) => style("translate", (parseInt(currentStyles.translate?.split(" ")[0], 10) || 0) + "px " + event.target.value + "px")} /><span>{parseInt(currentStyles.translate?.split(" ")[1], 10) || 0}px</span></div></label>
        </>}
        {isImage && <label className="canvas-field-label">Crop position<div className="canvas-range-row"><input type="range" min="0" max="100" value={parseInt(cropPosition, 10) || 50} onChange={(event) => style("objectPosition", event.target.value + "% 50%")} /><span>{parseInt(cropPosition, 10) || 50}%</span></div></label>}
        {isImage && <label className="canvas-field-label">Image zoom<div className="canvas-range-row"><input type="range" min="1" max="3" step="0.05" value={imageZoom} onChange={(event) => update({ zoom: Number(event.target.value) })} aria-label={(selection.viewport === "mobile" ? "Mobile" : "Desktop") + " image zoom"} /><span>{imageZoom.toFixed(2)}×</span></div></label>}
      </div>
      <div className="canvas-inspector-footer"><span><Check size={13} /> Preview updates instantly · saves automatically</span><button type="button" className="studio-btn-secondary studio-btn-sm" onClick={() => onChange(null)}><RotateCcw size={13} /> Reset element</button></div>
    </aside>
  );
}

export default function WebsiteCanvasEditor({ mode = "desktop", pageId = "hero", onExit }) {
  const navigate = useNavigate();
  const { cmsData, updateCMSPath, saveCMSChanges, hasUnpublishedCMSChanges, undoCMSChange, redoCMSChange, canUndoCMS, canRedoCMS } = useStudioAdmin();
  const page = getPage(pageId);
  const iframeRef = useRef(null);
  const canvasRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const autoSaveSnapshotRef = useRef("");
  const publishingRef = useRef(false);
  const [selection, setSelection] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [availableWidth, setAvailableWidth] = useState(1440);
  const isMobile = mode === "mobile";
  const previewUrl = page.route + (page.route.includes("?") ? "&" : "?") + "cmsPreview=1&cmsCanvas=1&cmsViewport=" + mode;

  // Save each device's draft to its own Supabase row after a brief pause.
  useEffect(() => {
    if (!hasUnpublishedCMSChanges || isPublishing) return undefined;
    const snapshot = JSON.stringify(cmsData);
    if (!snapshot || autoSaveSnapshotRef.current === snapshot) return undefined;
    autoSaveTimerRef.current = window.setTimeout(async () => {
      if (publishingRef.current) return;
      publishingRef.current = true;
      autoSaveSnapshotRef.current = snapshot;
      setIsPublishing(true);
      try {
        await saveCMSChanges(JSON.parse(snapshot), mode, { silent: true });
      } finally {
        publishingRef.current = false;
        setIsPublishing(false);
      }
    }, 650);
    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    };
  }, [cmsData, hasUnpublishedCMSChanges, isPublishing, mode, saveCMSChanges]);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return undefined;
    const measure = () => setAvailableWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sendDraft = useCallback(() => iframeRef.current?.contentWindow?.postMessage({ type: "studio-cms-preview", cms: cmsData }, window.location.origin), [cmsData]);
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "studio-cms-preview-ready") sendDraft();
      if (event.data?.type === "cms-canvas-select" && event.data.selection) setSelection(event.data.selection);
      if (event.data?.type === "cms-canvas-patch" && event.data.selection) {
        const patchKey = editKey(mode, event.data.selection.route, event.data.selection.selector);
        const editPath = mode === "mobile" ? ["mobileContent", "canvasEdits"] : ["canvasEdits"];
        const edits = mode === "mobile" ? cmsData.mobileContent?.canvasEdits : cmsData.canvasEdits;
        const existing = edits?.[patchKey] || {};
        updateCMSPath([...editPath, patchKey], { ...existing, ...event.data.patch, styles: { ...(existing.styles || {}), ...(event.data.patch?.styles || {}) }, selector: event.data.selection.selector, route: event.data.selection.route, viewport: event.data.selection.viewport });
      }
    };
    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(sendDraft, 180);
    return () => { window.clearTimeout(timer); window.removeEventListener("message", onMessage); };
  }, [sendDraft, previewUrl, mode, cmsData.canvasEdits, cmsData.mobileContent?.canvasEdits, updateCMSPath]);

  const key = selection ? editKey(mode, selection.route, selection.selector) : "";
  const canvasEdits = isMobile ? cmsData.mobileContent?.canvasEdits : cmsData.canvasEdits;
  const selectedValue = key ? canvasEdits?.[key] : null;
  const publishChanges = async () => {
    if (isPublishing || publishingRef.current) return;
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveSnapshotRef.current = "";
    publishingRef.current = true;
    setIsPublishing(true);
    try { await saveCMSChanges(cmsData, mode); }
    finally { publishingRef.current = false; setIsPublishing(false); }
  };
  const updateSelected = (next) => {
    if (!key) return;
    const editPath = isMobile ? ["mobileContent", "canvasEdits"] : ["canvasEdits"];
    if (next === null) {
      const remaining = { ...(canvasEdits || {}) };
      delete remaining[key];
      updateCMSPath(editPath, remaining);
      setSelection(null);
      window.setTimeout(() => iframeRef.current?.contentWindow?.location.reload(), 80);
      return;
    }
    applyEditToFrame(iframeRef.current, next);
    updateCMSPath([...editPath, key], next);
    // The Studio lead photograph is also a first-class page field. Persisting
    // it there makes replacement survive a full page render and immediately
    // updates the actual live page, instead of relying only on a canvas DOM
    // override that could be lost during React reconciliation.
    if (selection?.cmsField === "studio.leadImage" && typeof next.src === "string") {
      updateCMSPath(isMobile ? ["mobileContent", "studio", "leadImage"] : ["studio", "leadImage"], next.src);
    }
    iframeRef.current?.contentWindow?.postMessage({ type: "cms-canvas-live-edit", edit: next }, window.location.origin);
  };
  const choosePage = (id) => { setSelection(null); navigate("/gouthamspace/cms/" + mode + "/canvas/" + encodeURIComponent(id)); };
  const openDevice = (nextMode) => navigate("/gouthamspace/cms/" + nextMode + "/canvas/" + encodeURIComponent(page.id));
  const scale = isMobile ? Math.min(1, Math.max(.38, (availableWidth - 40) / 390)) : Math.min(zoom, Math.max(.38, (availableWidth - 40) / 1440));
  const width = (isMobile ? 390 : 1440) * scale;
  const height = (isMobile ? 844 : 900) * scale;

  return <div className="website-canvas-editor">
    <header className="website-canvas-toolbar">
      <button type="button" className="canvas-back-button" onClick={onExit}><ArrowLeft size={16} /> CMS</button>
      <div className="canvas-breadcrumb"><strong>Website</strong><ChevronRight size={13} /><span>{page.label}</span><ChevronRight size={13} /><span>{isMobile ? "Mobile" : "Desktop"}</span></div>
      <div className="canvas-toolbar-actions"><span className={"cms-publish-state " + (hasUnpublishedCMSChanges ? "is-dirty" : "")}>{isPublishing ? "Saving changes…" : hasUnpublishedCMSChanges ? "Changes pending…" : "Published"}</span><button className="studio-btn-secondary studio-btn-sm" type="button" disabled={!canUndoCMS || isPublishing} onClick={undoCMSChange} title="Undo"><RotateCcw size={14} /></button><button className="studio-btn-secondary studio-btn-sm" type="button" disabled={!canRedoCMS || isPublishing} onClick={redoCMSChange} title="Redo"><RotateCcw size={14} style={{ transform: "scaleX(-1)" }} /></button><button className="studio-btn-primary" type="button" disabled={isPublishing} onClick={publishChanges}>{isPublishing ? "Saving…" : "Publish now"}</button></div>
    </header>
    <div className="website-canvas-workspace">
      <aside className="canvas-pages"><div className="canvas-eyebrow">PAGES</div><div className="canvas-page-list">{PAGES.map((item) => <button type="button" key={item.id} className={"canvas-page-item " + (item.id === page.id ? "active " : "") + (item.category ? "category-page" : "")} onClick={() => choosePage(item.id)}><span>{item.category ? <ImageIcon size={14} /> : <ArrowUpRight size={14} />}{item.label}</span>{item.id === page.id && <ChevronRight size={14} />}</button>)}</div><div className="canvas-device-switch"><div className="canvas-eyebrow">PREVIEW DEVICE</div><div className="canvas-device-buttons"><button type="button" className={!isMobile ? "active" : ""} onClick={() => openDevice("desktop")}><Monitor size={14} /> Desktop</button><button type="button" className={isMobile ? "active" : ""} onClick={() => openDevice("mobile")}><Smartphone size={14} /> Mobile</button></div></div><div className="canvas-pages-tip"><Eye size={14} /><span>Select an element, then drag text to reposition it or drag images to crop. Use the inspector for precise changes.</span></div></aside>
      <main className="canvas-stage-column"><div className="canvas-stage-toolbar"><div><div className="canvas-eyebrow">LIVE PAGE CANVAS</div><strong>{page.label}</strong></div><div className="canvas-stage-tools"><button type="button" className="studio-btn-secondary studio-btn-sm" onClick={() => setShowPreview((current) => !current)}>{showPreview ? <EyeOff size={14} /> : <Eye size={14} />}{showPreview ? "Hide canvas" : "Show canvas"}</button><span>{isMobile ? "390 px" : "1440 px"}</span></div></div><div className={"canvas-stage " + (isMobile ? "mobile" : "")} ref={canvasRef}>{showPreview ? <div className="canvas-iframe-wrap" style={{ width, height }}><iframe ref={iframeRef} key={mode + page.route} className="canvas-site-frame" title={page.label + " website canvas preview"} src={previewUrl} style={{ width: isMobile ? 390 : 1440, height: isMobile ? 844 : 900, transform: "scale(" + scale + ")", transformOrigin: "top left" }} /></div> : <div className="canvas-hidden-preview"><EyeOff size={20} /><span>Canvas preview hidden</span></div>}</div><footer className="canvas-stage-footer"><span>{selection ? "Selected " + (selection.kind === "image" ? "image · drag to crop" : "text · drag to reposition") : "Nothing selected"}</span><div><button type="button" onClick={() => setZoom((current) => Math.max(.4, current - .1))}>−</button><span>{Math.round(scale * 100)}%</span><button type="button" onClick={() => setZoom((current) => Math.min(1, current + .1))}>+</button></div></footer></main>
      <Inspector selection={selection} value={selectedValue} onChange={updateSelected} onClose={() => setSelection(null)} />
    </div>
  </div>;
}
