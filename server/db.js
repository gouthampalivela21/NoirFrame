import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import {
  getSupabaseAdminClient,
  BOOKINGS_TABLE,
  ATTACHMENTS_TABLE,
  CLIENTS_TABLE,
  SITE_CONTENT_TABLE,
  TEAM_TABLE,
} from "./supabaseAdmin.js";
import {
  defaultLiveCmsCategories,
  defaultLiveCmsJourneys,
  defaultLiveCmsStories,
  defaultLiveCmsStudio,
} from "../src/data/liveCmsDefaults.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Vercel's deployed function bundle is read-only. Keep its transient fallback
// records in /tmp; local development continues to use server/data.
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "phantom-labs-data")
  : path.resolve(__dirname, "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function readJsonFile(filename, fallback = []) {
  try {
    const file = getFilePath(filename);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2), "utf8");
      return fallback;
    }
    const raw = fs.readFileSync(file, "utf8");
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[DB File Storage] Error reading ${filename}:`, err.message);
    return fallback;
  }
}

function writeJsonFile(filename, data) {
  try {
    const file = getFilePath(filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`[DB File Storage] Error writing ${filename}:`, err.message);
    return false;
  }
}

const ALLOWED_BOOKING_STATUSES = ["New", "In progress", "Responded", "Closed"];
const ALLOWED_CATEGORIES = [
  "Portraits",
  "Couples",
  "Events",
  "Brands",
  "Commercial",
  "Editorial",
];

function rowToBooking(row) {
  if (!row) return null;
  const contact = row.contact || {};
  const schedule = row.schedule || {};
  const references = row.references_data || {};

  return {
    id: row.id,
    category: row.category || "Portraits",
    kicker: row.kicker || `Creative Brief / ${row.category || "Portraits"}`,
    subCategory: row.sub_category || "Bespoke Commission",
    contact: {
      name: contact.name || "Anonymous Patron",
      email: contact.email || "",
      phone: contact.phone || "",
      organization: contact.organization || "",
      preferredChannel: contact.preferredChannel || "Email",
      additionalNotes: contact.additionalNotes || "",
    },
    clientName: contact.name || row.clientName || "Anonymous Patron",
    email: contact.email || row.email || "",
    phone: contact.phone || row.phone || "",
    location: schedule.location || row.location || "Studio / On Location",
    timeframe:
      schedule.dateType === "specific" && schedule.specificDate
        ? schedule.specificDate
        : schedule.flexibleTimeframe || row.timeframe || "Flexible timeframe",
    preferredDate:
      schedule.dateType === "specific" && schedule.specificDate
        ? schedule.specificDate
        : schedule.flexibleTimeframe || "Flexible timeframe",
    schedule: {
      dateType: schedule.dateType || "flexible",
      specificDate: schedule.specificDate || "",
      flexibleTimeframe: schedule.flexibleTimeframe || "Next 2–3 months",
      location: schedule.location || "",
      productionNotes: schedule.productionNotes || "",
    },
    brief: row.brief || {},
    references: {
      links: Array.isArray(references.links) ? references.links.filter(Boolean) : [],
      files: Array.isArray(references.files) ? references.files : [],
      notes: references.notes || "",
    },
    message: row.client_message || row.message || "",
    budget: row.budget ? (typeof row.budget === "number" ? row.budget : Number(String(row.budget).replace(/[^0-9]/g, "")) || 0) : 0,
    status: row.status || "New",
    isRead: Boolean(row.is_read),
    notes: Array.isArray(row.notes) ? row.notes : [],
    auditLog: Array.isArray(row.audit_log) ? row.audit_log : [],
    lastEditedBy: row.last_edited_by || null,
    lastEditedAt: row.last_edited_at || null,
    source: row.source || `Website Commission — ${row.category || "Creative"}`,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function normalizeCategory(raw) {
  const clean = String(raw || "Portraits").trim();
  const match = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === clean.toLowerCase());
  return match || "Portraits";
}

// ---------------------------------------------------------------------------
// 1. BOOKINGS & INQUIRIES
// ---------------------------------------------------------------------------
export async function getAllBookings(options = {}) {
  const { search, status, category, sort = "newest" } = options;
  let items = [];

  try {
    const supabase = getSupabaseAdminClient();
    let query = supabase.from(BOOKINGS_TABLE).select("*");
    if (sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      items = data.map(rowToBooking);
      // Synchronize to local persistent cache
      writeJsonFile("bookings.json", items);
    } else {
      items = readJsonFile("bookings.json", []).map(rowToBooking);
    }
  } catch (err) {
    items = readJsonFile("bookings.json", []).map(rowToBooking);
  }

  if (status && status !== "All") {
    const s = status.toLowerCase().trim();
    items = items.filter((b) => (b.status || "New").toLowerCase() === s);
  }

  if (category && category !== "All") {
    const c = category.toLowerCase().trim();
    items = items.filter((b) => (b.category || "").toLowerCase() === c);
  }

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
      const msg = (b.message || "").toLowerCase();
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

  if (sort === "name") {
    items.sort((a, b) => (a.clientName || "").localeCompare(b.clientName || ""));
  } else if (sort === "status") {
    items.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
  }

  return items;
}

export async function getBookingById(id) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return rowToBooking(data);
    }
  } catch {}

  const local = readJsonFile("bookings.json", []);
  const found = local.find((b) => b.id === id);
  return found ? rowToBooking(found) : null;
}

export async function createBooking(payload) {
  const now = new Date().toISOString();
  const id = `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const category = normalizeCategory(payload.category);

  const subCategory =
    payload.subCategory ||
    payload.brief?.purpose ||
    payload.brief?.occasion ||
    payload.brief?.eventType ||
    payload.brief?.campaignObjective ||
    payload.brief?.projectObjective ||
    payload.brief?.publicationStory ||
    "Bespoke Commission";

  const sanitizedFiles = Array.isArray(payload.references?.files)
    ? payload.references.files.map((f) => ({
        fileId: f.fileId || null,
        name: String(f.name || "attachment").slice(0, 200),
        type: String(f.type || "application/octet-stream").slice(0, 120),
        size: String(f.size || "").slice(0, 40),
        url: f.fileId ? `/api/uploads/${f.fileId}` : null,
      }))
    : [];

  const row = {
    id,
    category,
    kicker: String(payload.kicker || `Creative Brief / ${category}`).slice(0, 200),
    sub_category: String(subCategory).slice(0, 300),
    contact: {
      name: String(payload.contact?.name || payload.clientName || "").trim().slice(0, 200),
      email: String(payload.contact?.email || payload.email || "").trim().slice(0, 200),
      phone: String(payload.contact?.phone || payload.phone || "").trim().slice(0, 80),
      organization: String(payload.contact?.organization || payload.organization || "").trim().slice(0, 200),
      preferredChannel: String(payload.contact?.preferredChannel || "Email").slice(0, 60),
      additionalNotes: String(payload.contact?.additionalNotes || "").slice(0, 3000),
    },
    schedule: {
      dateType: payload.schedule?.dateType === "specific" ? "specific" : "flexible",
      specificDate: String(payload.schedule?.specificDate || "").slice(0, 80),
      flexibleTimeframe: String(payload.schedule?.flexibleTimeframe || "Next 2–3 months").slice(0, 160),
      location: String(payload.schedule?.location || payload.location || "").slice(0, 300),
      productionNotes: String(payload.schedule?.productionNotes || "").slice(0, 3000),
    },
    brief: payload.brief && typeof payload.brief === "object" ? payload.brief : {},
    references_data: {
      links: Array.isArray(payload.references?.links)
        ? payload.references.links.filter(Boolean).map((l) => String(l).trim().slice(0, 500)).slice(0, 20)
        : [],
      files: sanitizedFiles,
      notes: String(payload.references?.notes || "").slice(0, 3000),
    },
    client_message: String(payload.clientMessage || payload.message || "").slice(0, 10000),
    budget: String(payload.budget || "0").slice(0, 160),
    status: "New",
    is_read: false,
    notes: [],
    audit_log: [],
    last_edited_by: null,
    last_edited_at: null,
    source: String(payload.source || `Website Commission — ${category}`).slice(0, 200),
    created_at: now,
    updated_at: now,
  };

  let saved = null;
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .insert(row)
      .select("*")
      .single();

    if (!error && data) {
      saved = rowToBooking(data);
    }
  } catch {}

  if (!saved) {
    saved = rowToBooking(row);
  }

  // Update local storage
  const current = readJsonFile("bookings.json", []);
  writeJsonFile("bookings.json", [saved, ...current.filter((b) => b.id !== saved.id)]);

  return saved;
}

