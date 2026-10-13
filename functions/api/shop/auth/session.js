import { getAdmin, json } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const admin = await getAdmin(request, env);
  return admin
    ? json({ authenticated: true, user: { email: admin.email } })
    : json({ authenticated: false }, 401);
}
