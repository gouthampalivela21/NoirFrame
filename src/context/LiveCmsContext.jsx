import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { defaultLiveCmsCategories } from "../data/liveCmsDefaults.js";

const LiveCmsContext = createContext(null);
const STORAGE_KEY = "phantom_labs_live_cms_v3";

export function LiveCmsProvider({ children }) {
  const [cms, setCms] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && parsed.hero) {
          return {
            ...parsed,
            categories:
              Array.isArray(parsed.categories) && parsed.categories.length > 0
                ? parsed.categories
                : defaultLiveCmsCategories,
          };
        }
      }
    } catch {}
    return {
      hero: {},
      websiteSection: {},
      categories: defaultLiveCmsCategories,
      studio: {},
      journeys: { packages: [] },
      stories: [],
      footer: {},
    };
  });

  const [isLoading, setIsLoading] = useState(!cms.hero?.headline);
  const [error, setError] = useState(null);

  const fetchCmsData = useCallback(async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cms) {
          setCms({
            ...data.cms,
            categories:
              Array.isArray(data.cms.categories) && data.cms.categories.length > 0
                ? data.cms.categories
                : defaultLiveCmsCategories,
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.cms));
          } catch {}
          setError(null);
        }
      }
    } catch (err) {
      console.warn("[Live CMS fetch warning]:", err.message);
      setError("Unable to sync live site content.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  // Real-time Supabase subscription for instant live site updates
  useEffect(() => {
    if (!supabase) return undefined;

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
  }, [fetchCmsData]);

  const getStoryById = useCallback(
    (id) => {
      if (!Array.isArray(cms.stories)) return null;
      const clean = String(id || "").toLowerCase().trim();
      return (
        cms.stories.find(
          (s) =>
            (s.id && s.id.toLowerCase() === clean) ||
            (s.category && s.category.toLowerCase() === clean)
        ) || cms.stories[0] || null
      );
    },
    [cms.stories]
  );

  const value = {
    cms,
    home: {
      hero: cms.hero || {},
      websiteSection: cms.websiteSection || {},
      categories: cms.categories || [],
    },
    studio: cms.studio || {},
    journeys: cms.journeys || { packages: [] },
    stories: cms.stories || [],
    footer: cms.footer || {},
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
