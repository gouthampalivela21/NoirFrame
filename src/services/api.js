import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const CONTENT_TABLE = "site_content";
const STORAGE_KEY = "phantom_labs_cms_v1";
const CACHE_TTL_MS = 30000; // 30-second fresh in-memory cache

let detectedColumn = "data";
let inFlightFetch = null;
let memoryCache = {
  data: null,
  timestamp: 0,
};

/**
 * Fetch published CMS content with:
 * 1. Immediate in-memory cache check (zero network delay)
 * 2. In-flight promise deduplication (prevents parallel duplicate calls)
 * 3. Supabase Cloud Database (Primary source of truth)
 * 4. Local Storage Cache (Instant fallback when offline)
 */
export function fetchPublishedContent(forceRefresh = false) {
  const now = Date.now();

  // Return in-memory cache if still fresh and not force-refreshed
  if (!forceRefresh && memoryCache.data && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return Promise.resolve({
      success: true,
      data: memoryCache.data,
      source: "memory-cache",
    });
  }

  // Deduplicate in-flight network requests
  if (inFlightFetch) {
    return inFlightFetch;
  }

  const promise = (async () => {
    // 1. Supabase Cloud Database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from(CONTENT_TABLE)
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const candidates = [detectedColumn, "data", "content", "json", "payload", "value", "site_data", "body"];
          for (const col of candidates) {
            if (data[col] && typeof data[col] === "object" && Object.keys(data[col]).length > 0) {
              detectedColumn = col;
              memoryCache = { data: data[col], timestamp: Date.now() };
              return {
                success: true,
                data: data[col],
                source: "supabase",
                updatedAt: data.updated_at,
              };
            }
          }

          if (data.siteSettings || data.portfolioItems || data.aboutData) {
            memoryCache = { data, timestamp: Date.now() };
            return {
              success: true,
              data,
              source: "supabase",
              updatedAt: data.updated_at,
            };
          }
        }
      } catch (e) {
        console.warn("[CMS] Supabase fetch exception:", e.message);
      }
    }

    // 2. Local Storage Cache (Fallback when offline or during initial boot)
    try {
      if (typeof localStorage !== "undefined") {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            memoryCache = { data: parsed, timestamp: Date.now() };
            return {
              success: true,
              data: parsed,
              source: "local-cache",
            };
          }
        }
      }
    } catch (e) {}

    return { success: false, data: null };
  })();

  inFlightFetch = promise;
  promise.finally(() => {
    if (inFlightFetch === promise) {
      inFlightFetch = null;
    }
  });

  return inFlightFetch;
}

/**
 * Save published CMS content to Supabase site_content table
 * and update both in-memory and localStorage caches synchronously.
 */
export async function savePublishedContent(data, token) {
  // 1. Instantly update in-memory cache and localStorage (optimistic)
  memoryCache = { data, timestamp: Date.now() };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}

  let savedToRemote = false;

  // 2. Supabase Cloud Database (Primary persistent storage)
  if (isSupabaseConfigured && supabase) {
    const columnCandidates = [
      detectedColumn,
      "data",
      "content",
      "json",
      "payload",
      "value",
      "site_data",
      "body",
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const col of columnCandidates) {
      if (savedToRemote) break;

      try {
        const payload = {
          id: 1,
          [col]: data,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from(CONTENT_TABLE)
          .upsert(payload, { onConflict: "id" });

        if (!error) {
          savedToRemote = true;
          detectedColumn = col;
          break;
        } else {
          // Retry with string primary key id: "1"
          const { error: textErr } = await supabase
            .from(CONTENT_TABLE)
            .upsert({ ...payload, id: "1" }, { onConflict: "id" });

          if (!textErr) {
            savedToRemote = true;
            detectedColumn = col;
            break;
          }
        }
      } catch (e) {}
    }
  }

  return {
    success: true,
    data,
    savedToRemote,
    message: savedToRemote ? "Content successfully published to database." : "Saved to local cache.",
  };
}
