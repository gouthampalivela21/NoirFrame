import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#080808",
  border: "1px solid #2A2A2A",
  borderRadius: "8px",
  color: "#FFFFFF",
  padding: "11px 14px",
  fontSize: "13.5px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#8E8D88",
  marginBottom: "6px",
};

export default function AdminInviteAcceptPage() {
  const { token: inviteToken } = useParams();
  const navigate = useNavigate();
  const { acceptInvite } = useAdmin();

  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [inviteInfo, setInviteInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        const res = await fetch(`/api/auth/invite/${encodeURIComponent(inviteToken || "")}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.valid && json.invite) {
          setInviteInfo(json.invite);
          setName(json.invite.name || "");
          setStatus("valid");
        } else {
          setErrorMsg(json.error || "This invitation link is invalid or expired.");
          setStatus("invalid");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || "Could not validate invitation.");
          setStatus("invalid");
        }
      }
    }
    verify();
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await acceptInvite({
        inviteToken,
        name: name.trim(),
        password,
      });
      if (res?.success) {
        navigate("/admin", { replace: true });
      } else {
        setErrorMsg(res?.error || "Could not activate account.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#121212",
          border: "1px solid #222222",
          borderRadius: "14px",
          padding: "42px 36px",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.7)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <img
            src="/images/phantom-labs-logo-white.png"
            alt="PHANTOM LABS"
            style={{ height: "24px", width: "auto", margin: "0 auto", display: "block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "24px 0", fontSize: "13px", color: "#8E8D88" }}>
            Verifying your studio invitation...
          </div>
        )}

        {status === "invalid" && (
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "var(--admin-font-serif, 'Playfair Display', serif)",
                fontSize: "24px",
                fontWeight: 400,
                margin: "0 0 10px",
              }}
            >
              Invitation Unavailable
            </h1>
            <p style={{ fontSize: "13px", color: "#9E9D97", lineHeight: "1.6", margin: "0 0 24px" }}>
              {errorMsg}
            </p>
            <Link
              to="/admin/login"
              style={{
                display: "inline-block",
                width: "100%",
                boxSizing: "border-box",
                background: "#FFFFFF",
                color: "#0A0A0A",
                textDecoration: "none",
                borderRadius: "8px",
                padding: "12px 18px",
                fontSize: "13.5px",
                fontWeight: 600,
              }}
            >
              Go to Studio Sign In
            </Link>
          </div>
        )}

        {status === "valid" && inviteInfo && (
          <div>
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
                  marginBottom: "10px",
                }}
              >
                Team Invitation · {inviteInfo.role}
              </span>
              <h1
                style={{
                  fontFamily: "var(--admin-font-serif, 'Playfair Display', serif)",
                  fontSize: "25px",
                  fontWeight: 400,
                  margin: "0 0 6px",
                }}
              >
                Activate Your Access
              </h1>
              <p style={{ fontSize: "12.5px", color: "#8E8D88", margin: 0, lineHeight: "1.5" }}>
                Invited by {inviteInfo.invitedBy} as{" "}
                <strong style={{ color: "#FFFFFF" }}>{inviteInfo.role}</strong>{" "}
                ({inviteInfo.role === "Admin" ? "manage bookings & enquiries" : "read-only workspace access"}).
              </p>
            </div>

            <div
              style={{
                background: "#181818",
                border: "1px solid #262626",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "12.5px",
                color: "#D4D2CC",
              }}
            >
              <span style={{ color: "#7E7D78", fontSize: "10.5px", display: "block", textTransform: "uppercase" }}>
                Invited Email
              </span>
              <strong>{inviteInfo.email}</strong>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label htmlFor="invite-name" style={labelStyle}>
                  Your Full Name
                </label>
                <input
                  id="invite-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label htmlFor="invite-pass" style={labelStyle}>
                  Set Your Password (8+ characters)
                </label>
                <input
                  id="invite-pass"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label htmlFor="invite-confirm" style={labelStyle}>
                  Confirm Password
                </label>
                <input
                  id="invite-confirm"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {errorMsg && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#FCA5A5",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    marginBottom: "16px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
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
                {isSubmitting ? "Activating Account..." : "Accept Invitation & Sign In"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
