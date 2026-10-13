import { json, stripeGet } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const sessionId = new URL(request.url).searchParams.get("session_id") || "";
  if (!/^cs_(test_|live_)[A-Za-z0-9]+$/.test(sessionId)) return json({ message: "Invalid order reference." }, 400);
  const stripeResponse = await stripeGet(env, `checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (!stripeResponse) return json({ message: "Checkout is not configured yet." }, 503);
  const session = await stripeResponse.json();
  if (!stripeResponse.ok) return json({ message: "Order not found." }, 404);
  if (session.payment_status !== "paid") return json({ status: session.payment_status || "unpaid" }, 202);
  const ids = String(session.metadata?.product_ids || "").split(",").filter(Boolean);
  if (!env.SHOP_DB || !ids.length) return json({ status: "paid", email: session.customer_details?.email || "", downloads: [] });
  const placeholders = ids.map(() => "?").join(",");
  const result = await env.SHOP_DB.prepare(
    `SELECT id, name, asset_key, asset_name FROM products WHERE id IN (${placeholders})`
  ).bind(...ids).all();
  const downloads = (result.results || []).filter((product) => product.asset_key).map((product) => ({
    name: product.name,
    url: `/api/shop/download?session_id=${encodeURIComponent(sessionId)}&product_id=${encodeURIComponent(product.id)}`
  }));
  return json({ status: "paid", email: session.customer_details?.email || "", downloads });
}
