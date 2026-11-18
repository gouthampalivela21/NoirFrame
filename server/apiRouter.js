import url from "url";
import {
  generateToken,
  verifyTokenDetailed,
  authenticateRequestDetailed,
  verifyFounderSetupSecret,
  getFounderSetupSecret,
  getConfiguredFounderEmail,
} from "./auth.js";
import {
  hasFounder,
  getAllMembers,
  getTeamSummary,
  getMemberByEmail,
  createFounder,
  inviteMember,
  resendInvitation,
  verifyInviteToken,
  acceptInvitation,
  updateMember,
  removeMember,
  verifyPassword,
  sanitizeMember,
  recordLastLogin,
  activateInvitedMemberViaOAuth,
} from "./teamDb.js";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getStatsSummary,
} from "./db.js";
import { saveUploadedFile, handleFileDownload } from "./uploads.js";

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 50 * 1024 * 1024) {
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-admin-token, Accept"
  );
  res.end(JSON.stringify(payload));
}

function enforceAuth(req, res, allowedRoles = ["Founder", "Admin", "Viewer"]) {
  const auth = authenticateRequestDetailed(req, allowedRoles);
  if (auth.statusCode !== 200 || !auth.user) {
    sendJson(res, auth.statusCode || 401, {
      success: false,
      error: auth.statusCode === 403 ? "Forbidden" : "Unauthorized",
      message: auth.error || "Authentication required.",
    });
    return null;
  }
  return auth.user;
}

