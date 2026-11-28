import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLiveCms } from "../context/LiveCmsContext.jsx";
import { applyCmsImageObjectPosition, applyCmsImageSource, applyCmsImageZoom } from "../utils/cmsCanvasImage.js";

function normalizeRoute(route) { return route.replace(/\/$/, "") || "/"; }
function hasBackgroundImage(element) { return /url\(/i.test(getComputedStyle(element).backgroundImage); }
function normalizeSelector(selector) {
  return typeof selector === "string" ? selector.replace(/^html\s*>\s*/i, "") : "";
}
function findCanvasElement(doc, selector) {
  const normalized = normalizeSelector(selector);
  for (const candidate of [selector, normalized]) {
    if (!candidate) continue;
    try {
      const element = doc.querySelector(candidate);
      if (element) return element;
    } catch {}
  }
  return null;
}
function normalizeCanvasEdits(edits) {
  return Object.entries(edits || {}).reduce((result, [key, edit]) => {
    if (!edit || typeof edit !== "object") return result;
    const selector = normalizeSelector(edit.selector);
    const prefix = edit.viewport && edit.route ? `${edit.viewport}|${normalizeRoute(edit.route)}|` : "";
    const nextKey = prefix && key.startsWith(prefix) ? `${prefix}${selector}` : key.replace(/^((?:desktop|mobile)\|[^|]+\|)html\s*>\s*/i, "$1");
    result[nextKey] = { ...(result[nextKey] || {}), ...edit, ...(selector ? { selector } : {}) };
    return result;
  }, {});
}
function colorHex(value, fallback = "#ffffff") {
  if (typeof value === "string" && /^#[\da-f]{3,8}$/i.test(value)) return value;
  const channels = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return channels ? "#" + channels.slice(1, 4).map((part) => Number(part).toString(16).padStart(2, "0")).join("") : fallback;
}

function applyImageRatio(element, edit) {
  if (edit.ratio === undefined) return;
  let frame;
  try { frame = element.ownerDocument.querySelector(edit.frameSelector || edit.selector); } catch { return; }
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
    if (frame === element) {
      frame.style.width = "100%";
      frame.style.objectFit = "cover";
    }
    return;
  }
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

function makeSelector(element) {
  const parts = [];
  let current = element;
  while (current && current.nodeType === 1 && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase();
    if (current.id && !/^:/.test(current.id)) {
      parts.unshift("#" + CSS.escape(current.id));
      break;
    }
    const stableClasses = Array.from(current.classList || []).filter((name) => !/^(active|open|selected|visible|enter|exit|hover)/i.test(name)).slice(0, 2).map((name) => "." + CSS.escape(name)).join("");
    let index = 1;
    for (let sibling = current.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
      if (sibling.tagName === current.tagName) index += 1;
    }
    parts.unshift(tag + stableClasses + ":nth-of-type(" + index + ")");
    current = current.parentElement;
  }
  // #root is below body, so prefixing its path with `html >` never matches.
  return parts.join(" > ");
}

function getCropFrame(element) {
  let parent = element.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = getComputedStyle(parent);
    const clipsImage = [style.overflow, style.overflowX, style.overflowY].some((value) => ["hidden", "clip", "scroll", "auto"].includes(value));
    if (clipsImage) return parent;
    parent = parent.parentElement;
  }
  return element;
}

function getCropViewport(element) {
  return getCropFrame(element).getBoundingClientRect();
}

function applyEdit(edit) {
  if (!edit?.selector) return;
  const element = findCanvasElement(document, edit.selector);
  if (!element) return;
  if (typeof edit.text === "string") {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const target = textNodes[edit.textNodeIndex ?? 0] || (element.childNodes[edit.textNodeIndex || 0]?.nodeType === Node.TEXT_NODE ? element.childNodes[edit.textNodeIndex || 0] : null);
    if (target) target.nodeValue = edit.text;
    else if (edit.text) element.appendChild(document.createTextNode(edit.text));
  }
  if (edit.src) {
    applyCmsImageSource(element, edit.src, edit.viewport);
  }
  if (edit.alt !== undefined && element.matches("img")) element.alt = edit.alt;
  if (edit.href && edit.linkSelector) {
    const link = findCanvasElement(document, edit.linkSelector);
    if (link) link.setAttribute("href", edit.href);
  }
  Object.entries(edit.styles || {}).forEach(([key, value]) => {
    const styleKey = key === "objectPosition" && !element.matches("img,video,source") ? "backgroundPosition" : key === "objectFit" && !element.matches("img,video,source") ? "backgroundSize" : key;
    if (key === "objectPosition" && applyCmsImageObjectPosition(element, value, edit.viewport)) return;
    if (key === "fontSize" && element.matches(".cms-positionable-copy")) {
      element.querySelectorAll("h1,h2,h3,p").forEach((child) => child.style.setProperty("font-size", value, "important"));
    }
    if (key === "translate" && value && getComputedStyle(element).display === "inline") element.style.display = "inline-block";
    if (value === "" || value === null || value === undefined) element.style.removeProperty(styleKey.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()));
    else element.style[styleKey] = key === "objectFit" && !element.matches("img,video,source") && value === "cover" ? "cover" : value;
  });
  if (edit.zoom !== undefined) applyCmsImageZoom(element, edit.zoom, edit.viewport);
  applyImageRatio(element, edit);
}

