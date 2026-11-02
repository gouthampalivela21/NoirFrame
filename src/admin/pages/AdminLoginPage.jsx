import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@phantomlabs.in");
  const [password, setPassword] = useState("phantom2026");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/admin";

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@phantomlabs.in");
    setPassword("phantom2026");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D0D0D",
        padding: "24px",
        fontFamily: "var(--admin-font-sans)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#141414",
          border: "1px solid #242424",
          borderRadius: "14px",
          padding: "40px 36px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          color: "#FFFFFF",
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/images/phantom-labs-logo-white.png"
            alt="Phantom Labs"
            style={{ height: "26px", margin: "0 auto 16px auto", display: "block" }}
          />
          <h1
            style={{
              fontFamily: "var(--admin-font-serif)",
              fontSize: "26px",
              fontWeight: 400,
              margin: "0 0 6px 0",
              color: "#FFFFFF",
            }}
          >
            Studio Management
          </h1>
          <p style={{ fontSize: "12.5px", color: "#8E8D88", margin: 0 }}>
            Sign in to access your administrative dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
              fontSize: "12px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="admin-form-group">
            <label
              className="admin-form-label"
              style={{ color: "#A5A49E", fontSize: "11px", letterSpacing: "0.1em" }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@phantomlabs.in"
              style={{
                background: "#1E1E1E",
                border: "1px solid #333333",
                color: "#FFFFFF",
                padding: "11px 14px",
                borderRadius: "8px",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          <div className="admin-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label
                className="admin-form-label"
                style={{ color: "#A5A49E", fontSize: "11px", letterSpacing: "0.1em" }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleDemoFill}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9E9D97",
                  fontSize: "11px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Use Demo
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                background: "#1E1E1E",
                border: "1px solid #333333",
                color: "#FFFFFF",
                padding: "11px 14px",
                borderRadius: "8px",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: "#FFFFFF",
              color: "#0D0D0D",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: isLoading ? "wait" : "pointer",
              transition: "opacity 0.2s ease",
              marginTop: "8px",
            }}
          >
            {isLoading ? "Authenticating..." : "Enter Studio"}
          </button>
        </form>

        <div style={{ marginTop: "28px", textAlign: "center", borderTop: "1px solid #222222", paddingTop: "18px" }}>
          <a
            href="/"
            style={{
              fontSize: "12px",
              color: "#7E7D77",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            &larr; Return to public website
          </a>
        </div>
      </div>
    </div>
  );
}

