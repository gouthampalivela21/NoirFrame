import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useData } from "../../context/DataContext.jsx";
import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";

const SESSION_STORAGE_KEY = "phantom_admin_session_v2";
const LEGACY_GOOGLE_SESSION_KEY = "phantom_admin_google_session";
const LEGACY_TOKEN_KEY = "phantom_admin_token";

const AdminContext = createContext(null);

function readStoredSession() {
  try {
    const stored =
      localStorage.getItem(SESSION_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_GOOGLE_SESSION_KEY);
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
}

function persistSession(session) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
    localStorage.removeItem(LEGACY_GOOGLE_SESSION_KEY);
  } catch (e) {
    console.warn("[AdminAuth] LocalStorage save error:", e);
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LEGACY_GOOGLE_SESSION_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {}
}

export function AdminProvider({ children }) {
  const data = useData();

  const [sessionData, setSessionData] = useState(() => readStoredSession());
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // First-Run Founder Setup Status
  const [setupStatus, setSetupStatus] = useState({
    loaded: false,
    founderConfigured: true,
    setupKeyConfigured: true,
    founderEmailPinned: false,
  });

  // Persistent Backend Bookings State (Server-Enforced)
  const [backendBookings, setBackendBookings] = useState([]);
  const [bookingsSummary, setBookingsSummary] = useState({
    total: 0,
    unread: 0,
    byStatus: { New: 0, "In progress": 0, Responded: 0, Closed: 0 },
    byCategory: {
      Portraits: 0,
      Couples: 0,
      Events: 0,
      Brands: 0,
      Commercial: 0,
      Editorial: 0,
    },
  });
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  // Persistent Backend Team Management State (Founder Only)
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamSummary, setTeamSummary] = useState({
    total: 0,
    active: 0,
    invited: 0,
    revoked: 0,
    byRole: { Founder: 0, Admin: 0, Viewer: 0 },
  });
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState(null);

  const token = sessionData?.token || null;
  const user = sessionData?.user || null;
  const isAuthenticated = Boolean(token && user && user.status === "Active");

  // Role-based UI capability flags (always mirrored and enforced on the backend)
  const permissions = useMemo(() => {
    const role = user?.role || "Viewer";
    const isFounder = role === "Founder";
    const isAdmin = role === "Admin";
    const isViewer = role === "Viewer";
    const canWrite = isFounder || isAdmin;

    return {
      role,
      isFounder,
      isAdmin,
      isViewer,
      canManageTeam: isFounder,
      canManageAdmins: isFounder,
      canAssignRoles: isFounder,
      canManageSettings: isFounder,
      canViewAnalytics: isFounder || isAdmin,
      canManageServices: isFounder,
      canManageTestimonials: canWrite,
      canManageClients: canWrite,
      canManageProjects: canWrite,
      canManageInquiries: canWrite,
      canEditInquiries: canWrite,
      canManageBookings: canWrite,
      canManagePortfolio: canWrite,
      canManageMessages: canWrite,
    };
  }, [user?.role]);

  // -------------------------------------------------------------------------
  // 1. Setup Status & Session Helpers
  // -------------------------------------------------------------------------
  const refreshSetupStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/setup-status", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setSetupStatus({
          loaded: true,
          founderConfigured: Boolean(json.founderConfigured),
          setupKeyConfigured: Boolean(json.setupKeyConfigured),
          founderEmailPinned: Boolean(json.founderEmailPinned),
        });
        return json;
      }
    } catch (err) {
      console.warn("[AdminAuth] Setup status check error:", err);
    }
    setSetupStatus((prev) => ({ ...prev, loaded: true }));
    return null;
  }, []);

  useEffect(() => {
    refreshSetupStatus();
  }, [refreshSetupStatus]);

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("[AdminAuth] Supabase signOut error:", e);
    }

    clearStoredSession();
    setSessionData(null);
    setAuthError(null);
    setBackendBookings([]);
    setTeamMembers([]);
  }, []);

  // -------------------------------------------------------------------------
  // 2. First-Run Founder Initialization
  // -------------------------------------------------------------------------
  const setupFounder = useCallback(async ({ setupKey, name, email, password }) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/setup-founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupKey, name, email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.message || json.error || "Could not create Founder account.",
        };
      }

      const newSession = {
        token: json.token,
        user: json.user,
        timestamp: Date.now(),
      };
      persistSession(newSession);
      setSessionData(newSession);
      setSetupStatus({
        loaded: true,
        founderConfigured: true,
        setupKeyConfigured: true,
        founderEmailPinned: false,
      });
      return { success: true, user: json.user };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error during Founder setup.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // 3. Email & Password Authentication (Founder, Admin, Viewer)
  // -------------------------------------------------------------------------
  const loginWithCredentials = useCallback(async (email, password) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.needsSetup) {
          setSetupStatus((prev) => ({ ...prev, loaded: true, founderConfigured: false }));
        }
        return {
          success: false,
          error: json.message || json.error || "Invalid email or password.",
        };
      }

      const newSession = {
        token: json.token,
        user: json.user,
        timestamp: Date.now(),
      };
      persistSession(newSession);
      setSessionData(newSession);
      setAuthError(null);
      return { success: true, user: json.user };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Could not reach authentication server.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // 4. Invitation Acceptance
  // -------------------------------------------------------------------------
  const acceptInvite = useCallback(async ({ inviteToken, name, password }) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken, name, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || json.message || "Could not accept invitation.",
        };
      }

      const newSession = {
        token: json.token,
        user: json.user,
        timestamp: Date.now(),
      };
      persistSession(newSession);
      setSessionData(newSession);
      return { success: true, user: json.user };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error accepting invitation.",
      };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // 5. Google OAuth (Server-Verified Against team.json)
  // -------------------------------------------------------------------------
  const handleGoogleUser = useCallback(async (googleUser) => {
    const email = (googleUser?.email || "").trim().toLowerCase();
    if (!email) {
      setAuthError({
        code: "INVALID_GOOGLE_ACCOUNT",
        title: "Sign In Failed",
        message: "Could not retrieve a verified Google email address.",
      });
      return { success: false, error: "Missing Google email." };
    }

    const googleName =
      googleUser.user_metadata?.full_name ||
      googleUser.user_metadata?.name ||
      email.split("@")[0];
    const googleAvatar =
      googleUser.user_metadata?.avatar_url ||
      googleUser.user_metadata?.picture ||
      "/images/admin-avatar.png";

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleEmail: email,
          googleName,
          googleAvatar,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        clearStoredSession();
        setSessionData(null);
        setAuthError({
          code: "UNAUTHORIZED",
          title: json.error || "Access Restricted",
          message:
            json.message ||
            "This Google account is not authorised to access the PHANTOM LABS studio workspace.",
          email,
          attemptedUser: { name: googleName, avatar: googleAvatar, email },
        });
        return { success: false, error: json.message || "Unauthorized" };
      }

      const newSession = {
        token: json.token,
        user: json.user,
        timestamp: Date.now(),
      };
      persistSession(newSession);
      setAuthError(null);
      setSessionData(newSession);
      return { success: true, user: json.user };
    } catch (err) {
      setAuthError({
        code: "NETWORK_ERROR",
        title: "Verification Error",
        message: err.message || "Could not verify Google account with studio server.",
      });
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data: sData }) => {
        if (!isMounted) return;
        if (sData?.session?.user) {
          handleGoogleUser(sData.session.user);
        }
      })
      .catch(() => {});

    let subscription = null;
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) return;
        if (event === "SIGNED_IN" && session?.user) {
          handleGoogleUser(session.user);
        } else if (event === "SIGNED_OUT") {
          clearStoredSession();
          setSessionData(null);
        }
      });
      subscription = authListener?.subscription;
    } catch {}

    return () => {
      isMounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch {}
    };
  }, [handleGoogleUser]);

  const loginWithGoogle = useCallback(async () => {
    setIsAuthLoading(true);
    setAuthError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authResult, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/admin/login`,
            queryParams: { prompt: "select_account" },
          },
        });
        if (error) throw error;
        return { success: true, redirected: true, data: authResult };
      } catch (err) {
        setIsAuthLoading(false);
        setAuthError({
          code: "OAUTH_EXCEPTION",
          title: "OAuth Connection Error",
          message: err.message,
        });
        return { success: false, error: err.message };
      }
    }

    setIsAuthLoading(false);
    setAuthError({
      code: "SUPABASE_NOT_CONFIGURED",
      title: "Google OAuth Unavailable",
      message: "Sign in with your studio email and password instead.",
    });
    return { success: false, error: "Supabase OAuth not configured." };
  }, []);

  // -------------------------------------------------------------------------
  // 6. Server-Side Live Session & Role Preflight Check
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    let isCancelled = false;

    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (isCancelled) return;
        if (!json.valid || !json.user) {
          logout();
          return;
        }
        // Sync live role & status updates from server
        setSessionData((prev) => {
          if (!prev) return prev;
          const prevStr = JSON.stringify(prev.user);
          const nextStr = JSON.stringify(json.user);
          if (prevStr === nextStr) return prev;
          const updated = { ...prev, user: json.user };
          persistSession(updated);
          return updated;
        });
      })
      .catch((err) => {
        console.warn("[AdminAuth] Session preflight warning:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [token, logout]);

  // -------------------------------------------------------------------------
  // 7. Persistent Backend Bookings Operations (RBAC Enforced on Server)
  // -------------------------------------------------------------------------
  const fetchBookings = useCallback(
    async (options = {}) => {
      if (!token) return;
      setIsBookingsLoading(true);
      setBookingsError(null);
      try {
        const params = new URLSearchParams();
        if (options.search) params.set("search", options.search);
        if (options.status && options.status !== "All") params.set("status", options.status);
        if (options.category && options.category !== "All") params.set("category", options.category);
        if (options.sort) params.set("sort", options.sort);

        const res = await fetch(`/api/bookings?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          logout();
          return;
        }

        const json = await res.json();
        if (res.ok && json.success) {
          setBackendBookings(json.bookings || []);
          if (json.summary) {
            setBookingsSummary(json.summary);
          }
        } else {
          setBookingsError(json.message || json.error || "Failed to load booking requests.");
        }
      } catch (err) {
        setBookingsError(err.message || "Network error loading bookings.");
      } finally {
        setIsBookingsLoading(false);
      }
    },
    [token, logout]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, fetchBookings]);

  const updateBookingStatus = useCallback(
    async (id, status) => {
      if (!token) return { success: false, error: "Not authenticated" };
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });
        if (res.status === 401) {
          logout();
          return { success: false, error: "Session expired" };
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setBackendBookings((prev) =>
            prev.map((b) => (b.id === id ? json.booking : b))
          );
          if (json.summary) setBookingsSummary(json.summary);
          return { success: true, booking: json.booking };
        }
        const errMsg = json.message || json.error || "Could not update status.";
        setBookingsError(errMsg);
        return { success: false, error: errMsg };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, logout]
  );

  const toggleBookingRead = useCallback(
    async (id, isRead) => {
      if (!token) return { success: false };
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isRead }),
        });
        if (res.status === 401) {
          logout();
          return { success: false };
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setBackendBookings((prev) =>
            prev.map((b) => (b.id === id ? json.booking : b))
          );
          if (json.summary) setBookingsSummary(json.summary);
          return { success: true, booking: json.booking };
        }
        return { success: false, error: json.message || json.error };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, logout]
  );

  const addBookingNote = useCallback(
    async (id, noteText) => {
      if (!token || !noteText?.trim()) return null;
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ noteText: noteText.trim() }),
        });
        if (res.status === 401) {
          logout();
          return null;
        }
        const json = await res.json();
        if (res.ok && json.success && json.booking) {
          setBackendBookings((prev) =>
            prev.map((b) => (b.id === id ? json.booking : b))
          );
          return json.booking;
        }
        setBookingsError(json.message || json.error || "Could not add note.");
        return null;
      } catch (err) {
        setBookingsError(err.message);
        return null;
      }
    },
    [token, logout]
  );

  const removeBooking = useCallback(
    async (id) => {
      if (!token) return false;
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          logout();
          return false;
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setBackendBookings((prev) => prev.filter((b) => b.id !== id));
          if (json.summary) setBookingsSummary(json.summary);
          return true;
        }
        setBookingsError(json.message || json.error || "Could not delete booking request.");
        return false;
      } catch (err) {
        setBookingsError(err.message);
        return false;
      }
    },
    [token, logout]
  );

  // -------------------------------------------------------------------------
  // 8. Team Management API (FOUNDER ONLY — Server Enforced)
  // -------------------------------------------------------------------------
  const fetchTeam = useCallback(async () => {
    if (!token || user?.role !== "Founder") return;
    setIsTeamLoading(true);
    setTeamError(null);
    try {
      const res = await fetch("/api/team", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const json = await res.json();
      if (res.ok && json.success) {
        setTeamMembers(json.members || []);
        if (json.summary) setTeamSummary(json.summary);
      } else {
        setTeamError(json.message || json.error || "Failed to load team members.");
      }
    } catch (err) {
      setTeamError(err.message || "Network error loading team.");
    } finally {
      setIsTeamLoading(false);
    }
  }, [token, user?.role, logout]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Founder") {
      fetchTeam();
    } else {
      setTeamMembers([]);
    }
  }, [isAuthenticated, user?.role, fetchTeam]);

  const inviteTeamMember = useCallback(
    async ({ email, name, role }) => {
      if (!token) return { success: false, error: "Not authenticated" };
      try {
        const res = await fetch("/api/team/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, name, role }),
        });
        if (res.status === 401) {
          logout();
          return { success: false, error: "Session expired" };
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setTeamMembers((prev) => [...prev, json.member]);
          if (json.summary) setTeamSummary(json.summary);
          return {
            success: true,
            member: json.member,
            invitePath: json.invitePath,
            inviteToken: json.inviteToken,
            expiresAt: json.expiresAt,
            message: json.message,
          };
        }
        return { success: false, error: json.message || json.error || "Invite failed." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, logout]
  );

  const updateTeamMember = useCallback(
    async (memberId, patch) => {
      if (!token) return { success: false, error: "Not authenticated" };
      try {
        const res = await fetch(`/api/team/${memberId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patch),
        });
        if (res.status === 401) {
          logout();
          return { success: false, error: "Session expired" };
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === memberId ? json.member : m))
          );
          if (json.summary) setTeamSummary(json.summary);
          return { success: true, member: json.member, message: json.message };
        }
        return { success: false, error: json.message || json.error || "Update failed." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, logout]
  );

  const resendTeamInvite = useCallback(
    async (memberId) => {
      if (!token) return { success: false, error: "Not authenticated" };
      try {
        const res = await fetch(`/api/team/${memberId}/resend`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          logout();
          return { success: false, error: "Session expired" };
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === memberId ? json.member : m))
          );
          if (json.summary) setTeamSummary(json.summary);
          return {
            success: true,
            member: json.member,
            invitePath: json.invitePath,
            inviteToken: json.inviteToken,
            expiresAt: json.expiresAt,
            message: json.message,
          };
        }
        return { success: false, error: json.message || json.error || "Resend failed." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, logout]
  );

  const removeTeamMember = useCallback(
    async (memberId) => {
      if (!token) return { success: false, error: "Not authenticated" };
      try {
        const res = await fetch(`/api/team/${memberId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          logout();
          return { success: false, error: "Session expired" };
        }
        const json = await res.json();
        if (res.ok && json.success) {
          setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
          if (json.summary) setTeamSummary(json.summary);
          return { success: true, message: json.message };
        }
        return { success: false, error: json.message || json.error || "Removal failed." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, logout]
  );

  // Dynamically computed statistics from genuine database records
  const stats = useMemo(() => {
    const activeClients = (data.clients || []).filter(
      (c) => c.status === "Active" || !c.status
    ).length;
    const ongoingProjects = (data.projects || []).filter(
      (p) => p.status !== "Completed" && p.stage !== "Completed"
    ).length;
    const upcomingShoots = (data.bookings || []).filter(
      (b) => b.status === "Confirmed"
    ).length;
    const completedProjects = (data.projects || []).filter(
      (p) => p.status === "Completed" || p.stage === "Completed"
    ).length;

    const totalInquiries = bookingsSummary.total || backendBookings.length;
    const unreadInquiries =
      bookingsSummary.unread ||
      backendBookings.filter((b) => b.isRead === false).length;

    const totalRevNum = (data.projects || []).reduce((acc, p) => {
      const num =
        typeof p.budget === "number"
          ? p.budget
          : parseInt(String(p.budget || "").replace(/[^0-9]/g, ""), 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    const monthlyRevenue =
      totalRevNum > 0
        ? totalRevNum >= 100000
          ? `₹${(totalRevNum / 100000).toFixed(1)}L`
          : `₹${totalRevNum.toLocaleString("en-IN")}`
        : "₹0";

    return {
      totalInquiries,
      unreadInquiries,
      inquiriesTrend:
        unreadInquiries > 0
          ? `${unreadInquiries} unread`
          : totalInquiries > 0
          ? `${totalInquiries} total`
          : "—",
      activeClients,
      clientsTrend: activeClients > 0 ? `${activeClients} active` : "—",
      ongoingProjects,
      projectsTrend: ongoingProjects > 0 ? `${ongoingProjects} in progress` : "—",
      upcomingShoots,
      shootsTrend: upcomingShoots > 0 ? `${upcomingShoots} scheduled` : "—",
      completedProjects,
      completedTrend:
        completedProjects > 0 ? `${completedProjects} completed` : "—",
      monthlyRevenue,
      revenueTrend: totalRevNum > 0 ? "Commissions total" : "—",
      details: {
        totalInquiries: {
          value: totalInquiries,
          label: "TOTAL REQUESTS",
          change:
            unreadInquiries > 0
              ? `${unreadInquiries} unread`
              : `${totalInquiries} logged`,
        },
        activeClients: {
          value: activeClients,
          label: "ACTIVE CLIENTS",
          change: activeClients > 0 ? `${activeClients} active` : "—",
        },
        ongoingProjects: {
          value: ongoingProjects,
          label: "ONGOING PROJECTS",
          change: ongoingProjects > 0 ? `${ongoingProjects} active` : "—",
        },
        upcomingShoots: {
          value: upcomingShoots,
          label: "UPCOMING SHOOTS",
          change: upcomingShoots > 0 ? `${upcomingShoots} scheduled` : "—",
        },
        completedProjects: {
          value: completedProjects,
          label: "COMPLETED PROJECTS",
          change: completedProjects > 0 ? `${completedProjects} finished` : "—",
        },
        monthlyRevenue: {
          value: monthlyRevenue,
          label: "MONTHLY REVENUE",
          change: totalRevNum > 0 ? "Commissions" : "—",
        },
      },
    };
  }, [
    backendBookings,
    bookingsSummary,
    data.clients,
    data.projects,
    data.bookings,
  ]);

  const adminSettings = data.adminSettings || {};

  const value = useMemo(
    () => ({
      isAuthenticated,
      isAuthLoading,
      authError,
      setAuthError,
      setupStatus,
      refreshSetupStatus,
      token,
      setupFounder,
      loginWithCredentials,
      acceptInvite,
      loginWithGoogle,
      logout,
      user,
      permissions,
      stats,

      // Persistent Server-Backed Booking Requests
      backendBookings,
      bookingsSummary,
      isBookingsLoading,
      bookingsError,
      setBookingsError,
      fetchBookings,
      updateBookingStatus,
      toggleBookingRead,
      addBookingNote,
      removeBooking,

      // Persistent Server-Backed Team Management (Founder Only)
      teamMembers,
      teamSummary,
      isTeamLoading,
      teamError,
      fetchTeam,
      inviteTeamMember,
      updateTeamMember,
      resendTeamInvite,
      removeTeamMember,

      // Live connected database collections
      inquiries: backendBookings,
      clients: data.clients || [],
      projects: data.projects || [],
      bookings: data.bookings || [],
      activities: data.activities || [],
      services: data.services || [],
      portfolioItems: data.portfolioItems || [],
      testimonials: data.testimonials || [],
      messages: data.messages || [],
      administrators: teamMembers,
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

      updateSettings: data.updateAdminSettings,
      store: {
        inquiries: backendBookings,
        teamMembers,
        clients: data.clients,
        projects: data.projects,
        bookings: data.bookings,
        activities: data.activities,
        services: data.services,
        portfolioItems: data.portfolioItems,
        testimonials: data.testimonials,
        messages: data.messages,
        settings: adminSettings,
      },
    }),
    [
      isAuthenticated,
      isAuthLoading,
      authError,
      setupStatus,
      refreshSetupStatus,
      token,
      setupFounder,
      loginWithCredentials,
      acceptInvite,
      loginWithGoogle,
      logout,
      user,
      permissions,
      stats,
      backendBookings,
      bookingsSummary,
      isBookingsLoading,
      bookingsError,
      fetchBookings,
      updateBookingStatus,
      toggleBookingRead,
      addBookingNote,
      removeBooking,
      teamMembers,
      teamSummary,
      isTeamLoading,
      teamError,
      fetchTeam,
      inviteTeamMember,
      updateTeamMember,
      resendTeamInvite,
      removeTeamMember,
      data.clients,
      data.projects,
      data.bookings,
      data.activities,
      data.services,
      data.portfolioItems,
      data.testimonials,
      data.messages,
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
