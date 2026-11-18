import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "data");
const TEAM_DB_FILE = path.join(DATA_DIR, "team.json");

export const VALID_INVITABLE_ROLES = ["Admin", "Viewer"];
export const ALL_ROLES = ["Founder", "Admin", "Viewer"];
export const VALID_STATUSES = ["Active", "Invited", "Revoked"];
const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.error("[TeamDB] Failed to ensure data directory:", e);
}

let cachedMembers = null;

function loadMembersFromDisk() {
  try {
    if (fs.existsSync(TEAM_DB_FILE)) {
      const raw = fs.readFileSync(TEAM_DB_FILE, "utf8");
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("[TeamDB] Error reading team.json:", err.message);
  }
  return [];
}

function saveMembersToDisk(members) {
  try {
    const tmpFile = `${TEAM_DB_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString("hex")}`;
    fs.writeFileSync(tmpFile, JSON.stringify(members, null, 2), "utf8");
    fs.renameSync(tmpFile, TEAM_DB_FILE);
    return true;
  } catch (err) {
    console.error("[TeamDB] Atomic write failed:", err);
    return false;
  }
}

function getMembersRaw() {
  if (cachedMembers === null) {
    cachedMembers = loadMembersFromDisk();
  }
  return cachedMembers;
}

export function reloadTeamCache() {
  cachedMembers = loadMembersFromDisk();
  return cachedMembers;
}

// ---------------------------------------------------------------------------
// Cryptographic Helpers (scrypt + constant-time comparison)
// ---------------------------------------------------------------------------

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, originalHex] = parts;
  try {
    const derived = crypto.scryptSync(String(password), salt, 64);
    const original = Buffer.from(originalHex, "hex");
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  } catch {
    return false;
  }
}

function hashInviteToken(rawToken) {
  return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
}

function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Strip sensitive cryptographic fields before sending member records over API
 */
export function sanitizeMember(member) {
  if (!member) return null;
  const isInviteExpired =
    member.status === "Invited" &&
    member.inviteExpiresAt &&
    new Date(member.inviteExpiresAt).getTime() < Date.now();

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    isPrimaryFounder: Boolean(member.isPrimaryFounder),
    avatar: member.avatar || "/images/admin-avatar.png",
    hasPassword: Boolean(member.passwordHash),
    invitedBy: member.invitedBy || null,
    invitedAt: member.invitedAt || null,
    inviteExpiresAt: member.status === "Invited" ? member.inviteExpiresAt || null : null,
    isInviteExpired: Boolean(isInviteExpired),
    acceptedAt: member.acceptedAt || null,
    lastLoginAt: member.lastLoginAt || null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    updatedBy: member.updatedBy || null,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function hasFounder() {
  const members = getMembersRaw();
  return members.some((m) => (m.isPrimaryFounder || m.role === "Founder") && m.status === "Active");
}

export function getFounder() {
  const members = getMembersRaw();
  return members.find((m) => m.isPrimaryFounder || m.role === "Founder") || null;
}

export function getMemberById(id) {
  if (!id) return null;
  return getMembersRaw().find((m) => m.id === id) || null;
}

export function getMemberByEmail(email) {
  const clean = normalizeEmail(email);
  if (!clean) return null;
  return getMembersRaw().find((m) => normalizeEmail(m.email) === clean) || null;
}

export function getAllMembers() {
  const roleWeight = { Founder: 0, Admin: 1, Viewer: 2 };
  return [...getMembersRaw()]
    .sort((a, b) => {
      const rw = (roleWeight[a.role] ?? 9) - (roleWeight[b.role] ?? 9);
      if (rw !== 0) return rw;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    })
    .map(sanitizeMember);
}

export function getTeamSummary() {
  const members = getMembersRaw();
  return {
    total: members.length,
    active: members.filter((m) => m.status === "Active").length,
    invited: members.filter((m) => m.status === "Invited").length,
    revoked: members.filter((m) => m.status === "Revoked").length,
    byRole: {
      Founder: members.filter((m) => m.role === "Founder").length,
      Admin: members.filter((m) => m.role === "Admin").length,
      Viewer: members.filter((m) => m.role === "Viewer").length,
    },
  };
}

// ---------------------------------------------------------------------------
// First-Run Founder Setup (One-Time Only)
// ---------------------------------------------------------------------------

export function createFounder({ name, email, password }) {
  if (hasFounder()) {
    const err = new Error("Founder account is already configured.");
    err.code = "FOUNDER_ALREADY_EXISTS";
    err.statusCode = 409;
    throw err;
  }

  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    const err = new Error("Founder full name is required.");
    err.statusCode = 400;
    throw err;
  }
  if (!isValidEmail(cleanEmail)) {
    const err = new Error("A valid email address is required.");
    err.statusCode = 400;
    throw err;
  }
  if (!password || String(password).length < 8) {
    const err = new Error("Password must be at least 8 characters long.");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const founder = {
    id: `usr_founder_${crypto.randomBytes(6).toString("hex")}`,
    name: cleanName,
    email: cleanEmail,
    role: "Founder",
    status: "Active",
    isPrimaryFounder: true,
    avatar: "/images/admin-avatar.png",
    passwordHash: hashPassword(password),
    tokenVersion: 1,
    invitedBy: null,
    invitedAt: null,
    inviteTokenHash: null,
    inviteExpiresAt: null,
    acceptedAt: now,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    updatedBy: { name: cleanName, email: cleanEmail, role: "Founder" },
  };

  const members = getMembersRaw();
  cachedMembers = [founder, ...members.filter((m) => normalizeEmail(m.email) !== cleanEmail)];
  saveMembersToDisk(cachedMembers);
  return founder;
}

// ---------------------------------------------------------------------------
// Invitations & Acceptance
// ---------------------------------------------------------------------------

export function inviteMember({ email, name, role, invitedBy }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || "").trim() || cleanEmail.split("@")[0];

  if (!isValidEmail(cleanEmail)) {
    const err = new Error("Please enter a valid email address.");
    err.statusCode = 400;
    throw err;
  }

  if (!VALID_INVITABLE_ROLES.includes(role)) {
    const err = new Error(`Invalid role "${role}". Permitted team roles are Admin or Viewer.`);
    err.statusCode = 400;
    throw err;
  }

  const existing = getMemberByEmail(cleanEmail);
  if (existing) {
    if (existing.isPrimaryFounder || existing.role === "Founder") {
      const err = new Error("This email already belongs to the studio Founder account.");
      err.statusCode = 409;
      throw err;
    }
    const err = new Error(
      `A team member with email ${cleanEmail} already exists (Status: ${existing.status}).`
    );
    err.statusCode = 409;
    throw err;
  }

  const now = new Date().toISOString();
  const rawToken = generateInviteToken();
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  const newMember = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    name: cleanName,
    email: cleanEmail,
    role,
    status: "Invited",
    isPrimaryFounder: false,
    avatar: "/images/admin-avatar.png",
    passwordHash: null,
    tokenVersion: 1,
    invitedBy: invitedBy
      ? { id: invitedBy.id, name: invitedBy.name, email: invitedBy.email, role: invitedBy.role }
      : null,
    invitedAt: now,
    inviteTokenHash: hashInviteToken(rawToken),
    inviteExpiresAt,
    acceptedAt: null,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    updatedBy: invitedBy
      ? { id: invitedBy.id, name: invitedBy.name, email: invitedBy.email, role: invitedBy.role }
      : null,
  };

  cachedMembers = [...getMembersRaw(), newMember];
  saveMembersToDisk(cachedMembers);

  return {
    member: sanitizeMember(newMember),
    inviteToken: rawToken,
    expiresAt: inviteExpiresAt,
  };
}

