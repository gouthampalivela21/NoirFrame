import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminMessagesPage() {
  const { messages, markMessageRead, deleteMessage } = useAdmin();
  const [selectedId, setSelectedId] = useState(messages[0]?.id || null);
  const [replyText, setReplyText] = useState("");
  const [sentNotice, setSentNotice] = useState(false);

  const selectedMessage = messages.find((m) => m.id === selectedId) || messages[0];

  const handleSelect = (msg) => {
    setSelectedId(msg.id);
    if (msg.unread) {
      markMessageRead(msg.id);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSentNotice(true);
    setReplyText("");
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client Communication</h1>
          <p className="admin-page-desc">
            Direct messages, creative feedback, and booking inquiries.
          </p>
        </div>
      </div>

      {/* 2-Column Split: Message List & Thread View, or Clean Empty State */}
      {(messages || []).length === 0 ? (
        <div
          style={{
            padding: "54px 24px",
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px dashed var(--admin-border)",
            margin: "12px 0",
          }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--admin-text-primary)",
            }}
          >
            No client messages received
          </h3>
          <p
            style={{
              margin: "0",
              fontSize: "13px",
              color: "var(--admin-text-secondary)",
              maxWidth: "460px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Inbound client messages, booking consultations, and creative correspondence will appear in this central inbox.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: "24px",
            minHeight: "560px",
            alignItems: "start",
          }}
        >
          {/* Left: Message Threads List */}
          <div className="admin-card" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {messages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: isSelected ? "#F3F2EE" : "transparent",
                    borderLeft: msg.unread ? "3px solid #151515" : "3px solid transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <span style={{ fontWeight: msg.unread ? 700 : 500, fontSize: "13.5px" }}>
                      {msg.sender}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-secondary)" }}>
                      {msg.timeAgo || msg.timestamp || ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--admin-text-primary)", marginBottom: "3px" }}>
                    {msg.subject}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--admin-text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Message Detail & Reply Box */}
          {selectedMessage ? (
            <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--admin-border-subtle)", paddingBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 6px" }}>
                    {selectedMessage.subject}
                  </h2>
                  <div style={{ fontSize: "13px", color: "var(--admin-text-secondary)" }}>
                    From: <strong>{selectedMessage.sender}</strong> &lt;{selectedMessage.email}&gt;
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ color: "#DC3545", borderColor: "#F5C6CB" }}
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  Delete
                </button>
              </div>

              {/* Message Body */}
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "var(--admin-text-primary)",
                  whiteSpace: "pre-wrap",
                  minHeight: "160px",
                }}
              >
                {selectedMessage.body}
              </div>

              {/* Reply Composer */}
              <div style={{ borderTop: "1px solid var(--admin-border-subtle)", paddingTop: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--admin-text-secondary)", marginBottom: "8px" }}>
                  Send Studio Response
                </div>

                {sentNotice && (
                  <div style={{ padding: "8px 12px", background: "#D1E7DD", color: "#0F5132", borderRadius: "6px", fontSize: "12px", marginBottom: "12px" }}>
                    ✓ Response sent to {selectedMessage.email} via Phantom Studio Mail.
                  </div>
                )}

                <form onSubmit={handleSendReply}>
                  <textarea
                    rows={4}
                    required
                    className="admin-form-textarea"
                    placeholder={`Write your response to ${selectedMessage.sender}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ marginBottom: "12px" }}
                  />

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="admin-btn-black">
                      Send Reply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="admin-card" style={{ textAlign: "center", padding: "40px", color: "var(--admin-text-secondary)" }}>
              Select a message thread to view details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

