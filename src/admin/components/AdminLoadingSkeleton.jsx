import React from "react";

export default function AdminLoadingSkeleton({ rows = 4, type = "table" }) {
  if (type === "metrics") {
    return (
      <div className="studio-metrics-strip" style={{ opacity: 0.6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="studio-metric-col" style={{ gap: "8px" }}>
            <div style={{ height: "10px", width: "70%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
            <div style={{ height: "28px", width: "50%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
            <div style={{ height: "8px", width: "40%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="studio-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: 0.6 }}>
            <div style={{ height: "14px", width: "40%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
            <div style={{ height: "20px", width: "80%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
            <div style={{ height: "12px", width: "60%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
          </div>
        ))}
      </div>
    );
  }

  // Default table skeleton
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", opacity: 0.7 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0",
            borderBottom: "1px solid var(--studio-border-crisp)",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 2 }}>
            <div style={{ height: "14px", width: "65%", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
            <div style={{ height: "11px", width: "40%", backgroundColor: "#F3F2ED", borderRadius: "4px" }} />
          </div>
          <div style={{ height: "18px", width: "80px", backgroundColor: "#EAEAEA", borderRadius: "4px", flex: 1 }} />
          <div style={{ height: "14px", width: "100px", backgroundColor: "#EAEAEA", borderRadius: "4px", flex: 1 }} />
          <div style={{ height: "26px", width: "90px", backgroundColor: "#EAEAEA", borderRadius: "4px" }} />
        </div>
      ))}
    </div>
  );
}