export async function updateBooking(id, patch = {}, actor = null) {
  const current = await getBookingById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const dbPatch = { updated_at: now };

  if (patch.status !== undefined) {
    dbPatch.status = String(patch.status).trim();
  }
  if (typeof patch.isRead === "boolean") {
    dbPatch.is_read = patch.isRead;
  }
  if (patch.budget !== undefined) {
    dbPatch.budget = String(patch.budget);
  }
  if (patch.message !== undefined) {
    dbPatch.client_message = String(patch.message);
  }
  if (patch.clientName !== undefined) {
    dbPatch.contact = { ...(current.contact || {}), name: patch.clientName };
  }
  if (patch.email !== undefined) {
    dbPatch.contact = { ...(current.contact || {}), email: patch.email };
  }

  let updated = null;
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .update(dbPatch)
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) {
      updated = rowToBooking(data);
    }
  } catch {}

  if (!updated) {
    updated = {
      ...current,
      ...patch,
      updatedAt: now,
    };
  }

  const all = readJsonFile("bookings.json", []);
  writeJsonFile(
    "bookings.json",
    all.map((b) => (b.id === id ? updated : b))
  );

  return updated;
}

export async function deleteBooking(id) {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from(BOOKINGS_TABLE).delete().eq("id", id);
  } catch {}

  const all = readJsonFile("bookings.json", []);
  const filtered = all.filter((b) => b.id !== id);
  writeJsonFile("bookings.json", filtered);
  return true;
}

