function getViewport(element, viewport) {
  if (viewport === "mobile" || viewport === "desktop") return viewport;
  const view = element?.ownerDocument?.defaultView;
  return view?.matchMedia?.("(max-width: 680px)").matches ? "mobile" : "desktop";
}

export function applyCmsImageSource(element, src, viewport) {
  if (!element || !src) return;
  if (!element.matches("img,video,source")) {
    element.style.backgroundImage = "url(" + JSON.stringify(src) + ")";
    return;
  }

  if (element.matches("img") && getViewport(element, viewport) === "mobile") {
    const picture = element.closest("picture");
    if (picture) {
      const sources = Array.from(picture.querySelectorAll("source"));
      let mobileSource = sources.find((source) => /max-width/i.test(source.media || ""));
      if (!mobileSource) {
        mobileSource = element.ownerDocument.createElement("source");
        mobileSource.media = "(max-width: 680px)";
        picture.insertBefore(mobileSource, element);
      }
      mobileSource.srcset = src;
      return;
    }
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
