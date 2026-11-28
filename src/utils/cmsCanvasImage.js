function getViewport(element, viewport) {
  if (viewport === "mobile" || viewport === "desktop") return viewport;
  const view = element?.ownerDocument?.defaultView;
  return view?.matchMedia?.("(max-width: 680px)").matches ? "mobile" : "desktop";
}

export function applyCmsImageSource(element, src, viewport) {
  if (!element || !src) return;
  element.removeAttribute?.("data-cms-canvas-placeholder");
  if (!element.matches("img,video,source")) {
    element.style.backgroundImage = "url(" + JSON.stringify(src) + ")";
    return;
  }

  if (element.matches("img")) {
    const picture = element.closest("picture");
    if (picture) {
      const view = getViewport(element, viewport);
      const win = element.ownerDocument.defaultView;
      const activeSources = Array.from(picture.querySelectorAll("source")).filter((source) => {
        const media = source.media?.trim();
        return !media || !win?.matchMedia || win.matchMedia(media).matches;
      });

      if (activeSources.length) {
        // <picture> selects the first matching <source>. Update every source
        // that can currently win so the preview and published page use the
        // replacement regardless of whether the picture is width or aspect
        // ratio based.
        activeSources.forEach((source) => { source.srcset = src; });
      } else {
        const source = element.ownerDocument.createElement("source");
        source.media = view === "mobile" ? "(max-width: 680px)" : "(min-width: 681px)";
        source.srcset = src;
        picture.insertBefore(source, picture.firstChild);
      }
    }

    // Keep the img fallback in sync for browsers/viewports where no source
    // media query matches. A matching <source> still takes precedence.
    element.setAttribute("src", src);
    element.removeAttribute("srcset");
    return;
  }

  element.setAttribute("src", src);
  element.removeAttribute("srcset");
}

export function applyCmsImageObjectPosition(element, value, viewport) {
  if (!element || value === "" || value === null || value === undefined) return false;
  const isMedia = element.matches("img,video,source");
  const property = isMedia ? "object-position" : "background-position";
  element.style.setProperty(property, String(value), "important");

  if (isMedia) {
    const device = getViewport(element, viewport);
    element.style.setProperty("--cms-image-position-" + device, String(value));
  }
  return true;
}

export function applyCmsImageZoom(element, zoom, viewport) {
  const amount = Number(zoom);
  if (!element || !Number.isFinite(amount)) return;

  // Category-page images use responsive CSS variables for their crop. Update
  // those variables directly so canvas and public page share the same zoom.
  if (element.matches("img.cms-crop-image")) {
    const device = getViewport(element, viewport);
    element.style.setProperty("--cms-image-zoom-" + device, String(amount));
    return;
  }

  if (element.matches("img,video")) {
    if (amount === 1) element.style.removeProperty("scale");
    else element.style.scale = String(amount);
    return;
  }
  if (element.ownerDocument.defaultView.getComputedStyle(element).backgroundImage !== "none") {
    element.style.backgroundSize = amount === 1 ? "cover" : String(amount * 100) + "%";
  }
}
