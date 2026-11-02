import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
export const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith("http")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Fast reachability preflight check to verify that the Supabase host exists in DNS
 * and responds to HTTPS connections before initiating browser OAuth redirects.
 */
export async function checkSupabaseHealth(timeoutMs = 3000) {
  if (!isSupabaseConfigured || !supabaseUrl) {
    return { ok: false, error: "Supabase URL is not configured." };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Ping health endpoint with no-cors so cross-origin checks succeed
    await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: "GET",
      signal: controller.signal,
      mode: "no-cors",
    });
    clearTimeout(timer);
    return { ok: true };
  } catch (err) {
    const hostname = supabaseUrl.replace(/^https?:\/\//, "").split("/")[0];
    return {
      ok: false,
      hostname,
      error: err.name === "AbortError" ? "Connection timed out." : err.message || "Host unreachable",
    };
  }
}
