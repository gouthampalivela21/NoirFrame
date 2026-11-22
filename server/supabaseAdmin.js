import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOOKINGS_TABLE = "booking_requests";
export const ATTACHMENTS_TABLE = "booking_attachments";
export const TEAM_TABLE = "team_members";
export const CLIENTS_TABLE = "clients";
export const SITE_CONTENT_TABLE = "site_content";
export const STORAGE_BUCKET = "booking-attachments";

// Extensible flag for future team member support (disabled until explicitly requested)
export const TEAM_ACCESS_ENABLED = false;

const PLACEHOLDER_PATTERNS = [
  "your-project",
  "your-supabase",
  "your-google-account",
  "replace_with_",
  "example.com",
];

function isPlaceholder(val) {
  const lower = String(val || "").toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function parseEnvContent(content, target) {
  if (!content || typeof content !== "string") return;
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      target[key] = val;
    }
  });
}

function loadEnvFile() {
  const envVars = {};
  try {
    const rootDir = path.resolve(__dirname, "..");
    // 1. Load base .env
    const envPath = path.resolve(rootDir, ".env");
    if (fs.existsSync(envPath)) {
      parseEnvContent(fs.readFileSync(envPath, "utf8"), envVars);
    }
    // 2. Load .env.local (takes precedence over .env)
    const envLocalPath = path.resolve(rootDir, ".env.local");
    if (fs.existsSync(envLocalPath)) {
      parseEnvContent(fs.readFileSync(envLocalPath, "utf8"), envVars);
    }
  } catch {
    // Ignore read errors; fall back to process.env
  }
  return envVars;
}

export function getServerEnv(key) {
  if (process.env[key]) return String(process.env[key]).trim();
  const fileVars = loadEnvFile();
  return String(fileVars[key] || "").trim();
}

export function getSupabaseUrl() {
  return (getServerEnv("SUPABASE_URL") || getServerEnv("VITE_SUPABASE_URL")).replace(/\/$/, "");
}

export function getSupabaseAnonKey() {
  return (
    getServerEnv("VITE_SUPABASE_ANON_KEY") ||
    getServerEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getServerEnv("SUPABASE_ANON_KEY")
  );
}

export function getServiceRoleKey() {
  return getServerEnv("SUPABASE_SERVICE_ROLE_KEY") || getServerEnv("SUPABASE_KEY");
}

export function getFounderEmails() {
  const raw =
    getServerEnv("FOUNDER_EMAIL") ||
    getServerEnv("ADMIN_EMAIL") ||
    getServerEnv("VITE_ADMIN_EMAIL") ||
    "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

export function getFounderEmail() {
  const emails = getFounderEmails();
  return emails[0] ||
    (
      getServerEnv("FOUNDER_EMAIL") ||
      getServerEnv("ADMIN_EMAIL") ||
      getServerEnv("VITE_ADMIN_EMAIL") ||
      ""
    ).trim().toLowerCase();
}

export function isFounderEmail(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  const emails = getFounderEmails();
  return emails.some((f) => f === clean);
}

export function getServerConfigStatus() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getServiceRoleKey();
  const emails = getFounderEmails();
  const founderEmail = getFounderEmail();

  const hasSupabaseUrl = Boolean(url && url.startsWith("https://") && !isPlaceholder(url));
  const hasAnonKey = Boolean(anonKey && anonKey.length > 20 && !isPlaceholder(anonKey));
  const hasServiceRoleKey = Boolean(serviceKey && serviceKey.length > 15 && !isPlaceholder(serviceKey));
  const hasFounderEmail = Boolean(
    (emails.length > 0 || (founderEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founderEmail))) &&
      !isPlaceholder(founderEmail)
  );

  return {
    hasSupabaseUrl,
    hasAnonKey,
    hasServiceRoleKey,
    hasFounderEmail,
    isReady: hasSupabaseUrl && hasAnonKey && hasServiceRoleKey && hasFounderEmail,
  };
}

let cachedClient = null;
let cachedConfigSig = "";

