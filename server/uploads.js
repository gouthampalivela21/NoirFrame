import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import {
  getSupabaseAdminClient,
  ATTACHMENTS_TABLE,
  STORAGE_BUCKET,
} from "./supabaseAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// The deployment bundle cannot be written to on Vercel. Use its writable
// temporary directory for local upload fallback files.
const PUBLIC_UPLOADS_DIR = process.env.VERCEL
  ? path.join("/tmp", "phantom-labs-uploads")
  : path.resolve(__dirname, "../public/images/uploads");

if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}

const MAX_NON_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024; // Documents and booking references only.

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.",
];

function isAllowedMime(mime) {
  const m = String(mime || "").toLowerCase();
  if (!m) return false;
  return ALLOWED_MIME_PREFIXES.some((prefix) => m.startsWith(prefix));
}

function sanitizeFilename(name) {
  const base = path.basename(String(name || "attachment"));
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160) || "attachment";
}

/** Create a short-lived, founder-authorized upload slot for an original image. */
export async function createCmsImageUpload({ name, type, size }) {
  const mimeType = String(type || "").trim().toLowerCase();
  if (!mimeType.startsWith("image/")) {
    const err = new Error("Only image uploads are permitted for website media.");
    err.statusCode = 400;
    throw err;
  }
  if (!Number.isFinite(Number(size)) || Number(size) <= 0) {
    const err = new Error("Image size must be greater than zero.");
    err.statusCode = 400;
    throw err;
  }

  const cleanName = sanitizeFilename(name || "image.jpg");
  const ext = path.extname(cleanName) || ".jpg";
  const filename = `img_${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
  const storagePath = `cms/${filename}`;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from("public-media")
    .createSignedUploadUrl(storagePath, { upsert: false });

  if (error || !data?.token || !data?.path) {
    const err = new Error(error?.message || "Could not create a secure image upload link.");
    err.statusCode = 502;
    throw err;
  }

  const { data: publicData } = supabase.storage.from("public-media").getPublicUrl(data.path);
  if (!publicData?.publicUrl) {
    const err = new Error("Supabase did not return a public image URL.");
    err.statusCode = 502;
    throw err;
  }

  return {
    path: data.path,
    token: data.token,
    url: publicData.publicUrl,
    filename,
    mimeType,
    sizeBytes: Number(size),
  };
}

/**
 * Public CMS image upload — saves to public/images/uploads and optionally Supabase storage
 */
export async function saveCmsImage({ name, type, base64Data }) {
  if (!base64Data || typeof base64Data !== "string") {
    const err = new Error("Missing image content.");
    err.statusCode = 400;
    throw err;
  }

  const mimeType = String(type || "image/jpeg").trim().toLowerCase();
  if (!mimeType.startsWith("image/")) {
    const err = new Error("Only image uploads are permitted for website media.");
    err.statusCode = 400;
    throw err;
  }

  const pureBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");

  if (!buffer.length) {
    const err = new Error("Uploaded image is empty.");
    err.statusCode = 400;
    throw err;
  }

  const cleanName = sanitizeFilename(name || "image.jpg");
  const ext = path.extname(cleanName) || ".jpg";
  const uniquePrefix = `img_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const filename = `${uniquePrefix}${ext}`;
  const localFilePath = path.join(PUBLIC_UPLOADS_DIR, filename);

  // Keep the uploaded bytes, format, dimensions, and quality exactly as sent.
  // The file is never resized or recompressed here.
  try {
    const supabase = getSupabaseAdminClient();
    const storagePath = `cms/${filename}`;
    const { error } = await supabase.storage
      .from("public-media")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) throw error;

    const { data } = supabase.storage.from("public-media").getPublicUrl(storagePath);
    if (!data?.publicUrl) throw new Error("Supabase did not return a public image URL.");

    return {
      success: true,
      url: data.publicUrl,
      filename,
      sizeBytes: buffer.length,
      mimeType,
    };
  } catch (storageError) {
    // Vercel's filesystem is temporary. Never return a local URL for a cloud
    // deployment or pretend an image was saved if persistent storage failed.
    if (process.env.VERCEL) {
      const err = new Error("Could not save the original image to Supabase Storage. Check the public-media bucket and server credentials, then try again.");
      err.statusCode = 502;
      throw err;
    }

    // Local development fallback, also preserving the original buffer bytes.
    fs.writeFileSync(localFilePath, buffer);
  }

  return {
    success: true,
    url: `/images/uploads/${filename}`,
    filename,
    sizeBytes: buffer.length,
    mimeType,
  };
}

