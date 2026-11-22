import { auth } from "../../lib/firebase.js";

// Attach the current Firebase session token to every private admin API call.
export async function adminApiFetch(input, init = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Your admin session has expired. Sign in again to continue.");
  }

  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