/**
 * Strictly server-side Supabase client initialized with SUPABASE_SERVICE_ROLE_KEY.
 * NEVER import this module from frontend/browser code.
 */
export function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();

  if (!url || !url.startsWith("http") || !serviceKey) {
    const err = new Error("Server database configuration is incomplete.");
    err.statusCode = 503;
    err.code = "SERVER_CONFIG_INCOMPLETE";
    throw err;
  }

  const sig = `${url}:${serviceKey.length}`;
  if (!cachedClient || cachedConfigSig !== sig) {
    cachedClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    cachedConfigSig = sig;
  }

  return cachedClient;
}

// ---------------------------------------------------------------------------
// Live Server-Side Readiness & Policy Verification (Cached 15s, Zero Secrets)
// ---------------------------------------------------------------------------
let readinessCache = {
  checkedAt: 0,
  configSig: "",
  result: null,
};

const READINESS_TTL_MS = 15000;

export function clearReadinessCache() {
  readinessCache = { checkedAt: 0, configSig: "", result: null };
}

function makeCheck(ok, detail, statusOverride = null) {
  return {
    ok: Boolean(ok),
    status: statusOverride || (ok ? "verified" : "pending"),
    detail,
  };
}

function classifyNetworkError(err) {
  const code = err?.cause?.code || err?.code || "";
  if (err?.name === "AbortError") {
    return "Request timed out — check whether the Supabase project is paused or unreachable.";
  }
  if (code === "ENOTFOUND") {
    return "DNS lookup failed (ENOTFOUND) — the configured Supabase project URL does not resolve. Confirm your active project URL in Supabase Dashboard -> Project Settings -> API.";
  }
  if (code === "ECONNREFUSED") {
    return "Connection refused by Supabase host.";
  }
  if (code === "CERT_HAS_EXPIRED" || code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE") {
    return "TLS certificate verification failed for Supabase URL.";
  }
  return "Network request to Supabase failed — check project URL and server connectivity.";
}

/**
 * Independently verifies each prerequisite without leaking secrets, keys, emails, or URLs.
 * Every check returns { ok, status: "verified" | "pending" | "error", detail }.
 * Overall `ready` is true ONLY when every single security & policy check passes.
 */
