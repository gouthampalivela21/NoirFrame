import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLiveCms } from "../context/LiveCmsContext.jsx";

function normalizeRoute(route) { return route.replace(/\/$/, "") || "/"; }
function colorHex(value, fallback = "#ffffff") {
  if (typeof value === "string" && /^#[\da-f]{3,8}$/i.test(value)) return value;
  const channels = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return channels ? "#" + channels.slice(1, 4).map((part) => Number(part).toString(16).padStart(2, "0")).join("") : fallback;
}

function applyImageZoom(element, zoom) {
  const amount = Number(zoom);
  if (!Number.isFinite(amount)) return;
  if (element.matches("img,video")) {
    if (amount === 1) element.style.removeProperty("scale");
    else element.style.scale = String(amount);
    return;
  }
  if (getComputedStyle(element).backgroundImage !== "none") {
    element.style.backgroundSize = amount === 1 ? "cover" : `${amount * 100}%`;
  }
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
  return "html > " + parts.join(" > ");
}

function getCropViewport(element) {
  const elementRect = element.getBoundingClientRect();
  let parent = element.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = getComputedStyle(parent);
    const clipsImage = [style.overflow, style.overflowX, style.overflowY].some((value) => ["hidden", "clip", "scroll", "auto"].includes(value));
    const rect = parent.getBoundingClientRect();
    if (clipsImage && rect.width > 0 && rect.height > 0 && (rect.width < elementRect.width - 1 || rect.height < elementRect.height - 1)) return rect;
    parent = parent.parentElement;
  }
  return elementRect;
}

function applyEdit(edit) {
  if (!edit?.selector) return;
  let element;
  try { element = document.querySelector(edit.selector); } catch { return; }
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
    if (element.matches("img,source,video")) {
      element.setAttribute("src", edit.src);
      element.removeAttribute("srcset");
    } else {
      element.style.backgroundImage = "url(" + JSON.stringify(edit.src) + ")";
    }
  }
  if (edit.alt !== undefined && element.matches("img")) element.alt = edit.alt;
  if (edit.href && edit.linkSelector) {
    try { const link = document.querySelector(edit.linkSelector); if (link) link.setAttribute("href", edit.href); } catch {}
  }
  Object.entries(edit.styles || {}).forEach(([key, value]) => {
    const styleKey = key === "objectPosition" && !element.matches("img,video,source") ? "backgroundPosition" : key === "objectFit" && !element.matches("img,video,source") ? "backgroundSize" : key;
    if (key === "translate" && value && getComputedStyle(element).display === "inline") element.style.display = "inline-block";
    if (value === "" || value === null || value === undefined) element.style.removeProperty(styleKey.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()));
    else element.style[styleKey] = key === "objectFit" && !element.matches("img,video,source") && value === "cover" ? "cover" : value;
  });
  if (edit.zoom !== undefined) applyImageZoom(element, edit.zoom);
}

