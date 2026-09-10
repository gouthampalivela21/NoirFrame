import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const CONTENT_TABLE = "site_content";
const STORAGE_KEY = "noir_frame_cms_v1";

let detectedColumn = "data";

/**
 * Fetch published CMS content
 * Priority: Supabase Cloud Database -> Local Storage Cache -> Code Defaults
 */
export async function fetchPublishedContent() {
  // 1. Supabase Cloud Database (Primary source of truth)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(CONTENT_TABLE)
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const candidates = ["data", "content", "json", "payload", "value", "site_data", "body"];
        for (const col of candidates) {
          if (data[col] && typeof data[col] === "object" && Object.keys(data[col]).length > 0) {
            detectedColumn = col;
            return {
              success: true,
              data: data[col],
              source: "supabase",
              updatedAt: data.updated_at,
            };
          }
        }

        if (data.siteSettings || data.portfolioItems || data.aboutData) {
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
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        return {
          success: true,
          data: parsed,
          source: "local-cache",
        };
      }
    }
  } catch (e) {}

  return { success: false, data: null };
}

/**
 * Save published CMS content to Supabase site_content table
 * and update the localStorage cache.
 */
export async function savePublishedContent(data, token) {
  let savedToRemote = false;
  let remoteError = null;

  // 1. Supabase Cloud Database (Primary persistent storage)
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
          remoteError = error.message;

          // Retry with string primary key id: "1"
          const { error: textErr } = await supabase
            .from(CONTENT_TABLE)
            .upsert({ ...payload, id: "1" }, { onConflict: "id" });

          if (!textErr) {
            savedToRemote = true;
            detectedColumn = col;
            break;
          } else {
            remoteError = textErr.message || error.message;
          }
        }
      } catch (e) {
        remoteError = e.message;
      }
    }
  }

  // 2. Always update local storage cache immediately
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}

  if (savedToRemote) {
    return {
      success: true,
      data,
      savedToRemote: true,
      message: "Content successfully published to database.",
    };
  }

  return {
    success: true,
    data,
    savedToRemote: false,
    localSaved: true,
    message: "Saved locally (Supabase offline).",
  };
}
