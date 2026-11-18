import React from "react";

/**
 * Editorial skeleton placeholder for seamless, zero-flash admin subpage transitions.
 * Preserves the exact page geometry and warm off-white studio aesthetic.
 */
export default function AdminContentSkeleton() {
  return (
    <div
      className="admin-content"
      style={{
        animation: "adminFadeIn 0.2s ease-out",
        opacity: 0.9,
      }}
      aria-busy="true"
      aria-label="Loading section..."
    >
      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
        <div>
          <div
            style={{
              width: "120px",
              height: "12px",
              background: "#EAE9E5",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          />
          <div
            style={{
              width: "280px",
              height: "32px",
              background: "#E2E0DB",
              borderRadius: "6px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "200px",
              height: "14px",
              background: "#EAE9E5",
              borderRadius: "4px",
            }}
          />
        </div>
        <div
          style={{
            width: "140px",
            height: "38px",
            background: "#E2E0DB",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Metrics Row Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          margin: "12px 0",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-border-subtle, #EAE9E5)",
              borderRadius: "10px",
              padding: "18px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "28px",
                background: "#EAE9E5",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "11px",
                background: "#F0EFEB",
                borderRadius: "3px",
              }}
            />
          </div>
        ))}
      </div>

      {/* Content Card Skeleton */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid var(--admin-border, #DEDDD9)",
          borderRadius: "12px",
          padding: "24px",
          minHeight: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--admin-border-subtle, #EAE9E5)",
            paddingBottom: "14px",
          }}
        >
          <div style={{ width: "160px", height: "18px", background: "#EAE9E5", borderRadius: "4px" }} />
          <div style={{ width: "90px", height: "18px", background: "#EAE9E5", borderRadius: "4px" }} />
        </div>

        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid #F5F4F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#EAE9E5" }} />
              <div>
                <div style={{ width: "180px", height: "14px", background: "#E2E0DB", borderRadius: "3px", marginBottom: "6px" }} />
                <div style={{ width: "120px", height: "11px", background: "#EAE9E5", borderRadius: "3px" }} />
              </div>
            </div>
            <div style={{ width: "70px", height: "22px", borderRadius: "999px", background: "#F0EFEB" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

