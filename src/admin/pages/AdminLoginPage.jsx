import React, { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";
import { isSupabaseConfigured } from "../../lib/supabase.js";

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

const inputStyle = (hasError) => ({
  width: "100%",
  boxSizing: "border-box",
  background: "#080808",
  border: hasError ? "1px solid #EF4444" : "1px solid #2A2A2A",
  borderRadius: "8px",
  color: "#FFFFFF",
  padding: "11px 14px",
  fontSize: "13.5px",
  outline: "none",
});

const labelStyle = {
  display: "block",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#8E8D88",
  marginBottom: "6px",
};

export default function AdminLoginPage() {
  const {
    setupStatus,
    setupFounder,
    loginWithCredentials,
    loginWithGoogle,
    isAuthenticated,
    isAuthLoading,
    authError,
    logout,
  } = useAdmin();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  // Standard Sign-In Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // First-Run Founder Setup Form State
  const [setupKey, setSetupKey] = useState("");
  const [founderName, setFounderName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [founderPassword, setFounderPassword] = useState("");
  const [founderConfirm, setFounderConfirm] = useState("");

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const needsSetup = setupStatus.loaded && !setupStatus.founderConfigured;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password) {
      setFormError("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithCredentials(email.trim(), password);
      if (res?.success) {
        navigate(from, { replace: true });
      } else {
        setFormError(res?.error || "Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFounderSetupSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!setupKey.trim()) {
      setFormError("Server Setup Key is required to verify server ownership.");
      return;
    }
    if (!founderName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!founderEmail.trim() || !founderEmail.includes("@")) {
      setFormError("Please enter a valid Founder email address.");
      return;
    }
    if (founderPassword.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }
    if (founderPassword !== founderConfirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setupFounder({
        setupKey: setupKey.trim(),
        name: founderName.trim(),
        email: founderEmail.trim().toLowerCase(),
        password: founderPassword,
      });
      if (res?.success) {
        navigate("/admin", { replace: true });
      } else {
        setFormError(res?.error || "Could not initialize Founder account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueWithGoogle = async () => {
    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await loginWithGoogle();
      if (res?.success && !res?.redirected) {
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissError = async () => {
    await logout();
    setFormError("");
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
          maxWidth: needsSetup ? "470px" : "430px",
          background: "#121212",
          border: "1px solid #222222",
          borderRadius: "14px",
          padding: "42px 36px",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.7)",
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        {/* PHANTOM LABS Official Brand Logo */}
        <div style={{ marginBottom: "26px" }}>
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

        {/* Loading initial setup status */}
        {!setupStatus.loaded ? (
          <div style={{ padding: "28px 0", fontSize: "13px", color: "#8E8D88" }}>
            Checking studio workspace configuration...
          </div>
        ) : authError ? (
          /* ACCESS RESTRICTED SCREEN */
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
                "This account is not authorised to access the PHANTOM LABS studio workspace."}
            </p>

            {authError.email && (
              <div
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #282828",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "22px",
                  fontSize: "12.5px",
                  color: "#CFCBC2",
                }}
              >
                {authError.email}
              </div>
            )}

            <button
              type="button"
              onClick={handleDismissError}
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
              }}
            >
              Return to Sign In
            </button>
          </div>
        ) : needsSetup ? (
          /* SECURE FIRST-RUN FOUNDER SETUP */
          <div style={{ textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#c5a47e",
                  background: "rgba(197, 164, 126, 0.12)",
                  border: "1px solid rgba(197, 164, 126, 0.3)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  marginBottom: "12px",
                }}
              >
                First-Run Studio Setup
              </span>
              <h1
                style={{
                  fontFamily: "var(--admin-font-serif, 'Playfair Display', serif)",
                  fontSize: "26px",
                  fontWeight: 400,
                  margin: "0 0 8px 0",
                  color: "#FFFFFF",
                }}
              >
                Create Founder Account
              </h1>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "#8E8D88",
                  margin: 0,
                  lineHeight: "1.55",
                }}
              >
                No Founder account is configured yet. Enter your server setup key and email to establish the primary Founder account.
              </p>
            </div>

            {!setupStatus.setupKeyConfigured ? (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "10px",
                  padding: "16px",
                  fontSize: "12.5px",
                  color: "#FCA5A5",
                  lineHeight: "1.6",
                }}
              >
                <strong>Setup Key Required on Server</strong>
                <p style={{ margin: "6px 0 0", color: "#E5B8B8" }}>
                  To prevent unauthorized visitors from claiming Founder access, set{" "}
                  <code style={{ color: "#FFFFFF" }}>FOUNDER_SETUP_SECRET</code> in your{" "}
                  <code style={{ color: "#FFFFFF" }}>.env</code> file and reload this page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFounderSetupSubmit}>
                <div style={{ marginBottom: "14px" }}>
                  <label htmlFor="setup-key" style={labelStyle}>
                    Server Setup Key (from .env)
                  </label>
                  <input
                    id="setup-key"
                    type="password"
                    required
                    placeholder="FOUNDER_SETUP_SECRET / ADMIN_ACCESS_KEY"
                    value={setupKey}
                    onChange={(e) => {
                      setSetupKey(e.target.value);
                      if (formError) setFormError("");
                    }}
                    style={inputStyle(Boolean(formError && !setupKey))}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label htmlFor="founder-name" style={labelStyle}>
                    Founder Full Name
                  </label>
                  <input
                    id="founder-name"
                    type="text"
                    required
                    placeholder="e.g. Goutham Palivela"
                    value={founderName}
                    onChange={(e) => {
                      setFounderName(e.target.value);
                      if (formError) setFormError("");
                    }}
                    style={inputStyle(false)}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label htmlFor="founder-email" style={labelStyle}>
                    Founder Email Address
                  </label>
                  <input
                    id="founder-email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={founderEmail}
                    onChange={(e) => {
                      setFounderEmail(e.target.value);
                      if (formError) setFormError("");
                    }}
                    style={inputStyle(false)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  <div>
                    <label htmlFor="founder-pass" style={labelStyle}>
                      Password (8+ chars)
                    </label>
                    <input
                      id="founder-pass"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Create password"
                      value={founderPassword}
                      onChange={(e) => {
                        setFounderPassword(e.target.value);
                        if (formError) setFormError("");
                      }}
                      style={inputStyle(false)}
                    />
                  </div>
                  <div>
                    <label htmlFor="founder-confirm" style={labelStyle}>
                      Confirm Password
                    </label>
                    <input
                      id="founder-confirm"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Repeat password"
                      value={founderConfirm}
                      onChange={(e) => {
                        setFounderConfirm(e.target.value);
                        if (formError) setFormError("");
                      }}
                      style={inputStyle(false)}
                    />
                  </div>
                </div>

                {formError && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      color: "#FCA5A5",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "12px",
                      marginBottom: "16px",
                      lineHeight: "1.45",
                    }}
                  >
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isAuthLoading}
                  style={{
                    width: "100%",
                    background: "#c5a47e",
                    color: "#070707",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 18px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: isSubmitting ? "wait" : "pointer",
                  }}
                >
                  {isSubmitting ? "Creating Founder Account..." : "Initialize Founder Account"}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* STANDARD STUDIO ACCESS (EMAIL + PASSWORD & OPTIONAL GOOGLE OAUTH) */
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
                margin: "0 0 26px 0",
                lineHeight: "1.5",
              }}
            >
              Sign in with your authorized Founder, Admin, or Viewer account.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: "14px" }}>
                <label htmlFor="admin-email" style={labelStyle}>
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@phantomlabs.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError("");
                  }}
                  style={inputStyle(Boolean(formError))}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label htmlFor="admin-password" style={labelStyle}>
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError("");
                  }}
                  style={inputStyle(Boolean(formError))}
                />
              </div>

              {formError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#FCA5A5",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    marginBottom: "16px",
                    lineHeight: "1.45",
                  }}
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  color: "#0A0A0A",
                  border: "none",
                  borderRadius: "9px",
                  padding: "12.5px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isSubmitting || isAuthLoading ? "wait" : "pointer",
                  transition: "opacity 0.2s ease",
                }}
              >
                {isSubmitting || isAuthLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {isSupabaseConfigured && (
              <>
                <div style={{ margin: "22px 0 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "#222222" }} />
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    or
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#222222" }} />
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || isAuthLoading}
                  onClick={handleContinueWithGoogle}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "transparent",
                    color: "#E5E4DF",
                    border: "1px solid #2A2A2A",
                    borderRadius: "9px",
                    padding: "11px 18px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: isSubmitting || isAuthLoading ? "wait" : "pointer",
                  }}
                >
                  <GoogleIcon size={17} />
                  <span>Continue with Google</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Minimal Editorial Footnote */}
        <div style={{ marginTop: "30px", borderTop: "1px solid #1E1E1E", paddingTop: "18px" }}>
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
