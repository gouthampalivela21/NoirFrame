import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  portfolioItems as codePortfolioItems,
  categories as codeCategories,
} from "../data/portfolio.js";

import { galleryStrip as codeGalleryStrip } from "../data/gallery.js";
import { services as codeServices } from "../data/services.js";

import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  fetchPublishedContent,
  savePublishedContent,
} from "../services/api.js";

const DataContext = createContext(null);

const STORAGE_KEY = "noir_frame_cms_v1";

export const defaultSiteSettings = {
  studioName: "Noir Frame",
  eyebrow: "A New Visual Studio",
  heroTitle: "NOIR FRAME",
  heroSubtitle:
    "Visual stories, framed differently. A new visual studio focused on cinematic photography, intimate moments and distinctive visual storytelling.",
  heroBadge: "The First Chapter — 2026",
  heroImage: "noir-hero-main",
  heroAction1: "Explore Noir Frame",
  heroAction2: "Start a Conversation",
  heroStats: [],
};

export const defaultAboutData = {
  eyebrow: "Studio Philosophy",
  title: "WHY NOIR FRAME?",
  studioSubtitle: "The Philosophy",
  bio1:
    "Noir Frame was created around a simple belief: the best photographs aren't simply seen — they're remembered.",
  bio2:
    "Built at the intersection of photography, design and storytelling, Noir Frame aims to create images with atmosphere, emotion and intention.",
  stats: [],
};

export const defaultContactData = {
  eyebrow: "First Commissions",
  title: "LET’S CREATE THE FIRST STORY.",
  subtitle:
    "Noir Frame is currently opening its first set of creative projects.",
  inquiryEmail: "teamnoirframe@gmail.com",
  location: "Available for Commissions",
};

export const defaultVisualHero = {
  enabled: true,
  canvas: {
    width: 1920,
    height: 1080,
    aspectRatio: "16/9",
    backgroundType: "image",
    backgroundImage: "noir-hero-main",
    backgroundColor: "#070709",
    backgroundFit: "cover",
    backgroundPosition: "center",
    overlayType: "black-gradient",
    overlayOpacity: 0.6,
    overlayColor: "#000000",
    borderRadius: 0,
    zoom: 100,
  },
  elements: [
    {
      id: "el-eyebrow",
      type: "text",
      name: "Eyebrow Tagline",
      content: "PHOTOGRAPHY & CINEMATOGRAPHY STUDIO",
      x: 8,
      y: 32,
      width: 480,
      fontSize: 12,
      fontFamily: "Inter",
      fontWeight: 500,
      letterSpacing: 3,
      lineHeight: 1.4,
      textAlign: "left",
      color: "rgba(255, 255, 255, 0.75)",
      opacity: 1,
      rotation: 0,
      textTransform: "uppercase",
      zIndex: 10,
      locked: false,
      hidden: false,
    },
    {
      id: "el-title",
      type: "text",
      name: "Main Title",
      content: "NOIR FRAME",
      x: 8,
      y: 40,
      width: 800,
      fontSize: 76,
      fontFamily: "Playfair Display",
      fontWeight: 600,
      letterSpacing: -1,
      lineHeight: 1.05,
      textAlign: "left",
      color: "#ffffff",
      opacity: 1,
      rotation: 0,
      textTransform: "none",
      textShadow: "0 4px 24px rgba(0,0,0,0.5)",
      zIndex: 11,
      locked: false,
      hidden: false,
    },
    {
      id: "el-subtitle",
      type: "text",
      name: "Hero Subtitle",
      content: "An editorial studio dedicated to quiet elegance, candid atmosphere, and cinematic visual stories crafted across continents.",
      x: 8,
      y: 58,
      width: 540,
      fontSize: 16,
      fontFamily: "Inter",
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.6,
      textAlign: "left",
      color: "rgba(255, 255, 255, 0.85)",
      opacity: 1,
      rotation: 0,
      textTransform: "none",
      zIndex: 12,
      locked: false,
      hidden: false,
    },
    {
      id: "el-btn-primary",
      type: "button",
      name: "Primary Action",
      label: "Selected Work ↓",
      link: "#portfolio",
      x: 8,
      y: 74,
      width: 170,
      height: 48,
      fontSize: 13,
      fontFamily: "Inter",
      fontWeight: 500,
      textColor: "#000000",
      backgroundColor: "#ffffff",
      borderColor: "transparent",
      borderRadius: 4,
      borderWidth: 0,
      opacity: 1,
      zIndex: 13,
      locked: false,
      hidden: false,
    },
    {
      id: "el-btn-secondary",
      type: "button",
      name: "Secondary Action",
      label: "Moments in Motion",
      link: "#gallery",
      x: 20,
      y: 74,
      width: 190,
      height: 48,
      fontSize: 13,
      fontFamily: "Inter",
      fontWeight: 500,
      textColor: "#ffffff",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 4,
      borderWidth: 1,
      opacity: 1,
      zIndex: 14,
      locked: false,
      hidden: false,
    },
    {
      id: "el-badge",
      type: "badge",
      name: "Featured Badge",
      content: "FEATURED ARCHIVE — 2026",
      x: 75,
      y: 84,
      width: 220,
      height: 34,
      fontSize: 11,
      fontFamily: "Inter",
      fontWeight: 600,
      letterSpacing: 1.5,
      textColor: "rgba(255, 255, 255, 0.9)",
      backgroundColor: "rgba(18, 18, 24, 0.75)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 20,
      borderWidth: 1,
      opacity: 1,
      zIndex: 15,
      locked: false,
      hidden: false,
    },
  ],
};