// ---------------------------------------------------------------------------
// 2. ACTIVE PROJECTS / COMMISSIONS
// ---------------------------------------------------------------------------
export async function getAllProjects() {
  return readJsonFile("projects.json", []);
}

export async function createProjectRecord(projectPayload) {
  const projects = readJsonFile("projects.json", []);
  const now = new Date().toISOString();
  const id = `proj_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  const quote = Number(projectPayload.quote) || 0;
  const paid = Number(projectPayload.advance || projectPayload.paid) || 0;
  const due = Math.max(0, quote - paid);

  const newProject = {
    id,
    name: projectPayload.name || "Untitled Commission",
    client: projectPayload.client || "Client Patron",
    clientEmail: projectPayload.clientEmail || "",
    category: projectPayload.category || "Portraits",
    shootDate: projectPayload.shootDate || now.split("T")[0],
    stage: projectPayload.stage || "Pre-Production",
    quote,
    paid,
    due,
    location: projectPayload.location || "Studio / On Location",
    deliverables: projectPayload.deliverables || "High-Res Master Gallery Plates",
    notes: projectPayload.notes || "",
    payments: paid > 0 ? [
      {
        id: `pay_${Date.now()}`,
        date: now.split("T")[0],
        amount: paid,
        note: "Initial Advance Retainer",
      }
    ] : [],
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newProject, ...projects];
  writeJsonFile("projects.json", updated);

  // Auto-record booking schedule item
  const bookings = readJsonFile("calendar_bookings.json", []);
  const newCalendarItem = {
    id: `bkg_${Date.now()}`,
    projectId: id,
    shootName: newProject.name,
    client: newProject.client,
    date: newProject.shootDate,
    callTime: "09:00 AM",
    location: newProject.location,
    crew: "Goutham P, Assistant",
    status: "Confirmed",
  };
  writeJsonFile("calendar_bookings.json", [newCalendarItem, ...bookings]);

  return newProject;
}

export async function updateProjectRecord(id, patch) {
  const projects = readJsonFile("projects.json", []);
  const found = projects.find((p) => p.id === id);
  if (!found) return null;

  const now = new Date().toISOString();
  let updatedPayments = found.payments || [];
  let paid = found.paid || 0;
  let quote = patch.quote !== undefined ? Number(patch.quote) : found.quote;

  if (patch.paymentAmount && Number(patch.paymentAmount) > 0) {
    const amount = Number(patch.paymentAmount);
    paid += amount;
    updatedPayments = [
      ...updatedPayments,
      {
        id: `pay_${Date.now()}`,
        date: now.split("T")[0],
        amount,
        note: patch.paymentNote || "Milestone Settlement",
      },
    ];
  }

  const due = Math.max(0, quote - paid);

  const updated = {
    ...found,
    ...patch,
    quote,
    paid,
    due,
    payments: updatedPayments,
    updatedAt: now,
  };

  const allUpdated = projects.map((p) => (p.id === id ? updated : p));
  writeJsonFile("projects.json", allUpdated);
  return updated;
}

export async function deleteProjectRecord(id) {
  const projects = readJsonFile("projects.json", []);
  const filtered = projects.filter((p) => p.id !== id);
  writeJsonFile("projects.json", filtered);
  return true;
}

// ---------------------------------------------------------------------------
// 3. CLIENTS DIRECTORY
// ---------------------------------------------------------------------------
export async function getAllClients() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from(CLIENTS_TABLE).select("*");
    if (!error && Array.isArray(data)) {
      writeJsonFile("clients.json", data);
      return data;
    }
  } catch {}
  return readJsonFile("clients.json", []);
}

export async function createClientRecord(clientPayload) {
  const clients = readJsonFile("clients.json", []);
  const now = new Date().toISOString();
  const newClient = {
    id: `cli_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    name: clientPayload.name || "Unnamed Client",
    contactPerson: clientPayload.contactPerson || clientPayload.name || "",
    email: clientPayload.email || "",
    phone: clientPayload.phone || "",
    organization: clientPayload.organization || "",
    status: clientPayload.status || "Active",
    totalSpend: Number(clientPayload.totalSpend) || 0,
    commissionsCount: Number(clientPayload.commissionsCount) || 1,
    notes: clientPayload.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from(CLIENTS_TABLE).insert(newClient);
  } catch {}

  const updated = [newClient, ...clients];
  writeJsonFile("clients.json", updated);
  return newClient;
}