export async function handleApiRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname.replace(/\/$/, "");
  req.query = parsedUrl.query;

  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-admin-token, Accept"
    );
    res.end();
    return true;
  }

  // -------------------------------------------------------------------------
  // 1A. FIRST-RUN SETUP STATUS: GET /api/auth/setup-status
  // -------------------------------------------------------------------------
  if (pathname === "/api/auth/setup-status") {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }

    const founderConfigured = hasFounder();
    const setupKeyConfigured = Boolean(getFounderSetupSecret());
    const pinnedEmail = getConfiguredFounderEmail();

    sendJson(res, 200, {
      success: true,
      founderConfigured,
      setupKeyConfigured,
      founderEmailPinned: Boolean(pinnedEmail),
    });
    return true;
  }

  // -------------------------------------------------------------------------
  // 1B. SECURE FIRST-RUN FOUNDER SETUP: POST /api/auth/setup-founder
  // -------------------------------------------------------------------------
  if (pathname === "/api/auth/setup-founder") {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }

    if (hasFounder()) {
      sendJson(res, 409, {
        success: false,
        error: "Already Configured",
        message: "A Founder account is already configured. Please sign in with your account credentials.",
      });
      return true;
    }

    if (!getFounderSetupSecret()) {
      sendJson(res, 503, {
        success: false,
        error: "Setup Secret Not Configured",
        message:
          "Set FOUNDER_SETUP_SECRET (or ADMIN_ACCESS_KEY) in your server .env file before initializing the Founder account.",
      });
      return true;
    }

    const body = await parseJsonBody(req);
    const { setupKey, name, email, password } = body;

    if (!verifyFounderSetupSecret(setupKey)) {
      sendJson(res, 403, {
        success: false,
        error: "Invalid Setup Key",
        message:
          "The provided server setup key is incorrect. Check FOUNDER_SETUP_SECRET (or ADMIN_ACCESS_KEY) in your .env file.",
      });
      return true;
    }

    const pinnedEmail = getConfiguredFounderEmail();
    if (pinnedEmail && String(email || "").trim().toLowerCase() !== pinnedEmail) {
      sendJson(res, 403, {
        success: false,
        error: "Email Mismatch",
        message: "The email entered does not match the FOUNDER_EMAIL configured on the server.",
      });
      return true;
    }

    try {
      const founder = createFounder({ name, email, password });
      const token = generateToken(founder);
      sendJson(res, 201, {
        success: true,
        token,
        user: sanitizeMember(founder),
        message: "Founder account created and secured successfully.",
      });
    } catch (err) {
      sendJson(res, err.statusCode || 400, {
        success: false,
        error: err.message || "Could not initialize Founder account.",
      });
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // 1C. INVITATION LOOKUP & ACCEPTANCE:
  //     GET /api/auth/invite/:token
  //     POST /api/auth/accept-invite
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/api/auth/invite/")) {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }
    const rawToken = decodeURIComponent(pathname.replace("/api/auth/invite/", "").trim());
    const info = verifyInviteToken(rawToken);
    if (!info) {
      sendJson(res, 404, {
        success: false,
        valid: false,
        error: "Invitation not found or already used.",
      });
      return true;
    }
    if (info.expired) {
      sendJson(res, 410, {
        success: false,
        valid: false,
        expired: true,
        error: "This invitation has expired. Please ask the studio Founder to resend your invitation.",
      });
      return true;
    }

    sendJson(res, 200, {
      success: true,
      valid: true,
      invite: info,
    });
    return true;
  }

  if (pathname === "/api/auth/accept-invite") {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }

    const body = await parseJsonBody(req);
    const { token: rawToken, name, password } = body;

    try {
      const activated = acceptInvitation({ rawToken, name, password });
      const authToken = generateToken(activated);
      sendJson(res, 200, {
        success: true,
        token: authToken,
        user: sanitizeMember(activated),
        message: "Invitation accepted. Welcome to Phantom Labs.",
      });
    } catch (err) {
      sendJson(res, err.statusCode || 400, {
        success: false,
        error: err.message || "Could not accept invitation.",
      });
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // 1D. AUTHENTICATION ROUTE: POST /api/auth
  // -------------------------------------------------------------------------
  if (pathname === "/api/auth") {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }

    const body = await parseJsonBody(req);
    const { token, email, password, googleEmail, googleName, googleAvatar } = body;

    // A. Live Session Token Validation (resolves live role & revocation status)
    if (token) {
      const check = verifyTokenDetailed(token);
      if (check.statusCode === 200 && check.user) {
        sendJson(res, 200, {
          success: true,
          valid: true,
          user: check.user,
        });
        return true;
      }
      sendJson(res, 401, {
        success: false,
        valid: false,
        error: check.error || "Session expired or invalid.",
      });
      return true;
    }

    // Reject logins before Founder first-run setup is completed
    if (!hasFounder()) {
      sendJson(res, 409, {
        success: false,
        needsSetup: true,
        error: "Founder Setup Required",
        message: "No Founder account has been configured yet. Complete initial Founder setup first.",
      });
      return true;
    }

    // B. Email + Password Sign-In (Founder, Admin, Viewer)
    if (email && password) {
      const member = getMemberByEmail(email);
      if (!member) {
        sendJson(res, 401, {
          success: false,
          authorized: false,
          error: "Invalid Credentials",
          message: "Incorrect email or password.",
        });
        return true;
      }

      if (member.status === "Invited") {
        sendJson(res, 403, {
          success: false,
          authorized: false,
          error: "Invitation Pending",
          message:
            "Your invitation has not been accepted yet. Please open the invitation link sent by the Founder to set your password.",
        });
        return true;
      }

      if (member.status !== "Active") {
        sendJson(res, 403, {
          success: false,
          authorized: false,
          error: "Access Revoked",
          message: "Your access to Phantom Labs has been revoked. Please contact the studio Founder.",
        });
        return true;
      }

      if (!member.passwordHash || !verifyPassword(password, member.passwordHash)) {
        sendJson(res, 401, {
          success: false,
          authorized: false,
          error: "Invalid Credentials",
          message: "Incorrect email or password.",
        });
        return true;
      }

      const updated = recordLastLogin(member.id) || member;
      const authToken = generateToken(updated);

      sendJson(res, 200, {
        success: true,
        authorized: true,
        token: authToken,
        user: sanitizeMember(updated),
        message: "Signed in successfully.",
      });
      return true;
    }

    // C. Google OAuth Server-Side Verification (matches live team.json)
    if (googleEmail) {
      const member = getMemberByEmail(googleEmail);
      if (!member) {
        sendJson(res, 403, {
          success: false,
          authorized: false,
          error: "Access Restricted",
          message: "This Google account is not authorised to access the PHANTOM LABS studio workspace.",
        });
        return true;
      }

      if (member.status === "Revoked") {
        sendJson(res, 403, {
          success: false,
          authorized: false,
          error: "Access Revoked",
          message: "This account's access has been revoked. Please contact the studio Founder.",
        });
        return true;
      }

      let activeMember = member;
      if (member.status === "Invited") {
        if (member.inviteExpiresAt && new Date(member.inviteExpiresAt).getTime() < Date.now()) {
          sendJson(res, 403, {
            success: false,
            authorized: false,
            error: "Invitation Expired",
            message: "Your invitation has expired. Ask the studio Founder to resend your invitation.",
          });
          return true;
        }
        activeMember = activateInvitedMemberViaOAuth(member.id, {
          name: googleName || member.name,
          avatar: googleAvatar || member.avatar,
        });
      } else {
        activeMember = recordLastLogin(member.id, {
          name: googleName || member.name,
          avatar: googleAvatar || member.avatar,
        });
      }

      const authToken = generateToken(activeMember);
      sendJson(res, 200, {
        success: true,
        authorized: true,
        token: authToken,
        user: sanitizeMember(activeMember),
        message: "Google account verified successfully.",
      });
      return true;
    }

    sendJson(res, 400, {
      success: false,
      error: "Please enter both your email address and password.",
    });
    return true;
  }

  // -------------------------------------------------------------------------
  // 2. TEAM MANAGEMENT ROUTES: /api/team* (FOUNDER ONLY — BACKEND ENFORCED)
  // -------------------------------------------------------------------------
  if (pathname === "/api/team") {
    const founder = enforceAuth(req, res, ["Founder"]);
    if (!founder) return true;

    if (req.method === "GET") {
      sendJson(res, 200, {
        success: true,
        members: getAllMembers(),
        summary: getTeamSummary(),
      });
      return true;
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  if (pathname === "/api/team/invite") {
    const founder = enforceAuth(req, res, ["Founder"]);
    if (!founder) return true;

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const { email, name, role } = body;
      const result = inviteMember({
        email,
        name,
        role: role || "Viewer",
        invitedBy: founder,
      });

      sendJson(res, 201, {
        success: true,
        member: result.member,
        inviteToken: result.inviteToken,
        invitePath: `/admin/invite/${result.inviteToken}`,
        expiresAt: result.expiresAt,
        summary: getTeamSummary(),
        message: `Invitation created for ${result.member.email} as ${result.member.role}.`,
      });
    } catch (err) {
      sendJson(res, err.statusCode || 400, {
        success: false,
        error: err.message || "Could not create invitation.",
      });
    }
    return true;
  }

  // POST /api/team/:id/resend
  if (pathname.startsWith("/api/team/") && pathname.endsWith("/resend")) {
    const founder = enforceAuth(req, res, ["Founder"]);
    if (!founder) return true;

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }

    const memberId = pathname.replace("/api/team/", "").replace(/\/resend$/, "").trim();
    try {
      const result = resendInvitation(memberId, founder);
      sendJson(res, 200, {
        success: true,
        member: result.member,
        inviteToken: result.inviteToken,
        invitePath: `/admin/invite/${result.inviteToken}`,
        expiresAt: result.expiresAt,
        summary: getTeamSummary(),
        message: `Fresh invitation generated for ${result.member.email}.`,
      });
    } catch (err) {
      sendJson(res, err.statusCode || 400, {
        success: false,
        error: err.message || "Could not resend invitation.",
      });
    }
    return true;
  }

  // PATCH / DELETE /api/team/:id
  if (pathname.startsWith("/api/team/")) {
    const founder = enforceAuth(req, res, ["Founder"]);
    if (!founder) return true;

    const memberId = pathname.replace("/api/team/", "").trim();

    if (req.method === "PATCH") {
      try {
        const body = await parseJsonBody(req);
        const updated = updateMember(memberId, body, founder);
        sendJson(res, 200, {
          success: true,
          member: updated,
          summary: getTeamSummary(),
          message: `Updated ${updated.email} successfully.`,
        });
      } catch (err) {
        sendJson(res, err.statusCode || 400, {
          success: false,
          error: err.message || "Could not update team member.",
        });
      }
      return true;
    }

    if (req.method === "DELETE") {
      try {
        const removed = removeMember(memberId);
        sendJson(res, 200, {
          success: true,
          removed,
          summary: getTeamSummary(),
          message: `Removed ${removed.email} and revoked access.`,
        });
      } catch (err) {
        sendJson(res, err.statusCode || 400, {
          success: false,
          error: err.message || "Could not remove team member.",
        });
      }
      return true;
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // 3. BOOKINGS COLLECTION ROUTE: /api/bookings
  // -------------------------------------------------------------------------
  if (pathname === "/api/bookings") {
    // GET: Founder, Admin, Viewer (read access)
    if (req.method === "GET") {
      const actor = enforceAuth(req, res, ["Founder", "Admin", "Viewer"]);
      if (!actor) return true;

      const bookings = getAllBookings({
        search: req.query.search,
        status: req.query.status,
        category: req.query.category,
        sort: req.query.sort,
      });

      const summary = getStatsSummary();

      sendJson(res, 200, {
        success: true,
        bookings,
        summary,
        count: bookings.length,
        adminUser: {
          id: actor.id,
          name: actor.name,
          email: actor.email,
          role: actor.role,
        },
      });
      return true;
    }

    // POST: Public submission from creative booking brief forms
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

        if (!email || !String(email).trim()) {
          sendJson(res, 400, {
            success: false,
            error: "Valid email address is required.",
          });
          return true;
        }

        const newBooking = createBooking(body);

        sendJson(res, 201, {
          success: true,
          booking: newBooking,
          message: "Project brief successfully received and logged into studio workspace.",
        });
        return true;
      } catch (err) {
        console.error("[API] Error creating booking:", err);
        sendJson(res, 500, { success: false, error: "Internal server error" });
        return true;
      }
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // 4. BOOKINGS METRICS SUMMARY: /api/bookings/summary
  // -------------------------------------------------------------------------
  if (pathname === "/api/bookings/summary") {
    const actor = enforceAuth(req, res, ["Founder", "Admin", "Viewer"]);
    if (!actor) return true;

    const summary = getStatsSummary();
    sendJson(res, 200, { success: true, summary });
    return true;
  }

  // -------------------------------------------------------------------------
  // 5. INDIVIDUAL BOOKING: /api/bookings/:id
  //    GET: Founder, Admin, Viewer
  //    PATCH / DELETE: Founder, Admin ONLY (Viewer receives 403 Forbidden)
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/api/bookings/")) {
    const bookingId = pathname.replace("/api/bookings/", "").trim();

    if (req.method === "GET") {
      const actor = enforceAuth(req, res, ["Founder", "Admin", "Viewer"]);
      if (!actor) return true;

      const booking = getBookingById(bookingId);
      if (!booking) {
        sendJson(res, 404, { success: false, error: "Booking request not found" });
        return true;
      }
      sendJson(res, 200, { success: true, booking });
      return true;
    }

    if (req.method === "PATCH") {
      const actor = enforceAuth(req, res, ["Founder", "Admin"]);
      if (!actor) return true;

      try {
        const body = await parseJsonBody(req);
        const updated = updateBooking(bookingId, body, actor);
        if (!updated) {
          sendJson(res, 404, { success: false, error: "Booking request not found" });
          return true;
        }
        sendJson(res, 200, {
          success: true,
          booking: updated,
          summary: getStatsSummary(),
        });
      } catch (err) {
        sendJson(res, err.statusCode || 400, {
          success: false,
          error: err.message || "Failed to update booking request.",
        });
      }
      return true;
    }

    if (req.method === "DELETE") {
      const actor = enforceAuth(req, res, ["Founder", "Admin"]);
      if (!actor) return true;

      const success = deleteBooking(bookingId);
      if (!success) {
        sendJson(res, 404, { success: false, error: "Booking request not found" });
        return true;
      }
      sendJson(res, 200, {
        success: true,
        message: "Booking request deleted successfully",
        deletedBy: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
        summary: getStatsSummary(),
      });
      return true;
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  // -------------------------------------------------------------------------
  // 6. SECURE UPLOADS: /api/uploads and /api/uploads/:fileId
  // -------------------------------------------------------------------------
  if (pathname === "/api/uploads") {
    if (req.method === "POST") {
      try {
        const body = await parseJsonBody(req);
        const fileInfo = await saveUploadedFile(body);
        sendJson(res, 201, { success: true, file: fileInfo });
        return true;
      } catch (err) {
        sendJson(res, 400, { success: false, error: err.message || "Upload failed" });
        return true;
      }
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  if (pathname.startsWith("/api/uploads/")) {
    const fileId = pathname.replace("/api/uploads/", "").trim();
    if (req.method === "GET") {
      await handleFileDownload(req, res, fileId);
      return true;
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  return false;
}
