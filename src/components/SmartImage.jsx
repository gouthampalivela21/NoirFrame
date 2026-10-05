import React, { useState, useLayoutEffect, useRef } from "react";
import { getOptimizedImageUrl, loadedImageUrls } from "../utils/imageRegistry.js";

/**
 * High-Speed Zero-CLS Zero-Pop-in Image Component.
 * - Direct CDN asset delivery (bypasses redirects).
 * - Instant memory cache recognition.
 * - Predictable aspect-ratio layout reservation (0 Cumulative Layout Shift).
 * - Native rendering with zero JavaScript-delayed opacity.
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
  const safeAspect = Number(aspect) && Number(aspect) > 0 ? Number(aspect) : 3 / 2;
  const mainWidth = widths[widths.length - 1];
  const mainHeight = Math.round(mainWidth / safeAspect);
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

  const isLocal = mainSrc.startsWith("/");
  const srcSet = isLocal
    ? undefined
    : widths
        .map((w) => `${getOptimizedImageUrl(seed, w, Math.round(w / safeAspect))} ${w}w`)
        .join(", ");

  const handleLoad = () => {
    loadedImageUrls.add(mainSrc);
    setLoaded(true);
  };

  return (
    <span
      className={`smart-image ${loaded ? "is-loaded" : ""} ${className}`}
      style={{
        aspectRatio: safeAspect,
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
        width={mainWidth}
        height={mainHeight}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
      />
    </span>
  );
}
