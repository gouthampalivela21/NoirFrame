import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getMemberById,
  getMemberByEmail,
  sanitizeMember,
} from "./teamDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lightweight zero-dependency .env loader for local Node / Vite dev server
function loadEnvFile() {
  const envVars = {};
  try {
    const envPath = path.resolve(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          envVars[key] = val;
        }
      });
    }
  } catch (e) {
    console.warn("[Auth] Could not load .env file:", e.message);
  }
  return envVars;
}

export function getEnv(key) {
  if (process.env[key]) return process.env[key].trim();
  const fileVars = loadEnvFile();
  return (fileVars[key] || "").trim();
}

function getJwtSecret() {
  const secret = getEnv("ADMIN_JWT_SECRET");
  if (secret) return secret;
  // Ephemeral fallback per process if not configured in env
  return crypto.createHash("sha256").update(process.cwd() + "_phantom_jwt").digest("hex");
}

/**
 * First-run bootstrap secret used ONLY to authorize initial Founder account creation.
 * Never hardcoded in source; must be configured in environment (.env).
 */
export function getFounderSetupSecret() {
  return getEnv("FOUNDER_SETUP_SECRET") || getEnv("ADMIN_ACCESS_KEY") || "";
}

/**
 * Optional pinned Founder email from environment (.env).
 * If omitted, the first-run setup UI prompts the Founder to enter their email.
 */
export function getConfiguredFounderEmail() {
  return getEnv("FOUNDER_EMAIL").toLowerCase();
}

export function safeEqual(a, b) {
  if (!a || !b || typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyFounderSetupSecret(submittedKey) {
  const expected = getFounderSetupSecret();
  if (!expected) return false;
  return safeEqual(String(submittedKey || "").trim(), expected);
}

export function generateToken(member) {
  const secret = getJwtSecret();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      id: member.id,
      email: String(member.email || "").toLowerCase(),
      name: member.name,
      role: member.role,
      status: member.status || "Active",
      isPrimaryFounder: Boolean(member.isPrimaryFounder),
      tokenVersion: member.tokenVersion || 1,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14-day session
    })
  ).toString("base64url");

  const sigData = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(sigData).digest("base64url");
  return `${sigData}.${signature}`;
}

function extractTokenFromRequest(req) {
  const authHeader = req.headers?.authorization || req.headers?.["x-admin-token"];
  if (authHeader) {
    return String(authHeader).replace(/^Bearer\s+/i, "").trim();
  }
  if (req.query?.token) {
    return String(req.query.token).trim();
  }
  return null;
}

/**
 * Verify JWT signature, expiration, and LIVE team database status/role/tokenVersion.
 * Returns { user, error, statusCode } for granular 401 vs 403 enforcement.
 */
export function verifyTokenDetailed(token, allowedRoles = null) {
  if (!token || typeof token !== "string") {
    return { user: null, statusCode: 401, error: "Authentication required." };
  }
  const cleanToken = token.replace(/^Bearer\s+/i, "").trim();

  try {
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      return { user: null, statusCode: 401, error: "Malformed session token." };
    }
    const [header, payload, signature] = parts;
    const sigData = `${header}.${payload}`;

    const secret = getJwtSecret();
    const expectedSig = crypto.createHmac("sha256", secret).update(sigData).digest("base64url");

    if (!safeEqual(signature, expectedSig)) {
      return { user: null, statusCode: 401, error: "Invalid session signature." };
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return { user: null, statusCode: 401, error: "Session has expired. Please sign in again." };
    }

    // LIVE database lookup: enforces immediate role updates and access revocation
    const liveMember = getMemberById(decoded.id) || getMemberByEmail(decoded.email);
    if (!liveMember) {
      return {
        user: null,
        statusCode: 401,
        error: "Your studio account no longer exists or access has been removed.",
      };
    }

    if (liveMember.status !== "Active") {
      return {
        user: null,
        statusCode: 401,
        error: "Your access to the studio workspace has been revoked or is not active.",
      };
    }

    if ((decoded.tokenVersion || 1) !== (liveMember.tokenVersion || 1)) {
      return {
        user: null,
        statusCode: 401,
        error: "Session was invalidated. Please sign in again.",
      };
    }

    const liveUser = sanitizeMember(liveMember);

    if (allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(liveUser.role)) {
        return {
          user: liveUser,
          forbidden: true,
          statusCode: 403,
          error: `Permission denied. This action requires ${roles.join(" or ")} privileges (your role: ${liveUser.role}).`,
        };
      }
    }

    return { user: liveUser, statusCode: 200, error: null };
  } catch {
    return { user: null, statusCode: 401, error: "Invalid or corrupted session token." };
  }
}

export function verifyToken(token, allowedRoles = null) {
  const result = verifyTokenDetailed(token, allowedRoles);
  if (!result.user || result.forbidden || result.statusCode !== 200) {
    return null;
  }
  return result.user;
}

export function authenticateAdminRequest(req, allowedRoles = null) {
  const token = extractTokenFromRequest(req);
  return verifyToken(token, allowedRoles);
}

export function authenticateRequestDetailed(req, allowedRoles = null) {
  const token = extractTokenFromRequest(req);
  return verifyTokenDetailed(token, allowedRoles);
}
