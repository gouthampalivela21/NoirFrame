import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./auth/AdminAuthContext.jsx";
import AdminGuard from "./auth/AdminGuard.jsx";
import { StudioAdminProvider, useStudioAdmin } from "./context/StudioAdminContext.jsx";
import OverviewView from "./views/OverviewView.jsx";
import InquiriesView from "./views/InquiriesView.jsx";
import ClientsView from "./views/ClientsView.jsx";
import ProjectsView from "./views/ProjectsView.jsx";
import BookingsView from "./views/BookingsView.jsx";
import MessagesView from "./views/MessagesView.jsx";
import AnalyticsView from "./views/AnalyticsView.jsx";
import TeamView from "./views/TeamView.jsx";
import WebsiteContentView from "./views/WebsiteContentView.jsx";

import NewProjectModal from "./components/NewProjectModal.jsx";
import LogPaymentModal from "./components/LogPaymentModal.jsx";
import NewInvoiceModal from "./components/NewInvoiceModal.jsx";
import CommandPaletteModal from "./components/CommandPaletteModal.jsx";
import ToastNotification from "./components/ToastNotification.jsx";

import "./styles/adminEditorial.css";

import {
  LayoutDashboard,
  Inbox,
  Users,
  Camera,
  Calendar,
  Layers,
  Mail,
  BarChart3,
  UserCheck,
  Search,
  Bell,
  ChevronDown,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

/**
 * Reusable dynamic user avatar with clean Google photoURL rendering
 * and instant initials fallback if loading or unavailable.
 */
function UserAvatar({ size = 36, url, name, initialsText, onClick, title }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name || "User Avatar"}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        onClick={onClick}
        title={title}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid var(--studio-border-crisp)",
          cursor: onClick ? "pointer" : "default",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      title={title}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: "#EAE4DC",
        border: "1px solid #DCD4C9",
        color: "#1A1918",
        fontSize: size >= 40 ? "13px" : "11px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {initialsText}
    </div>
  );
}