export const defaultVisualEditorState = {
  pages: {
    homeHero: defaultVisualHero,
  },
  savedTemplates: [],
};

export const createDefaultState = () => ({
  siteSettings: defaultSiteSettings,
  portfolioItems: codePortfolioItems,
  categories: codeCategories,
  galleryStrip: codeGalleryStrip,
  services: codeServices,
  aboutData: defaultAboutData,
  contactData: defaultContactData,
  customPages: [],
  visualEditor: defaultVisualEditorState,
});

/**
 * Sanitize and validate CMS data state while preserving all populated database content
 */
export const sanitizeState = (raw) => {
  if (!raw || typeof raw !== "object") {
    return createDefaultState();
  }

  const rawHomeHero = raw.visualEditor?.pages?.homeHero;

  return {
    siteSettings: {
      ...defaultSiteSettings,
      ...(raw.siteSettings || {}),
      heroStats:
        Array.isArray(raw.siteSettings?.heroStats) &&
        raw.siteSettings.heroStats.length > 0
          ? raw.siteSettings.heroStats
          : defaultSiteSettings.heroStats,
    },

    portfolioItems:
      Array.isArray(raw.portfolioItems)
        ? raw.portfolioItems
        : codePortfolioItems,

    categories:
      Array.isArray(raw.categories) && raw.categories.length > 0
        ? raw.categories
        : codeCategories,

    galleryStrip:
      Array.isArray(raw.galleryStrip)
        ? raw.galleryStrip
        : codeGalleryStrip,

    services:
      Array.isArray(raw.services)
        ? raw.services
        : codeServices,

    aboutData: {
      ...defaultAboutData,
      ...(raw.aboutData || {}),
      stats:
        Array.isArray(raw.aboutData?.stats) &&
        raw.aboutData.stats.length > 0
          ? raw.aboutData.stats
          : defaultAboutData.stats,
    },

    contactData: {
      ...defaultContactData,
      ...(raw.contactData || {}),
    },

    customPages:
      Array.isArray(raw.customPages)
        ? raw.customPages
        : [],

    visualEditor: {
      pages: {
        homeHero: {
          ...defaultVisualHero,
          ...(rawHomeHero || {}),
          canvas: {
            ...defaultVisualHero.canvas,
            ...(rawHomeHero?.canvas || {}),
          },
          elements: Array.isArray(rawHomeHero?.elements)
            ? rawHomeHero.elements
            : defaultVisualHero.elements,
        },
        ...(raw.visualEditor?.pages || {}),
      },
      savedTemplates: Array.isArray(raw.visualEditor?.savedTemplates)
        ? raw.visualEditor.savedTemplates
        : [],
    },
  };
};

