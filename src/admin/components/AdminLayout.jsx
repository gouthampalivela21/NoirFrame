import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";
import {
  IconOverview,
  IconInquiries,
  IconClients,
  IconProjects,
  IconBookings,
  IconPortfolio,
  IconServices,
  IconTestimonials,
  IconMessages,
  IconAnalytics,
  IconSettings,
  IconTeam,
  IconSearch,
  IconBell,
  IconMenu,
  IconClose,
  IconChevronDown,
} from "./AdminIcons.jsx";
import CommandPaletteModal from "./Modals/CommandPaletteModal.jsx";
import NewProjectModal from "./Modals/NewProjectModal.jsx";
import AdminErrorBoundary from "./AdminErrorBoundary.jsx";
import AdminContentSkeleton from "./AdminContentSkeleton.jsx";

// Route preload registry for instantaneous 0ms transitions
const routePreloaders = {
  "/admin": () => import("../pages/AdminDashboardPage.jsx"),
  "/admin/inquiries": () => import("../pages/AdminInquiriesPage.jsx"),
  "/admin/clients": () => import("../pages/AdminClientsPage.jsx"),
  "/admin/projects": () => import("../pages/AdminProjectsPage.jsx"),
  "/admin/bookings": () => import("../pages/AdminBookingsPage.jsx"),
  "/admin/portfolio": () => import("../pages/AdminPortfolioPage.jsx"),
  "/admin/services": () => import("../pages/AdminServicesPage.jsx"),
  "/admin/testimonials": () => import("../pages/AdminTestimonialsPage.jsx"),
  "/admin/messages": () => import("../pages/AdminMessagesPage.jsx"),
  "/admin/analytics": () => import("../pages/AdminAnalyticsPage.jsx"),
  "/admin/team": () => import("../pages/AdminTeamPage.jsx"),
  "/admin/settings": () => import("../pages/AdminSettingsPage.jsx"),
};

const preloadRoute = (path) => {
  if (routePreloaders[path]) {
    try {
      routePreloaders[path]();
    } catch (e) {}
  }
};