export default function CmsCanvasBridge() {
  const location = useLocation();
  const { cms } = useLiveCms();
  const previewMode = new URLSearchParams(window.location.search).get("cmsPreview") === "1";
  const canvasMode = previewMode && new URLSearchParams(window.location.search).get("cmsCanvas") === "1";
  const mode = new URLSearchParams(window.location.search).get("cmsViewport") || (window.matchMedia("(max-width: 680px)").matches ? "mobile" : "desktop");
  const canvasEdits = normalizeCanvasEdits(cms.canvasEdits);

  useEffect(() => {
    const pageRoute = normalizeRoute(location.pathname);
    const applyPageEdits = () => {
      const edits = Object.entries(canvasEdits).filter(([key, edit]) => key.startsWith(mode + "|" + pageRoute + "|") && edit.viewport === mode);
      edits.forEach(([, edit]) => applyEdit(edit));
    };
    applyPageEdits();
    let timer;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(applyPageEdits, 80);
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [canvasEdits, location.pathname, mode]);

  useEffect(() => {
    if (!canvasMode) return undefined;
    const pageRoute = normalizeRoute(location.pathname);

    const doc = document;
    let selected = null;
    let drag = null;
    const style = doc.createElement("style");
    style.textContent = "[data-cms-canvas-hover]{outline:2px solid #0a84ff!important;outline-offset:2px!important;cursor:crosshair!important}[data-cms-canvas-active]{outline:2px solid #0a84ff!important;outline-offset:3px!important;position:relative;z-index:2}img[data-cms-canvas-placeholder]{display:block!important;min-width:72px!important;min-height:140px!important;object-fit:contain!important;background:#f1efe9!important;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%238b877f' stroke-width='1.4'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E\")!important;background-repeat:no-repeat!important;background-position:center!important;background-size:42px!important;outline:1px dashed #aaa59b!important}";
    doc.head.appendChild(style);

    // Empty or broken image fields have no visible target to select. Give
    // those slots an editor-only placeholder while keeping their DOM nodes
    // selectable so the inspector can upload a replacement.
    const markMissingImages = (root = doc) => {
      const images = [];
      if (root.matches?.("img")) images.push(root);
      root.querySelectorAll?.("img").forEach((image) => images.push(image));
      images.forEach((image) => {
        const picture = image.closest("picture");
        const hasSource = Boolean(
          image.getAttribute("src")?.trim() ||
          image.getAttribute("srcset")?.trim() ||
          picture?.querySelector("source[srcset]")
        );
        if (!hasSource || (image.complete && image.naturalWidth === 0)) {
          image.setAttribute("data-cms-canvas-placeholder", "true");
        }
      });
    };
    const onImageError = (event) => {
      if (event.target?.matches?.("img")) event.target.setAttribute("data-cms-canvas-placeholder", "true");
    };
    const onImageLoad = (event) => {
      if (event.target?.matches?.("img")) event.target.removeAttribute("data-cms-canvas-placeholder");
    };
    markMissingImages();
    const imageObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) markMissingImages(node);
      }));
    });
    if (doc.body) imageObserver.observe(doc.body, { childList: true, subtree: true });
    doc.addEventListener("error", onImageError, true);
    doc.addEventListener("load", onImageLoad, true);

    const onPointerOver = (event) => {
      const target = event.target?.closest?.("body *");
      if (!target || target === selected) return;
      doc.querySelectorAll("[data-cms-canvas-hover]").forEach((node) => node.removeAttribute("data-cms-canvas-hover"));
      target.setAttribute("data-cms-canvas-hover", "true");
    };
    const onPointerOut = (event) => {
      if (event.target?.hasAttribute?.("data-cms-canvas-hover")) event.target.removeAttribute("data-cms-canvas-hover");
    };
    const onClick = (event) => {
      const origin = event.target?.closest?.("body *");
      if (!origin) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      let element = origin;
      let text = "";
      let textNodeIndex = null;
      const getTextNodeIndex = (parent, targetNode) => {
        const walker = doc.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
        let index = 0;
        while (walker.nextNode()) {
          if (walker.currentNode === targetNode) return index;
          index += 1;
        }
        return null;
      };
      const range = doc.caretRangeFromPoint?.(event.clientX, event.clientY);
      if (range?.startContainer?.nodeType === Node.TEXT_NODE && range.startContainer.nodeValue.trim()) {
        element = range.startContainer.parentElement;
        textNodeIndex = getTextNodeIndex(element, range.startContainer);
        text = range.startContainer.nodeValue.trim();
      } else {
        const media = origin.closest("img,video,source");
        if (media) element = media;
        else {
          let bg = origin;
          while (bg && bg !== doc.body && !hasBackgroundImage(bg)) bg = bg.parentElement;
          if (bg && bg !== doc.body) element = bg;
          else {
            let ancestor = origin;
            let textMatch = null;
            while (ancestor && ancestor !== doc.body && !textMatch) {
              const walker = doc.createTreeWalker(ancestor, NodeFilter.SHOW_TEXT);
              let index = 0;
              while (walker.nextNode()) {
                const candidate = walker.currentNode;
                if (candidate.nodeValue.trim() && getComputedStyle(candidate.parentElement).display !== "none") {
                  textMatch = { node: candidate, index };
                  break;
                }
                index += 1;
              }
              if (!textMatch) ancestor = ancestor.parentElement;
            }
            if (textMatch) {
              element = textMatch.node.parentElement;
              textNodeIndex = getTextNodeIndex(element, textMatch.node);
              text = textMatch.node.nodeValue.trim();
            } else {
              element = origin;
            }
          }
        }
      }
      // The image behind this section is normally covered by its overlay and
      // copy. Clicking the image area selects the actual picture so it can be
      // replaced from the inspector; clicking the copy still selects text.
      const perspectiveSection = origin.closest(".editorial-long-image-section");
      if (perspectiveSection && !origin.closest(".cms-positionable-copy")) {
        const backgroundImage = perspectiveSection.querySelector(".editorial-long-image-picture img");
        if (backgroundImage) {
          element = backgroundImage;
          text = "";
          textNodeIndex = null;
        }
      }
      // Select the whole overlay group when the user clicks any of its copy,
      // so dragging a headline moves the complete text block together.
      if (!element.matches("img,video,source") && !hasBackgroundImage(element)) {
        const draggableCopy = element.closest(".cms-positionable-copy, [data-cms-canvas-draggable]");
        if (draggableCopy) {
          element = draggableCopy;
          text = "";
          textNodeIndex = null;
        }
      }
      if (selected) selected.removeAttribute("data-cms-canvas-active");
      selected = element;
      selected.setAttribute("data-cms-canvas-active", "true");
      const computed = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const cropRect = element.matches("img,video,source") ? getCropViewport(element) : rect;
      const frame = element.matches("img,video,source") ? getCropFrame(element) : element;
      const image = element.matches("img,video,source")
        ? (element.currentSrc || element.getAttribute("src") || element.getAttribute("srcset") || "")
        : (computed.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1] || "");
      const link = element.closest("a,button");
      const textSection = element.closest("section, article, [data-cms-section]");
      const relatedImageElement = textSection?.querySelector("picture img, img, video");
      const selection = {
        selector: makeSelector(element), tag: element.tagName.toLowerCase(), kind: element.matches("img,video,source") || image ? "image" : "text",
        frameSelector: makeSelector(frame),
        text, textNodeIndex, src: image, route: pageRoute, viewport: mode,
        cmsField: pageRoute === "/studio" && element.matches("img") && (element.alt === "The Studio Space" || doc.querySelector("main img") === element) ? "studio.leadImage" : "",
        relatedImage: relatedImageElement && !element.matches("img,video,source") ? { selector: makeSelector(relatedImageElement), src: relatedImageElement.currentSrc || relatedImageElement.getAttribute("src") || "", alt: relatedImageElement.alt || "" } : null,
        alt: element.alt || "", href: link?.getAttribute("href") || "", linkSelector: link ? makeSelector(link) : "",
        fontSize: Math.round(parseFloat(computed.fontSize) || 32),
        zoom: Number(computed.getPropertyValue("--cms-image-zoom-" + mode)) || Number(computed.scale) || 1,
        styles: { color: colorHex(computed.color), fill: colorHex(computed.fill, ""), stroke: colorHex(computed.stroke, ""), fontSize: computed.fontSize, fontFamily: computed.fontFamily, fontWeight: computed.fontWeight, textAlign: computed.textAlign, letterSpacing: computed.letterSpacing, lineHeight: computed.lineHeight, backgroundColor: computed.backgroundColor === "rgba(0, 0, 0, 0)" ? "" : colorHex(computed.backgroundColor, ""), opacity: computed.opacity, borderRadius: computed.borderRadius, translate: element.style.translate || "0px 0px", objectPosition: computed.objectPosition || "50% 50%", objectFit: computed.objectFit || "cover" },
        aspectRatio: cropRect.width && cropRect.height ? Math.round(cropRect.width) + "/" + Math.round(cropRect.height) : "16/9",
      };
      window.parent.postMessage({ type: "cms-canvas-select", selection }, window.location.origin);
    };
    const onPointerDown = (event) => {
      const active = event.target?.closest?.("[data-cms-canvas-active]");
      if (!active || event.button !== 0) return;
      const isImage = active.matches("img,video,source") || hasBackgroundImage(active);
      const rect = isImage && active.matches("img,video,source") ? getCropViewport(active) : active.getBoundingClientRect();
      const pos = active.matches("img,video,source") ? getComputedStyle(active).objectPosition : getComputedStyle(active).backgroundPosition;
      // Text starts at its natural location; 50% is only the image crop
      // default. Applying that value to text makes the first drag jump.
      const rawPosition = (isImage ? pos : active.style.translate) || (isImage ? "50% 50%" : "0px 0px");
      const values = rawPosition.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      drag = { active, pointerX: event.clientX, pointerY: event.clientY, rect, isImage, x: values[0] ?? (isImage ? 50 : 0), y: values[1] ?? (isImage ? 50 : 0), moved: false };
      event.preventDefault();
      active.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event) => {
      if (!drag) return;
      const dx = event.clientX - drag.pointerX;
      const dy = event.clientY - drag.pointerY;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      event.preventDefault();
      if (drag.isImage) {
        const x = Math.max(0, Math.min(100, drag.x - (dx / Math.max(1, drag.rect.width)) * 100));
        const y = Math.max(0, Math.min(100, drag.y - (dy / Math.max(1, drag.rect.height)) * 100));
        const next = x + "% " + y + "%";
        if (drag.active.matches("img,video,source")) {
          applyCmsImageObjectPosition(drag.active, next, mode);
          drag.nextStyle = { objectPosition: next, objectFit: "cover" };
        } else {
          drag.active.style.backgroundPosition = next;
          drag.nextStyle = { backgroundPosition: next, backgroundSize: "cover" };
        }
      } else {
        const next = (drag.x + dx) + "px " + (drag.y + dy) + "px";
        if (getComputedStyle(drag.active).display === "inline") drag.active.style.display = "inline-block";
        // Keep dragged copy above nearby photos so it can be positioned as an
        // image overlay, then persist the same stacking behavior on the site.
        if (getComputedStyle(drag.active).position === "static") drag.active.style.position = "relative";
        drag.active.style.zIndex = "3";
        drag.active.style.translate = next;
        drag.nextStyle = { translate: next, position: drag.active.style.position, zIndex: "3", ...(drag.active.style.display === "inline-block" ? { display: "inline-block" } : {}) };
      }
    };
    const onPointerUp = () => {
      if (drag?.moved && drag.nextStyle) window.parent.postMessage({ type: "cms-canvas-patch", patch: { styles: drag.nextStyle }, selection: { selector: makeSelector(drag.active), route: pageRoute, viewport: mode } }, window.location.origin);
      drag = null;
    };
    const onLiveEdit = (event) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "cms-canvas-live-edit") return;
      applyEdit(event.data.edit);
    };
    doc.addEventListener("pointerover", onPointerOver, true);
    doc.addEventListener("pointerout", onPointerOut, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("pointermove", onPointerMove, true);
    doc.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("message", onLiveEdit);
    return () => {
      doc.removeEventListener("pointerover", onPointerOver, true);
      doc.removeEventListener("pointerout", onPointerOut, true);
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("pointermove", onPointerMove, true);
      doc.removeEventListener("pointerup", onPointerUp, true);
      doc.removeEventListener("error", onImageError, true);
      doc.removeEventListener("load", onImageLoad, true);
      imageObserver.disconnect();
      window.removeEventListener("message", onLiveEdit);
      style.remove();
      doc.querySelectorAll("[data-cms-canvas-hover],[data-cms-canvas-active],[data-cms-canvas-placeholder]").forEach((node) => { node.removeAttribute("data-cms-canvas-hover"); node.removeAttribute("data-cms-canvas-active"); node.removeAttribute("data-cms-canvas-placeholder"); });
    };
  }, [canvasMode, location.pathname, mode]);

  return null;
}
