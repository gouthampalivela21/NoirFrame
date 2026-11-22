import React, { useState } from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import AdminEmptyState from "../components/AdminEmptyState.jsx";
import { MessageSquare, Send } from "lucide-react";

export default function MessagesView() {
  const { messages, showToast } = useStudioAdmin();
  const [activeThread, setActiveThread] = useState(messages[0] || null);
  const [replyText, setReplyText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    showToast(`Reply sent to ${activeThread.client}.`);
    setReplyText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <div className="studio-eyebrow" style={{ marginBottom: "6px" }}>CLIENT CORRESPONDENCE</div>
        <h1 className="studio-serif" style={{ fontSize: "28px", color: "var(--studio-text-primary)", margin: 0 }}>
          Client Communication & Creative Briefs
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--studio-text-muted)", margin: "4px 0 0 0" }}>
          Coordinate call sheets, moodboards, and delivery approvals directly with client patrons.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="studio-card">
          <AdminEmptyState
            icon={MessageSquare}
            title="No correspondence threads yet"
            description="Client messages and conversation threads from booking inquiries will appear here."
          />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px" }}>
          {/* Messages List */}
          <div className="studio-card" style={{ padding: "14px" }}>
            <div className="studio-eyebrow" style={{ padding: "8px 10px", marginBottom: "8px" }}>
              CONVERSATION THREADS ({messages.length})
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {messages.map((msg) => {
                const isSelected = activeThread?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setActiveThread(msg)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: isSelected ? "#FAF9F6" : "#FFFFFF",
                      border: "1px solid",
                      borderColor: isSelected ? "#111111" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#111111" }}>
                        {msg.client}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>
                        {msg.time}
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--studio-text-muted)", marginTop: "2px" }}>
                      {msg.genre}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--studio-text-secondary)",
                        marginTop: "6px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {msg.lastMessage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conversation Pane */}
          {activeThread ? (
            <div className="studio-card" style={{ display: "flex", flexDirection: "column", height: "540px" }}>
              <div
                style={{
                  paddingBottom: "14px",
                  borderBottom: "1px solid var(--studio-border-crisp)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "var(--studio-text-primary)" }}>
                    {activeThread.client}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
                    {activeThread.genre} · {activeThread.unread ? "Unread Brief" : "Active Thread"}
                  </span>
                </div>
              </div>

              {/* Message thread preview */}
              <div style={{ flex: 1, padding: "20px 0", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ maxWidth: "80%", padding: "12px 16px", background: "#FAF9F6", borderRadius: "10px", border: "1px solid var(--studio-border-crisp)", alignSelf: "flex-start" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--studio-text-muted)", marginBottom: "4px" }}>
                    {activeThread.client}
                  </div>
                  <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--studio-text-primary)" }}>
                    {activeThread.lastMessage}
                  </div>
                </div>
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} style={{ display: "flex", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--studio-border-crisp)" }}>
                <input
                  type="text"
                  className="studio-input"
                  placeholder={`Reply to ${activeThread.client}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="studio-btn-primary">
                  <Send size={14} />
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="studio-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--studio-text-muted)", fontSize: "13px" }}>
                Select a conversation thread to view correspondence.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
