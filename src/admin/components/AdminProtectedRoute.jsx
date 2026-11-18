import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";
import AdminErrorBoundary from "./AdminErrorBoundary.jsx";

/**
 * High-performance route protection & role guard.
 * - Prevents auth flickering by using synchronous local session state.
 * - In-place role permission restriction without unmounting layout shell.
 */
export default function AdminProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isAuthLoading, user } = useAdmin();
  const location = useLocation();

  // If initial auth is actively querying without any stored session, avoid flashing
  if (isAuthLoading && !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          color: "#9E9D97",
          fontFamily: "var(--admin-font-sans, sans-serif)",
          fontSize: "13px",
          letterSpacing: "0.05em",
        }}
      >
        Authenticating Studio Workspace...
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based permission if required
  if (requiredRole) {
    const role = user?.role || "Viewer";
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const isAuthorized =
      role === "Founder" ||
      allowed.includes(role) ||
      (allowed.includes("Admin") && role === "Admin");

    if (!isAuthorized) {
      return (
        <div className="admin-content" style={{ padding: "80px 24px", textAlign: "center" }}>
          <div
            style={{
              maxWidth: "460px",
              margin: "0 auto",
              background: "#FFFFFF",
              border: "1px solid var(--admin-border, #DEDDD9)",
              borderRadius: "12px",
              padding: "44px 32px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: "20px",
                color: "#151515",
              }}
            >
              🔒
            </div>
            <h2
              style={{
                fontFamily: "var(--admin-font-serif, serif)",
                fontSize: "24px",
                fontWeight: 600,
                color: "var(--admin-text-primary, #151515)",
                margin: "0 0 10px 0",
              }}
            >
              Restricted Studio Section
            </h2>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--admin-text-secondary, #777571)",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              This section is restricted to <strong>{requiredRole}</strong> access.
              Your current account role is <strong>{role}</strong>.
            </p>
          </div>
        </div>
      );
    }
  }

  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
}