export async function updateClientRecord(id, patch) {
  const clients = readJsonFile("clients.json", []);
  const found = clients.find((c) => c.id === id);
  if (!found) return null;

  const updated = { ...found, ...patch, updatedAt: new Date().toISOString() };
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from(CLIENTS_TABLE).update(patch).eq("id", id);
  } catch {}

  const allUpdated = clients.map((c) => (c.id === id ? updated : c));
  writeJsonFile("clients.json", allUpdated);
  return updated;
}

export async function deleteClientRecord(id) {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from(CLIENTS_TABLE).delete().eq("id", id);
  } catch {}

  const clients = readJsonFile("clients.json", []);
  writeJsonFile("clients.json", clients.filter((c) => c.id !== id));
  return true;
}

// ---------------------------------------------------------------------------
// 4. INVOICES
// ---------------------------------------------------------------------------
export async function getAllInvoices() {
  return readJsonFile("invoices.json", []);
}

export async function createInvoiceRecord(invPayload) {
  const invoices = readJsonFile("invoices.json", []);
  const now = new Date().toISOString();
  const newInv = {
    id: invPayload.id || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    client: invPayload.client,
    project: invPayload.project,
    amount: Number(invPayload.amount) || 0,
    dueDate: invPayload.dueDate || now.split("T")[0],
    issueDate: invPayload.issueDate || now.split("T")[0],
    status: invPayload.status || "Balance Due",
    paidDate: invPayload.status === "Paid" ? now.split("T")[0] : null,
    createdAt: now,
  };

  const updated = [newInv, ...invoices];
  writeJsonFile("invoices.json", updated);
  return newInv;
}

