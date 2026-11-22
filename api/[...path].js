import { handleApiRequest } from "../server/apiRouter.js";

// Route nested API paths (for example /api/admin/projects/:id) through the
// shared handler in Vercel's serverless environment.
export default async function handler(req, res) {
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
