import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { authenticateAdminRequest } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, "uploads");
const META_FILE = path.join(UPLOADS_DIR, "_files_meta.json");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function loadMeta() {
  try {
    if (fs.existsSync(META_FILE)) {
      return JSON.parse(fs.readFileSync(META_FILE, "utf8"));
    }
  } catch {}
  return {};
}

function saveMeta(meta) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), "utf8");
  } catch (e) {
    console.error("[Uploads] Error saving files metadata:", e);
  }
}

/**
 * Save an uploaded file securely. Accepts base64 encoded payload.
 */
export async function saveUploadedFile({ name, type, size, base64Data }) {
  if (!base64Data) {
    throw new Error("Missing file content");
  }

  const fileId = `att_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  const ext = path.extname(name || "") || ".bin";
  const diskFilename = `${fileId}${ext}`;
  const filePath = path.join(UPLOADS_DIR, diskFilename);

  // Strip data URL scheme if present (e.g. data:image/jpeg;base64,...)
  const pureBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");

  fs.writeFileSync(filePath, buffer);

  const fileInfo = {
    fileId,
    name: name || "attachment",
    type: type || "application/octet-stream",
    size: size || `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
    diskFilename,
    uploadedAt: new Date().toISOString(),
    url: `/api/uploads/${fileId}`,
  };

  const meta = loadMeta();
  meta[fileId] = fileInfo;
  saveMeta(meta);

  return fileInfo;
}

/**
 * Handle private file download with server-side authentication check
 */
export async function handleFileDownload(req, res, fileId) {
  // 1. Enforce Server-Side Admin Authentication Check
  const admin = authenticateAdminRequest(req);
  if (!admin) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error: "Unauthorized",
        message: "Access to private client attachments is restricted to authorized studio administrators.",
      })
    );
    return;
  }

  // 2. Lookup metadata
  const meta = loadMeta();
  const fileInfo = meta[fileId];

  if (!fileInfo) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: "File not found" }));
    return;
  }

  const filePath = path.join(UPLOADS_DIR, fileInfo.diskFilename);
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: "File asset missing on disk" }));
    return;
  }

  // 3. Stream file to authenticated admin
  res.statusCode = 200;
  res.setHeader("Content-Type", fileInfo.type || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileInfo.name)}"`);
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}