export async function updateInvoiceRecord(id, patch) {
  const invoices = readJsonFile("invoices.json", []);
  const found = invoices.find((i) => i.id === id);
  if (!found) return null;

  const updated = { ...found, ...patch };
  const allUpdated = invoices.map((i) => (i.id === id ? updated : i));
  writeJsonFile("invoices.json", allUpdated);
  return updated;
}

// ---------------------------------------------------------------------------
// 5. CMS & LIVE STORIES / FIELD NOTES / CONTENT
// ---------------------------------------------------------------------------
export async function getCMSContent() {
  let supabaseConfigured = false;
  try {
    const supabase = getSupabaseAdminClient();
    supabaseConfigured = true;
    const { data, error } = await supabase
      .from(SITE_CONTENT_TABLE)
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (!error && data && data.data && Object.keys(data.data).length > 0) {
      writeJsonFile("cms.json", data.data);
      return data.data;
    }
  } catch (error) {
    if (supabaseConfigured || process.env.VERCEL) {
      const err = new Error(`Could not load the shared CMS from Supabase: ${error.message}`);
      err.statusCode = 503;
      throw err;
    }
  }

  if (process.env.VERCEL && !supabaseConfigured) {
    const err = new Error("The live CMS has no Supabase connection configured.");
    err.statusCode = 503;
    throw err;
  }

  return readJsonFile("cms.json", {
    hero: {
      headline: "Visual Stories, Framed Differently",
      subheadline: "Fine-art photography, editorial portraiture, and cinematic storytelling.",
      availabilityBadge: "Accepting Commissions",
      bannerImage: "/images/dashboard-mountains.png",
      studioEmail: "studio@phantomlabs.in",
      location: "Bangalore / Worldwide",
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
      seoTitle: "Phantom Labs — Creative Production Studio",
      seoDescription: "Fine art portraits, editorial campaigns, and bespoke creative production.",
    },
    portfolio: [],
    categories: defaultLiveCmsCategories,
    stories: defaultLiveCmsStories,
    journeys: defaultLiveCmsJourneys,
    studio: defaultLiveCmsStudio,
    services: [],
    testimonials: [],
  });
}

export function getCMSStorageMode() {
  try {
    getSupabaseAdminClient();
    return "supabase";
  } catch {
    return process.env.VERCEL ? "unconfigured" : "local";
  }
}

export async function updateCMSContent(newContent) {
  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    if (error.code === "SERVER_CONFIG_INCOMPLETE" && !process.env.VERCEL) {
      writeJsonFile("cms.json", newContent);
      return newContent;
    }
    throw error;
  }

  const { error } = await supabase.from(SITE_CONTENT_TABLE).upsert({
    id: 1,
    data: newContent,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    const err = new Error(`Could not publish CMS content to Supabase: ${error.message}`);
    err.statusCode = 503;
    throw err;
  }
  writeJsonFile("cms.json", newContent);
  return newContent;
}

// ---------------------------------------------------------------------------
// 6. TEAM MEMBERS
// ---------------------------------------------------------------------------
export async function getAllTeamMembers() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from(TEAM_TABLE).select("*");
    if (!error && Array.isArray(data)) {
      writeJsonFile("team.json", data);
      return data;
    }
  } catch {}
  return readJsonFile("team.json", []);
}

