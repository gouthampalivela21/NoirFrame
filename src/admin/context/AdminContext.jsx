import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useData, defaultAdministrators } from "../../context/DataContext.jsx";
import { supabase, isSupabaseConfigured, supabaseUrl, checkSupabaseHealth } from "../../lib/supabase.js";

const GOOGLE_SESSION_KEY = "phantom_admin_google_session";
const LEGACY_TOKEN_KEY = "phantom_admin_token";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const data = useData();

  // Read persisted session from localStorage
  const [sessionData, setSessionData] = useState(() => {
    try {
      const stored = localStorage.getItem(GOOGLE_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[AdminAuth] Session read error:", e);
    }
    return null;
  });

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const token = sessionData?.token || null;
  const user = sessionData?.user || null;
  const isAuthenticated = Boolean(token && user && user.status === "Active");

  // Keep user permissions dynamically updated based on assigned role
  const permissions = useMemo(() => {
    const role = user?.role || "Admin";
    return {
      canManageAdmins: role === "Founder",
      canAssignRoles: role === "Founder",
      canManageSettings: role === "Founder",
      canViewAnalytics: role === "Founder" || role === "Co-Founder",
      canManageServices: role === "Founder" || role === "Co-Founder",
      canManageTestimonials: role === "Founder" || role === "Co-Founder",
      canManageClients: true,
      canManageProjects: true,
      canManageInquiries: true,
      canManageBookings: true,
      canManagePortfolio: true,
      canManageMessages: true,
    };
  }, [user?.role]);

  /**
   * Secure Google user evaluation against the Authorised Administrator Allowlist
   */
  const handleGoogleUser = useCallback(
    (googleUser, oauthToken = null) => {
      const email = (googleUser?.email || "").trim().toLowerCase();
      if (!email) {
        setAuthError({
          code: "INVALID_GOOGLE_ACCOUNT",
          title: "Sign In Failed",
          message: "Could not retrieve a verified Google email address. Please try again.",
        });
        return { success: false, error: "Missing Google email." };
      }

      // Check against current administrator allowlist
      const adminList = data.administrators || defaultAdministrators;
      const matchedAdmin = adminList.find(
        (a) => a.email && a.email.toLowerCase() === email
      );

      // 1. Check whether the email belongs to an authorised administrator
      if (!matchedAdmin) {
        console.warn(`[AdminAuth] Rejected unauthorised Google login attempt: ${email}`);
        setAuthError({
          code: "UNAUTHORIZED",
          title: "Access Restricted",
          message: "This Google account is not authorised to access the PHANTOM LABS studio workspace.",
          email,
          attemptedUser: {
            name: googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || email.split("@")[0],
            avatar: googleUser.user_metadata?.avatar_url || googleUser.user_metadata?.picture || null,
            email,
          },
        });
        try {
          localStorage.removeItem(GOOGLE_SESSION_KEY);
          localStorage.removeItem(LEGACY_TOKEN_KEY);
        } catch {}
        setSessionData(null);
        return {
          success: false,
          unauthorized: true,
          error: "This Google account is not authorised to access the PHANTOM LABS studio workspace.",
        };
      }

      // 2. Check whether the account is active
      if (matchedAdmin.status !== "Active") {
        console.warn(`[AdminAuth] Rejected deactivated administrator account: ${email}`);
        setAuthError({
          code: "DEACTIVATED",
          title: "Access Restricted",
          message: "This administrator account has been deactivated. Please contact the studio founder.",
          email,
          attemptedUser: {
            name: matchedAdmin.name,
            avatar: matchedAdmin.avatar,
            email,
            role: matchedAdmin.role,
          },
        });
        try {
          localStorage.removeItem(GOOGLE_SESSION_KEY);
          localStorage.removeItem(LEGACY_TOKEN_KEY);
        } catch {}
        setSessionData(null);
        return {
          success: false,
          deactivated: true,
          error: "This administrator account has been deactivated.",
        };
      }

      // 3. Retrieve real Google profile details & assigned role
      const googleName =
        googleUser.user_metadata?.full_name ||
        googleUser.user_metadata?.name ||
        matchedAdmin.name ||
        email.split("@")[0];

      const googleAvatar =
        googleUser.user_metadata?.avatar_url ||
        googleUser.user_metadata?.picture ||
        matchedAdmin.avatar ||
        "/images/admin-avatar.png";

      const validToken =
        oauthToken || `phantom_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      const userObject = {
        id: matchedAdmin.id || `google_${email.replace(/[^a-z0-9]/g, "_")}`,
        email: matchedAdmin.email,
        name: googleName,
        avatar: googleAvatar,
        role: matchedAdmin.role || "Admin",
        status: matchedAdmin.status || "Active",
        isPrimaryFounder: Boolean(matchedAdmin.isPrimaryFounder),
        dateAdded: matchedAdmin.dateAdded,
      };

      const newSession = {
        token: validToken,
        user: userObject,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(newSession));
        localStorage.setItem(LEGACY_TOKEN_KEY, validToken);
      } catch (e) {
        console.warn("[AdminAuth] LocalStorage save error:", e);
      }

      setAuthError(null);
      setSessionData(newSession);

      // Optionally update admin name and avatar in CMS allowlist if changed
      if (
        (googleName && googleName !== matchedAdmin.name) ||
        (googleAvatar && googleAvatar !== matchedAdmin.avatar)
      ) {
        try {
          data.updateAdministrator(matchedAdmin.id, {
            name: googleName,
            avatar: googleAvatar,
          });
        } catch {}
      }

      return { success: true, user: userObject };
    },
    [data]
  );

  /**
   * Listen for Supabase OAuth redirect & session restoration
   */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check active Supabase OAuth session on boot
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleGoogleUser(session.user, session.access_token);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          handleGoogleUser(session.user, session.access_token);
        } else if (event === "SIGNED_OUT") {
          try {
            localStorage.removeItem(GOOGLE_SESSION_KEY);
            localStorage.removeItem(LEGACY_TOKEN_KEY);
          } catch {}
          setSessionData(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [handleGoogleUser]);

  /**
   * Google Sign-In Trigger
   * Immediately launches official Google OAuth with prompt: 'select_account'
   */
  const loginWithGoogle = useCallback(async () => {
    setIsAuthLoading(true);
    setAuthError(null);

    // Real Supabase Google OAuth Provider
    if (isSupabaseConfigured && supabase) {
      // Pre-flight check: verify that the Supabase host exists in DNS and responds
      const health = await checkSupabaseHealth(3000);
      if (!health.ok) {
        console.warn("[AdminAuth] Supabase endpoint unreachable:", health);
        setIsAuthLoading(false);
        const hostname = health.hostname || (supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, "").split("/")[0] : "supabase.co");
        setAuthError({
          code: "SUPABASE_SERVER_UNREACHABLE",
          title: "Authentication Server Not Found",
          message: `Could not reach the Supabase authentication server (${hostname}). The project may be paused, inactive, or the Project URL in .env is outdated.`,
          hostname,
        });
        return {
          success: false,
          error: `Server not found: ${hostname}`,
        };
      }

      try {
        const redirectUrl =
          typeof window !== "undefined" && window.location?.origin
            ? `${window.location.origin}/admin/login`
            : `${import.meta.env.VITE_SITE_URL || "https://phantomlabs.in"}/admin/login`;

        const { data: authResult, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: "offline",
              prompt: "select_account",
            },
          },
        });

        if (error) {
          throw error;
        }

        return { success: true, redirected: true, data: authResult };
      } catch (err) {
        console.warn("[AdminAuth] Supabase Google OAuth exception:", err.message);
        setIsAuthLoading(false);
        setAuthError({
          code: "OAUTH_EXCEPTION",
          title: "OAuth Connection Error",
          message: err.message,
        });
        return {
          success: false,
          error: err.message,
        };
      }
    }

    setIsAuthLoading(false);
    setAuthError({
      code: "SUPABASE_NOT_CONFIGURED",
      title: "Configuration Required",
      message: "Supabase client is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.",
    });
    return {
      success: false,
      error: "Supabase client not initialized.",
    };
  }, []);

  /**
   * Sign Out
   */
  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("[AdminAuth] Supabase signOut error:", e);
    }

    try {
      localStorage.removeItem(GOOGLE_SESSION_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch (e) {
      console.warn("[AdminAuth] LocalStorage cleanup error:", e);
    }

    setSessionData(null);
    setAuthError(null);
  }, []);

  // Dynamically computed statistics from genuine database records
  const stats = useMemo(() => {
    const inquiries = data.inquiries || [];
    const clients = data.clients || [];
    const projects = data.projects || [];
    const bookings = data.bookings || [];

    const totalInquiries = inquiries.length;
    const activeClients = clients.filter((c) => c.status === "Active" || !c.status).length;
    const ongoingProjects = projects.filter((p) => p.status !== "Completed" && p.stage !== "Completed").length;
    const upcomingShoots = bookings.filter((b) => b.status === "Confirmed").length;
    const completedProjects = projects.filter((p) => p.status === "Completed" || p.stage === "Completed").length;

    const totalRevNum = projects.reduce((acc, p) => {
      const num = typeof p.budget === "number"
        ? p.budget
        : parseInt(String(p.budget || "").replace(/[^0-9]/g, ""), 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    const monthlyRevenue = totalRevNum > 0
      ? totalRevNum >= 100000
        ? `₹${(totalRevNum / 100000).toFixed(1)}L`
        : `₹${totalRevNum.toLocaleString("en-IN")}`
      : "₹0";

    return {
      totalInquiries,
      inquiriesTrend: totalInquiries > 0 ? `${totalInquiries} received` : "—",
      activeClients,
      clientsTrend: activeClients > 0 ? `${activeClients} active` : "—",
      ongoingProjects,
      projectsTrend: ongoingProjects > 0 ? `${ongoingProjects} in progress` : "—",
      upcomingShoots,
      shootsTrend: upcomingShoots > 0 ? `${upcomingShoots} scheduled` : "—",
      completedProjects,
      completedTrend: completedProjects > 0 ? `${completedProjects} completed` : "—",
      monthlyRevenue,
      revenueTrend: totalRevNum > 0 ? "Commissions total" : "—",
      details: {
        totalInquiries: { value: totalInquiries, label: "TOTAL INQUIRIES", change: totalInquiries > 0 ? `${totalInquiries} total` : "—" },
        activeClients: { value: activeClients, label: "ACTIVE CLIENTS", change: activeClients > 0 ? `${activeClients} active` : "—" },
        ongoingProjects: { value: ongoingProjects, label: "ONGOING PROJECTS", change: ongoingProjects > 0 ? `${ongoingProjects} active` : "—" },
        upcomingShoots: { value: upcomingShoots, label: "UPCOMING SHOOTS", change: upcomingShoots > 0 ? `${upcomingShoots} scheduled` : "—" },
        completedProjects: { value: completedProjects, label: "COMPLETED PROJECTS", change: completedProjects > 0 ? `${completedProjects} finished` : "—" },
        monthlyRevenue: { value: monthlyRevenue, label: "MONTHLY REVENUE", change: totalRevNum > 0 ? "Commissions" : "—" },
      },
    };
  }, [data.inquiries, data.clients, data.projects, data.bookings]);

  const adminSettings = data.adminSettings || {};

  const value = useMemo(
    () => ({
      isAuthenticated,
      isAuthLoading,
      authError,
      setAuthError,
      token,
      loginWithGoogle,
      logout,
      user,
      permissions,
      stats,

      // Live connected database collections
      inquiries: data.inquiries || [],
      clients: data.clients || [],
      projects: data.projects || [],
      bookings: data.bookings || [],
      activities: data.activities || [],
      services: data.services || [],
      portfolioItems: data.portfolioItems || [],
      testimonials: data.testimonials || [],
      messages: data.messages || [],
      administrators: data.administrators || defaultAdministrators,
      settings: adminSettings,

      // Two-way synchronization actions
      addInquiry: data.addInquiry,
      updateInquiry: data.updateInquiry,
      deleteInquiry: data.deleteInquiry,
      convertInquiryToClient: data.convertInquiryToClient,

      addClient: data.addClient,
      updateClient: data.updateClient,
      deleteClient: data.deleteClient,

      addProject: data.addProject,
      updateProject: data.updateProject,
      deleteProject: data.deleteProject,

      addBooking: data.addBooking,
      updateBooking: data.updateBooking,
      cancelBooking: data.cancelBooking,
      deleteBooking: data.deleteBooking,

      addService: data.addServiceItem,
      updateService: data.updateServiceItem,
      deleteService: data.deleteServiceItem,

      addPortfolioItem: data.addPortfolioItem,
      updatePortfolioItem: data.updatePortfolioItem,
      deletePortfolioItem: data.deletePortfolioItem,

      addTestimonial: data.addTestimonial,
      updateTestimonial: data.updateTestimonial,
      deleteTestimonial: data.deleteTestimonial,

      markMessageRead: data.markMessageRead,
      deleteMessage: data.deleteMessage,

      // Administrator Allowlist Management (Founder Only)
      addAdministrator: data.addAdministrator,
      updateAdministrator: data.updateAdministrator,
      toggleAdministratorStatus: data.toggleAdministratorStatus,
      deleteAdministrator: data.deleteAdministrator,

      updateSettings: data.updateAdminSettings,
      store: {
        inquiries: data.inquiries,
        clients: data.clients,
        projects: data.projects,
        bookings: data.bookings,
        activities: data.activities,
        services: data.services,
        portfolioItems: data.portfolioItems,
        testimonials: data.testimonials,
        messages: data.messages,
        administrators: data.administrators,
        settings: adminSettings,
      },
    }),
    [
      isAuthenticated,
      isAuthLoading,
      authError,
      token,
      loginWithGoogle,
      logout,
      user,
      permissions,
      stats,
      data.inquiries,
      data.clients,
      data.projects,
      data.bookings,
      data.activities,
      data.services,
      data.portfolioItems,
      data.testimonials,
      data.messages,
      data.administrators,
      adminSettings,
      data.addInquiry,
      data.updateInquiry,
      data.deleteInquiry,
      data.convertInquiryToClient,
      data.addClient,
      data.updateClient,
      data.deleteClient,
      data.addProject,
      data.updateProject,
      data.deleteProject,
      data.addBooking,
      data.updateBooking,
      data.cancelBooking,
      data.deleteBooking,
      data.addServiceItem,
      data.updateServiceItem,
      data.deleteServiceItem,
      data.addPortfolioItem,
      data.updatePortfolioItem,
      data.deletePortfolioItem,
      data.addTestimonial,
      data.updateTestimonial,
      data.deleteTestimonial,
      data.markMessageRead,
      data.deleteMessage,
      data.addAdministrator,
      data.updateAdministrator,
      data.toggleAdministratorStatus,
      data.deleteAdministrator,
      data.updateAdminSettings,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return ctx;
}