export function resendInvitation(memberId, actor) {
  const members = getMembersRaw();
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) {
    const err = new Error("Team member not found.");
    err.statusCode = 404;
    throw err;
  }

  const target = members[idx];
  if (target.isPrimaryFounder || target.role === "Founder") {
    const err = new Error("The Founder account cannot be modified through invitations.");
    err.code = "FOUNDER_PROTECTED";
    err.statusCode = 403;
    throw err;
  }

  if (target.status === "Active" && target.passwordHash) {
    const err = new Error("This member has already accepted their invitation and is Active.");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const rawToken = generateInviteToken();
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  const updated = {
    ...target,
    status: "Invited",
    inviteTokenHash: hashInviteToken(rawToken),
    inviteExpiresAt,
    invitedAt: now,
    updatedAt: now,
    updatedBy: actor
      ? { id: actor.id, name: actor.name, email: actor.email, role: actor.role }
      : null,
  };

  members[idx] = updated;
  cachedMembers = [...members];
  saveMembersToDisk(cachedMembers);

  return {
    member: sanitizeMember(updated),
    inviteToken: rawToken,
    expiresAt: inviteExpiresAt,
  };
}

export function verifyInviteToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") return null;
  const hashed = hashInviteToken(rawToken.trim());
  const members = getMembersRaw();
  const match = members.find((m) => {
    if (!m.inviteTokenHash || m.status !== "Invited") return false;
    const bufA = Buffer.from(m.inviteTokenHash);
    const bufB = Buffer.from(hashed);
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  });

  if (!match) return null;

  if (match.inviteExpiresAt && new Date(match.inviteExpiresAt).getTime() < Date.now()) {
    return { expired: true, email: match.email, role: match.role };
  }

  return {
    expired: false,
    id: match.id,
    name: match.name,
    email: match.email,
    role: match.role,
    expiresAt: match.inviteExpiresAt,
    invitedBy: match.invitedBy?.name || "Studio Founder",
  };
}

