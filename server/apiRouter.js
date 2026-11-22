import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllProjects,
  createProjectRecord,
  updateProjectRecord,
  deleteProjectRecord,
  getAllClients,
  createClientRecord,
  updateClientRecord,
  deleteClientRecord,
  getAllInvoices,
  createInvoiceRecord,
  updateInvoiceRecord,
  getCMSContent,
  updateCMSContent,
  getAllTeamMembers,
  createTeamMemberRecord,
  getAllCalendarBookings,
  getLiveSummary,
} from "./db.js";
import { saveUploadedFile, handleFileDownload, saveCmsImage } from "./uploads.js";

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 25 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res) {
  const parsedUrl = new URL(req.url, "http://localhost");
  const pathname = parsedUrl.pathname.replace(/\/$/, "");

  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept"
    );
    res.end();
    return true;
  }

  // -------------------------------------------------------------------------
  // SUMMARY METRICS: GET /api/admin/summary
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/summary") {
    if (req.method === "GET") {
      try {
        const summary = await getLiveSummary();
        sendJson(res, 200, { success: true, summary });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // BOOKINGS / INQUIRIES: /api/bookings and /api/admin/bookings
  // -------------------------------------------------------------------------
  if (pathname === "/api/bookings" || pathname === "/api/admin/bookings") {
    if (req.method === "GET") {
      try {
        const search = parsedUrl.searchParams.get("search") || "";
        const status = parsedUrl.searchParams.get("status") || "All";
        const category = parsedUrl.searchParams.get("category") || "All";
        const bookings = await getAllBookings({ search, status, category });
        sendJson(res, 200, { success: true, bookings });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const clientName = body.contact?.name || body.clientName;
        const email = body.contact?.email || body.email;

        if (!clientName || !String(clientName).trim()) {
          sendJson(res, 400, {
            success: false,
            error: "Full Name or organization is required.",
          });
          return true;
        }

        const newBooking = await createBooking(body);
        sendJson(res, 201, {
          success: true,
          booking: newBooking,
          message: "Project brief successfully received.",
        });
      } catch (err) {
        sendJson(res, err.statusCode || 500, {
          success: false,
          error: "Unable to submit project brief right now.",
        });
      }
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  // Parameterized /api/bookings/:id or /api/admin/bookings/:id
  const bookingMatch = pathname.match(/^\/api\/(?:admin\/)?bookings\/([a-zA-Z0-9_\-]+)$/);
  if (bookingMatch) {
    const bookingId = bookingMatch[1];

    if (req.method === "GET") {
      const item = await getBookingById(bookingId);
      if (!item) {
        sendJson(res, 404, { success: false, error: "Booking not found" });
      } else {
        sendJson(res, 200, { success: true, booking: item });
      }
      return true;
    }

    if (req.method === "PATCH") {
      try {
        const body = await parseJsonBody(req);
        const updated = await updateBooking(bookingId, body);
        sendJson(res, 200, { success: true, booking: updated });
      } catch (err) {
        sendJson(res, err.statusCode || 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "DELETE") {
      try {
        await deleteBooking(bookingId);
        sendJson(res, 200, { success: true, message: "Booking deleted" });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // PROJECTS / SESSIONS: /api/admin/projects
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/projects") {
    if (req.method === "GET") {
      try {
        const projects = await getAllProjects();
        sendJson(res, 200, { success: true, projects });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const created = await createProjectRecord(body);
        sendJson(res, 201, { success: true, project: created });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  const projectMatch = pathname.match(/^\/api\/admin\/projects\/([a-zA-Z0-9_\-]+)$/);
  if (projectMatch) {
    const projectId = projectMatch[1];

    if (req.method === "PATCH") {
      try {
        const body = await parseJsonBody(req);
        const updated = await updateProjectRecord(projectId, body);
        sendJson(res, 200, { success: true, project: updated });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "DELETE") {
      try {
        await deleteProjectRecord(projectId);
        sendJson(res, 200, { success: true, message: "Project deleted" });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // CLIENTS: /api/admin/clients
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/clients") {
    if (req.method === "GET") {
      try {
        const clients = await getAllClients();
        sendJson(res, 200, { success: true, clients });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const created = await createClientRecord(body);
        sendJson(res, 201, { success: true, client: created });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  const clientMatch = pathname.match(/^\/api\/admin\/clients\/([a-zA-Z0-9_\-]+)$/);
  if (clientMatch) {
    const clientId = clientMatch[1];
    if (req.method === "PATCH") {
      try {
        const body = await parseJsonBody(req);
        const updated = await updateClientRecord(clientId, body);
        sendJson(res, 200, { success: true, client: updated });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "DELETE") {
      try {
        await deleteClientRecord(clientId);
        sendJson(res, 200, { success: true, message: "Client deleted" });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // INVOICES: /api/admin/invoices
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/invoices") {
    if (req.method === "GET") {
      try {
        const invoices = await getAllInvoices();
        sendJson(res, 200, { success: true, invoices });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const created = await createInvoiceRecord(body);
        sendJson(res, 201, { success: true, invoice: created });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
  }

  const invoiceMatch = pathname.match(/^\/api\/admin\/invoices\/([a-zA-Z0-9_\-]+)$/);
  if (invoiceMatch) {
    const invId = invoiceMatch[1];
    if (req.method === "PATCH") {
      try {
        const body = await parseJsonBody(req);
        const updated = await updateInvoiceRecord(invId, body);
        sendJson(res, 200, { success: true, invoice: updated });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // CMS: /api/admin/cms & /api/cms (PUBLIC & ADMIN UNIFIED DATA LAYER)
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/cms" || pathname === "/api/cms") {
    if (req.method === "GET") {
      try {
        const cms = await getCMSContent();
        sendJson(res, 200, { success: true, cms });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "PUT" || req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const updated = await updateCMSContent(body);
        sendJson(res, 200, { success: true, cms: updated });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // IMAGE UPLOADS: POST /api/admin/upload-image (1-CLICK REPLACEMENT)
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/upload-image") {
    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const result = await saveCmsImage(body);
        sendJson(res, 201, result);
      } catch (err) {
        sendJson(res, err.statusCode || 400, {
          success: false,
          error: err.message || "Image upload failed.",
        });
      }
      return true;
    }
    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // TEAM: /api/admin/team
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/team") {
    if (req.method === "GET") {
      try {
        const team = await getAllTeamMembers();
        sendJson(res, 200, { success: true, team });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }

    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const created = await createTeamMemberRecord(body);
        sendJson(res, 201, { success: true, member: created });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // CALENDAR: /api/admin/calendar
  // -------------------------------------------------------------------------
  if (pathname === "/api/admin/calendar") {
    if (req.method === "GET") {
      try {
        const bookings = await getAllCalendarBookings();
        sendJson(res, 200, { success: true, bookings });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // FILE UPLOADS: POST /api/uploads & GET /api/uploads/:fileId
  // -------------------------------------------------------------------------
  if (pathname === "/api/uploads") {
    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const fileInfo = await saveUploadedFile(body);
        sendJson(res, 201, { success: true, file: fileInfo });
      } catch (err) {
        sendJson(res, err.statusCode || 400, {
          success: false,
          error: err.statusCode && err.statusCode < 500 ? err.message : "Upload failed.",
        });
      }
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  if (pathname.startsWith("/api/uploads/")) {
    const fileId = decodeURIComponent(pathname.replace("/api/uploads/", "").trim());
    if (req.method === "GET") {
      await handleFileDownload(req, res, fileId);
      return true;
    }

    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return true;
  }

  return false;
}
