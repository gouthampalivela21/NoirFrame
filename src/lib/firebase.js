import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Safe environment resolver for Vite and SSR/Node runtimes
const getEnv = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  return {};
};

const env = getEnv();

// Production Firebase Configuration
// Environment variables are loaded securely via Vite (VITE_*)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_KEY_FOR_DEV_BUILD",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "phantom-labs-studio.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "phantom-labs-studio",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "phantom-labs-studio.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

// Initialize Firebase App singleton safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Strict Single-Owner Security Credentials
export const ADMIN_UID =
  env.VITE_ADMIN_UID ||
  env.NEXT_PUBLIC_ADMIN_UID ||
  "YOUR_EXACT_FIREBASE_UID";

const rawAdminEmails =
  env.VITE_ADMIN_EMAIL ||
  env.FOUNDER_EMAIL ||
  "founder@phantomlabs.in,gouthampalivela21@gmail.com,gouthampalivela26@gmail.com";

export const ALLOWED_ADMIN_EMAILS = rawAdminEmails
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAIL = ALLOWED_ADMIN_EMAILS[0] || "founder@phantomlabs.in";

/**
 * Validates whether the given user object matches the designated single-owner admin.
 * Requires:
 * 1. user !== null
 * 2. user.emailVerified === true
 * 3. user.uid === ADMIN_UID (or user.email is in ALLOWED_ADMIN_EMAILS)
 */
export function isAuthorizedOwner(user) {
  if (!user) return false;

  // Strict email verification check
  const isEmailVerified = user.emailVerified === true;
  if (!isEmailVerified) return false;

  const matchesUid =
    Boolean(ADMIN_UID) &&
    ADMIN_UID !== "YOUR_EXACT_FIREBASE_UID" &&
    ADMIN_UID !== "<MY_ADMIN_UID>" &&
    user.uid === ADMIN_UID;

  const userEmail = String(user.email || "").toLowerCase().trim();
  const matchesEmail = ALLOWED_ADMIN_EMAILS.includes(userEmail);

  // If ADMIN_UID is explicitly configured with a real UID, check UID match
  if (ADMIN_UID && ADMIN_UID !== "YOUR_EXACT_FIREBASE_UID" && ADMIN_UID !== "<MY_ADMIN_UID>") {
    return matchesUid || matchesEmail;
  }

  return matchesEmail;
}
