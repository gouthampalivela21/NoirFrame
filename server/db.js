import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "data");
const UPLOADS_DIR = path.resolve(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "bookings.json");

// Ensure data directories exist synchronously
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.error("[DB] Failed to create data directories:", e);
}

// In-memory cache synced with disk
let cachedBookings = null;

function loadFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("[DB] Error reading bookings database file:", err.message);
  }
  return [];
}

function saveToDisk(bookings) {
  try {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(bookings, null, 2), "utf8");
    fs.renameSync(tmpFile, DB_FILE);
    return true;
  } catch (err) {
    console.error("[DB] Atomic write error to bookings.json:", err);
    return false;
  }
}

function getBookings() {
  if (cachedBookings === null) {
    cachedBookings = loadFromDisk();
  }
  return cachedBookings;
}

export function getAllBookings(options = {}) {
  const { search, status, category, sort = "newest" } = options;
  let items = [...getBookings()];

  // Filter by status (case-insensitive)
  if (status && status !== "All") {
    const s = status.toLowerCase().trim();
    items = items.filter((b) => (b.status || "New").toLowerCase() === s);
  }

  // Filter by category (case-insensitive)
  if (category && category !== "All") {
    const c = category.toLowerCase().trim();
    items = items.filter((b) => (b.category || "").toLowerCase() === c);
  }

  // Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter((b) => {
      const name = (b.contact?.name || b.clientName || "").toLowerCase();
      const email = (b.contact?.email || b.email || "").toLowerCase();
      const phone = (b.contact?.phone || b.phone || "").toLowerCase();
      const org = (b.contact?.organization || "").toLowerCase();
      const loc = (b.schedule?.location || b.location || "").toLowerCase();
      const cat = (b.category || "").toLowerCase();
      const sub = (b.subCategory || "").toLowerCase();
      const msg = (b.clientMessage || b.message || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        org.includes(q) ||
        loc.includes(q) ||
        cat.includes(q) ||
        sub.includes(q) ||
        msg.includes(q)
      );
    });
  }

  // Sort
  if (sort === "oldest") {
    items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  } else if (sort === "name") {
    items.sort((a, b) =>
      (a.contact?.name || a.clientName || "").localeCompare(b.contact?.name || b.clientName || "")
    );
  } else if (sort === "status") {
    items.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
  } else {
    // default: newest first
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return items;
}

export function getBookingById(id) {
  const bookings = getBookings();
  return bookings.find((b) => b.id === id) || null;
}

export function createBooking(payload) {
  const bookings = getBookings();
  const now = new Date().toISOString();
  const id = payload.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const newBooking = {
    id,
    category: payload.category || "Portraits",
    kicker: payload.kicker || `Creative Brief / ${payload.category || "Portraits"}`,
    subCategory:
      payload.subCategory ||
      payload.brief?.purpose ||
      payload.brief?.occasion ||
      payload.brief?.eventType ||
      payload.brief?.campaignObjective ||
      payload.brief?.projectObjective ||
      payload.brief?.publicationStory ||
      "Bespoke Commission",
    contact: {
      name: payload.contact?.name || payload.clientName || "Anonymous Patron",
      email: payload.contact?.email || payload.email || "",
      phone: payload.contact?.phone || payload.phone || "",
      organization: payload.contact?.organization || payload.organization || "",
      preferredChannel: payload.contact?.preferredChannel || "Email",
      additionalNotes: payload.contact?.additionalNotes || "",
    },
    // Backwards-compatible top-level fields
    clientName: payload.contact?.name || payload.clientName || "Anonymous Patron",
    email: payload.contact?.email || payload.email || "",
    phone: payload.contact?.phone || payload.phone || "",
    location: payload.schedule?.location || payload.location || "Studio / On Location",
    preferredDate:
      payload.schedule?.dateType === "specific" && payload.schedule?.specificDate
        ? payload.schedule.specificDate
        : payload.schedule?.flexibleTimeframe || payload.preferredDate || "Flexible timeframe",
    schedule: {
      dateType: payload.schedule?.dateType || "flexible",
      specificDate: payload.schedule?.specificDate || "",
      flexibleTimeframe: payload.schedule?.flexibleTimeframe || "Next 2–3 months",
      location: payload.schedule?.location || payload.location || "",
      productionNotes: payload.schedule?.productionNotes || "",
    },
    brief: payload.brief || {},
    references: {
      links: Array.isArray(payload.references?.links)
        ? payload.references.links.filter(Boolean)
        : [],
      files: Array.isArray(payload.references?.files) ? payload.references.files : [],
      notes: payload.references?.notes || "",
    },
    clientMessage: payload.clientMessage || payload.message || "",
    budget: payload.budget || "Bespoke Creative Brief",
    status: payload.status || "New",
    isRead: false,
    createdAt: now,
    updatedAt: now,
    notes: Array.isArray(payload.notes) ? payload.notes : [],
    auditLog: [],
    lastEditedBy: null,
    lastEditedAt: null,
    source: payload.source || `Website Commission — ${payload.category || "Creative"}`,
  };

  cachedBookings = [newBooking, ...bookings];
  saveToDisk(cachedBookings);
  return newBooking;
}

const ALLOWED_BOOKING_STATUSES = ["New", "In progress", "Responded", "Closed"];

