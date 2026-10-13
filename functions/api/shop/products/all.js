import { json, requireAdmin } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ message: "Sign in required." }, 401);
  if (!env.SHOP_DB) return json({ message: "Connect the SHOP_DB binding to manage products." }, 503);
  const result = await env.SHOP_DB.prepare(
    "SELECT * FROM products WHERE archived = 0 ORDER BY updated_at DESC"
  ).all();
  return json({ products: result.results || [] });
}
