import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import { adminApiFetch } from "../auth/adminApi.js";
import { supabase } from "../../lib/supabase.js";

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

  const makeDeliveryImage = async (file) => {
    if (file.type === "image/svg+xml" || file.type === "image/gif") return null;
    if (typeof createImageBitmap !== "function") return null;
    const bitmap = await createImageBitmap(file);
    try {
      const maxEdge = 2560;
      if (Math.max(bitmap.width, bitmap.height) <= maxEdge && file.size <= 2 * 1024 * 1024) return null;
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return null;
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.92));
      if (!blob || blob.size >= file.size) return null;
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-web.webp`, { type: "image/webp", lastModified: Date.now() });
    } finally {
      bitmap.close?.();
    }
  };

  const uploadToCloud = async (file) => {
    const linkResponse = await adminApiFetch("/api/admin/image-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
    });
    const upload = await linkResponse.json().catch(() => ({}));
    if (!linkResponse.ok) throw new Error(upload.error || "Could not prepare the image upload.");
    const { error } = await supabase.storage.from("public-media").uploadToSignedUrl(upload.path, upload.token, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    return upload.url;
  };

  const uploadViaApi = async (file) => {
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read the selected image."));
      reader.readAsDataURL(file);
    });
    const res = await adminApiFetch("/api/admin/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type, base64Data }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to upload image.");
    return data.url;
  };

  const uploadImage = async (file) => {
    if (!supabase?.storage) return uploadViaApi(file);

    try {
      return await uploadToCloud(file);
    } catch (cloudError) {
      // Safari can report a generic "Load failed" for direct Storage uploads.
      // Retry through our authenticated server API, which writes to the same
      // Supabase bucket and avoids a browser-to-Storage network dependency.
      try {
        return await uploadViaApi(file);
      } catch (apiError) {
        throw new Error(apiError.message || cloudError.message || "Image upload failed. Please try again.");
      }
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      // Preserve the exact upload as the master; use a separate responsive WebP for the public site.
      const originalUrl = await uploadImage(file);
      let deliveryUrl = originalUrl;
      try {
        const deliveryFile = await makeDeliveryImage(file);
        if (deliveryFile) deliveryUrl = await uploadImage(deliveryFile);
      } catch (deliveryError) {
        console.warn("Could not create a lighter delivery image; using the original.", deliveryError);
      }
      if (deliveryUrl) onChange(deliveryUrl, { originalUrl });
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please check network connectivity.");
    } finally {
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
              onChange={(e) => {
                setUploadError("");
                onChange(e.target.value);
              }}
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
