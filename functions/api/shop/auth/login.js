import { createSessionCookie, json, sameOrigin, verifyPassword } from "../_shared.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET) {
    return json({ message: "Admin sign-in has not been configured yet." }, 503);
  }

  let input;
  try { input = await request.json(); } catch { return json({ message: "Invalid sign-in request." }, 400); }
  const email = String(input.email || "").trim().toLowerCase();
  const passwordMatches = await verifyPassword(input.password, env.ADMIN_PASSWORD_HASH);
  const emailMatches = email === env.ADMIN_EMAIL.toLowerCase();

  if (!emailMatches || !passwordMatches) {
    return json({ message: "That email or password is not correct." }, 401);
  }

  return json({ user: { email } }, 200, {
    "Set-Cookie": await createSessionCookie(email, env.ADMIN_SESSION_SECRET)
  });
}