export function updateBooking(id, patch = {}, actor = null) {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const current = bookings[index];
  const now = new Date().toISOString();
  const actorRecord = actor
    ? {
        id: actor.id || null,
        name: actor.name || "Studio Member",
        email: actor.email || "",
        role: actor.role || "Admin",
      }
    : {
        id: null,
        name: "System",
        email: "",
        role: "System",
      };

  const next = { ...current };
  const newAuditEntries = [];
  const editedFields = [];

  // 1. Status change (validated)
  if (patch.status !== undefined) {
    const cleanStatus = String(patch.status).trim();
    if (!ALLOWED_BOOKING_STATUSES.includes(cleanStatus)) {
      const err = new Error(
        `Invalid booking status "${cleanStatus}". Allowed: ${ALLOWED_BOOKING_STATUSES.join(", ")}.`
      );
      err.statusCode = 400;
      throw err;
    }
    if (cleanStatus !== current.status) {
      newAuditEntries.push({
        id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        action: "status_changed",
        summary: `Changed status from "${current.status || "New"}" to "${cleanStatus}"`,
        from: current.status || "New",
        to: cleanStatus,
        actor: actorRecord,
        timestamp: now,
      });
      next.status = cleanStatus;
    }
  }

  // 2. Read / Unread toggle
  if (typeof patch.isRead === "boolean" && patch.isRead !== current.isRead) {
    newAuditEntries.push({
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action: patch.isRead ? "marked_read" : "marked_unread",
      summary: patch.isRead ? "Marked request as read" : "Marked request as unread",
      actor: actorRecord,
      timestamp: now,
    });
    next.isRead = patch.isRead;
  }

  // 3. Server-stamped internal note addition (preferred: patch.noteText)
  if (typeof patch.noteText === "string" && patch.noteText.trim()) {
    const noteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      author: actorRecord.name,
      authorEmail: actorRecord.email,
      authorRole: actorRecord.role,
      text: patch.noteText.trim(),
      createdAt: now,
    };
    next.notes = [...(Array.isArray(current.notes) ? current.notes : []), noteItem];
    newAuditEntries.push({
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action: "note_added",
      summary: "Added an internal studio note",
      actor: actorRecord,
      timestamp: now,
    });
  } else if (Array.isArray(patch.notes)) {
    // Backwards-compatible notes array append: stamp server actor on any newly appended notes
    const existingCount = Array.isArray(current.notes) ? current.notes.length : 0;
    const sanitizedNotes = patch.notes.map((item, i) => {
      if (i >= existingCount && item && typeof item === "object") {
        return {
          ...item,
          id: item.id || `note_${Date.now()}_${i}`,
          author: actorRecord.name,
          authorEmail: actorRecord.email,
          authorRole: actorRecord.role,
          createdAt: item.createdAt || now,
        };
      }
      return item;
    });
    if (sanitizedNotes.length > existingCount) {
      newAuditEntries.push({
        id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        action: "note_added",
        summary: "Added an internal studio note",
        actor: actorRecord,
        timestamp: now,
      });
    }
    next.notes = sanitizedNotes;
  }

  // 4. General request field edits (whitelisted fields only)
  const editableFields = [
    "budget",
    "location",
    "preferredDate",
    "clientMessage",
    "subCategory",
    "schedule",
    "contact",
  ];
  for (const field of editableFields) {
    if (patch[field] !== undefined) {
      const prevVal = JSON.stringify(current[field] ?? "");
      const nextVal = JSON.stringify(patch[field] ?? "");
      if (prevVal !== nextVal) {
        next[field] = patch[field];
        editedFields.push(field);
      }
    }
  }

  if (editedFields.length > 0) {
    newAuditEntries.push({
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action: "request_edited",
      summary: `Edited booking details (${editedFields.join(", ")})`,
      fields: editedFields,
      actor: actorRecord,
      timestamp: now,
    });
  }

  const existingLog = Array.isArray(current.auditLog) ? current.auditLog : [];
  if (newAuditEntries.length > 0) {
    next.auditLog = [...newAuditEntries, ...existingLog].slice(0, 100);
    next.lastEditedBy = actorRecord;
    next.lastEditedAt = now;
  } else {
    next.auditLog = existingLog;
  }

  next.id = current.id;
  next.updatedAt = now;

  bookings[index] = next;
  cachedBookings = [...bookings];
  saveToDisk(cachedBookings);
  return next;
}

export function deleteBooking(id) {
  const bookings = getBookings();
  const next = bookings.filter((b) => b.id !== id);
  if (next.length === bookings.length) return false;

  cachedBookings = next;
  saveToDisk(cachedBookings);
  return true;
}

export function getStatsSummary() {
  const bookings = getBookings();

  const total = bookings.length;
  const unread = bookings.filter((b) => b.isRead === false).length;

  const byStatus = {
    New: 0,
    "In progress": 0,
    Responded: 0,
    Closed: 0,
  };

  const byCategory = {
    Portraits: 0,
    Couples: 0,
    Events: 0,
    Brands: 0,
    Commercial: 0,
    Editorial: 0,
  };

  bookings.forEach((b) => {
    // Normalise status
    const rawStatus = (b.status || "New").trim();
    const statusKey =
      rawStatus.toLowerCase() === "new"
        ? "New"
        : rawStatus.toLowerCase() === "in progress"
        ? "In progress"
        : rawStatus.toLowerCase() === "responded" || rawStatus.toLowerCase() === "confirmed"
        ? "Responded"
        : rawStatus.toLowerCase() === "closed" || rawStatus.toLowerCase() === "archived"
        ? "Closed"
        : "New";

    if (byStatus[statusKey] !== undefined) {
      byStatus[statusKey] += 1;
    } else {
      byStatus.New += 1;
    }

    // Normalise category
    const rawCat = (b.category || "Portraits").trim();
    const matchedKey = Object.keys(byCategory).find(
      (k) => k.toLowerCase() === rawCat.toLowerCase()
    );
    if (matchedKey) {
      byCategory[matchedKey] += 1;
    }
  });

  return {
    total,
    unread,
    byStatus,
    byCategory,
  };
}
