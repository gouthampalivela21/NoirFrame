import React, { useState, useEffect } from "react";
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
  IconSearch,
  IconBell,
  IconMenu,
  IconClose,
  IconChevronDown,
} from "./AdminIcons.jsx";
import CommandPaletteModal from "./Modals/CommandPaletteModal.jsx";
import NewProjectModal from "./Modals/NewProjectModal.jsx";
import AdminErrorBoundary from "./AdminErrorBoundary.jsx";

export default function AdminLayout() {
  const { user, inquiries, messages, activities, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

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

  // Real, dynamic Inquiries count (no mock default)
  const pendingInquiries = (inquiries || []).filter(
    (i) => i.status === "New" || i.status === "Pending"
  );
  const inquiryCount = pendingInquiries.length > 0
    ? pendingInquiries.length
    : inquiries.length > 0
    ? inquiries.length
    : undefined;

  // Real, dynamic Messages count (no mock default)
  const unreadMessagesCount = (messages || []).filter((m) => m.unread).length || undefined;

  // Notification items derived from real activity records
  const notificationItems = (activities || []).slice(0, 5);

  // Navigation Links with Role-Based Access Control
  const navLinks = [
    { label: "Overview", to: "/admin", icon: IconOverview, end: true },
    { label: "Inquiries", to: "/admin/inquiries", icon: IconInquiries, badge: inquiryCount },
    { label: "Clients", to: "/admin/clients", icon: IconClients },
    { label: "Projects", to: "/admin/projects", icon: IconProjects },
    { label: "Bookings", to: "/admin/bookings", icon: IconBookings },
    { label: "Portfolio", to: "/admin/portfolio", icon: IconPortfolio },
    { label: "Services", to: "/admin/services", icon: IconServices, requiredRole: "Co-Founder" },
    { label: "Testimonials", to: "/admin/testimonials", icon: IconTestimonials, requiredRole: "Co-Founder" },
    { label: "Messages", to: "/admin/messages", icon: IconMessages, badge: unreadMessagesCount },
    { label: "Analytics", to: "/admin/analytics", icon: IconAnalytics, requiredRole: "Co-Founder" },
    { label: "Settings", to: "/admin/settings", icon: IconSettings, requiredRole: "Founder" },
  ];

  const visibleNavLinks = navLinks.filter((item) => {
    if (!item.requiredRole) return true;
    if (user?.role === "Founder") return true;
    if (user?.role === "Co-Founder") return item.requiredRole !== "Founder";
    return false;
  });

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
                            ? "rgba(255, 255, 255, 0.2)"
                            : user?.role === "Co-Founder"
                            ? "rgba(100, 160, 255, 0.25)"
                            : "rgba(180, 180, 180, 0.15)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {user?.role || "Admin"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Founder Access to Studio Settings */}
              {user?.role === "Founder" && (
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
                {(notificationItems.length > 0 || (pendingInquiries && pendingInquiries.length > 0)) && (
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

        {/* Dynamic Nested Page Content */}
        <AdminErrorBoundary>
          <Outlet />
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

