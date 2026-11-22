import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

export default function DestructiveActionModal({
  isOpen,
  title = "Confirm Permanent Deletion",
  itemDescription = "This record will be permanently purged from the production database.",
  onConfirm,
  onCancel,
}) {
  const [confirmKeyword, setConfirmKeyword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");

    if (confirmKeyword.trim().toUpperCase() !== "DELETE") {
      setError('Please type "DELETE" exactly to authorize this permanent action.');
      return;
    }

    try {
      setIsVerifying(true);
      await onConfirm();
      setConfirmKeyword("");
    } catch (err) {
      setError(err.message || "Deletion failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isMatched = confirmKeyword.trim().toUpperCase() === "DELETE";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#0D0D0D",
          border: "1px solid #333333",
          borderRadius: "12px",
          padding: "28px",
          color: "#FFFFFF",
          boxShadow: "0 24px 48px rgba(0,0,0,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#221111",
                border: "1px solid #551A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF453A",
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#FFFFFF" }}>
                {title}
              </h3>
              <span style={{ fontSize: "11px", color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Destructive Action Authorization
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              color: "#8E8E93",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning Description */}
        <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "#CCCCCC", margin: "0 0 20px 0" }}>
          {itemDescription}
        </p>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "#200E0E",
              border: "1px solid #5A1E1E",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#FF8F87",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Confirmation Keyword Prompt */}
        <form onSubmit={handleConfirm}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11.5px",
                fontWeight: "600",
                color: "#A1A1AA",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Type <strong style={{ color: "#FF453A" }}>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              required
              autoFocus
              value={confirmKeyword}
              onChange={(e) => setConfirmKeyword(e.target.value)}
              placeholder="DELETE"
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#161616",
                border: isMatched ? "1px solid #FF453A" : "1px solid #2C2C2C",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "600",
                letterSpacing: "0.06em",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isVerifying}
              style={{
                padding: "9px 16px",
                backgroundColor: "#161616",
                border: "1px solid #2A2A2A",
                borderRadius: "6px",
                color: "#A1A1AA",
                fontSize: "12.5px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !isMatched}
              style={{
                padding: "9px 18px",
                backgroundColor: isMatched ? "#FF453A" : "#331616",
                border: "none",
                borderRadius: "6px",
                color: isMatched ? "#FFFFFF" : "#777777",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: isVerifying || !isMatched ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Purging...
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  Permanently Delete
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