export default function AdminLayout() {
  const { user, inquiries, bookingsSummary, messages, activities, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Background idle prefetching: load all admin modules in background so tab switches are instant
  useEffect(() => {
    const prefetchAll = () => {
      Object.values(routePreloaders).forEach((loader) => {
        try {
          loader();
        } catch (e) {}
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(prefetchAll, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(prefetchAll, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
    setIsNotifyOpen(false);
  }, [location.pathname]);

  // Global keyboard shortcut: ⌘K or Ctrl+K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for custom event to trigger New Project modal from Hero or any child
  useEffect(() => {
    const handleOpenProject = () => setIsNewProjectOpen(true);
    window.addEventListener("admin:new-project", handleOpenProject);
    return () => window.removeEventListener("admin:new-project", handleOpenProject);
  }, []);

  // Memoized dynamic badge counts
  const inquiryCount = useMemo(() => {
    if (bookingsSummary && typeof bookingsSummary.unread === "number" && bookingsSummary.unread > 0) {
      return bookingsSummary.unread;
    }
    const unread = (inquiries || []).filter(
      (i) => i.isRead === false || (i.status || "").toLowerCase() === "new"
    );
    if (unread.length > 0) return unread.length;
    return undefined;
  }, [bookingsSummary, inquiries]);

  const unreadMessagesCount = useMemo(() => {
    return (messages || []).filter((m) => m.unread).length || undefined;
  }, [messages]);

  const notificationItems = useMemo(() => {
    return (activities || []).slice(0, 5);
  }, [activities]);

  // Navigation Links with Role-Based Access Control (Founder / Admin / Viewer)
  const visibleNavLinks = useMemo(() => {
    const navLinks = [
      { label: "Overview", to: "/admin", icon: IconOverview, end: true },
      { label: "Inquiries", to: "/admin/inquiries", icon: IconInquiries, badge: inquiryCount },
      { label: "Clients", to: "/admin/clients", icon: IconClients },
      { label: "Projects", to: "/admin/projects", icon: IconProjects },
      { label: "Bookings", to: "/admin/bookings", icon: IconBookings },
      { label: "Portfolio", to: "/admin/portfolio", icon: IconPortfolio },
      { label: "Services", to: "/admin/services", icon: IconServices, requiredRole: "Founder" },
      { label: "Testimonials", to: "/admin/testimonials", icon: IconTestimonials, requiredRole: "Admin" },
      { label: "Messages", to: "/admin/messages", icon: IconMessages, badge: unreadMessagesCount },
      { label: "Analytics", to: "/admin/analytics", icon: IconAnalytics, requiredRole: "Admin" },
      { label: "Team", to: "/admin/team", icon: IconTeam, requiredRole: "Founder" },
      { label: "Settings", to: "/admin/settings", icon: IconSettings, requiredRole: "Founder" },
    ];

    return navLinks.filter((item) => {
      if (!item.requiredRole) return true;
      if (user?.role === "Founder") return true;
      if (user?.role === "Admin") return item.requiredRole === "Admin";
      return false;
    });
  }, [inquiryCount, unreadMessagesCount, user?.role]);

  return (
    <div className="admin-shell">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            zIndex: 95,
          }}
        />
      )}

      {/* 280px Fixed Deep-Black Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__top">
          {/* Official PHANTOM LABS Logo */}
          <div className="admin-sidebar__logo-wrap">
            <Link to="/admin" style={{ display: "inline-block" }}>
              <img
                src="/images/phantom-labs-logo-white.png"
                alt="Phantom Labs"
                className="admin-sidebar__logo-img"
                width={170}
                height={22}
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="admin-sidebar__nav">
            {visibleNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onMouseEnter={() => preloadRoute(item.to)}
                  className={({ isActive }) =>
                    `admin-sidebar__link ${isActive ? "is-active" : ""}`
                  }
                >
                  <div className="admin-sidebar__link-left">
                    <span className="admin-sidebar__icon">
                      <Icon size={17} />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="admin-sidebar__badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Administrator Profile */}
        <div className="admin-sidebar__footer">
          {isProfileOpen && (
            <div className="admin-profile-menu" style={{ padding: "12px", minWidth: "230px" }}>
              {/* Authenticated Profile Dossier */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "4px 4px 12px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  marginBottom: "6px",
                }}
              >
                <img
                  src={user?.avatar || "/images/admin-avatar.png"}
                  alt={user?.name || "Admin"}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#222",
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/admin-avatar.png";
                  }}
                />
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      lineHeight: "1.2",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.name || "Studio Administrator"}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--admin-sidebar-text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginTop: "2px",
                    }}
                  >
                    {user?.email}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span
                      style={{
                        fontSize: "9.5px",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        background:
                          user?.role === "Founder"
                            ? "rgba(197, 164, 126, 0.28)"
                            : user?.role === "Admin"
                            ? "rgba(100, 160, 255, 0.25)"
                            : "rgba(180, 180, 180, 0.18)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {user?.role || "Viewer"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Founder Access to Team & Studio Settings */}
              {user?.role === "Founder" && (
                <>
                  <button
                    type="button"
                    className="admin-profile-menu__item"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/admin/team");
                    }}
                  >
                    <span>Team &amp; Access Control</span>
                  </button>
                  <button
                    type="button"
                    className="admin-profile-menu__item"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/admin/settings");
                    }}
                  >
                    <span>Studio Settings</span>
                  </button>
                </>
              )}

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="admin-profile-menu__item"
                onClick={() => setIsProfileOpen(false)}
              >
                <span>View Public Site ↗</span>
              </a>

              {/* Sign Out Action */}
              <button
                type="button"
                className="admin-profile-menu__item admin-profile-menu__item--danger"
                onClick={async () => {
                  setIsProfileOpen(false);
                  await logout();
                  navigate("/admin/login");
                }}
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="admin-sidebar__profile-btn"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
          >
            <div className="admin-sidebar__profile-left">
              <img
                src={user?.avatar || "/images/admin-avatar.png"}
                alt={user?.name || "Admin"}
                className="admin-sidebar__avatar"
                onError={(e) => {
                  e.currentTarget.src = "/images/admin-avatar.png";
                }}
              />
              <div style={{ overflow: "hidden", maxWidth: "145px" }}>
                <div
                  className="admin-sidebar__profile-name"
                  style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {user?.name || "Studio Admin"}
                </div>
                <div className="admin-sidebar__profile-role">{user?.role || "Administrator"}</div>
              </div>
            </div>
            <span
              className="admin-sidebar__profile-chevron"
              style={{
                transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <IconChevronDown size={14} />
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Navigation Bar */}
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>

          <div className="admin-topbar__actions">
            {/* Search Button (Triggers ⌘K Palette) */}
            <div className="admin-search-wrap">
              <button
                type="button"
                className="admin-search-btn"
                onClick={() => setIsCommandOpen(true)}
              >
                <IconSearch className="admin-search-icon" size={15} />
                <span className="admin-search-placeholder">
                  Search clients, projects, inquiries...
                </span>
                <kbd className="admin-search-shortcut">⌘K</kbd>
              </button>
            </div>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="admin-notify-btn"
                onClick={() => setIsNotifyOpen((prev) => !prev)}
                aria-label="View notifications"
              >
                <IconBell size={18} />
                {(notificationItems.length > 0 || Boolean(inquiryCount)) && (
                  <span className="admin-notify-badge" />
                )}
              </button>

              {isNotifyOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: "320px",
                    background: "#FFFFFF",
                    border: "1px solid var(--admin-border)",
                    borderRadius: "10px",
                    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.12)",
                    padding: "16px",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid var(--admin-border-subtle)",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Notifications</span>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                      {notificationItems.length > 0 ? `${notificationItems.length} recent` : "All caught up"}
                    </span>
                  </div>

                  {notificationItems.length === 0 ? (
                    <div
                      style={{
                        padding: "20px 0",
                        textAlign: "center",
                        color: "var(--admin-text-secondary)",
                        fontSize: "12.5px",
                      }}
                    >
                      No new notifications.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
                      {notificationItems.map((act) => (
                        <div key={act.id} style={{ padding: "6px 0", borderBottom: "1px solid #F0EFEB" }}>
                          <strong>{act.headline || act.title || "Studio Event"}</strong>
                          {act.subText && (
                            <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)", marginTop: "2px" }}>
                              {act.subText}
                            </div>
                          )}
                          <div style={{ fontSize: "10.5px", color: "var(--admin-text-muted)", marginTop: "3px" }}>
                            {act.timeAgo || act.timestamp || "Recently"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Topbar Avatar */}
            <img
              src={user?.avatar || "/images/admin-avatar.png"}
              alt={user?.name || "Admin"}
              title={user?.name ? `${user.name} (${user.role || "Admin"})` : "Studio Admin"}
              className="admin-topbar__avatar"
              onError={(e) => {
                e.currentTarget.src = "/images/admin-avatar.png";
              }}
              onClick={() => {
                if (user?.role === "Founder") {
                  navigate("/admin/settings");
                } else {
                  setIsProfileOpen((prev) => !prev);
                }
              }}
            />
          </div>
        </header>

        {/* Dynamic Nested Page Content with scoped Suspense to keep sidebar permanently mounted */}
        <AdminErrorBoundary>
          <Suspense fallback={<AdminContentSkeleton />}>
            <Outlet />
          </Suspense>
        </AdminErrorBoundary>
      </div>

      {/* Global Modals */}
      <CommandPaletteModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
    </div>
  );
}