export function DataProvider({ children }) {
  /**
   * 1. Initialize state immediately from localStorage cache (or code defaults)
   */
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeState(parsed);
      }
    } catch (error) {
      console.warn("[CMS] Failed to load local cache:", error);
    }
    return createDefaultState();
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  /**
   * 2. Fetch latest content from Supabase cloud database.
   * Priority: Supabase -> localStorage cache -> code defaults.
   */
  useEffect(() => {
    let isMounted = true;

    async function loadLatestFromBackend() {
      setIsSyncing(true);
      try {
        const result = await fetchPublishedContent();

        // Only replace state if Supabase returned valid content
        if (isMounted && result?.success && result?.data && typeof result.data === "object") {
          const sanitized = sanitizeState(result.data);
          setData(sanitized);
          dataRef.current = sanitized;

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          } catch (error) {
            console.warn("[CMS] Could not update local cache:", error);
          }
        }
      } catch (error) {
        console.warn("[CMS] Backend content loading failed:", error);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    }

    loadLatestFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 3. Cross-tab synchronization via storage events.
   */
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue);
        const sanitized = sanitizeState(parsed);
        setData(sanitized);
        dataRef.current = sanitized;
      } catch (error) {
        console.warn("[CMS] Cross-tab synchronization failed:", error);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /**
   * 4. Centralized atomic state updater + localStorage + Supabase save.
   */
  const persistAndSet = useCallback(async (updater) => {
    const previous = dataRef.current;
    const rawNext = typeof updater === "function" ? updater(previous) : updater;
    const nextState = sanitizeState(rawNext);

    // Immediate React state update
    setData(nextState);
    dataRef.current = nextState;

    // Immediate localStorage cache update
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.warn("[CMS] Failed to save local state:", error);
    }

    // Persist to Supabase with authenticated session token
    try {
      let token = null;
      if (isSupabaseConfigured && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token;
      }

      const backendResult = await savePublishedContent(nextState, token);
      return backendResult;
    } catch (error) {
      console.error("[CMS] Backend save exception:", error);
      return { success: false, error: error?.message || "Database save failed.", data: nextState };
    }
  }, []);

  /**
   * Mutators
   */
  const updateSiteSettings = useCallback(
    (settings) => {
      return persistAndSet((previous) => ({
        ...previous,
        siteSettings: {
          ...previous.siteSettings,
          ...settings,
        },
      }));
    },
    [persistAndSet]
  );

  const updateVisualEditor = useCallback(
    (pageKey, editorData) => {
      return persistAndSet((previous) => ({
        ...previous,
        visualEditor: {
          ...previous.visualEditor,
          pages: {
            ...previous.visualEditor?.pages,
            [pageKey]: {
              ...previous.visualEditor?.pages?.[pageKey],
              ...editorData,
            },
          },
        },
      }));
    },
    [persistAndSet]
  );

  const saveVisualTemplate = useCallback(
    (template) => {
      const newTpl = {
        id: template.id || `tpl_${Date.now()}`,
        name: template.name || "Custom Composition",
        createdAt: new Date().toISOString(),
        ...template,
      };

      return persistAndSet((previous) => ({
        ...previous,
        visualEditor: {
          ...previous.visualEditor,
          savedTemplates: [
            newTpl,
            ...(previous.visualEditor?.savedTemplates || []).filter((t) => t.id !== newTpl.id),
          ],
        },
      }));
    },
    [persistAndSet]
  );

  const deleteVisualTemplate = useCallback(
    (templateId) => {
      return persistAndSet((previous) => ({
        ...previous,
        visualEditor: {
          ...previous.visualEditor,
          savedTemplates: (previous.visualEditor?.savedTemplates || []).filter((t) => t.id !== templateId),
        },
      }));
    },
    [persistAndSet]
  );

  const addPortfolioItem = useCallback(
    (item = {}) => {
      const newItem = {
        id: item.id || `p_${Date.now()}`,
        title: item.title || "Untitled Story",
        category: item.category || "Portraits",
        year: item.year || String(new Date().getFullYear()),
        size: item.size || "normal",
        seed: item.seed || "noir-portrait-02",
        aspect: item.aspect || 4 / 5,
        intro: item.intro || {
          quote: "A story preserved in light and silence.",
          description:
            "Documented with available natural light and slow observation.",
        },
        sections: item.sections || [],
      };

      return persistAndSet((previous) => ({
        ...previous,
        portfolioItems: [newItem, ...previous.portfolioItems],
      }));
    },
    [persistAndSet]
  );

  const updatePortfolioItem = useCallback(
    (id, updated) => {
      return persistAndSet((previous) => ({
        ...previous,
        portfolioItems: previous.portfolioItems.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
      }));
    },
    [persistAndSet]
  );

  const deletePortfolioItem = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        portfolioItems: previous.portfolioItems.filter(
          (item) => item.id !== id
        ),
      }));
    },
    [persistAndSet]
  );

  const addCategory = useCallback(
    (category) => {
      const cleanCategory = String(category || "").trim();
      if (!cleanCategory) return;

      return persistAndSet((previous) => {
        if (previous.categories.includes(cleanCategory)) {
          return previous;
        }

        return {
          ...previous,
          categories: [...previous.categories, cleanCategory],
        };
      });
    },
    [persistAndSet]
  );

  const deleteCategory = useCallback(
    (category) => {
      if (category === "All") return;

      return persistAndSet((previous) => ({
        ...previous,
        categories: previous.categories.filter((item) => item !== category),
      }));
    },
    [persistAndSet]
  );

  const addGalleryItem = useCallback(
    (item = {}) => {
      const currentYear = new Date().getFullYear();

      const newItem = {
        id: item.id || `g_${Date.now()}`,
        seed: item.seed || "noir-strip-01",
        aspect: item.aspect || 16 / 10,
        title: item.title || "Untitled Location",
        caption:
          item.caption || `${item.title || "Location"}, ${currentYear}`,
        category: item.category || "Moments",
        year: item.year || String(currentYear),
        tagline:
          item.tagline || "Memories kept unhurried in natural light.",
        description:
          item.description ||
          "An editorial exploration through natural geometry and light.",
        sections: item.sections || [],
      };

      return persistAndSet((previous) => ({
        ...previous,
        galleryStrip: [...previous.galleryStrip, newItem],
      }));
    },
    [persistAndSet]
  );

  const updateGalleryItem = useCallback(
    (id, updated) => {
      return persistAndSet((previous) => ({
        ...previous,
        galleryStrip: previous.galleryStrip.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteGalleryItem = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        galleryStrip: previous.galleryStrip.filter((item) => item !== id),
      }));
    },
    [persistAndSet]
  );

  const addServiceItem = useCallback(
    (service = {}) => {
      return persistAndSet((previous) => {
        const number = String(previous.services.length + 1).padStart(2, "0");

        const newService = {
          id: service.id || `s_${Date.now()}`,
          number: service.number || number,
          title: service.title || "New Service",
          tagline:
            service.tagline || "Custom tailored photography commissions.",
          description:
            service.description ||
            "Full coverage crafted around quiet elegance and natural light.",
          seed: service.seed || "noir-service-weddings",
          aspect: service.aspect || 1000 / 700,
        };

        return {
          ...previous,
          services: [...previous.services, newService],
        };
      });
    },
    [persistAndSet]
  );

  const updateServiceItem = useCallback(
    (id, updated) => {
      return persistAndSet((previous) => ({
        ...previous,
        services: previous.services.map((service) =>
          service.id === id ? { ...service, ...updated } : service
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteServiceItem = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        services: previous.services.filter((service) => service.id !== id),
      }));
    },
    [persistAndSet]
  );

  const updateAboutData = useCallback(
    (about) => {
      return persistAndSet((previous) => ({
        ...previous,
        aboutData: {
          ...previous.aboutData,
          ...about,
        },
      }));
    },
    [persistAndSet]
  );

  const updateContactData = useCallback(
    (contact) => {
      return persistAndSet((previous) => ({
        ...previous,
        contactData: {
          ...previous.contactData,
          ...contact,
        },
      }));
    },
    [persistAndSet]
  );

  const addCustomPage = useCallback(
    (page = {}) => {
      const slug = (page.slug || page.title || "custom-page")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const newPage = {
        id: `page_${Date.now()}`,
        slug: slug || `page-${Date.now()}`,
        title: page.title || "Custom Page",
        subtitle: page.subtitle || "",
        heroImage: page.heroImage || "noir-hero-main",
        content: page.content || "Welcome to this bespoke editorial page.",
        sections: page.sections || [],
        showInNav: page.showInNav ?? true,
        createdAt: new Date().toISOString(),
      };

      return persistAndSet((previous) => ({
        ...previous,
        customPages: [...(previous.customPages || []), newPage],
      }));
    },
    [persistAndSet]
  );

  const updateCustomPage = useCallback(
    (slug, updated) => {
      return persistAndSet((previous) => ({
        ...previous,
        customPages: (previous.customPages || []).map((page) =>
          page.slug === slug ? { ...page, ...updated } : page
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteCustomPage = useCallback(
    (slug) => {
      return persistAndSet((previous) => ({
        ...previous,
        customPages: (previous.customPages || []).filter(
          (page) => page.slug !== slug
        ),
      }));
    },
    [persistAndSet]
  );

  const resetAllToDefaults = useCallback(async () => {
    const defaultState = createDefaultState();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("[CMS] Could not clear local CMS data:", error);
    }

    setData(defaultState);
    dataRef.current = defaultState;

    // Also persist reset to Supabase
    try {
      let token = null;
      if (isSupabaseConfigured && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token;
      }
      await savePublishedContent(defaultState, token);
    } catch (e) {}

    return defaultState;
  }, []);

  const exportDataJSON = useCallback(() => {
    return JSON.stringify(dataRef.current, null, 2);
  }, []);

  const importDataJSON = useCallback(
    async (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return {
            success: false,
            error: "Invalid JSON format.",
          };
        }

        const sanitized = sanitizeState(parsed);
        return await persistAndSet(sanitized);
      } catch (error) {
        return {
          success: false,
          error: error?.message || "Invalid JSON file.",
        };
      }
    },
    [persistAndSet]
  );

  return (
    <DataContext.Provider
      value={{
        siteSettings: data.siteSettings,
        portfolioItems: data.portfolioItems,
        categories: data.categories,
        galleryStrip: data.galleryStrip,
        services: data.services,
        aboutData: data.aboutData,
        contactData: data.contactData,
        customPages: data.customPages || [],
        visualEditor: data.visualEditor || defaultVisualEditorState,
        isSyncing,

        updateSiteSettings,
        updateVisualEditor,
        saveVisualTemplate,
        deleteVisualTemplate,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        addCategory,
        deleteCategory,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addServiceItem,
        updateServiceItem,
        deleteServiceItem,
        updateAboutData,
        updateContactData,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,
        resetAllToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
