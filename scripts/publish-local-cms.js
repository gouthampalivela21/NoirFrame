import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdminClient, SITE_CONTENT_TABLE } from "../server/supabaseAdmin.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localCmsPath = path.join(root, "server", "data", "cms.json");
const localUploadsDir = path.join(root, "public", "images", "uploads");
const publish = process.argv.includes("--publish");

const mimeByExtension = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function collectUploadPaths(value, found = new Set()) {
  if (typeof value === "string") {
    const match = value.match(/^\/images\/uploads\/([a-zA-Z0-9._-]+)$/);
    if (match) found.add(match[1]);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectUploadPaths(item, found));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectUploadPaths(item, found));
  }
  return found;
}

function replaceUploadPaths(value, urls) {
  if (typeof value === "string") return urls.get(value) || value;
  if (Array.isArray(value)) return value.map((item) => replaceUploadPaths(item, urls));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceUploadPaths(child, urls)]));
  }
  return value;
}

async function main() {
  if (!publish) {
    throw new Error("This command publishes a local snapshot to the live CMS. Re-run with --publish to confirm.");
  }

  const localCms = JSON.parse(await fs.readFile(localCmsPath, "utf8"));
  const filenames = [...collectUploadPaths(localCms)];
  const files = await Promise.all(filenames.map(async (filename) => {
    const filePath = path.join(localUploadsDir, filename);
    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat?.isFile()) throw new Error(`Local CMS image is missing: ${filename}`);
    return { filename, filePath, bytes: await fs.readFile(filePath) };
  }));

  const supabase = getSupabaseAdminClient();
  const { data: liveRow, error: readError } = await supabase
    .from(SITE_CONTENT_TABLE)
    .select("id, data, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (readError) throw new Error(`Could not read the current live CMS: ${readError.message}`);

  if (liveRow?.data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(root, "server", "data", `cms-live-backup-${timestamp}.json`);
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(liveRow, null, 2), "utf8");
    console.log(`Backed up the previous live CMS to server/data/${path.basename(backupPath)}.`);
  }

  const uploadedUrls = new Map();
  for (const file of files) {
    const ext = path.extname(file.filename).toLowerCase();
    const contentType = mimeByExtension[ext];
    if (!contentType) throw new Error(`Unsupported local CMS image format: ${ext || "unknown"}`);
    const storagePath = `cms/${file.filename}`;
    const { error } = await supabase.storage.from("public-media").upload(storagePath, file.bytes, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(`Could not upload ${file.filename}: ${error.message}`);
    const { data } = supabase.storage.from("public-media").getPublicUrl(storagePath);
    if (!data?.publicUrl) throw new Error(`Could not create a public URL for ${file.filename}.`);
    uploadedUrls.set(`/images/uploads/${file.filename}`, data.publicUrl);
  }

  const cmsForProduction = replaceUploadPaths(localCms, uploadedUrls);
  const { error: publishError } = await supabase.from(SITE_CONTENT_TABLE).upsert({
    id: 1,
    data: cmsForProduction,
    updated_at: new Date().toISOString(),
  });
  if (publishError) throw new Error(`Could not publish local CMS content: ${publishError.message}`);

  console.log(`Published the local CMS snapshot and ${files.length} uploaded image(s) to the shared Supabase project.`);
  console.log("Reload noirframe.in to see the same CMS content as localhost.");
}

main().catch((error) => {
  console.error(`[CMS publish failed] ${error.message}`);
  process.exitCode = 1;
});
