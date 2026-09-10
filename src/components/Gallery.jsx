import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import SmartImage from "./SmartImage.jsx";
import StoryModal from "./StoryModal.jsx";
import { prefersReducedMotion } from "../utils/helpers.js";
import { preloadImage } from "../utils/imageRegistry.js";
import { useData } from "../context/DataContext.jsx";

const AUTO_SWITCH_DURATION = 4800; // 4.8s per item in Apple TV+ style

export default function Gallery() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const isResettingRef = useRef(false);
  const lastWheelTimeRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0, isDragging: false, moved: false });
  const [activeStory, setActiveStory] = useState(null);

  const { galleryStrip = [], portfolioItems = [] } = useData();
  const itemCount = galleryStrip.length || 1;
  
  // Start in the middle set for seamless infinite continuous loop
  const [virtualIndex, setVirtualIndex] = useState(itemCount);
  const [progress, setProgress] = useState(0);

  // 3 duplicate sets of items to guarantee continuous forward wrap-around without rewind
  const extendedItems = useMemo(
    () => [
      ...galleryStrip.map((item) => ({ ...item, cloneId: `c1-${item.id}` })),
      ...galleryStrip.map((item) => ({ ...item, cloneId: `c2-${item.id}` })),
      ...galleryStrip.map((item) => ({ ...item, cloneId: `c3-${item.id}` })),
    ],
    [galleryStrip]
  );

  // Preload all gallery images
  useEffect(() => {
    galleryStrip.forEach((item) => {
      preloadImage(item.seed, 1400);
    });
  }, [galleryStrip]);

  const getTargetX = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return 0;
    const itemEl = track.children[index];
    if (!itemEl) return 0;

    const viewWidth = window.innerWidth;
    const itemLeft = itemEl.offsetLeft;
    const itemWidth = itemEl.offsetWidth;

    return itemLeft - (viewWidth / 2 - itemWidth / 2);
  }, []);

  // Silky smooth scroll track to target virtual index
  const scrollToVirtualIndex = useCallback(
    (index, immediate = false) => {
      const track = trackRef.current;
      if (!track) return;

      const targetX = getTargetX(index);

      if (immediate) {
        gsap.set(track, { x: -targetX, force3D: true });
      } else {
        gsap.to(track, {
          x: -targetX,
          duration: 1.15,
          ease: "power2.inOut",
          overwrite: "auto",
          force3D: true,
          onComplete: () => {
            // Seamless forward / backward wrap-around reset
            if (index >= itemCount * 2) {
              isResettingRef.current = true;
              const resetIndex = index - itemCount;
              const resetX = getTargetX(resetIndex);
              gsap.set(track, { x: -resetX, force3D: true });
              setVirtualIndex(resetIndex);
            } else if (index < itemCount) {
              isResettingRef.current = true;
              const resetIndex = index + itemCount;
              const resetX = getTargetX(resetIndex);
              gsap.set(track, { x: -resetX, force3D: true });
              setVirtualIndex(resetIndex);
            }
          },
        });
      }
    },
    [getTargetX, itemCount]
  );

  // Scroll on index change (unless silently resetting)
  useEffect(() => {
    if (isResettingRef.current) {
      isResettingRef.current = false;
      return;
    }
    scrollToVirtualIndex(virtualIndex);
  }, [virtualIndex, scrollToVirtualIndex]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      scrollToVirtualIndex(virtualIndex, true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [virtualIndex, scrollToVirtualIndex]);

  // Active original item index (0 to itemCount - 1)
  const activeDotIndex = ((virtualIndex % itemCount) + itemCount) % itemCount;

  // Uninterrupted Apple-style automatic progress bar & continuous forward cycling
  // Continues cycling non-stop even when placing/hovering mouse over images
  useEffect(() => {
    if (activeStory || prefersReducedMotion()) return undefined;

    let animId;
    let lastTime = performance.now();

    const tick = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + (delta / AUTO_SWITCH_DURATION) * 100;
        if (next >= 100) {
          setVirtualIndex((curr) => curr + 1);
          return 0;
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [activeStory, virtualIndex]);

  // Handle Mouse Wheel Scroll
  const handleWheel = (e) => {
    const now = performance.now();
    // 450ms cooldown to ensure clean, smooth 1-slide transitions per scroll gesture
    if (now - lastWheelTimeRef.current < 450) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 20) {
      lastWheelTimeRef.current = now;
      if (delta > 0) {
        // Scroll down/right -> Next slide
        setVirtualIndex((curr) => curr + 1);
      } else {
        // Scroll up/left -> Previous slide
        setVirtualIndex((curr) => curr - 1);
      }
      setProgress(0);
    }
  };

  // Mouse Drag / Swipe Handlers
  const handleMouseDown = (e) => {
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      isDragging: true,
      moved: false,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragStartRef.current.isDragging) return;
    const diffX = e.clientX - dragStartRef.current.x;
    if (Math.abs(diffX) > 10) {
      dragStartRef.current.moved = true;
    }
  };

  const handleMouseUp = (e) => {
    if (!dragStartRef.current.isDragging) return;
    const diffX = e.clientX - dragStartRef.current.x;
    dragStartRef.current.isDragging = false;

    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        // Dragged left -> Next slide
        setVirtualIndex((curr) => curr + 1);
      } else {
        // Dragged right -> Previous slide
        setVirtualIndex((curr) => curr - 1);
      }
      setProgress(0);
    }
  };

  // Touch Swipe Handlers for Mobile / Trackpad
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      x: touch.clientX,
      y: touch.clientY,
      isDragging: true,
      moved: false,
    };
  };

  const handleTouchMove = (e) => {
    if (!dragStartRef.current.isDragging) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - dragStartRef.current.startX;
    const diffY = touch.clientY - dragStartRef.current.startY;
    if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
      dragStartRef.current.moved = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (!dragStartRef.current.isDragging) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - dragStartRef.current.startX;
    dragStartRef.current.isDragging = false;

    if (Math.abs(diffX) > 35) {
      if (diffX < 0) {
        setVirtualIndex((curr) => curr + 1);
      } else {
        setVirtualIndex((curr) => curr - 1);
      }
      setProgress(0);
    }
  };

  // Handle dot click: always glide forward smoothly
  const handleDotClick = (dotIdx) => {
    const currentDot = ((virtualIndex % itemCount) + itemCount) % itemCount;
    let diff = dotIdx - currentDot;
    if (diff < 0) diff += itemCount;
    setVirtualIndex((curr) => curr + diff);
    setProgress(0);
  };

  const handleOpenItem = (item) => {
    // If mouse was dragged, don't open the modal
    if (dragStartRef.current.moved) return;

    const matching = portfolioItems.find((p) => p.seed === item.seed || p.id === item.id);
    if (matching) {
      setActiveStory(matching);
    } else {
      setActiveStory({
        id: item.id,
        title: item.title || item.caption,
        category: item.category || "Moments",
        year: item.year || "2026",
        seed: item.seed,
        aspect: item.aspect,
        intro: {
          quote:
            item.tagline ||
            item.quote ||
            "Preserving the spontaneous texture of life across continents and seasons.",
          description:
            item.description ||
            "Photographed on location with available natural light, medium format grain, and slow observation.",
        },
        sections: item.sections || [
          {
            chapter: "SECTION 01",
            subtitle: "THE CAPTURE",
            quote:
              item.tagline ||
              "Preserving the spontaneous texture of life across continents and seasons.",
            text: "Every frame in Moments in Motion reflects our commitment to slow, deliberate observation in the world.",
            image: { seed: item.seed, aspect: 16 / 10, caption: item.caption },
          },
        ],
      });
    }
  };

  return (
    <>
      <section
        className="gallery-section"
        id="gallery"
        ref={sectionRef}
        onWheel={handleWheel}
        onMouseLeave={() => {
          dragStartRef.current.isDragging = false;
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="gallery-section__header container-max">
          <div>
            <span className="eyebrow">Visual Stories</span>
            <h2 className="heading-lg">Moments in Motion</h2>
          </div>
        </div>

        <div className="gallery-section__track-wrap">
          <div className="gallery-section__track" ref={trackRef}>
            {extendedItems.map((item, idx) => {
              const isFocused = idx === virtualIndex;
              return (
                <figure
                  className={`gallery-section__item ${isFocused ? "is-focused" : ""}`}
                  key={item.cloneId}
                  onClick={() => {
                    if (isFocused) {
                      handleOpenItem(item);
                    } else {
                      setVirtualIndex(idx);
                      setProgress(0);
                    }
                  }}
                  data-cursor="view"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isFocused) handleOpenItem(item);
                      else {
                        setVirtualIndex(idx);
                        setProgress(0);
                      }
                    }
                  }}
                >
                  <motion.div
                    className="gallery-section__item-image"
                    layoutId={isFocused ? `story-image-${item.id}` : undefined}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SmartImage
                      seed={item.seed}
                      aspect={16 / 9}
                      widths={[800, 1400, 2000]}
                      sizes="(max-width: 768px) 92vw, min(1400px, 86vw)"
                      alt={item.caption}
                    />
                  </motion.div>

                  {/* Top-Right Apple TV+ Style Brand Badge */}
                  <div className="gallery-section__item-brand">
                    <span>✦ NOIR</span>
                  </div>

                  {/* Apple TV+ Cinematic Content Overlay */}
                  <div className="gallery-section__item-overlay">
                    <div className="gallery-section__item-headline">
                      <h3 className="gallery-section__item-title">{item.caption}</h3>
                      {item.tagline && (
                        <p className="gallery-section__item-subheadline">
                          {item.tagline}
                        </p>
                      )}
                    </div>

                    <div className="gallery-section__item-bottom-row">
                      <button
                        type="button"
                        className="gallery-section__item-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(item);
                        }}
                        data-cursor="button"
                      >
                        Explore story
                      </button>

                      <div className="gallery-section__item-meta-inline">
                        <span className="gallery-section__item-genre">
                          {item.category || "Editorial"}
                        </span>
                        <span className="gallery-section__item-dot">&bull;</span>
                        <span className="gallery-section__item-logline">
                          {item.quote || item.description || "Captured on location in natural light."}
                        </span>
                      </div>
                    </div>
                  </div>
                </figure>
              );
            })}
          </div>
        </div>

        {/* Apple-Style Pagination Indicator Bar */}
        <div className="gallery-pagination">
          {galleryStrip.map((item, idx) => {
            const isActive = idx === activeDotIndex;
            return (
              <button
                key={item.id}
                type="button"
                className={`gallery-pagination__dot ${isActive ? "is-active" : ""}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to slide ${idx + 1}: ${item.caption}`}
                data-cursor="button"
              >
                {isActive && (
                  <span
                    className="gallery-pagination__progress"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <StoryModal activeStory={activeStory} onClose={() => setActiveStory(null)} />
    </>
  );
}
