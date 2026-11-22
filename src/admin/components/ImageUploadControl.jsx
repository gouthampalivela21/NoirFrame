import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";

export default function ImageUploadControl({
  label = "Image Media",
  value = "",
  onChange,
  aspectRatio = "16/9",
  helperText,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            base64Data,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            onChange(data.url);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setUploadError(errData.error || "Failed to upload image.");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError("Upload failed. Please check network connectivity.");
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="studio-form-group">
      {label && <label className="studio-form-label">{label}</label>}

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Live Preview Thumbnail */}
        <div
          style={{
            width: "120px",
            aspectRatio: aspectRatio || "16/9",
            backgroundColor: "#FAF9F6",
            border: "1px solid var(--studio-border-crisp)",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {value ? (
            <img
              src={value}
              alt="Media Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div style={{ color: "var(--studio-text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <ImageIcon size={20} />
              <span style={{ fontSize: "10px" }}>No Media</span>
            </div>
          )}

          {isUploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}
        </div>

        {/* Controls: Drag-and-drop & URL input */}
        <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="studio-input studio-mono"
              style={{ fontSize: "12.5px" }}
              placeholder="Paste direct image URL or upload below..."
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            />
            {value && (
              <button
                type="button"
                className="studio-btn-secondary studio-btn-sm"
                onClick={() => onChange("")}
                title="Clear image"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Drag & drop upload trigger */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "10px 14px",
              backgroundColor: dragOver ? "#F3F2ED" : "#FAF9F6",
              border: `1px dashed ${dragOver ? "#111111" : "var(--studio-border-crisp)"}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Upload size={13} style={{ color: "var(--studio-text-secondary)" }} />
            <span style={{ fontSize: "12px", color: "var(--studio-text-secondary)", fontWeight: "500" }}>
              {isUploading ? "Uploading to Cloud..." : "Drag & drop image file or click to browse"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          {helperText && (
            <span style={{ fontSize: "11px", color: "var(--studio-text-muted)" }}>
              {helperText}
            </span>
          )}

          {uploadError && (
            <span style={{ fontSize: "11.5px", color: "#FF3B30" }}>
              {uploadError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
