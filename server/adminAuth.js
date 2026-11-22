import crypto from "crypto";
import { getFounderEmail, getServerEnv } from "./supabaseAdmin.js";

const CERTIFICATE_URL =
  "https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CERTIFICATE_TIMEOUT_MS = 6000;
let signingCertificates = null;
let certificatesExpireAt = 0;

async function getSigningCertificates() {
  if (signingCertificates && certificatesExpireAt > Date.now()) {
    return signingCertificates;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CERTIFICATE_TIMEOUT_MS);
  try {
    const response = await fetch(CERTIFICATE_URL, { signal: controller.signal });
    if (!response.ok) throw new Error("Unable to load Firebase signing certificates.");

    const certificates = await response.json();
    if (!certificates || typeof certificates !== "object") {
      throw new Error("Firebase signing certificates were invalid.");
    }

    const cacheControl = response.headers.get("cache-control") || "";
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1]) || 300;
    signingCertificates = certificates;
    certificatesExpireAt = Date.now() + maxAge * 1000;
    return signingCertificates;
  } finally {
    clearTimeout(timeout);
  }
}

function decodeJwtPart(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function isConfiguredUid(value) {
  return Boolean(value && !["YOUR_EXACT_FIREBASE_UID", "<MY_ADMIN_UID>"].includes(value));
}

/** Verify a Firebase ID token and enforce the single founder Google account. */
export async function verifyFounderRequest(req) {
  const authorization = String(req.headers?.authorization || "");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return { ok: false, status: 401, error: "Admin sign-in required." };

  const parts = match[1].trim().split(".");
  if (parts.length !== 3) {
    return { ok: false, status: 401, error: "Admin session is invalid or expired." };
  }

  const projectId = getServerEnv("VITE_FIREBASE_PROJECT_ID");
  const founderEmail = getFounderEmail().trim().toLowerCase();
  const configuredUid = getServerEnv("VITE_ADMIN_UID");
  if (!projectId || !founderEmail) {
    return {
      ok: false,
      status: 503,
      error: "Server-side founder authentication is not configured.",
    };
  }

  try {
    const header = decodeJwtPart(parts[0]);
    const claims = decodeJwtPart(parts[1]);
    if (header.alg !== "RS256" || !header.kid) {
      return { ok: false, status: 401, error: "Admin session is invalid or expired." };
    }

    const certificates = await getSigningCertificates();
    const certificate = certificates[header.kid];
    if (!certificate) {
      signingCertificates = null;
      certificatesExpireAt = 0;
      return { ok: false, status: 401, error: "Admin session is invalid or expired." };
    }

    const signedPayload = Buffer.from(`${parts[0]}.${parts[1]}`);
    const signature = Buffer.from(parts[2], "base64url");
    const signatureIsValid = crypto.verify(
      "RSA-SHA256",
      signedPayload,
      crypto.createPublicKey(certificate),
      signature
    );
    if (!signatureIsValid) {
      return { ok: false, status: 401, error: "Admin session is invalid or expired." };
    }

    const now = Math.floor(Date.now() / 1000);
    const email = String(claims.email || "").trim().toLowerCase();
    const uidMatches = !isConfiguredUid(configuredUid) || configuredUid === claims.sub;
    const isValidFirebaseToken =
      claims.aud === projectId &&
      claims.iss === `https://securetoken.google.com/${projectId}` &&
      typeof claims.sub === "string" &&
      claims.sub.length > 0 &&
      Number.isFinite(claims.exp) &&
      claims.exp > now &&
      Number.isFinite(claims.iat) &&
      claims.iat <= now + 60;
    const isAuthorizedFounder =
      isValidFirebaseToken &&
      claims.email_verified === true &&
      email === founderEmail &&
      claims.firebase?.sign_in_provider === "google.com" &&
      uidMatches;

    if (!isAuthorizedFounder) {
      return { ok: false, status: 403, error: "This Google account is not authorized." };
    }

    return { ok: true, user: { uid: claims.sub, email } };
  } catch {
    return {
      ok: false,
      status: 503,
      error: "Unable to verify the admin session right now.",
    };
  }
}