function AdminDashboardInner() {
  const { logout, user } = useAdminAuth();
  const {
    activeView,
    setActiveView,
    setCommandPaletteOpen,
    setNewProjectModalOpen,
    inquiries,
    projects,
    messages,
    showToast,
  } = useStudioAdmin();

  const [founderMenuOpen, setFounderMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Live profile details directly from Firebase Auth
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Studio Founder";
  const email = user?.email || "founder@phantomlabs.in";
  const photoURL = user?.photoURL || null;

  const getInitials = (name, mail) => {
    if (name) {
      const parts = name.trim().split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
    }
    if (mail) return mail.slice(0, 2).toUpperCase();
    return "PL";
  };

  const initials = getInitials(displayName, email);

  // Keep operational tools visible and collect every website editor under CMS.
  const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inquiries", label: "Inquiries", icon: Inbox, badge: inquiries.filter((i) => i.status === "New").length },
    { id: "clients", label: "Clients", icon: Users },
    { id: "projects", label: "Projects", icon: Camera, badge: projects.filter((p) => p.stage !== "Delivered").length },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "cms", label: "CMS", icon: Layers },
    { id: "messages", label: "Messages", icon: Mail, badge: messages.filter((m) => m.unread).length },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "team", label: "Team", icon: UserCheck },
  ];

  return (
    <div className="studio-shell">
      {/* Mobile Drawer Backdrop (< 1024px) */}
      {mobileNavOpen && (
        <div
          className="studio-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ====================================================================
          LEFT SIDEBAR (256px Fixed Width · Pitch-Black #0D0D0D)
          Permanently locked to viewport (fixed top-0 bottom-0 left-0 w-64 h-screen)
          ==================================================================== */}
      <aside className={`studio-sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        {/* Extended-Width Uppercase Wordmark */}
        <div className="studio-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/gouthamspace" style={{ textDecoration: "none", color: "inherit" }} onClick={() => setMobileNavOpen(false)}>
              <img
                className="studio-brand-logo"
                src="/images/phantom-labs-admin-wordmark.png"
                alt="Phantom Labs"
              />
            </Link>
            <button
              type="button"
              className="studio-mobile-close-btn"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Direct links to operations and editable website sections */}
        <nav className="studio-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`studio-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileNavOpen(false);
                }}
              >
                <Icon className="studio-nav-icon" />
                <span className="studio-nav-label">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="studio-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pinned Founder Profile Footer with Live Google Identity & Popover */}
        <div className="studio-sidebar-footer" style={{ position: "relative" }}>
          {/* Expanded Account Popover Menu */}
          {founderMenuOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "64px",
                left: "8px",
                right: "8px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DFD6",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 16px 36px rgba(0,0,0,0.08)",
                zIndex: 1000,
                color: "#1A1918",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <UserAvatar
                  size={42}
                  url={photoURL}
                  name={displayName}
                  initialsText={initials}
                />
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1A1918",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={displayName}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6E6A63",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: "SF Mono, monospace",
                    }}
                    title={email}
                  >
                    {email}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  backgroundColor: "#EAE4DC",
                  border: "1px solid #DCD4C9",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#1A1918",
                  marginBottom: "12px",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#1A1918" }} />
                Google Authenticated Owner
              </div>

              <div style={{ height: "1px", backgroundColor: "#E8E2D9", margin: "4px 0 10px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    color: "#1A1918",
                    fontSize: "12px",
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3EFEA")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span>Open Live Website</span>
                  <ExternalLink size={13} style={{ color: "#6E6A63" }} />
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#D93829",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FDF2F0")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span>Sign Out of Studio OS</span>
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Interactive Profile Card */}
          <div
            className="studio-founder-pill"
            style={{ cursor: "pointer", width: "100%", justifyContent: "space-between" }}
            onClick={() => setFounderMenuOpen((prev) => !prev)}
            title="Click to view Google account details"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", flex: 1 }}>
              <UserAvatar
                size={32}
                url={photoURL}
                name={displayName}
                initialsText={initials}
              />
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div className="studio-founder-name">{displayName}</div>
                <div
                  className="studio-founder-role"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={email}
                >
                  {email}
                </div>
              </div>
            </div>
            <ChevronDown
              size={12}
              style={{
                color: "#71717A",
                transform: founderMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
                marginLeft: "8px",
              }}
            />
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT CANVAS (Alabaster Surface #FAF9F6)
          ==================================================================== */}
      <div className="studio-main">
        {/* TOP HEADER BAR (Sticky top-0 z-30 with backdrop blur) */}
        <header className="studio-topbar">
          <div className="studio-topbar-left">
            {/* Mobile Hamburger Toggle Button (< 1024px) */}
            <button
              type="button"
              className="studio-mobile-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>

            {/* Global Search Input */}
            <div
              className="studio-search-bar"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search size={14} style={{ color: "var(--studio-text-muted)" }} />
              <span className="studio-search-placeholder">
                Search clients, projects, inquiries...
              </span>
              <span className="studio-kbd">⌘K</span>
            </div>
          </div>

          <div className="studio-topbar-right">
            {/* Current Date Pill */}
            <div className="studio-date-pill">
              <Calendar size={13} style={{ color: "var(--studio-text-muted)" }} />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="studio-btn-secondary"
              style={{ width: "36px", height: "36px", padding: 0, justifyContent: "center" }}
              onClick={() => showToast("All production notifications are up to date.")}
              title="Notifications"
            >
              <Bell size={15} />
            </button>

            {/* User Avatar with Live Google photoURL & Fallback */}
            <UserAvatar
              size={36}
              url={photoURL}
              name={displayName}
              initialsText={initials}
              onClick={() => setFounderMenuOpen((prev) => !prev)}
              title={`${displayName} (${email}) — Click to toggle account menu`}
            />
          </div>
        </header>

        {/* ACTIVE SECTION CANVAS */}
        <main className="studio-content">
          {activeView === "overview" && <OverviewView />}
          {activeView === "inquiries" && <InquiriesView />}
          {activeView === "clients" && <ClientsView />}
          {activeView === "projects" && <ProjectsView />}
          {activeView === "bookings" && <BookingsView />}
          {activeView === "messages" && <MessagesView />}
          {activeView === "analytics" && <AnalyticsView />}
          {activeView === "team" && <TeamView />}
          {activeView === "cms" && <WebsiteContentView />}
        </main>
      </div>

      {/* MODALS & OVERLAYS */}
      <NewProjectModal />
      <LogPaymentModal />
      <NewInvoiceModal />
      <CommandPaletteModal />
      <ToastNotification />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        <StudioAdminProvider>
          <AdminDashboardInner />
        </StudioAdminProvider>
      </AdminGuard>
    </AdminAuthProvider>
  );
}
