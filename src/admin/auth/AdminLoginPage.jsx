import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext.jsx";
import { Lock, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const { loginWithGoogle, authError, setAuthError } = useAdminAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleGoogleSignIn = async () => {
    setLocalError("");
    setAuthError("");
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err.message || "Google authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F6F3EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5DFD6",
          borderRadius: "14px",
          padding: "48px 36px",
          boxShadow: "0 20px 48px rgba(0,0,0,0.06)",
          color: "#1A1918",
          textAlign: "center",
        }}
      >
        {/* Header Wordmark & Security Badge */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "20px",
              backgroundColor: "#F3EFEA",
              border: "1px solid #E5DFD6",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6E6A63",
              marginBottom: "20px",
            }}
          >
            <Lock size={12} style={{ color: "#1A1918" }} />
            Single-Owner Secure Access
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: "0 0 8px 0",
              color: "#1A1918",
            }}
          >
            Studio Access
          </h1>

          <p style={{ fontSize: "13px", color: "#6E6A63", margin: 0 }}>
            Phantom Labs &mdash; Visual Stories, Framed Differently
          </p>
        </div>

        {/* Access Denied / Error Alert */}
        {activeError && (
          <div
            style={{
              backgroundColor: "#FFF5F5",
              border: "1px solid #F5C6CB",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              textAlign: "left",
            }}
          >
            <ShieldAlert size={16} style={{ color: "#D93829", flexShrink: 0, marginTop: "2px" }} />
            <span style={{ fontSize: "12.5px", color: "#C92A2A", lineHeight: 1.45 }}>
              {activeError}
            </span>
          </div>
        )}

        {/* Sole Action: Continue with Google Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleGoogleSignIn}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "14px 20px",
            backgroundColor: "#1A1918",
            border: "none",
            borderRadius: "9px",
            color: "#FAF8F5",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.02em",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) e.currentTarget.style.backgroundColor = "#2D2B28";
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) e.currentTarget.style.backgroundColor = "#1A1918";
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying Google Credentials...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#FAF8F5"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#FAF8F5"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FAF8F5"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#FAF8F5"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Return to Public Website Link */}
        <div style={{ marginTop: "28px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#6E6A63",
              fontSize: "12.5px",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1918")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6A63")}
          >
            <ArrowLeft size={13} />
            &larr; Return to public website
          </Link>
        </div>

        {/* Security Notice */}
        <div
          style={{
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid #E8E2D9",
            textAlign: "center",
            fontSize: "11px",
            color: "#8A847C",
            lineHeight: 1.5,
          }}
        >
          Single-owner access restricted to authorized Google accounts.
          <br />
          Public signups and unauthorized accounts are strictly blocked.
        </div>
      </div>
    </div>
  );
}
