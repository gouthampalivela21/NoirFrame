import { handleApiRequest } from "../server/apiRouter.js";

export default async function handler(req, res) {
  const route = new URL(req.url, "http://localhost").searchParams.get("route");
  if (route?.startsWith("/api/bookings/")) req.url = route;
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
