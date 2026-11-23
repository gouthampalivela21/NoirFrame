import React, { useState, useEffect, useRef } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import {
  Search,
  Camera,
  Users,
  Calendar,
  Receipt,
  Layout,
  Plus,
  ArrowRight,
  X,
} from "lucide-react";

export default function CommandPaletteModal() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    projects,
    inquiries,
    clients,
    setActiveView,
    setNewProjectModalOpen,
    setNewInvoiceModalOpen,
  } = useStudioAdmin();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [commandPaletteOpen]);

  // Global ⌘K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProjects = projects.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.client || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
  );

  const filteredInquiries = inquiries.filter(
    (i) =>
      (i.clientName || "").toLowerCase().includes(q) ||
      (i.category || "").toLowerCase().includes(q) ||
      (i.location || "").toLowerCase().includes(q)
  );

  const filteredClients = clients.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.contactPerson || "").toLowerCase().includes(q)
  );

  const navigateTo = (view) => {
    setCommandPaletteOpen(false);
    setActiveView(view);
  };

  return (
    <div className="studio-modal-overlay" onClick={() => setCommandPaletteOpen(false)}>
      <div
        className="studio-modal"
        style={{ maxWidth: "620px", marginTop: "-100px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--studio-border-crisp)",
            background: "#FFFFFF",
          }}
        >
          <Search size={18} style={{ color: "var(--studio-text-muted)", marginRight: "12px", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            className="studio-input"
            style={{
              border: "none",
              padding: 0,
              fontSize: "15px",
              boxShadow: "none",
            }}
            placeholder="Search clients, projects, inquiries, portfolio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="studio-btn-secondary studio-btn-sm"
            style={{ width: "26px", height: "26px", padding: 0, justifyContent: "center" }}
            onClick={() => setCommandPaletteOpen(false)}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "10px 14px" }}>
          {!q && (
            <div style={{ marginBottom: "12px" }}>
              <div className="studio-eyebrow" style={{ padding: "6px 10px" }}>
                Studio Quick Actions
              </div>
              <div
                className="studio-nav-item"
                style={{ color: "#111111", padding: "8px 12px" }}
                onClick={() => {
                  setCommandPaletteOpen(false);
                  setNewProjectModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>Commission New Project / Shoot</span>
              </div>
              <div
                className="studio-nav-item"
                style={{ color: "#111111", padding: "8px 12px" }}
                onClick={() => {
                  setCommandPaletteOpen(false);
                  setNewInvoiceModalOpen(true);
                }}
              >
                <Receipt size={15} />
                <span>Issue Milestone Invoice</span>
              </div>
              <div
                className="studio-nav-item"
                style={{ color: "#111111", padding: "8px 12px" }}
                onClick={() => navigateTo("cms")}
              >
                <Layout size={15} />
                <span>Edit Website Stories</span>
              </div>
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div className="studio-eyebrow" style={{ padding: "6px 10px" }}>
                Active Projects & Shoots ({filteredProjects.length})
              </div>
              {filteredProjects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="studio-nav-item"
                  style={{ color: "#111111", justifyContent: "space-between" }}
                  onClick={() => navigateTo("projects")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Camera size={14} style={{ color: "var(--studio-text-muted)" }} />
                    <span style={{ fontWeight: "600" }}>{p.name}</span>
                    <span style={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>({p.client})</span>
                  </div>
                  <span className="studio-mono" style={{ fontSize: "12px", fontWeight: "600" }}>
                    {formatINR(p.quote)} · {p.stage}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredInquiries.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div className="studio-eyebrow" style={{ padding: "6px 10px" }}>
                Client Inquiries ({filteredInquiries.length})
              </div>
              {filteredInquiries.slice(0, 3).map((i) => (
                <div
                  key={i.id}
                  className="studio-nav-item"
                  style={{ color: "#111111", justifyContent: "space-between" }}
                  onClick={() => navigateTo("inquiries")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={14} style={{ color: "var(--studio-text-muted)" }} />
                    <span style={{ fontWeight: "500" }}>{i.clientName}</span>
                    <span className="studio-badge studio-badge-subtle" style={{ fontSize: "10.5px" }}>
                      {i.category}
                    </span>
                  </div>
                  <span className="studio-mono" style={{ fontSize: "12px" }}>
                    {formatINR(i.budget)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredClients.length > 0 && (
            <div>
              <div className="studio-eyebrow" style={{ padding: "6px 10px" }}>
                Clients ({filteredClients.length})
              </div>
              {filteredClients.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="studio-nav-item"
                  style={{ color: "#111111", justifyContent: "space-between" }}
                  onClick={() => navigateTo("clients")}
                >
                  <span style={{ fontWeight: "600" }}>{c.name}</span>
                  <span className="studio-mono" style={{ fontSize: "12px" }}>
                    Spend: {formatINR(c.totalSpend)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {q && filteredProjects.length === 0 && filteredInquiries.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--studio-text-muted)", fontSize: "13px" }}>
              No studio records found for "{query}".
            </div>
          )}
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderTop: "1px solid var(--studio-border-crisp)",
            background: "#FAF9F6",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--studio-text-muted)",
          }}
        >
          <span>Press <strong>Esc</strong> to dismiss</span>
          <span><strong>Phantom Labs Studio Command Center</strong></span>
        </div>
      </div>
    </div>
  );
}