export function acceptInvitation({ rawToken, name, password }) {
  if (!rawToken || typeof rawToken !== "string") {
    const err = new Error("Invitation token is missing.");
    err.statusCode = 400;
    throw err;
  }
  if (!password || String(password).length < 8) {
    const err = new Error("Password must be at least 8 characters long.");
    err.statusCode = 400;
    throw err;
  }

  const hashed = hashInviteToken(rawToken.trim());
  const members = getMembersRaw();
  const idx = members.findIndex((m) => {
    if (!m.inviteTokenHash || m.status !== "Invited") return false;
    const bufA = Buffer.from(m.inviteTokenHash);
    const bufB = Buffer.from(hashed);
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  });

  if (idx === -1) {
    const err = new Error("This invitation link is invalid or has already been used.");
    err.statusCode = 404;
    throw err;
  }

  const target = members[idx];
  if (target.inviteExpiresAt && new Date(target.inviteExpiresAt).getTime() < Date.now()) {
    const err = new Error("This invitation link has expired. Please ask the Founder to resend it.");
    err.statusCode = 410;
    throw err;
  }

  const now = new Date().toISOString();
  const cleanName = String(name || "").trim() || target.name;

  const updated = {
    ...target,
    name: cleanName,
    passwordHash: hashPassword(password),
    status: "Active",
    inviteTokenHash: null,
    inviteExpiresAt: null,
    acceptedAt: now,
    lastLoginAt: now,
    updatedAt: now,
    tokenVersion: (target.tokenVersion || 1) + 1,
  };

  members[idx] = updated;
  cachedMembers = [...members];
  saveMembersToDisk(cachedMembers);
  return updated;
}

// ---------------------------------------------------------------------------
// Member Updates & Revocation (Strict Founder Protection)
// ---------------------------------------------------------------------------

export function updateMember(memberId, patch = {}, actor = null) {
  const members = getMembersRaw();
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) {
    const err = new Error("Team member not found.");
    err.statusCode = 404;
    throw err;
  }

  const target = members[idx];

  // HARD GUARD: Founder account can NEVER be demoted, revoked, or changed via team management
  if (target.isPrimaryFounder || target.role === "Founder") {
    const err = new Error("The Founder account is protected and cannot be modified, demoted, or revoked.");
    err.code = "FOUNDER_PROTECTED";
    err.statusCode = 403;
    throw err;
  }

  const next = { ...target };

  if (patch.role !== undefined) {
    if (!VALID_INVITABLE_ROLES.includes(patch.role)) {
      const err = new Error("Permitted team roles are Admin or Viewer. Founder role cannot be assigned here.");
      err.statusCode = 400;
      throw err;
    }
    next.role = patch.role;
  }

  if (patch.status !== undefined) {
    if (!["Active", "Revoked"].includes(patch.status)) {
      const err = new Error("Status can only be set to Active or Revoked.");
      err.statusCode = 400;
      throw err;
    }
    if (patch.status === "Active" && !target.passwordHash) {
      // Member never accepted invite yet; keep as Invited unless they set password
      const err = new Error("This member has not accepted their invitation yet. Use Resend Invitation instead.");
      err.statusCode = 400;
      throw err;
    }
    if (patch.status === "Revoked") {
      // Immediately invalidate all existing tokens and pending invite links
      next.tokenVersion = (target.tokenVersion || 1) + 1;
      next.inviteTokenHash = null;
      next.inviteExpiresAt = null;
    }
    next.status = patch.status;
  }

  if (patch.name !== undefined && String(patch.name).trim()) {
    next.name = String(patch.name).trim();
  }

  next.updatedAt = new Date().toISOString();
  next.updatedBy = actor
    ? { id: actor.id, name: actor.name, email: actor.email, role: actor.role }
    : null;

  members[idx] = next;
  cachedMembers = [...members];
  saveMembersToDisk(cachedMembers);

  return sanitizeMember(next);
}

export function removeMember(memberId) {
  const members = getMembersRaw();
  const target = members.find((m) => m.id === memberId);
  if (!target) {
    const err = new Error("Team member not found.");
    err.statusCode = 404;
    throw err;
  }

  // HARD GUARD: Founder account can NEVER be removed
  if (target.isPrimaryFounder || target.role === "Founder") {
    const err = new Error("The Founder account is protected and cannot be removed.");
    err.code = "FOUNDER_PROTECTED";
    err.statusCode = 403;
    throw err;
  }

  cachedMembers = members.filter((m) => m.id !== memberId);
  saveMembersToDisk(cachedMembers);
  return sanitizeMember(target);
}

export function activateInvitedMemberViaOAuth(memberId, { name, avatar } = {}) {
  const members = getMembersRaw();
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) return null;

  const target = members[idx];
  const now = new Date().toISOString();
  const updated = {
    ...target,
    name: name || target.name,
    avatar: avatar || target.avatar,
    status: "Active",
    inviteTokenHash: null,
    inviteExpiresAt: null,
    acceptedAt: target.acceptedAt || now,
    lastLoginAt: now,
    updatedAt: now,
  };

  members[idx] = updated;
  cachedMembers = [...members];
  saveMembersToDisk(cachedMembers);
  return updated;
}

export function recordLastLogin(memberId, { name, avatar } = {}) {
  const members = getMembersRaw();
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) return null;

  const target = members[idx];
  const updated = {
    ...target,
    name: name || target.name,
    avatar: avatar || target.avatar,
    lastLoginAt: new Date().toISOString(),
  };

  members[idx] = updated;
  cachedMembers = [...members];
  saveMembersToDisk(cachedMembers);
  return updated;
}
