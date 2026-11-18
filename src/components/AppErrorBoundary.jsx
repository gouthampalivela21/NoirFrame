import React, { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[PhantomLabs Root Error]", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
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
            background: "#0A0A0A",
            padding: "24px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: "#FFFFFF",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "#121212",
              border: "1px solid #222222",
              borderRadius: "14px",
              padding: "44px 36px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
              textAlign: "center",
            }}
          >
            {/* PHANTOM LABS Logo */}
            <div style={{ marginBottom: "28px" }}>
              <img
                src="/images/phantom-labs-logo-white.png"
                alt="PHANTOM LABS"
                style={{
                  height: "22px",
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

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "26px",
                fontWeight: 500,
                letterSpacing: "0.02em",
                marginBottom: "10px",
                color: "#FFFFFF",
              }}
            >
              Application Notice
            </h1>

            <p
              style={{
                fontSize: "13.5px",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.6",
                marginBottom: "28px",
              }}
            >
              An unexpected condition interrupted the page view. Your data and studio settings are completely safe.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: "#FFFFFF",
                  color: "#000000",
                  border: "none",
                  padding: "11px 22px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  background: "transparent",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "11px 22px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)")}
              >
                Return Home
              </button>
            </div>

            {this.state.error && (
              <div style={{ marginTop: "24px", textAlign: "left" }}>
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {this.state.showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
                </button>

                {this.state.showDetails && (
                  <pre
                    style={{
                      marginTop: "10px",
                      background: "#080808",
                      border: "1px solid #222222",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "#F87171",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {this.state.error.message || String(this.state.error)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

