const WEBP_ASSET_PREFIXES = [
  "/images/tiles/",
  "/images/hero-villa-",
  "/images/websites-showcase-",
];

/** Prefer bundled WebP siblings for known site assets while preserving uploads. */
export function optimizedImageSrc(src) {
  if (typeof src !== "string" || !src.startsWith("/images/") || !src.endsWith(".jpg")) {
    return src;
  }

  if (WEBP_ASSET_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    return src.replace(/\.jpg$/, ".webp");
  }

  return src;
}
