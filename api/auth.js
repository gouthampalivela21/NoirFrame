import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gouthampalivela26@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "231258hg";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "noir-frame-secure-secret-key-2026";

function generateToken(email) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    email,
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),
  })).toString("base64url");
  const sigData = header + "." + payload;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(sigData).digest("base64url");
  return sigData + "." + signature;
}

export function verifyToken(token) {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const sigData = header + "." + payload;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(sigData).digest("base64url");
    if (signature !== expectedSig) return false;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-token");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { email, password, token } = body;

    if (token) {
      const isValid = verifyToken(token);
      if (isValid) {
        return res.status(200).json({ success: true, valid: true });
      }
      return res.status(401).json({ success: false, valid: false, error: "Invalid or expired session" });
    }

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
      const authToken = generateToken(cleanEmail);
      return res.status(200).json({
        success: true,
        token: authToken,
        adminEmail: ADMIN_EMAIL,
        message: "Authentication successful",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid credentials. Please check your admin email and password.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
}