import React, { Component } from "react";

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[PhantomLabs Admin Error]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F7F6F3",
            padding: "24px",
            fontFamily: "var(--admin-font-sans, sans-serif)",
            color: "#151515",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "#FFFFFF",
              border: "1px solid #DEDDD9",
              borderRadius: "12px",
              padding: "36px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--admin-font-serif, serif)",
                fontSize: "24px",
                marginBottom: "8px",
              }}
            >
              Dashboard Rendering Notice
            </div>
            <p style={{ fontSize: "13.5px", color: "#777571", marginBottom: "20px", lineHeight: "1.5" }}>
              An unexpected condition occurred while rendering this studio module. Your data remains safe.
            </p>

            {this.state.error && (
              <pre
                style={{
                  background: "#F9F8F6",
                  border: "1px solid #EAE9E5",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#B91C1C",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "24px",
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: "#151515",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Reload Dashboard
              </button>
              <a
                href="/admin/login"
                style={{
                  background: "transparent",
                  color: "#151515",
                  border: "1px solid #DEDDD9",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  textDecoration: "none",
                  display: "inline-block",
                  fontWeight: 500,
                }}
              >
                Return to Login
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

