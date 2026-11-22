import { handleApiRequest } from "../server/apiRouter.js";

// Vercel creates a serverless function for each file in /api. Keep the public
// CMS endpoint on the same shared router used by the local Vite middleware.
export default async function handler(req, res) {
  // This endpoint is consumed by the public website and must remain read-only.
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: "Method not allowed" }));
    return;
  }

  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
