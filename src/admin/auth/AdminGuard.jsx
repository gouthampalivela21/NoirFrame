import React from "react";
import { useAdminAuth } from "./AdminAuthContext.jsx";
import AdminLoginPage from "./AdminLoginPage.jsx";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }) {
  const { user, isOwner, loading } = useAdminAuth();

  // 1. While determining auth state, prevent any UI or data from flashing
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF8F5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          color: "#6E6A63",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: "700",
            color: "#1A1918",
          }}
        >
          PHANTOM LABS
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <Loader2 size={16} className="animate-spin" style={{ color: "#1A1918" }} />
          Verifying Administrator Privileges...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated or unauthorized users are locked out and served the login portal
  if (!user || !isOwner) {
    return <AdminLoginPage />;
  }

  // 3. Authorized single-owner is granted access
  return <>{children}</>;
}
