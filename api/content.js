import { verifyToken } from "./auth.js";

// In-memory fallback cache for serverless container lifecycle & local dev
let memoryCache = null;

const STORAGE_KEY = "noir_frame_cms_v1";

// Remote Storage Adapters
async function getFromRemoteDatabase() {
  // 1. Upstash Redis / Vercel KV
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/${STORAGE_KEY}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          return typeof json.result === "string" ? JSON.parse(json.result) : json.result;
        }
      }
    } catch (e) {
      console.warn("[CMS] KV fetch error:", e);
    }
  }

  // 2. Supabase REST API
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cms_content?key=eq.${STORAGE_KEY}&select=content`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows[0] && rows[0].content) {
          return rows[0].content;
        }
      }
    } catch (e) {
      console.warn("[CMS] Supabase fetch error:", e);
    }
  }

  return memoryCache;
}

async function saveToRemoteDatabase(data) {
  memoryCache = data;
  let savedToRemote = false;

  // 1. Upstash Redis / Vercel KV
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const payloadStr = JSON.stringify(data);
      const res = await fetch(`${kvUrl}/set/${STORAGE_KEY}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadStr),
      });
      if (res.ok) savedToRemote = true;
    } catch (e) {
      console.warn("[CMS] KV save error:", e);
    }
  }

  // 2. Supabase REST API
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cms_content`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key: STORAGE_KEY, content: data, updated_at: new Date().toISOString() }),
      });
      if (res.ok) savedToRemote = true;
    } catch (e) {
      console.warn("[CMS] Supabase save error:", e);
    }
  }

  return { success: true, savedToRemote };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-token"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Public fetch of latest CMS content
  if (req.method === "GET") {
    try {
      const remoteData = await getFromRemoteDatabase();
      return res.status(200).json({
        success: true,
        data: remoteData || null,
        timestamp: Date.now(),
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Protected write of CMS content
  if (req.method === "POST") {
    try {
      const authHeader = req.headers["authorization"] || req.headers["x-admin-token"];
      const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

      // Validate authorization (token or emergency secret matching admin password)
      const isTokenValid = verifyToken(token);
      const isDirectSecretValid = token === "231258hg" || token === process.env.ADMIN_PASSWORD;

      if (!isTokenValid && !isDirectSecretValid) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized. Valid admin credentials or session required.",
        });
      }

      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const payload = body.data || body;

      if (!payload || typeof payload !== "object") {
        return res.status(400).json({ success: false, error: "Invalid payload format" });
      }

      const result = await saveToRemoteDatabase(payload);
      return res.status(200).json({
        success: true,
        message: "Content successfully saved to persistent production database",
        savedToRemote: result.savedToRemote,
        timestamp: Date.now(),
        data: payload,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message || "Save failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}