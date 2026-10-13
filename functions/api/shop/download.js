import { stripeGet } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") || "";
  const productId = url.searchParams.get("product_id") || "";
  if (!/^cs_(test_|live_)[A-Za-z0-9]+$/.test(sessionId) || !productId || !env.SHOP_DB || !env.SHOP_ASSETS) {
    return new Response("Not found", { status: 404 });
  }
  const stripeResponse = await stripeGet(env, `checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (!stripeResponse || !stripeResponse.ok) return new Response("Order not found", { status: 404 });
  const session = await stripeResponse.json();
  const purchasedIds = String(session.metadata?.product_ids || "").split(",");
  if (session.payment_status !== "paid" || !purchasedIds.includes(productId)) return new Response("Not authorized", { status: 403 });
  const product = await env.SHOP_DB.prepare(
    "SELECT asset_key, asset_name FROM products WHERE id = ?"
  ).bind(productId).first();
  if (!product?.asset_key || !product.asset_key.startsWith("downloads/")) return new Response("Download not available", { status: 404 });
  const object = await env.SHOP_ASSETS.get(product.asset_key);
  if (!object) return new Response("Download not available", { status: 404 });
  const fileName = String(product.asset_name || "ismile-download.zip").replace(/[\r\n"]/g, "");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}