export async function createTeamMemberRecord(member) {
  const team = readJsonFile("team.json", []);
  const newMember = {
    id: `usr_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    name: member.name,
    email: member.email,
    role: member.role || "Associate",
    phone: member.phone || "",
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from(TEAM_TABLE).insert(newMember);
  } catch {}

  const updated = [newMember, ...team];
  writeJsonFile("team.json", updated);
  return newMember;
}

// ---------------------------------------------------------------------------
// 7. CALENDAR BOOKINGS
// ---------------------------------------------------------------------------
export async function getAllCalendarBookings() {
  return readJsonFile("calendar_bookings.json", []);
}

// ---------------------------------------------------------------------------
// 8. DYNAMIC SUMMARY METRICS
// ---------------------------------------------------------------------------
export async function getLiveSummary() {
  const [inquiries, projects, clients, bookings, invoices] = await Promise.all([
    getAllBookings(),
    getAllProjects(),
    getAllClients(),
    getAllCalendarBookings(),
    getAllInvoices(),
  ]);

  const totalInquiries = inquiries.length;
  const activeClients = clients.length;
  const ongoingProjects = projects.filter((p) => p.stage !== "Delivered").length;
  const upcomingShoots = bookings.filter((b) => b.status !== "Completed").length;
  const completedProjects = projects.filter((p) => p.stage === "Delivered").length;

  // Monthly Revenue calculated strictly from actual payments in the current calendar month
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let monthlyRevenue = 0;
  let totalRevenue = 0;

  // Sum payments from projects
  projects.forEach((proj) => {
    (proj.payments || []).forEach((pay) => {
      totalRevenue += pay.amount || 0;
      if (pay.date && pay.date.startsWith(currentMonthPrefix)) {
        monthlyRevenue += pay.amount || 0;
      }
    });
  });

  // Sum paid invoices
  invoices.forEach((inv) => {
    if (inv.status === "Paid") {
      const invDate = inv.paidDate || inv.issueDate || "";
      if (invDate.startsWith(currentMonthPrefix)) {
        monthlyRevenue += inv.amount || 0;
      }
    }
  });

  // Status Counts
  const statusCounts = {
    New: inquiries.filter((i) => i.status === "New").length,
    "In progress": inquiries.filter((i) => i.status === "In progress").length,
    Responded: inquiries.filter((i) => i.status === "Responded").length,
    Closed: inquiries.filter((i) => i.status === "Closed").length,
  };

  // Category Counts
  const categoryCounts = {
    Portraits: inquiries.filter((i) => i.category === "Portraits").length,
    Couples: inquiries.filter((i) => i.category === "Couples").length,
    Events: inquiries.filter((i) => i.category === "Events").length,
    Brands: inquiries.filter((i) => i.category === "Brands").length,
    Commercial: inquiries.filter((i) => i.category === "Commercial").length,
    Editorial: inquiries.filter((i) => i.category === "Editorial").length,
  };

  // Dynamic monthly history grouped by month from actual payments
  const monthsMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    monthsMap[key] = { month: label, collected: 0 };
  }

  projects.forEach((proj) => {
    (proj.payments || []).forEach((pay) => {
      const prefix = (pay.date || "").slice(0, 7);
      if (monthsMap[prefix]) {
        monthsMap[prefix].collected += pay.amount || 0;
      }
    });
  });

  const monthlyRevenueHistory = Object.values(monthsMap);

  return {
    totalInquiries,
    activeClients,
    ongoingProjects,
    upcomingShoots,
    completedProjects,
    monthlyRevenue,
    totalRevenue,
    statusCounts,
    categoryCounts,
    monthlyRevenueHistory,
    conversionRate: totalInquiries > 0 ? `${Math.round((projects.length / totalInquiries) * 100)}%` : "0%",
  };
}
