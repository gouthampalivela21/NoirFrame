import React from "react";
import { Inbox, Plus } from "lucide-react";

export default function AdminEmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "No entries exist in this database collection yet.",
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#FAF9F6",
        border: "1px dashed var(--studio-border-crisp)",
        borderRadius: "10px",
        margin: "12px 0",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--studio-border-crisp)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
          color: "var(--studio-text-secondary)",
        }}
      >
        <Icon size={20} />
      </div>

      <h4
        className="studio-serif"
        style={{
          fontSize: "17px",
          color: "var(--studio-text-primary)",
          margin: "0 0 6px 0",
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: "13px",
          color: "var(--studio-text-muted)",
          maxWidth: "380px",
          margin: "0 0 16px 0",
          lineHeight: 1.45,
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="studio-btn-primary studio-btn-sm"
          onClick={onAction}
        >
          <Plus size={13} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
