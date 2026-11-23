import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { supabase } from "../../lib/supabase.js";
import { adminApiFetch } from "../auth/adminApi.js";
import {
  defaultLiveCmsCategories,
  defaultLiveCmsBranding,
  defaultLiveCmsFooter,
  defaultLiveCmsJourneys,
  defaultLiveCmsNavigation,
  defaultLiveCmsPages,
  defaultLiveCmsStories,
  defaultLiveCmsStudio,
  defaultLiveCmsWebsiteExperience,
} from "../../data/liveCmsDefaults.js";
import { CATEGORIES_CONFIG } from "../../data/bookingQuestions.js";

const StudioAdminContext = createContext(null);

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function StudioAdminProvider({ children }) {
  // Live records state (Strictly empty defaults, NO mock data)
  const [inquiries, setInquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [team, setTeam] = useState([]);
  const [cmsData, setCmsData] = useState({
    hero: {
      headline: "Visual Stories, Framed Differently",
      subheadline: "Fine-art photography, editorial portraiture, and cinematic storytelling.",
      availabilityBadge: "Accepting Commissions",
      bannerImage: "/images/hero-villa-wide.jpg",
      heroImageWide: "/images/hero-villa-wide.jpg",
      heroImageMobile: "/images/hero-villa-mobile.jpg",
      primaryButtonText: "Book a Session",
      primaryButtonLink: "/book",
      secondaryButtonText: "Explore Works",
      secondaryButtonLink: "/stories",
      studioEmail: "studio@phantomlabs.in",
      location: "Bangalore / Worldwide",
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
      seoTitle: "Phantom Labs — Creative Production Studio",
      seoDescription: "Fine art portraits, editorial campaigns, and bespoke creative production.",
    },
    websiteSection: {
      title: "Website.",
      subtitle: "A better way to experience the web.",
      imageDesktop: "/images/websites-showcase-desktop.jpg",
      imageMobile: "/images/websites-showcase-mobile.jpg",
      ctaText: "Explore Digital Experience",
      ctaLink: "/experiences/website-design",
    },
    websiteExperience: defaultLiveCmsWebsiteExperience,
    categories: defaultLiveCmsCategories,
    studio: defaultLiveCmsStudio,
    journeys: defaultLiveCmsJourneys,
    stories: defaultLiveCmsStories,
    booking: { categories: CATEGORIES_CONFIG },
    pages: defaultLiveCmsPages,
    navigation: defaultLiveCmsNavigation,
    branding: defaultLiveCmsBranding,
    footer: defaultLiveCmsFooter,
    portfolio: [],
    services: [],
    testimonials: [],
  });

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation & UI state
  const [activeView, setActiveView] = useState("overview");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("All");
  const [inquiryCategoryFilter, setInquiryCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [logPaymentModalOpen, setLogPaymentModalOpen] = useState(false);
  const [paymentTargetProject, setPaymentTargetProject] = useState(null);
  const [toast, setToast] = useState(null);

  // Toast notification helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id > 2800 ? null : curr));
    }, 3000);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. LIVE DATA FETCHING
  // ---------------------------------------------------------------------------
  const fetchLiveAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        inquiriesRes,
        projectsRes,
        clientsRes,
        calendarRes,
        invoicesRes,
        cmsRes,
        teamRes,
      ] = await Promise.all([
        adminApiFetch("/api/admin/bookings").then((r) => (r.ok ? r.json() : { bookings: [] })),
        adminApiFetch("/api/admin/projects").then((r) => (r.ok ? r.json() : { projects: [] })),
        adminApiFetch("/api/admin/clients").then((r) => (r.ok ? r.json() : { clients: [] })),
        adminApiFetch("/api/admin/calendar").then((r) => (r.ok ? r.json() : { bookings: [] })),
        adminApiFetch("/api/admin/invoices").then((r) => (r.ok ? r.json() : { invoices: [] })),
        adminApiFetch("/api/admin/cms").then((r) => (r.ok ? r.json() : { cms: null })),
        adminApiFetch("/api/admin/team").then((r) => (r.ok ? r.json() : { team: [] })),
      ]);

      if (inquiriesRes && Array.isArray(inquiriesRes.bookings)) {
        setInquiries(inquiriesRes.bookings);
      }
      if (projectsRes && Array.isArray(projectsRes.projects)) {
        setProjects(projectsRes.projects);
      }
      if (clientsRes && Array.isArray(clientsRes.clients)) {
        setClients(clientsRes.clients);
      }
      if (calendarRes && Array.isArray(calendarRes.bookings)) {
        setBookings(calendarRes.bookings);
      }
      if (invoicesRes && Array.isArray(invoicesRes.invoices)) {
        setInvoices(invoicesRes.invoices);
      }
      if (cmsRes && cmsRes.cms) {
        setCmsData((prev) => ({
          ...prev,
          ...cmsRes.cms,
          hero: { ...prev.hero, ...(cmsRes.cms.hero || {}) },
          websiteSection: { ...prev.websiteSection, ...(cmsRes.cms.websiteSection || {}) },
          websiteExperience: { ...prev.websiteExperience, ...(cmsRes.cms.websiteExperience || {}) },
          categories: Array.isArray(cmsRes.cms.categories) && cmsRes.cms.categories.length ? cmsRes.cms.categories : prev.categories,
          studio: { ...prev.studio, ...(cmsRes.cms.studio || {}) },
          journeys: { ...prev.journeys, ...(cmsRes.cms.journeys || {}) },
          stories: Array.isArray(cmsRes.cms.stories) ? cmsRes.cms.stories : prev.stories,
          booking: { ...prev.booking, ...(cmsRes.cms.booking || {}), categories: { ...(prev.booking?.categories || {}), ...(cmsRes.cms.booking?.categories || {}) } },
          pages: {
            ...prev.pages,
            ...(cmsRes.cms.pages || {}),
            stories: { ...prev.pages.stories, ...(cmsRes.cms.pages?.stories || {}) },
            booking: { ...prev.pages.booking, ...(cmsRes.cms.pages?.booking || {}) },
            studio: { ...prev.pages.studio, ...(cmsRes.cms.pages?.studio || {}) },
            journeys: { ...prev.pages.journeys, ...(cmsRes.cms.pages?.journeys || {}) },
            seo: { ...prev.pages.seo, ...(cmsRes.cms.pages?.seo || {}) },
          },
          navigation: Array.isArray(cmsRes.cms.navigation) && cmsRes.cms.navigation.length ? cmsRes.cms.navigation : prev.navigation,
          branding: { ...prev.branding, ...(cmsRes.cms.branding || {}) },
          footer: { ...prev.footer, ...(cmsRes.cms.footer || {}) },
          portfolio: Array.isArray(cmsRes.cms.portfolio) ? cmsRes.cms.portfolio : (Array.isArray(cmsRes.cms.stories) ? cmsRes.cms.stories : []),
          services: Array.isArray(cmsRes.cms.services) ? cmsRes.cms.services : (cmsRes.cms.journeys?.packages || []),
          testimonials: Array.isArray(cmsRes.cms.testimonials) ? cmsRes.cms.testimonials : [],
        }));
      }
      if (teamRes && Array.isArray(teamRes.team)) {
        setTeam(teamRes.team);
      }
    } catch (err) {
      console.error("[Live Admin DB Fetch Exception]:", err);
      setError("Unable to connect to live studio database. Please check connectivity.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLiveAdminData();
  }, [fetchLiveAdminData]);

  // ---------------------------------------------------------------------------
  // 2. REAL-TIME DATABASE SUBSCRIPTIONS (SUPABASE POSTGRES CHANGES)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!supabase) return undefined;

    try {
      const channel = supabase
        .channel("studio-live-db")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "booking_requests" },
          () => {
            fetchLiveAdminData();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_content" },
          () => {
            fetchLiveAdminData();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "clients" },
          () => {
            fetchLiveAdminData();
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    } catch (e) {
      console.warn("Supabase real-time listener init notice:", e);
    }
  }, [fetchLiveAdminData]);

  // ---------------------------------------------------------------------------
  // 3. DYNAMIC METRICS CALCULATION (ZERO STATIC/MOCK NUMBERS)
  // ---------------------------------------------------------------------------
  const kpiStats = useMemo(() => {
    const totalInquiries = inquiries.length;
    const activeClients = clients.length;
    const ongoingProjects = projects.filter((p) => p.stage !== "Delivered").length;
    const upcomingShoots = bookings.filter((b) => b.status !== "Completed").length;
    const completedProjects = projects.filter((p) => p.stage === "Delivered").length;

    // Monthly & Total Revenue dynamically computed from actual payment logs
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let monthlyRevenue = 0;
    let totalRevenue = 0;

    projects.forEach((proj) => {
      (proj.payments || []).forEach((pay) => {
        const amt = Number(pay.amount) || 0;
        totalRevenue += amt;
        if (pay.date && pay.date.startsWith(currentMonthPrefix)) {
          monthlyRevenue += amt;
        }
      });
    });

    invoices.forEach((inv) => {
      if (inv.status === "Paid") {
        const amt = Number(inv.amount) || 0;
        totalRevenue += amt;
        const invDate = inv.paidDate || inv.issueDate || "";
        if (invDate.startsWith(currentMonthPrefix)) {
          monthlyRevenue += amt;
        }
      }
    });

    // Requests by Status (2x2 Grid)
    const statusCounts = {
      New: inquiries.filter((i) => i.status === "New").length,
      "In progress": inquiries.filter((i) => i.status === "In progress").length,
      Responded: inquiries.filter((i) => i.status === "Responded").length,
      Closed: inquiries.filter((i) => i.status === "Closed").length,
    };

    // Requests by Category (3x2 Grid)
    const categoryCounts = {
      Portraits: inquiries.filter((i) => i.category === "Portraits").length,
      Couples: inquiries.filter((i) => i.category === "Couples").length,
      Events: inquiries.filter((i) => i.category === "Events").length,
      Brands: inquiries.filter((i) => i.category === "Brands").length,
      Commercial: inquiries.filter((i) => i.category === "Commercial").length,
      Editorial: inquiries.filter((i) => i.category === "Editorial").length,
    };

    // Dynamic conversion rate
    const conversionRate =
      totalInquiries > 0
        ? `${Math.round((projects.length / totalInquiries) * 100)}%`
        : "0%";

    // Average Commission Value
    const totalQuote = projects.reduce((sum, p) => sum + (Number(p.quote) || 0), 0);
    const averageCommission = projects.length > 0 ? Math.round(totalQuote / projects.length) : 0;

    return {
      totalInquiries,
      activeClients,
      ongoingProjects,
      upcomingShoots,
      completedProjects,
      monthlyRevenue,
      totalRevenue,
      statusCounts,
      categoryCounts,
      conversionRate,
      averageCommission,
    };
  }, [inquiries, clients, projects, bookings, invoices]);

  // Dynamic 6-Month Monthly Revenue History
  const monthlyRevenueHistory = useMemo(() => {
    const now = new Date();
    const monthsMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthsMap[key] = { month: label, collected: 0 };
    }

    projects.forEach((proj) => {
      (proj.payments || []).forEach((pay) => {
        const prefix = (pay.date || "").slice(0, 7);
        if (monthsMap[prefix]) {
          monthsMap[prefix].collected += Number(pay.amount) || 0;
        }
      });
    });

    return Object.values(monthsMap);
  }, [projects]);

  // Dynamic Category Revenue Distribution
  const categoryDistribution = useMemo(() => {
    const genreMap = {
      Portraits: 0,
      Couples: 0,
      Commercial: 0,
      Editorial: 0,
      Brands: 0,
      Events: 0,
    };

    let totalQuote = 0;
    projects.forEach((p) => {
      const cat = p.category || "Portraits";
      const q = Number(p.quote) || 0;
      totalQuote += q;
      if (genreMap[cat] !== undefined) {
        genreMap[cat] += q;
      } else {
        genreMap[cat] = q;
      }
    });

    return Object.entries(genreMap).map(([name, rev]) => ({
      name,
      revenue: rev,
      share: totalQuote > 0 ? Math.round((rev / totalQuote) * 100) : 0,
    }));
  }, [projects]);

  // ---------------------------------------------------------------------------
  // 4. CRUD OPERATIONS (DIRECT DATABASE PERSISTENCE)
  // ---------------------------------------------------------------------------

  // Inquiries CRUD
  const updateInquiryStatus = useCallback(
    async (inquiryId, status) => {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
      );

      try {
        const res = await adminApiFetch(`/api/admin/bookings/${inquiryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update status on server");
        showToast(`Inquiry marked as ${status}.`);
      } catch (err) {
        showToast("Error updating inquiry status. Please retry.", "error");
        fetchLiveAdminData();
      }
    },
    [showToast, fetchLiveAdminData]
  );

  const deleteInquiry = useCallback(
    async (inquiryId) => {
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));

      try {
        const res = await adminApiFetch(`/api/admin/bookings/${inquiryId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete booking");
        showToast("Inquiry brief removed from database.");
      } catch (err) {
        showToast("Error deleting inquiry. Please retry.", "error");
        fetchLiveAdminData();
      }
    },
    [showToast, fetchLiveAdminData]
  );

  // Projects CRUD
  const createProject = useCallback(
    async (projectPayload) => {
      const quote = Number(projectPayload.quote) || 0;
      const advance = Number(projectPayload.advance) || 0;

      try {
        const res = await adminApiFetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectPayload.name,
            client: projectPayload.client,
            category: projectPayload.category,
            shootDate: projectPayload.shootDate,
            stage: projectPayload.stage || "Pre-Production",
            quote,
            advance,
            location: projectPayload.location,
            deliverables: projectPayload.deliverables,
            notes: projectPayload.notes,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setProjects((prev) => [data.project, ...prev]);
            showToast(`Project "${data.project.name}" commissioned.`);
            setNewProjectModalOpen(false);

            // Also refresh calendar bookings
            fetchLiveAdminData();
            return data.project;
          }
        }
      } catch (err) {
        console.error("Create project error:", err);
      }

      showToast("Unable to save project to database. Please retry.", "error");
      return null;
    },
    [showToast, fetchLiveAdminData]
  );

  const updateProjectStage = useCallback(
    async (projectId, stage) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, stage } : p))
      );

      try {
        const res = await adminApiFetch(`/api/admin/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage }),
        });
        if (!res.ok) throw new Error("Failed to update project stage");
        showToast(`Production stage updated to ${stage}.`);
      } catch (err) {
        showToast("Error updating project stage.", "error");
        fetchLiveAdminData();
      }
    },
    [showToast, fetchLiveAdminData]
  );

  const logPayment = useCallback(
    async (projectId, amount, note = "Client Milestone Payment") => {
      const numAmount = Number(amount) || 0;
      if (numAmount <= 0) return;

      try {
        const res = await adminApiFetch(`/api/admin/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentAmount: numAmount,
            paymentNote: note,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setProjects((prev) =>
              prev.map((p) => (p.id === projectId ? data.project : p))
            );
            setLogPaymentModalOpen(false);
            setPaymentTargetProject(null);
            showToast(`Payment of ${formatINR(numAmount)} logged.`);
            return;
          }
        }
      } catch (err) {
        console.error("Log payment error:", err);
      }

      showToast("Error recording payment. Please retry.", "error");
    },
    [showToast]
  );

  const deleteProject = useCallback(
    async (projectId) => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      try {
        const res = await adminApiFetch(`/api/admin/projects/${projectId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete project");
        showToast("Project removed from database.");
      } catch (err) {
        showToast("Error deleting project.", "error");
        fetchLiveAdminData();
      }
    },
    [showToast, fetchLiveAdminData]
  );

  // Convert Inquiry to Project
  const convertInquiryToProject = useCallback(
    async (inquiryId) => {
      const inquiry = inquiries.find((i) => i.id === inquiryId);
      if (!inquiry) return;

      const newProj = await createProject({
        name: `${inquiry.clientName} — ${inquiry.category} Commission`,
        client: inquiry.clientName,
        category: inquiry.category,
        quote: inquiry.budget || 75000,
        advance: Math.round((inquiry.budget || 75000) * 0.5),
        location: inquiry.location,
        notes: inquiry.message,
      });

      if (newProj) {
        await updateInquiryStatus(inquiryId, "Closed");
        showToast(`Inquiry converted to project commission.`);
        setActiveView("projects");
      }
    },
    [inquiries, createProject, updateInquiryStatus, showToast]
  );

  // Clients CRUD
  const createClient = useCallback(
    async (clientPayload) => {
      try {
        const res = await adminApiFetch("/api/admin/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientPayload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.client) {
            setClients((prev) => [data.client, ...prev]);
            showToast(`Client "${data.client.name}" registered.`);
            return data.client;
          }
        }
      } catch (err) {}
      showToast("Error creating client.", "error");
      return null;
    },
    [showToast]
  );

  const deleteClient = useCallback(
    async (clientId) => {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      try {
        await adminApiFetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
        showToast("Client removed from directory.");
      } catch {
        fetchLiveAdminData();
      }
    },
    [showToast, fetchLiveAdminData]
  );

  // Invoices CRUD
  const addInvoice = useCallback(
    async (invoiceData) => {
      try {
        const res = await adminApiFetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoiceData),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.invoice) {
            setInvoices((prev) => [data.invoice, ...prev]);
            setNewInvoiceModalOpen(false);
            showToast(`Invoice ${data.invoice.id} issued.`);
            return data.invoice;
          }
        }
      } catch (err) {}
      showToast("Error issuing invoice.", "error");
    },
    [showToast]
  );

  const markInvoicePaid = useCallback(
    async (invoiceId) => {
      try {
        const res = await adminApiFetch(`/api/admin/invoices/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Paid" }),
        });
        if (res.ok) {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === invoiceId ? { ...inv, status: "Paid" } : inv
            )
          );
          showToast(`Invoice ${invoiceId} marked as Paid.`);
        }
      } catch (err) {}
    },
    [showToast]
  );

  // CMS Content Operations
  const updateCMSPortfolio = useCallback((updatedPortfolio) => {
    setCmsData((prev) => ({
      ...prev,
      portfolio: updatedPortfolio,
    }));
  }, []);

  const updateCMSServices = useCallback((updatedServices) => {
    setCmsData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  }, []);

  const updateCMSTestimonials = useCallback((updatedTestimonials) => {
    setCmsData((prev) => ({
      ...prev,
      testimonials: updatedTestimonials,
    }));
  }, []);

  const updateCMSHero = useCallback((heroUpdates) => {
    setCmsData((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...heroUpdates },
    }));
  }, []);

  const updateCMSStories = useCallback((updatedStories) => {
    setCmsData((prev) => ({
      ...prev,
      stories: updatedStories,
    }));
  }, []);

  const updateCMSJourneys = useCallback((updatedJourneys) => {
    setCmsData((prev) => ({
      ...prev,
      journeys: updatedJourneys,
    }));
  }, []);

  const updateCMSStudio = useCallback((updatedStudio) => {
    setCmsData((prev) => ({
      ...prev,
      studio: updatedStudio,
    }));
  }, []);

  const updateCMSCategories = useCallback((updatedCategories) => {
    setCmsData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  }, []);

  const updateCMSWebsiteSection = useCallback((sectionUpdates) => {
    setCmsData((prev) => ({
      ...prev,
      websiteSection: { ...prev.websiteSection, ...sectionUpdates },
    }));
  }, []);

  const updateCMSFooter = useCallback((footerUpdates) => {
    setCmsData((prev) => ({
      ...prev,
      footer: { ...prev.footer, ...footerUpdates },
    }));
  }, []);

  const updateCMSPath = useCallback((path, value) => {
    const parts = Array.isArray(path) ? path : String(path).split(".").filter(Boolean);
    if (!parts.length) return;
    setCmsData((previous) => {
      const next = { ...previous };
      let source = previous;
      let target = next;
      parts.forEach((part, index) => {
        const key = Array.isArray(source) ? Number(part) : part;
        if (index === parts.length - 1) {
          target[key] = value;
          return;
        }
        const child = source?.[key];
        const clone = Array.isArray(child) ? [...child] : { ...(child || {}) };
        target[key] = clone;
        source = child || {};
        target = clone;
      });
      return next;
    });
  }, []);

  const saveCMSChanges = useCallback(async () => {
    try {
      const res = await adminApiFetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData),
      });
      if (res.ok) {
        showToast("✓ Live CMS content published to database.", "success");
        return;
      }
    } catch (err) {}
    showToast("Error publishing CMS changes to database.", "error");
  }, [cmsData, showToast]);

  // Team Member Operations
  const addTeamMember = useCallback(
    async (member) => {
      try {
        const res = await adminApiFetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.member) {
            setTeam((prev) => [data.member, ...prev]);
            showToast(`Team member "${data.member.name}" added.`);
          }
        }
      } catch {}
    },
    [showToast]
  );

  // Navigation Filter Helpers
  const filterInquiriesByStatus = useCallback((status) => {
    setInquiryStatusFilter(status);
    setInquiryCategoryFilter("All");
    setActiveView("inquiries");
  }, []);

  const filterInquiriesByCategory = useCallback((category) => {
    setInquiryCategoryFilter(category);
    setInquiryStatusFilter("All");
    setActiveView("inquiries");
  }, []);

  const value = {
    // Live Data
    inquiries,
    projects,
    clients,
    bookings,
    invoices,
    messages,
    team,
    cmsData,
    monthlyRevenueHistory,
    categoryDistribution,
    kpiStats,
    isLoading,
    error,
    refreshData: fetchLiveAdminData,

    // UI state
    activeView,
    setActiveView,
    inquiryStatusFilter,
    setInquiryStatusFilter,
    inquiryCategoryFilter,
    setInquiryCategoryFilter,
    filterInquiriesByStatus,
    filterInquiriesByCategory,
    searchQuery,
    setSearchQuery,
    commandPaletteOpen,
    setCommandPaletteOpen,
    newProjectModalOpen,
    setNewProjectModalOpen,
    newInvoiceModalOpen,
    setNewInvoiceModalOpen,
    logPaymentModalOpen,
    setLogPaymentModalOpen,
    paymentTargetProject,
    setPaymentTargetProject,
    toast,
    showToast,

    // Mutators
    logPayment,
    createProject,
    updateProjectStage,
    deleteProject,
    convertInquiryToProject,
    updateInquiryStatus,
    deleteInquiry,
    createClient,
    deleteClient,
    addInvoice,
    markInvoicePaid,
    updateCMSPortfolio,
    updateCMSServices,
    updateCMSTestimonials,
    updateCMSHero,
    updateCMSStories,
    updateCMSJourneys,
    updateCMSStudio,
    updateCMSCategories,
    updateCMSWebsiteSection,
    updateCMSFooter,
    updateCMSPath,
    saveCMSChanges,
    addTeamMember,
  };

  return (
    <StudioAdminContext.Provider value={value}>
      {children}
    </StudioAdminContext.Provider>
  );
}

export function useStudioAdmin() {
  const context = useContext(StudioAdminContext);
  if (!context) {
    throw new Error("useStudioAdmin must be used within a StudioAdminProvider");
  }
  return context;
}