/**
 * Store client-uploaded reference files in private Supabase Storage (`booking-attachments`)
 * and record metadata in RLS-protected `public.booking_attachments`.
 */
export async function saveUploadedFile({ name, type, size, base64Data, bookingId = null }) {
  if (!base64Data || typeof base64Data !== "string") {
    const err = new Error("Missing file content.");
    err.statusCode = 400;
    throw err;
  }

  const mimeType = String(type || "application/octet-stream").trim().toLowerCase();
  if (!isAllowedMime(mimeType)) {
    const err = new Error("Unsupported file type. Upload images, PDFs, or document files only.");
    err.statusCode = 400;
    throw err;
  }

  const pureBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");

  if (!buffer.length) {
    const err = new Error("Uploaded file is empty.");
    err.statusCode = 400;
    throw err;
  }

  if (!mimeType.startsWith("image/") && buffer.length > MAX_NON_IMAGE_UPLOAD_BYTES) {
    const err = new Error("Document uploads must be 15 MB or smaller.");
    err.statusCode = 413;
    throw err;
  }

  const fileId = `att_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  const cleanName = sanitizeFilename(name);
  const ext = path.extname(cleanName) || ".bin";
  const storagePath = `submissions/${fileId}${ext}`;
  const uploadedAt = new Date().toISOString();

  const supabase = getSupabaseAdminClient();

  // 1. Upload to private Supabase Storage bucket
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    const err = new Error("Failed to store uploaded attachment securely.");
    err.statusCode = 502;
    throw err;
  }

  const humanSize = size || `${(buffer.length / 1024 / 1024).toFixed(2)} MB`;

  // 2. Insert metadata record into RLS-protected booking_attachments table
  const { error: metaError } = await supabase.from(ATTACHMENTS_TABLE).insert({
    id: fileId,
    booking_id: bookingId,
    storage_path: storagePath,
    file_name: cleanName,
    mime_type: mimeType,
    size_bytes: buffer.length,
    uploaded_at: uploadedAt,
  });

  if (metaError) {
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    } catch {}
    const err = new Error("Failed to record attachment metadata.");
    err.statusCode = 502;
    throw err;
  }

  return {
    fileId,
    name: cleanName,
    type: mimeType,
    size: humanSize,
    uploadedAt,
    url: `/api/uploads/${fileId}`,
  };
}

/**
 * Private attachment download — strictly authorized Founder Google identity only.
 */
export async function handleFileDownload(req, res, fileId) {
  try {
    const supabase = getSupabaseAdminClient();

    const { data: fileMeta, error: metaErr } = await supabase
      .from(ATTACHMENTS_TABLE)
      .select("id, storage_path, file_name, mime_type")
      .eq("id", fileId)
      .maybeSingle();

    if (!fileMeta || metaErr) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, error: "Attachment not found." }));
      return;
    }

    const { data: blob, error: dlErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(fileMeta.storage_path);

    if (dlErr || !blob) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, error: "Attachment file unavailable." }));
      return;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader("Content-Type", fileMeta.mime_type || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileMeta.file_name || "attachment")}"`
    );
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(buffer);
  } catch {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: "Unable to retrieve private attachment." }));
  }
}
