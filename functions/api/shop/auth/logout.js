import { clearSessionCookie, json, sameOrigin } from "../_shared.js";

export async function onRequestPost({ request }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}
