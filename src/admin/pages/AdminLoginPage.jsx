import React, { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const { loginWithGoogle, isAuthenticated, isAuthLoading, authError, logout, administrators } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const [showIdentitySelector, setShowIdentitySelector] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/admin";

  // Redirect if already authenticated and authorized
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleContinueWithGoogle = async () => {
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res?.success && !res?.redirected) {
        navigate(from, { replace: true });
      } else if (res?.needsAccountSelection) {
        // Open identity selector if running in local environment without OAuth client credentials
        setShowIdentitySelector(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAccount = async (email) => {
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle(email);
      if (res?.success) {
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
      setShowIdentitySelector(false);
    }
  };

  const handleSignOutUnauthorized = async () => {
    await logout();
    setShowIdentitySelector(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
        padding: "24px",
        fontFamily: "var(--admin-font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#121212",
          border: "1px solid #222222",
          borderRadius: "14px",
          padding: "44px 38px",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.7)",
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        {/* PHANTOM LABS Official Brand Logo */}
        <div style={{ marginBottom: "28px" }}>
          <img
            src="/images/phantom-labs-logo-white.png"
            alt="PHANTOM LABS"
            style={{
              height: "24px",
              width: "auto",
              margin: "0 auto",
              display: "block",
              filter: "brightness(0.95)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* ACCESS RESTRICTED SCREEN (For Unauthorized or Deactivated Google Accounts) */}
        {authError ? (
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                color: "#EF4444",
                fontSize: "20px",
              }}
            >
              ✕
            </div>

            <h1
              style={{
                fontFamily: "var(--admin-font-serif, 'Playfair Display', serif)",
                fontSize: "26px",
                fontWeight: 400,
                margin: "0 0 10px 0",
                color: "#FFFFFF",
                letterSpacing: "0.02em",
              }}
            >
              {authError.title || "Access Restricted"}
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "#9E9D97",
                lineHeight: "1.6",
                margin: "0 0 24px 0",
              }}
            >
              {authError.message ||
                "This Google account is not authorised to access the PHANTOM LABS studio workspace."}
            </p>

            {/* Display Unreachable Hostname Diagnostics if server connection failed */}
            {authError.hostname && (
              <div
                style={{
                  background: "#161616",
                  border: "1px solid #282828",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#D1D0C9",
                  textAlign: "left",
                  lineHeight: "1.5",
                }}
              >
                <div style={{ color: "#EF4444", fontWeight: 600, marginBottom: "4px" }}>
                  Host Unreachable:
                </div>
                <code
                  style={{
                    display: "block",
                    fontFamily: "monospace",
                    background: "#0E0E0E",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    color: "#F87171",
                    wordBreak: "break-all",
                    marginBottom: "8px",
                  }}
                >
                  {authError.hostname}
                </code>
                <span style={{ color: "#8E8D88", fontSize: "11px" }}>
                  Please verify that this project is active in Supabase Dashboard → Project Settings → API.
                </span>
              </div>
            )}

            {/* Display Rejected Account Information */}
            {authError.email && (
              <div
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #282828",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                }}
              >
                <img
                  src={authError.attemptedUser?.avatar || "/images/admin-avatar.png"}
                  alt=""
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#2A2A2A",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/admin-avatar.png";
                  }}
                />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>
                    {authError.attemptedUser?.name || authError.email.split("@")[0]}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888782",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {authError.email}
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleSignOutUnauthorized}
              style={{
                width: "100%",
                background: "#FFFFFF",
                color: "#0A0A0A",
                border: "none",
                borderRadius: "8px",
                padding: "12px 18px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {authError.code === "SUPABASE_SERVER_UNREACHABLE" ? "Dismiss & Return to Login" : "Sign Out"}
            </button>
          </div>
        ) : (
          /* STANDARD STUDIO ACCESS (GOOGLE LOGIN ONLY) */
          <div>
            <h1
              style={{
                fontFamily: "var(--admin-font-serif, 'Playfair Display', serif)",
                fontSize: "27px",
                fontWeight: 400,
                margin: "0 0 8px 0",
                color: "#FFFFFF",
                letterSpacing: "0.02em",
              }}
            >
              Studio Access
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "#8E8D88",
                margin: "0 0 32px 0",
                lineHeight: "1.5",
              }}
            >
              Sign in to access the private studio workspace.
            </p>

            {/* Premium Black-and-White "Continue with Google" Button */}
            <button
              type="button"
              disabled={isSubmitting || isAuthLoading}
              onClick={handleContinueWithGoogle}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                background: "#FFFFFF",
                color: "#0A0A0A",
                border: "none",
                borderRadius: "9px",
                padding: "13px 20px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.01em",
                cursor: isSubmitting || isAuthLoading ? "wait" : "pointer",
                boxShadow: "0 4px 18px rgba(0, 0, 0, 0.4)",
                transition: "transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F2F1EE";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <GoogleIcon size={19} />
              <span>{isSubmitting || isAuthLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Subtle Account Switcher Link for Testing Roles */}
            <div style={{ marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setShowIdentitySelector((prev) => !prev)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6B6964",
                  fontSize: "11.5px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "4px 8px",
                }}
              >
                {showIdentitySelector ? "Hide Account Switcher" : "Select Test Google Account ▾"}
              </button>
            </div>

            {/* Test Google Account Selector (Permits verifying Founder, Co-Founder, Admin & Unauthorized) */}
            {showIdentitySelector && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#181818",
                  borderRadius: "10px",
                  border: "1px solid #2B2B2B",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8E8D88", marginBottom: "10px", fontWeight: 600 }}>
                  Select Authorized Google Identity:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(administrators || []).map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => handleSelectAccount(admin.email)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "#202020",
                        border: "1px solid #303030",
                        borderRadius: "6px",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        fontSize: "12.5px",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#282828")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#202020")}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{admin.name}</div>
                        <div style={{ fontSize: "11px", color: "#8E8D88" }}>{admin.email}</div>
                      </div>
                      <span
                        style={{
                          fontSize: "10.5px",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background:
                            admin.role === "Founder"
                              ? "rgba(255, 255, 255, 0.15)"
                              : admin.role === "Co-Founder"
                              ? "rgba(100, 150, 255, 0.15)"
                              : "rgba(150, 150, 150, 0.15)",
                          color: "#FFFFFF",
                        }}
                      >
                        {admin.role} ({admin.status})
                      </span>
                    </button>
                  ))}

                  {/* Option to test an unauthorized account to verify refusal */}
                  <button
                    type="button"
                    onClick={() => handleSelectAccount("unauthorized.guest@gmail.com")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px dashed rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      color: "#FCA5A5",
                      cursor: "pointer",
                      fontSize: "12px",
                      textAlign: "left",
                    }}
                  >
                    <span>Test Unauthorised Google Account</span>
                    <span style={{ fontSize: "10.5px" }}>Will be restricted ✕</span>
                  </button>
                </div>

                {/* Custom Google Email Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customEmail) handleSelectAccount(customEmail);
                  }}
                  style={{ marginTop: "12px", display: "flex", gap: "6px" }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter any other Google email..."
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    style={{
                      flex: 1,
                      background: "#111111",
                      border: "1px solid #333333",
                      color: "#FFFFFF",
                      padding: "7px 10px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#FFFFFF",
                      color: "#000000",
                      border: "none",
                      borderRadius: "5px",
                      padding: "0 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Simulate
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Minimal Editorial Footnote */}
        <div style={{ marginTop: "32px", borderTop: "1px solid #1E1E1E", paddingTop: "20px" }}>
          <Link
            to="/"
            style={{
              fontSize: "12px",
              color: "#6B6964",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6964")}
          >
            &larr; Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
