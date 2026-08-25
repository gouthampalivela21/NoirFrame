import React, { useState, useLayoutEffect, useRef } from "react";
import { getOptimizedImageUrl, loadedImageUrls } from "../utils/imageRegistry.js";

/**
 * High-Speed Zero-CLS Image Component.
 * - Direct CDN asset delivery (bypasses 302 redirects).
 * - Instant memory cache recognition (0ms render on subsequent views).
 * - High priority decoding and eager loading for modal hero views.
 */
export default function SmartImage({
  seed,
  aspect = 3 / 2,
  widths = [600, 1000, 1400],
  sizes = "100vw",
  alt = "",
  className = "",
  priority = false,
  style = {},
  ...rest
}) {
  const imgRef = useRef(null);
  const mainWidth = widths[widths.length - 1];
  const mainHeight = Math.round(mainWidth / aspect);
  const mainSrc = getOptimizedImageUrl(seed, mainWidth, mainHeight);

  const [loaded, setLoaded] = useState(() => loadedImageUrls.has(mainSrc));

  useLayoutEffect(() => {
    if (loadedImageUrls.has(mainSrc)) {
      setLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete) {
      loadedImageUrls.add(mainSrc);
      setLoaded(true);
    }
  }, [mainSrc]);

  const srcSet = widths
    .map((w) => `${getOptimizedImageUrl(seed, w, Math.round(w / aspect))} ${w}w`)
    .join(", ");

  const handleLoad = () => {
    loadedImageUrls.add(mainSrc);
    setLoaded(true);
  };

  return (
    <span
      className={`smart-image ${loaded ? "is-loaded" : ""} ${className}`}
      style={{
        aspectRatio: aspect,
        ...style,
      }}
      {...rest}
    >
      <img
        ref={imgRef}
        className="smart-image__main"
        src={mainSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
      />
    </span>
  );
}
