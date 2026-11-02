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

export default function AdminLayout() {
  const { user, inquiries, messages, logout } = useAdmin();
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

  // Inquiries count (match 12 from screenshot or dynamic)
  const inquiryCount = inquiries.length > 0 ? inquiries.length : 12;
  // Messages count (match 3 from screenshot or dynamic unread)
  const unreadMessagesCount = messages.filter((m) => m.unread).length || 3;

  const navLinks = [
    { label: "Overview", to: "/admin", icon: IconOverview, end: true },
    { label: "Inquiries", to: "/admin/inquiries", icon: IconInquiries, badge: inquiryCount },
    { label: "Clients", to: "/admin/clients", icon: IconClients },
    { label: "Projects", to: "/admin/projects", icon: IconProjects },
    { label: "Bookings", to: "/admin/bookings", icon: IconBookings },
    { label: "Portfolio", to: "/admin/portfolio", icon: IconPortfolio },
    { label: "Services", to: "/admin/services", icon: IconServices },
    { label: "Testimonials", to: "/admin/testimonials", icon: IconTestimonials },
    { label: "Messages", to: "/admin/messages", icon: IconMessages, badge: unreadMessagesCount },
    { label: "Analytics", to: "/admin/analytics", icon: IconAnalytics },
    { label: "Settings", to: "/admin/settings", icon: IconSettings },
  ];

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
            {navLinks.map((item) => {
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

        {/* Sidebar Footer User Profile */}
        <div className="admin-sidebar__footer">
          {isProfileOpen && (
            <div className="admin-profile-menu">
              <button
                type="button"
                className="admin-profile-menu__item"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/admin/settings");
                }}
              >
                Studio Settings
              </button>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="admin-profile-menu__item"
                onClick={() => setIsProfileOpen(false)}
              >
                View Public Site ↗
              </a>
              <button
                type="button"
                className="admin-profile-menu__item admin-profile-menu__item--danger"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                  navigate("/admin/login");
                }}
              >
                Sign Out
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
                alt={user?.name || "Studio Admin"}
                className="admin-sidebar__avatar"
              />
              <div>
                <div className="admin-sidebar__profile-name">{user?.name || "Studio Admin"}</div>
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
                <span className="admin-notify-badge" />
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
                      3 unread
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
                    <div style={{ padding: "6px 0", borderBottom: "1px solid #F0EFEB" }}>
                      <strong>New Inquiry</strong> from Aditi & Rohan (Pre-Wedding)
                      <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                        10 min ago
                      </div>
                    </div>
                    <div style={{ padding: "6px 0", borderBottom: "1px solid #F0EFEB" }}>
                      <strong>Payment Received</strong> ₹50,000 from The Grove Café
                      <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                        5 hrs ago
                      </div>
                    </div>
                    <div style={{ padding: "6px 0" }}>
                      <strong>Shoot Confirmed</strong> Priya & Karthik Wedding
                      <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                        4 hrs ago
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Topbar Avatar */}
            <img
              src={user?.avatar || "/images/admin-avatar.png"}
              alt="Admin"
              className="admin-topbar__avatar"
              onClick={() => navigate("/admin/settings")}
            />
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <Outlet />
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

