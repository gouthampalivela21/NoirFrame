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

const STORAGE_KEY = "phantom_labs_cms_v1";

export const defaultSiteSettings = {
  studioName: "Phantom Labs",
  eyebrow: "A New Visual Studio",
  heroTitle: "PHANTOM LABS",
  heroSubtitle:
    "Visual stories, framed differently. A creative visual studio specializing in cinematic photography, intimate moments, and timeless visual storytelling.",
  heroBadge: "The First Chapter — 2026",
  heroImage: "noir-hero-main",
  heroAction1: "Explore Phantom Labs",
  heroAction2: "Start a Conversation",
  heroStats: [],
};

export const defaultAboutData = {
  eyebrow: "Studio Philosophy",
  title: "WHY PHANTOM LABS?",
  studioSubtitle: "The Philosophy",
  bio1:
    "Phantom Labs was created around a simple belief: the best photographs aren't simply seen — they're remembered.",
  bio2:
    "Built at the intersection of photography, design and storytelling, Phantom Labs aims to create images with atmosphere, emotion and intention.",
  stats: [],
};

export const defaultContactData = {
  eyebrow: "First Commissions",
  title: "LET’S CREATE THE FIRST STORY.",
  subtitle:
    "Phantom Labs is currently opening its first set of creative projects.",
  inquiryEmail: "teamphantomlabs@gmail.com",
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
      content: "PHANTOM LABS",
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

export const defaultAdminSettings = {
  studioName: "Phantom Labs",
  studioTagline: "Visual stories, framed differently.",
  studioEmail: "teamphantomlabs@gmail.com",
  studioPhone: "+91 98860 12345",
  studioAddress: "Bengaluru · Worldwide",
  gstNumber: "",
  adminName: "Goutham Palivela",
  adminRole: "Founder",
  adminEmail: "gouthampalivela26@gmail.com",
  adminAvatar: "/images/team/goutham.png",
};

/**
 * Authorised Administrator Allowlist
 * Only Google accounts registered here are granted access to the studio workspace.
 */
export const defaultAdministrators = [
  {
    id: "admin_founder_goutham",
    email: "gouthampalivela26@gmail.com",
    name: "Goutham Palivela",
    avatar: "/images/team/goutham.png",
    role: "Founder",
    status: "Active",
    dateAdded: "2026-01-01T00:00:00.000Z",
    isPrimaryFounder: true,
  },
  {
    id: "admin_cofounder_harshith",
    email: "harshith@phantomlabs.in",
    name: "Harshith",
    avatar: "/images/team/harshith.png",
    role: "Co-Founder",
    status: "Active",
    dateAdded: "2026-01-05T00:00:00.000Z",
    isPrimaryFounder: false,
  },
  {
    id: "admin_ops_team",
    email: "team@phantomlabs.in",
    name: "Studio Operations",
    avatar: "/images/admin-avatar.png",
    role: "Admin",
    status: "Active",
    dateAdded: "2026-01-10T00:00:00.000Z",
    isPrimaryFounder: false,
  },
];

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
  // Real Studio Business Records (starts clean with genuine submissions)
  inquiries: [],
  clients: [],
  projects: [],
  bookings: [],
  activities: [],
  testimonials: [],
  messages: [],
  adminSettings: defaultAdminSettings,
  // Authorised Administrator Allowlist
  administrators: defaultAdministrators,
});

/**
 * Sanitize and validate CMS data state while preserving all populated database content
 */
