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
  objectPosition = "50% 50%",
  cropZoom = 1,
  onCropChange,
}) {
  const imageUrl = typeof value === "string" ? value : (typeof value?.src === "string" ? value.src : typeof value?.url === "string" ? value.url : typeof value?.src?.src === "string" ? value.src.src : "");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isCropDragging, setIsCropDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cropStageRef = useRef(null);
  const cropPointerRef = useRef(null);
  const [cropXValue, cropYValue] = String(objectPosition || "50% 50%").split(/\s+/);
  const parsedCropX = Number.parseFloat(cropXValue);
  const parsedCropY = Number.parseFloat(cropYValue);
  const cropX = Number.isFinite(parsedCropX) ? parsedCropX : 50;
  const cropY = Number.isFinite(parsedCropY) ? parsedCropY : 50;
  const updateCrop = (next) => onCropChange?.({ objectPosition: `${next.x ?? cropX}% ${next.y ?? cropY}%`, cropZoom: next.zoom ?? cropZoom });
  const beginCropDrag = (event) => {
    if (!imageUrl || !onCropChange || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    cropPointerRef.current = { x: event.clientX, y: event.clientY };
    setIsCropDragging(true);
  };
  const moveCrop = (event) => {
    const previous = cropPointerRef.current;
    const bounds = cropStageRef.current?.getBoundingClientRect();
    if (!previous || !bounds) return;
    cropPointerRef.current = { x: event.clientX, y: event.clientY };
    updateCrop({
      x: Math.max(0, Math.min(100, cropX - ((event.clientX - previous.x) / bounds.width) * 100)),
      y: Math.max(0, Math.min(100, cropY - ((event.clientY - previous.y) / bounds.height) * 100)),
    });
  };
  const endCropDrag = (event) => {
    cropPointerRef.current = null;
    setIsCropDragging(false);
    if (event?.currentTarget?.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

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
          ref={cropStageRef}
          onPointerDown={beginCropDrag}
          onPointerMove={moveCrop}
          onPointerUp={endCropDrag}
          onPointerCancel={endCropDrag}
          title={onCropChange && imageUrl ? "Drag the image to adjust its crop" : undefined}
          style={{
            width: "min(100%, 280px)",
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
            cursor: onCropChange && imageUrl ? (isCropDragging ? "grabbing" : "grab") : "default",
            touchAction: onCropChange && imageUrl ? "none" : "auto",
            userSelect: "none",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Drag to reframe image crop"
              draggable="false"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, transform: `scale(${cropZoom || 1})`, transformOrigin: objectPosition, pointerEvents: "none" }}
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

          {imageUrl && onCropChange && !isUploading && (
            <div style={{ position: "absolute", left: 8, bottom: 8, padding: "5px 8px", borderRadius: 99, background: "rgba(15,15,15,.72)", color: "white", fontSize: 10, letterSpacing: ".01em", pointerEvents: "none" }}>
              {isCropDragging ? "Reframing…" : "Drag to reframe"}
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
              value={imageUrl}
              onChange={(e) => {
                setUploadError("");
                onChange(e.target.value);
              }}
            />
            {imageUrl && (
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

          {onCropChange && imageUrl && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", padding: "10px 12px", border: "1px solid var(--studio-border-crisp)", borderRadius: "8px", background: "#fff" }}>
              <label style={{ display: "grid", gap: "4px", fontSize: "10px", color: "var(--studio-text-muted)" }}>
                Crop left / right <span style={{ color: "var(--studio-text-primary)" }}>{Math.round(cropX)}%</span>
                <input type="range" min="0" max="100" value={cropX} onChange={(e) => updateCrop({ x: Number(e.target.value) })} aria-label={`${label} crop horizontal position`} />
              </label>
              <label style={{ display: "grid", gap: "4px", fontSize: "10px", color: "var(--studio-text-muted)" }}>
                Crop top / bottom <span style={{ color: "var(--studio-text-primary)" }}>{Math.round(cropY)}%</span>
                <input type="range" min="0" max="100" value={cropY} onChange={(e) => updateCrop({ y: Number(e.target.value) })} aria-label={`${label} crop vertical position`} />
              </label>
              <label style={{ display: "grid", gap: "4px", fontSize: "10px", color: "var(--studio-text-muted)" }}>
                Zoom <span style={{ color: "var(--studio-text-primary)" }}>{Number(cropZoom || 1).toFixed(1)}×</span>
                <input type="range" min="1" max="2.5" step="0.05" value={cropZoom || 1} onChange={(e) => updateCrop({ zoom: Number(e.target.value) })} aria-label={`${label} crop zoom`} />
              </label>
            </div>
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