export default function CmsCanvasBridge() {
  const location = useLocation();
  const { cms } = useLiveCms();
  const previewMode = new URLSearchParams(window.location.search).get("cmsPreview") === "1";
  const canvasMode = previewMode && new URLSearchParams(window.location.search).get("cmsCanvas") === "1";
  const mode = new URLSearchParams(window.location.search).get("cmsViewport") || (window.matchMedia("(max-width: 680px)").matches ? "mobile" : "desktop");

  useEffect(() => {
    const pageRoute = normalizeRoute(location.pathname);
    const applyPageEdits = () => {
      const edits = Object.entries(cms.canvasEdits || {}).filter(([key, edit]) => key.startsWith(mode + "|" + pageRoute + "|") && edit.viewport === mode);
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
  }, [cms.canvasEdits, location.pathname, mode]);

  useEffect(() => {
    if (!canvasMode) return undefined;
    const pageRoute = normalizeRoute(location.pathname);

    const doc = document;
    let selected = null;
    let drag = null;
    const style = doc.createElement("style");
    style.textContent = "[data-cms-canvas-hover]{outline:2px solid #0a84ff!important;outline-offset:2px!important;cursor:crosshair!important}[data-cms-canvas-active]{outline:2px solid #0a84ff!important;outline-offset:3px!important;position:relative;z-index:2}";
    doc.head.appendChild(style);

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
          while (bg && bg !== doc.body && !getComputedStyle(bg).backgroundImage.startsWith("url(")) bg = bg.parentElement;
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
      if (selected) selected.removeAttribute("data-cms-canvas-active");
      selected = element;
      selected.setAttribute("data-cms-canvas-active", "true");
      const computed = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const cropRect = element.matches("img,video,source") ? getCropViewport(element) : rect;
      const image = element.matches("img,video,source") ? element.currentSrc || element.src : (computed.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1] || "");
      const link = element.closest("a,button");
      const selection = {
        selector: makeSelector(element), tag: element.tagName.toLowerCase(), kind: image ? "image" : "text",
        text, textNodeIndex, src: image, route: pageRoute, viewport: mode,
        cmsField: pageRoute === "/studio" && element.matches("img") && (element.alt === "The Studio Space" || doc.querySelector("main img") === element) ? "studio.leadImage" : "",
        alt: element.alt || "", href: link?.getAttribute("href") || "", linkSelector: link ? makeSelector(link) : "",
        fontSize: Math.round(parseFloat(computed.fontSize) || 32),
        styles: { color: colorHex(computed.color), fill: colorHex(computed.fill, ""), stroke: colorHex(computed.stroke, ""), fontSize: computed.fontSize, fontFamily: computed.fontFamily, fontWeight: computed.fontWeight, textAlign: computed.textAlign, letterSpacing: computed.letterSpacing, lineHeight: computed.lineHeight, backgroundColor: computed.backgroundColor === "rgba(0, 0, 0, 0)" ? "" : colorHex(computed.backgroundColor, ""), opacity: computed.opacity, borderRadius: computed.borderRadius, translate: element.style.translate || "0px 0px", objectPosition: computed.objectPosition || "50% 50%", objectFit: computed.objectFit || "cover" },
        aspectRatio: cropRect.width && cropRect.height ? Math.round(cropRect.width) + "/" + Math.round(cropRect.height) : "16/9",
      };
      window.parent.postMessage({ type: "cms-canvas-select", selection }, window.location.origin);
    };
    const onPointerDown = (event) => {
      const active = event.target?.closest?.("[data-cms-canvas-active]");
      if (!active || event.button !== 0) return;
      const isImage = active.matches("img,video,source") || getComputedStyle(active).backgroundImage.startsWith("url(");
      const rect = isImage && active.matches("img,video,source") ? getCropViewport(active) : active.getBoundingClientRect();
      const pos = active.matches("img,video,source") ? getComputedStyle(active).objectPosition : getComputedStyle(active).backgroundPosition;
      const rawPosition = (isImage ? pos : active.style.translate) || "50% 50%";
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
          drag.active.style.objectPosition = next;
          drag.nextStyle = { objectPosition: next, objectFit: "cover" };
        } else {
          drag.active.style.backgroundPosition = next;
          drag.nextStyle = { backgroundPosition: next, backgroundSize: "cover" };
        }
      } else {
        const next = (drag.x + dx) + "px " + (drag.y + dy) + "px";
        if (getComputedStyle(drag.active).display === "inline") drag.active.style.display = "inline-block";
        drag.active.style.translate = next;
        drag.nextStyle = { translate: next };
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
      window.removeEventListener("message", onLiveEdit);
      style.remove();
      doc.querySelectorAll("[data-cms-canvas-hover],[data-cms-canvas-active]").forEach((node) => { node.removeAttribute("data-cms-canvas-hover"); node.removeAttribute("data-cms-canvas-active"); });
    };
  }, [canvasMode, location.pathname, mode]);

  return null;
}