export const sanitizeState = (raw) => {
  if (!raw || typeof raw !== "object") {
    return createDefaultState();
  }

  const rawHomeHero = raw.visualEditor?.pages?.homeHero;

  // Filter out any mock/fake demonstration items from previous versions
  const isDemonstration = (item) => {
    if (!item) return false;
    const s = JSON.stringify(item);
    return (
      s.includes("Aditi & Rohan") ||
      s.includes("Veyra Studio") ||
      s.includes("Priya & Karthik") ||
      s.includes("The Grove Café") ||
      s.includes("Arjun Mehta") ||
      s.includes("inq-1") ||
      s.includes("proj-1") ||
      s.includes("cli-1") ||
      s.includes("book-1")
    );
  };

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

    // Studio Database Records — only retain real entries
    inquiries: Array.isArray(raw.inquiries)
      ? raw.inquiries.filter((i) => !isDemonstration(i))
      : [],
    clients: Array.isArray(raw.clients)
      ? raw.clients.filter((c) => !isDemonstration(c))
      : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.filter((p) => !isDemonstration(p))
      : [],
    bookings: Array.isArray(raw.bookings)
      ? raw.bookings.filter((b) => !isDemonstration(b))
      : [],
    activities: Array.isArray(raw.activities)
      ? raw.activities.filter((a) => !isDemonstration(a))
      : [],
    testimonials: Array.isArray(raw.testimonials)
      ? raw.testimonials.filter((t) => !isDemonstration(t))
      : [],
    messages: Array.isArray(raw.messages)
      ? raw.messages.filter((m) => !isDemonstration(m))
      : [],
    administrators: Array.isArray(raw.administrators) && raw.administrators.length > 0
      ? raw.administrators
      : defaultAdministrators,
    adminSettings: {
      ...defaultAdminSettings,
      ...(raw.adminSettings || raw.settings || {}),
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

  const addInquiry = useCallback(
    (inquiry = {}) => {
      const newInq = {
        id: inquiry.id || `inq_${Date.now()}`,
        clientName: inquiry.clientName || inquiry.name || "Anonymous Patron",
        email: inquiry.email || "",
        phone: inquiry.phone || "",
        category: inquiry.category || inquiry.lookingFor || "General Inquiry",
        subCategory: inquiry.subCategory || "",
        location: inquiry.location || "Website Submission",
        preferredDate: inquiry.preferredDate || "",
        budget: inquiry.budget || "Pending Quote",
        message: inquiry.message || "",
        status: inquiry.status || "New",
        source: inquiry.source || "Website Contact Form",
        timeAgo: "Just now",
        createdAt: new Date().toISOString(),
        notes: inquiry.notes || [],
      };

      const newActivity = {
        id: `act_${Date.now()}`,
        type: "inquiry",
        title: `New Inquiry — ${newInq.category}`,
        headline: `New Inquiry — ${newInq.category}`,
        details: `${newInq.clientName} · ${newInq.location}`,
        subText: `${newInq.clientName} · ${newInq.location}`,
        timestamp: "Just now",
        timeAgo: "Just now",
        statusBadge: "New",
        status: "New",
        thumbnail: "/images/dashboard/act-1.png",
      };

      return persistAndSet((previous) => ({
        ...previous,
        inquiries: [newInq, ...(previous.inquiries || [])],
        activities: [newActivity, ...(previous.activities || []).slice(0, 49)],
      }));
    },
    [persistAndSet]
  );

  const updateInquiry = useCallback(
    (id, patch) => {
      return persistAndSet((previous) => ({
        ...previous,
        inquiries: (previous.inquiries || []).map((i) =>
          i.id === id ? { ...i, ...patch } : i
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteInquiry = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        inquiries: (previous.inquiries || []).filter((i) => i.id !== id),
      }));
    },
    [persistAndSet]
  );

  const convertInquiryToClient = useCallback(
    (inquiryId) => {
      return persistAndSet((previous) => {
        const inq = (previous.inquiries || []).find((i) => i.id === inquiryId);
        if (!inq) return previous;

        const updatedInquiries = previous.inquiries.map((i) =>
          i.id === inquiryId ? { ...i, status: "Confirmed" } : i
        );

        const newClient = {
          id: `cli_${Date.now()}`,
          name: inq.clientName,
          company: "",
          email: inq.email,
          phone: inq.phone,
          category: inq.category || "Commercial",
          tier: "Standard",
          status: "Active",
          totalSpend: inq.budget || "—",
          projectsCount: 1,
          avatar: "/images/dashboard/act-5.png",
          notes: inq.message ? `Converted from inquiry: ${inq.message}` : "",
          createdAt: new Date().toISOString(),
        };

        const newProject = {
          id: `proj_${Date.now()}`,
          title: `${inq.clientName} — ${inq.category} Commission`,
          client: inq.clientName,
          clientName: inq.clientName,
          category: inq.category,
          stage: "Planning",
          status: "In Progress",
          progress: 15,
          budget: inq.budget || "—",
          deadline: inq.preferredDate || "",
          coverImage: "/images/dashboard/shoot-1.png",
          deliverables: [
            { id: "d1", title: "Creative brief & moodboard", done: true, completed: true },
            { id: "d2", title: "Production shoot execution", done: false, completed: false },
            { id: "d3", title: "Culling & color grading", done: false, completed: false },
            { id: "d4", title: "Final gallery delivery", done: false, completed: false },
          ],
          notes: inq.message || "",
          createdAt: new Date().toISOString(),
        };

        const newActivity = {
          id: `act_${Date.now()}`,
          type: "client",
          title: `New Client Added`,
          headline: `New Client Added`,
          details: `${inq.clientName} · ${inq.category}`,
          subText: `${inq.clientName} · ${inq.category}`,
          timestamp: "Just now",
          timeAgo: "Just now",
          statusBadge: "Client",
          status: "Client",
          thumbnail: "/images/dashboard/act-5.png",
        };

        return {
          ...previous,
          inquiries: updatedInquiries,
          clients: [newClient, ...(previous.clients || [])],
          projects: [newProject, ...(previous.projects || [])],
          activities: [newActivity, ...(previous.activities || []).slice(0, 49)],
        };
      });
    },
    [persistAndSet]
  );

  const addClient = useCallback(
    (client = {}) => {
      const newClient = {
        id: client.id || `cli_${Date.now()}`,
        name: client.name || "Client",
        company: client.company || "",
        email: client.email || "",
        phone: client.phone || "",
        category: client.category || "Commercial",
        tier: client.tier || "Standard",
        status: client.status || "Active",
        totalSpend: client.totalSpend || "₹0",
        projectsCount: client.projectsCount || 0,
        avatar: client.avatar || "/images/dashboard/act-5.png",
        notes: client.notes || "",
        createdAt: new Date().toISOString(),
      };

      return persistAndSet((previous) => ({
        ...previous,
        clients: [newClient, ...(previous.clients || [])],
      }));
    },
    [persistAndSet]
  );

  const updateClient = useCallback(
    (id, patch) => {
      return persistAndSet((previous) => ({
        ...previous,
        clients: (previous.clients || []).map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteClient = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        clients: (previous.clients || []).filter((c) => c.id !== id),
      }));
    },
    [persistAndSet]
  );

  const addProject = useCallback(
    (project = {}) => {
      const newProj = {
        id: project.id || `proj_${Date.now()}`,
        title: project.title || "Untitled Commission",
        client: project.client || project.clientName || "Client",
        clientName: project.client || project.clientName || "Client",
        category: project.category || "Campaign",
        stage: project.stage || "Inquiry",
        status: project.status || "In Progress",
        progress: project.progress ?? 10,
        budget: project.budget || "—",
        deadline: project.deadline || "",
        coverImage: project.coverImage || "/images/dashboard/shoot-1.png",
        deliverables: project.deliverables || [],
        notes: project.notes || "",
        published: project.published ?? true,
        createdAt: new Date().toISOString(),
      };

      const newActivity = {
        id: `act_${Date.now()}`,
        type: "project",
        title: `Project Created — ${newProj.title}`,
        headline: `Project Created — ${newProj.title}`,
        details: `${newProj.client} · Stage: ${newProj.stage}`,
        subText: `${newProj.client} · Stage: ${newProj.stage}`,
        timestamp: "Just now",
        timeAgo: "Just now",
        statusBadge: "In Progress",
        status: "In Progress",
        thumbnail: newProj.coverImage,
      };

      return persistAndSet((previous) => ({
        ...previous,
        projects: [newProj, ...(previous.projects || [])],
        activities: [newActivity, ...(previous.activities || []).slice(0, 49)],
      }));
    },
    [persistAndSet]
  );

  const updateProject = useCallback(
    (id, patch) => {
      return persistAndSet((previous) => ({
        ...previous,
        projects: (previous.projects || []).map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteProject = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        projects: (previous.projects || []).filter((p) => p.id !== id),
      }));
    },
    [persistAndSet]
  );

  const addBooking = useCallback(
    (booking = {}) => {
      const newBooking = {
        id: booking.id || `book_${Date.now()}`,
        title: booking.title || "Production Shoot",
        client: booking.client || booking.clientName || "Patron",
        clientName: booking.client || booking.clientName || "Patron",
        location: booking.location || "Studio",
        date: booking.date || new Date().toISOString().slice(0, 10),
        time: booking.time || "08:00 AM",
        dateFormatted: booking.dateFormatted || `${booking.date} · ${booking.time}`,
        crew: booking.crew || "Studio Crew",
        equipment: booking.equipment || "Standard Production Kit",
        status: booking.status || "Confirmed",
        thumbnail: booking.thumbnail || "/images/dashboard/shoot-1.png",
        createdAt: new Date().toISOString(),
      };

      const newActivity = {
        id: `act_${Date.now()}`,
        type: "booking",
        title: `Booking Confirmed — ${newBooking.title}`,
        headline: `Booking Confirmed — ${newBooking.title}`,
        details: `${newBooking.client} · ${newBooking.location}`,
        subText: `${newBooking.client} · ${newBooking.location}`,
        timestamp: "Just now",
        timeAgo: "Just now",
        statusBadge: "Confirmed",
        status: "Confirmed",
        thumbnail: newBooking.thumbnail,
      };

      return persistAndSet((previous) => ({
        ...previous,
        bookings: [newBooking, ...(previous.bookings || [])],
        activities: [newActivity, ...(previous.activities || []).slice(0, 49)],
      }));
    },
    [persistAndSet]
  );

  const updateBooking = useCallback(
    (id, patch) => {
      return persistAndSet((previous) => ({
        ...previous,
        bookings: (previous.bookings || []).map((b) =>
          b.id === id ? { ...b, ...patch } : b
        ),
      }));
    },
    [persistAndSet]
  );

  const cancelBooking = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        bookings: (previous.bookings || []).map((b) =>
          b.id === id ? { ...b, status: "Cancelled" } : b
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteBooking = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        bookings: (previous.bookings || []).filter((b) => b.id !== id),
      }));
    },
    [persistAndSet]
  );

  const addTestimonial = useCallback(
    (testimonial = {}) => {
      const newT = {
        id: testimonial.id || `test_${Date.now()}`,
        author: testimonial.author || testimonial.clientName || "Client",
        clientName: testimonial.author || testimonial.clientName || "Client",
        role: testimonial.role || testimonial.shootType || "Client",
        company: testimonial.company || "",
        quote: testimonial.quote || "",
        rating: testimonial.rating || 5,
        published: testimonial.published ?? true,
        createdAt: new Date().toISOString(),
      };

      return persistAndSet((previous) => ({
        ...previous,
        testimonials: [newT, ...(previous.testimonials || [])],
      }));
    },
    [persistAndSet]
  );

  const updateTestimonial = useCallback(
    (id, patch) => {
      return persistAndSet((previous) => ({
        ...previous,
        testimonials: (previous.testimonials || []).map((t) =>
          t.id === id ? { ...t, ...patch } : t
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteTestimonial = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        testimonials: (previous.testimonials || []).filter((t) => t.id !== id),
      }));
    },
    [persistAndSet]
  );

  const markMessageRead = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        messages: (previous.messages || []).map((m) =>
          m.id === id ? { ...m, unread: false } : m
        ),
      }));
    },
    [persistAndSet]
  );

  const deleteMessage = useCallback(
    (id) => {
      return persistAndSet((previous) => ({
        ...previous,
        messages: (previous.messages || []).filter((m) => m.id !== id),
      }));
    },
    [persistAndSet]
  );

  const updateAdminSettings = useCallback(
    (patch) => {
      return persistAndSet((previous) => ({
        ...previous,
        adminSettings: {
          ...(previous.adminSettings || defaultAdminSettings),
          ...patch,
        },
      }));
    },
    [persistAndSet]
  );

  /**
   * Administrator Allowlist Mutators (Founder Only)
   */
  const addAdministrator = useCallback(
    ({ email, name, role = "Admin" }) => {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        throw new Error("A valid Google email address is required.");
      }

      return persistAndSet((previous) => {
        const currentAdmins = previous.administrators || defaultAdministrators;
        if (currentAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
          throw new Error(`An administrator with email ${cleanEmail} is already registered.`);
        }

        const validRole = ["Founder", "Co-Founder", "Admin"].includes(role) ? role : "Admin";
        const newAdmin = {
          id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email: cleanEmail,
          name: (name || "").trim() || cleanEmail.split("@")[0],
          avatar: "/images/admin-avatar.png",
          role: validRole,
          status: "Active",
          dateAdded: new Date().toISOString(),
          isPrimaryFounder: false,
        };

        return {
          ...previous,
          administrators: [...currentAdmins, newAdmin],
          activities: [
            {
              id: `act_${Date.now()}`,
              type: "admin",
              title: "Administrator Access Authorized",
              headline: `New ${validRole} Added`,
              subText: `${newAdmin.name} (${cleanEmail})`,
              details: `Authorized Google email ${cleanEmail} as ${validRole}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              timeAgo: "Just now",
              status: "Active",
              statusBadge: "Active",
              thumbnail: "/images/dashboard/act-1.png",
            },
            ...(previous.activities || []),
          ],
        };
      });
    },
    [persistAndSet]
  );

  const updateAdministrator = useCallback(
    (id, updates) => {
      return persistAndSet((previous) => {
        const currentAdmins = previous.administrators || defaultAdministrators;
        return {
          ...previous,
          administrators: currentAdmins.map((admin) => {
            if (admin.id !== id && admin.email.toLowerCase() !== (updates.email || "").toLowerCase()) {
              return admin;
            }
            // Protect primary founder account from accidental removal or demotion
            if (admin.isPrimaryFounder) {
              return {
                ...admin,
                name: updates.name ?? admin.name,
                avatar: updates.avatar ?? admin.avatar,
                // Role and status cannot be changed for primary founder
              };
            }
            return {
              ...admin,
              ...updates,
              role: updates.role ? (["Founder", "Co-Founder", "Admin"].includes(updates.role) ? updates.role : admin.role) : admin.role,
              status: updates.status ? (["Active", "Deactivated"].includes(updates.status) ? updates.status : admin.status) : admin.status,
            };
          }),
        };
      });
    },
    [persistAndSet]
  );

  const toggleAdministratorStatus = useCallback(
    (id) => {
      return persistAndSet((previous) => {
        const currentAdmins = previous.administrators || defaultAdministrators;
        return {
          ...previous,
          administrators: currentAdmins.map((admin) => {
            if (admin.id === id) {
              if (admin.isPrimaryFounder) return admin; // Primary founder cannot be deactivated
              const nextStatus = admin.status === "Active" ? "Deactivated" : "Active";
              return { ...admin, status: nextStatus };
            }
            return admin;
          }),
        };
      });
    },
    [persistAndSet]
  );

  const deleteAdministrator = useCallback(
    (id) => {
      return persistAndSet((previous) => {
        const currentAdmins = previous.administrators || defaultAdministrators;
        const target = currentAdmins.find((a) => a.id === id);
        if (target?.isPrimaryFounder) {
          throw new Error("The primary Founder account cannot be deleted or removed.");
        }
        return {
          ...previous,
          administrators: currentAdmins.filter((a) => a.id !== id),
        };
      });
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

        // Studio Database Records
        inquiries: data.inquiries || [],
        clients: data.clients || [],
        projects: data.projects || [],
        bookings: data.bookings || [],
        activities: data.activities || [],
        testimonials: data.testimonials || [],
        messages: data.messages || [],
        adminSettings: data.adminSettings || defaultAdminSettings,
        administrators: data.administrators || defaultAdministrators,

        // Studio Actions
        addInquiry,
        updateInquiry,
        deleteInquiry,
        convertInquiryToClient,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addBooking,
        updateBooking,
        cancelBooking,
        deleteBooking,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        markMessageRead,
        deleteMessage,
        updateAdminSettings,

        // Administrator Allowlist Management (Founder Only)
        addAdministrator,
        updateAdministrator,
        toggleAdministratorStatus,
        deleteAdministrator,

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