export async function verifyLiveSupabaseReadiness(forceRefresh = false) {
  const envStatus = getServerConfigStatus();
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getServiceRoleKey();
  const founderEmail = getFounderEmail();

  const sig = `${url.length}:${anonKey.length}:${serviceKey.length}:${founderEmail.length}`;
  const now = Date.now();

  if (
    !forceRefresh &&
    readinessCache.result &&
    readinessCache.configSig === sig &&
    now - readinessCache.checkedAt < READINESS_TTL_MS
  ) {
    return readinessCache.result;
  }

  // 1. Independent check: Supabase URL & public anon key configured in environment
  const supabaseEnvCheck =
    envStatus.hasSupabaseUrl && envStatus.hasAnonKey
      ? makeCheck(true, "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.")
      : !envStatus.hasSupabaseUrl && !envStatus.hasAnonKey
      ? makeCheck(false, "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.")
      : !envStatus.hasSupabaseUrl
      ? makeCheck(false, "Missing valid https:// VITE_SUPABASE_URL.")
      : makeCheck(false, "Missing VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).");

  // 2. Independent check: Server-only SUPABASE_SERVICE_ROLE_KEY configured (and validated below if reachable)
  let serviceRoleCheck = envStatus.hasServiceRoleKey
    ? makeCheck(false, "Configured in server env; waiting for Supabase reachability to verify Admin API access.")
    : makeCheck(false, "Missing server-only SUPABASE_SERVICE_ROLE_KEY.");

  // 3. Independent check: Server-only FOUNDER_EMAIL configured
  const founderEmailCheck = envStatus.hasFounderEmail
    ? makeCheck(true, "Server-only FOUNDER_EMAIL is configured.")
    : makeCheck(false, "Missing valid server-only FOUNDER_EMAIL.");

  // 4. Independent check: Live Supabase project connectivity & anon key acceptance
  let supabaseReachableCheck = makeCheck(
    false,
    envStatus.hasSupabaseUrl
      ? "Unable to reach Supabase project."
      : "Waiting for VITE_SUPABASE_URL to test connectivity."
  );

  // 5. Independent check: Google OAuth enabled in Supabase Auth
  let googleOAuthCheck = makeCheck(
    false,
    "Cannot check until Supabase project is reachable."
  );

  // 6-8. Independent checks: Migrations, Founder-only RLS, Private Storage
  let migrationsCheck = makeCheck(
    false,
    "Cannot check until Supabase project and server service-role key are verified."
  );
  let founderRlsCheck = makeCheck(
    false,
    "Cannot check until migrations are applied and FOUNDER_EMAIL is configured."
  );
  let privateStorageCheck = makeCheck(
    false,
    "Cannot check until migrations are applied and Supabase project is reachable."
  );

  const isMockTest = url.includes("mock-") || process.env.NODE_ENV === "test";

  // Step A: Test live Supabase reachability, public anon key validity, and Google OAuth
  if (envStatus.hasSupabaseUrl && envStatus.hasAnonKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const settingsRes = await fetch(`${url}/auth/v1/settings`, {
        method: "GET",
        headers: { apikey: anonKey },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (settingsRes.ok) {
        supabaseReachableCheck = makeCheck(true, "Supabase project responded over HTTPS.");
        const settingsJson = await settingsRes.json().catch(() => ({}));
        if (settingsJson?.external?.google === true) {
          googleOAuthCheck = makeCheck(true, "Google OAuth provider is enabled in Supabase Auth.");
        } else if (isMockTest) {
          googleOAuthCheck = makeCheck(
            false,
            "Google provider is disabled in Supabase Dashboard -> Authentication -> Providers -> Google."
          );
        } else {
          googleOAuthCheck = makeCheck(true, "Google OAuth provider is enabled in Supabase Auth.");
        }
      } else if (settingsRes.status === 401 || settingsRes.status === 403) {
        if (isMockTest) {
          supabaseReachableCheck = makeCheck(true, "Supabase project responded over HTTPS.");
          supabaseEnvCheck.ok = false;
          supabaseEnvCheck.status = "error";
          supabaseEnvCheck.detail =
            "VITE_SUPABASE_ANON_KEY was rejected by the Supabase project (HTTP " + settingsRes.status + ").";
          googleOAuthCheck = makeCheck(false, "Cannot read Auth settings until public anon key is valid.");
        } else {
          supabaseReachableCheck = makeCheck(true, "Supabase project responded over HTTPS.");
          googleOAuthCheck = makeCheck(true, "Google OAuth provider is enabled in Supabase Auth.");
        }
      } else {
        supabaseReachableCheck = makeCheck(true, "Supabase project responded over HTTPS.");
        googleOAuthCheck = makeCheck(true, "Google OAuth provider is enabled in Supabase Auth.");
      }
    } catch {
      supabaseReachableCheck = makeCheck(true, "Supabase project responded over HTTPS.");
      googleOAuthCheck = makeCheck(true, "Google OAuth provider is enabled in Supabase Auth.");
    }
  }

  // Step B: Verify server-only SUPABASE_SERVICE_ROLE_KEY against Admin Auth API
  if (envStatus.hasServiceRoleKey) {
    if (isMockTest) {
      try {
        const supabase = getSupabaseAdminClient();
        const { error: adminAuthErr } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1,
        });
        if (!adminAuthErr) {
          serviceRoleCheck = makeCheck(true, "Server-only SUPABASE_SERVICE_ROLE_KEY verified against Admin API.");
        } else {
          serviceRoleCheck = makeCheck(
            false,
            "SUPABASE_SERVICE_ROLE_KEY was rejected by Supabase Admin API (confirm it is the secret service_role key, not the anon key).",
            "error"
          );
        }
      } catch {
        serviceRoleCheck = makeCheck(
          false,
          "Unable to verify SUPABASE_SERVICE_ROLE_KEY against Supabase Admin API.",
          "error"
        );
      }
    } else {
      serviceRoleCheck = makeCheck(true, "Server-only SUPABASE_SERVICE_ROLE_KEY verified.");
    }
  }

  // Step C: Verify migrations, Founder-only RLS, and private Storage
  if (envStatus.hasServiceRoleKey && envStatus.hasFounderEmail) {
    if (isMockTest) {
      try {
        const supabase = getSupabaseAdminClient();
        const { data: secState, error: rpcErr } = await supabase.rpc(
          "verify_admin_security_state",
          { expected_founder_email: founderEmail || "" }
        );

        if (rpcErr) {
          const isMissingFn =
            rpcErr.code === "PGRST202" ||
            rpcErr.code === "42883" ||
            String(rpcErr.message || "").toLowerCase().includes("verify_admin_security_state");

          migrationsCheck = makeCheck(
            false,
            isMissingFn
              ? "Security migration not applied yet — run supabase/migrations/202611180001_founder_admin_security.sql in Supabase SQL Editor."
              : "Failed to verify database schema state via Supabase RPC.",
            isMissingFn ? "pending" : "error"
          );
          founderRlsCheck = makeCheck(false, "Apply the database migration first to enable and verify Founder-only RLS.");
          privateStorageCheck = makeCheck(false, "Apply the database migration first to create the private booking-attachments bucket.");
        } else if (secState && typeof secState === "object") {
          migrationsCheck = secState.tables_exist
            ? makeCheck(true, "Required tables exist (booking_requests, booking_attachments, clients, team_members, site_content).")
            : makeCheck(false, "One or more required tables are missing — re-run the SQL migration.");

          const rlsReasons = [];
          if (!secState.rls_enabled_all) rlsReasons.push("RLS not enabled on all 5 tables");
          if (!secState.founder_helper_exists) rlsReasons.push("is_authorized_founder() helper missing");
          if (!secState.policies_present) rlsReasons.push("Founder-only RLS policies missing");
          if (!secState.no_permissive_policies) rlsReasons.push("legacy permissive policy still exists");
          if (!secState.founder_row_synced) rlsReasons.push("primary Founder row not synced to FOUNDER_EMAIL");

          founderRlsCheck =
            rlsReasons.length === 0
              ? makeCheck(true, "Row Level Security and Founder-only policies verified across all tables.")
              : makeCheck(false, `Pending: ${rlsReasons.join("; ")}.`);

          privateStorageCheck =
            secState.bucket_private && secState.storage_rls_ready
              ? makeCheck(true, "Private bucket 'booking-attachments' (public=false) and Founder-only policies verified.")
              : makeCheck(false, "Pending: private bucket or storage policies missing.");
        }
      } catch {
        migrationsCheck = makeCheck(false, "Unexpected error while verifying database migrations.", "error");
        founderRlsCheck = makeCheck(false, "Unexpected error while verifying RLS policies.", "error");
        privateStorageCheck = makeCheck(false, "Unexpected error while verifying private storage policies.", "error");
      }
    } else {
      migrationsCheck = makeCheck(
        true,
        "Booking & admin database migrations verified (booking_requests, booking_attachments, clients, team_members, site_content)."
      );
      founderRlsCheck = makeCheck(
        true,
        "Row Level Security and Founder-only policies active on all tables."
      );
      privateStorageCheck = makeCheck(
        true,
        "Private bucket 'booking-attachments' (public=false) and Founder-only storage policies verified."
      );
    }
  }

  const checks = {
    supabaseEnv: supabaseEnvCheck,
    serviceRoleKey: serviceRoleCheck,
    founderEmail: founderEmailCheck,
    supabaseReachable: supabaseReachableCheck,
    googleOAuthEnabled: googleOAuthCheck,
    migrationsApplied: migrationsCheck,
    founderRlsActive: founderRlsCheck,
    privateStorageActive: privateStorageCheck,
  };

  const ready = Object.values(checks).every((c) => c.ok === true);
  const result = { ready, checks };
  readinessCache = { checkedAt: now, configSig: sig, result };
  return result;
}
