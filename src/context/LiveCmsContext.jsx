import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { withLiveCmsDefaults } from "../data/liveCmsDefaults.js";

const LiveCmsContext = createContext(null);
const STORAGE_KEY = "phantom_labs_live_cms_v3";

function applyMobileContent(base, overrides) {
  if (overrides === undefined || overrides === null) return base;
  if (Array.isArray(overrides)) {
    if (!Array.isArray(base)) return overrides;
    return overrides.map((item, index) => applyMobileContent(base[index], item));
  }
  if (typeof overrides !== "object") return overrides;
  const result = { ...(base && typeof base === "object" && !Array.isArray(base) ? base : {}) };
  for (const [key, value] of Object.entries(overrides)) result[key] = applyMobileContent(result[key], value);
  return result;
}

export function LiveCmsProvider({ children }) {
  const [isMobileViewport, setIsMobileViewport] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 680px)").matches);
  const previewMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cmsPreview") === "1";
  const previewCmsRef = React.useRef(null);
  const cmsFetchInFlightRef = React.useRef(false);
  const [cms, setCms] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && parsed.hero) {
          return withLiveCmsDefaults(parsed);
        }
      }
    } catch {}
    return withLiveCmsDefaults({
      hero: {},
      websiteSection: {},
      footer: {},
    });
  });

  const [isLoading, setIsLoading] = useState(!cms.hero?.headline);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(max-width: 680px)");
    const updateViewport = (event) => setIsMobileViewport(event.matches);
    setIsMobileViewport(query.matches);
    query.addEventListener?.("change", updateViewport);
    if (!query.addEventListener) query.addListener?.(updateViewport);
    return () => {
      query.removeEventListener?.("change", updateViewport);
      if (!query.removeEventListener) query.removeListener?.(updateViewport);
    };
  }, []);

  const visibleCms = isMobileViewport
    ? applyMobileContent(cms, cms.mobileContent || {})
    : cms;

  const fetchCmsData = useCallback(async () => {
    if (cmsFetchInFlightRef.current) return;
    cmsFetchInFlightRef.current = true;
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.cms) {
        throw new Error(data.error || `CMS request failed (${res.status}).`);
      }

      if (!previewCmsRef.current) setCms(withLiveCmsDefaults(data.cms));
      try {
        if (!previewMode) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.cms));
      } catch {}
      setError(null);
    } catch (err) {
      console.warn("[Live CMS fetch warning]:", err.message);
      setError("Unable to sync live site content.");
    } finally {
      cmsFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [previewMode]);

  useEffect(() => {
    if (!previewMode) return undefined;
    const receivePreview = (event) => {
      if (event.origin !== window.location.origin || event.data?.type !== "studio-cms-preview" || !event.data.cms) return;
      previewCmsRef.current = event.data.cms;
      setCms(withLiveCmsDefaults(event.data.cms));
    };
    window.addEventListener("message", receivePreview);
    window.parent.postMessage({ type: "studio-cms-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receivePreview);
  }, [previewMode]);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  // Supabase Realtime normally refreshes the page as soon as a CMS row
  // changes. Polling while visible keeps visitors in sync if Realtime is
  // disabled or temporarily disconnected.
  useEffect(() => {
    if (previewMode) return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") fetchCmsData();
    };
    const timer = window.setInterval(refreshIfVisible, 4000);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [fetchCmsData, previewMode]);

  // Real-time Supabase subscription for instant live site updates
  useEffect(() => {
    if (!supabase || previewMode) return undefined;

    try {
      const channel = supabase
        .channel("public-live-cms")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_content" },
          () => {
            fetchCmsData();
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    } catch {}
  }, [fetchCmsData, previewMode]);

  const getStoryById = useCallback(
    (id) => {
      if (!Array.isArray(visibleCms.stories)) return null;
      const clean = String(id || "").toLowerCase().trim();
      return (
        visibleCms.stories.find(
          (s) =>
            (s.id && s.id.toLowerCase() === clean) ||
            (s.category && s.category.toLowerCase() === clean)
      ) || visibleCms.stories[0] || null
      );
    },
    [visibleCms.stories]
  );

  const value = {
    cms: visibleCms,
    home: {
      hero: visibleCms.hero || {},
      websiteSection: visibleCms.websiteSection || {},
      websiteExperience: visibleCms.websiteExperience || {},
      categories: visibleCms.categories || [],
    },
    studio: visibleCms.studio || {},
    journeys: visibleCms.journeys || { packages: [] },
    stories: visibleCms.stories || [],
    footer: visibleCms.footer || {},
    navigation: visibleCms.navigation || [],
    branding: visibleCms.branding || {},
    pages: visibleCms.pages || {},
    booking: visibleCms.booking || {},
    websiteExperience: visibleCms.websiteExperience || {},
    testimonials: visibleCms.testimonials || [],
    getStoryById,
    isLoading,
    error,
    refreshCms: fetchCmsData,
  };

  return <LiveCmsContext.Provider value={value}>{children}</LiveCmsContext.Provider>;
}

export function useLiveCms() {
  const context = useContext(LiveCmsContext);
  if (!context) {
    throw new Error("useLiveCms must be used within a LiveCmsProvider");
  }
  return context;
}
