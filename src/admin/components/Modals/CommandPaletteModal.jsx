import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext.jsx";
import { IconSearch, IconClose } from "../AdminIcons.jsx";

export default function CommandPaletteModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { inquiries, clients, projects } = useAdmin();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered from layout
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [
        { type: "shortcut", label: "Studio Overview", path: "/admin", sub: "Go to Dashboard" },
        {
          type: "shortcut",
          label: "All Inquiries",
          path: "/admin/inquiries",
          sub: (inquiries && inquiries.length > 0)
            ? `View ${inquiries.length} studio lead${inquiries.length === 1 ? "" : "s"}`
            : "Studio leads & submissions",
        },
        { type: "shortcut", label: "Active Clients", path: "/admin/clients", sub: "Client directory" },
        { type: "shortcut", label: "Ongoing Projects", path: "/admin/projects", sub: "Studio production pipeline" },
        { type: "shortcut", label: "Upcoming Shoots", path: "/admin/bookings", sub: "Calendar & schedule" },
        { type: "shortcut", label: "Studio Messages", path: "/admin/messages", sub: "Client conversations" },
        { type: "shortcut", label: "Studio Settings", path: "/admin/settings", sub: "Branding & account" },
      ];
    }

    const q = query.toLowerCase();
    const matches = [];

    // Search Inquiries
    (inquiries || []).forEach((inq) => {
      if (
        (inq.clientName || "").toLowerCase().includes(q) ||
        (inq.category || "").toLowerCase().includes(q) ||
        (inq.location || "").toLowerCase().includes(q) ||
        (inq.subCategory && inq.subCategory.toLowerCase().includes(q))
      ) {
        matches.push({
          type: "inquiry",
          label: inq.clientName || "Inquiry",
          sub: `${inq.subCategory || inq.category || "General"} · ${inq.location || "Online"}`,
          badge: inq.status || "New",
          path: "/admin/inquiries",
        });
      }
    });

    // Search Clients
    (clients || []).forEach((c) => {
      if (
        (c.name || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
      ) {
        matches.push({
          type: "client",
          label: c.name || "Client",
          sub: `${c.company || c.category || "Studio Client"} · ${c.email || ""}`,
          badge: "Client",
          path: "/admin/clients",
        });
      }
    });

    // Search Projects
    (projects || []).forEach((p) => {
      if (
        (p.title || "").toLowerCase().includes(q) ||
        (p.client || "").toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      ) {
        matches.push({
          type: "project",
          label: p.title || "Project",
          sub: `${p.client || "Client"} · Stage: ${p.stage || p.status || "In Progress"}`,
          badge: p.status || "Active",
          path: "/admin/projects",
        });
      }
    });

    return matches;
  }, [query, inquiries, clients, projects]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--admin-border-subtle)", gap: "12px" }}>
          <IconSearch size={18} style={{ color: "var(--admin-text-secondary)" }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, projects, inquiries, or navigate... (ESC to close)"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
              background: "transparent",
              color: "var(--admin-text-primary)",
              fontFamily: "var(--admin-font-sans)",
            }}
          />
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--admin-text-secondary)", display: "flex", alignItems: "center" }}
          >
            <IconClose size={16} />
          </button>
        </div>

        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "10px 12px" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--admin-text-secondary)", fontSize: "13px" }}>
              No matches found for "{query}".
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F3EF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--admin-text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)" }}>{item.sub}</div>
                </div>
                {item.badge && (
                  <span className="admin-status-pill admin-status-pill--new" style={{ fontSize: "10.5px" }}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

