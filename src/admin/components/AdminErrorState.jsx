import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminErrorState({
  title = "Failed to load database records",
  message = "An error occurred while connecting to the studio database.",
  onRetry,
}) {
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #111111",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        margin: "12px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#111111",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 2px 0", color: "#111111" }}>
            {title}
          </h4>
          <p style={{ fontSize: "12.5px", color: "var(--studio-text-muted)", margin: 0 }}>
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          className="studio-btn-secondary studio-btn-sm"
          onClick={onRetry}
        >
          <RefreshCw size={12} />
          Retry Request
        </button>
      )}
    </div>
  );
}
