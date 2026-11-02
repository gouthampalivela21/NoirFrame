import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";
import AdminErrorBoundary from "./AdminErrorBoundary.jsx";

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAdmin();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F6F3",
          fontFamily: "var(--admin-font-sans, sans-serif)",
          color: "#777571",
          fontSize: "13px",
          letterSpacing: "0.05em",
        }}
      >
        Authenticating Studio Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
}
