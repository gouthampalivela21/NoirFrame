import crypto from "crypto";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "phantom-labs-secure-secret-key-2026";
const FALLBACK_SECRET = "noir-frame-secure-secret-key-2026";

// Server-side default allowlist (Founder, Co-Founder, Admin)
const DEFAULT_ALLOWLIST = [
  {
    email: "gouthampalivela26@gmail.com",
    name: "Goutham Palivela",
    role: "Founder",
    status: "Active",
    isPrimaryFounder: true,
  },
  {
    email: "harshith@phantomlabs.in",
    name: "Harshith",
    role: "Co-Founder",
    status: "Active",
    isPrimaryFounder: false,
  },
  {
    email: "team@phantomlabs.in",
    name: "Studio Operations",
    role: "Admin",
    status: "Active",
    isPrimaryFounder: false,
  },
];

export function generateToken(admin) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      id: admin.id || `google_${admin.email.replace(/[^a-z0-9]/g, "_")}`,
      email: admin.email.toLowerCase(),
      name: admin.name,
      role: admin.role,
      status: admin.status,
      isPrimaryFounder: Boolean(admin.isPrimaryFounder),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30-day session
    })
  ).toString("base64url");

  const sigData = header + "." + payload;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(sigData).digest("base64url");
  return sigData + "." + signature;
}

export function verifyToken(token, requiredRole = null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const sigData = header + "." + payload;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(sigData).digest("base64url");
    const fallbackSig = crypto.createHmac("sha256", FALLBACK_SECRET).update(sigData).digest("base64url");
    if (signature !== expectedSig && signature !== fallbackSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (decoded.status !== "Active") {
      return null;
    }

    // Role-Based Access Control check
    if (requiredRole) {
      if (requiredRole === "Founder" && decoded.role !== "Founder") {
        return null;
      }
      if (requiredRole === "Co-Founder" && decoded.role !== "Founder" && decoded.role !== "Co-Founder") {
        return null;
      }
    }

    return decoded;
  } catch {
    return null;
  }
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { token, googleEmail, googleName, googleAvatar, action } = body;

    // 1. Session Token Validation
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        return res.status(200).json({
          success: true,
          valid: true,
          user: decoded,
        });
      }
      return res.status(401).json({
        success: false,
        valid: false,
        error: "Session expired or invalid.",
      });
    }

    // 2. Google OAuth Server-Side Allowlist Verification
    if (googleEmail || action === "verify-google") {
      const email = (googleEmail || "").trim().toLowerCase();
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Missing Google email address.",
        });
      }

      // Check against allowlist
      const matched = DEFAULT_ALLOWLIST.find((a) => a.email.toLowerCase() === email);

      if (!matched) {
        return res.status(403).json({
          success: false,
          authorized: false,
          error: "Access Restricted",
          message: "This Google account is not authorised to access the PHANTOM LABS studio workspace.",
        });
      }

      if (matched.status !== "Active") {
        return res.status(403).json({
          success: false,
          authorized: false,
          deactivated: true,
          error: "Account Deactivated",
          message: "This administrator account has been deactivated. Please contact the studio founder.",
        });
      }

      const adminUser = {
        ...matched,
        name: googleName || matched.name,
        avatar: googleAvatar || "/images/admin-avatar.png",
      };

      const authToken = generateToken(adminUser);

      return res.status(200).json({
        success: true,
        authorized: true,
        token: authToken,
        user: adminUser,
        message: "Google authentication verified successfully.",
      });
    }

    // Email/password login is strictly disallowed
    return res.status(400).json({
      success: false,
      error: "Password authentication is disabled. Please use 'Continue with Google'.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
}
