import { cleanProduct, json, requireAdmin, sameOrigin } from "../_shared.js";

export async function onRequestPut({ request, env, params }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  if (!await requireAdmin(request, env)) return json({ message: "Sign in required." }, 401);
  if (!env.SHOP_DB) return json({ message: "Connect the SHOP_DB binding to manage products." }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ message: "Invalid product data." }, 400); }
  const product = cleanProduct(input);
  if (!product) return json({ message: "Add a valid product name and price." }, 400);
  const now = new Date().toISOString();
  try {
    const result = await env.SHOP_DB.prepare(
      `UPDATE products SET slug = ?, name = ?, eyebrow = ?, description = ?, price_cents = ?, compare_at_cents = ?, category = ?, image_url = ?, image_alt = ?, asset_key = ?, asset_name = ?, active = ?, featured = ?, updated_at = ? WHERE id = ?`
    ).bind(product.slug, product.name, product.eyebrow, product.description, product.price_cents,
      product.compare_at_cents, product.category, product.image_url, product.image_alt, product.asset_key,
      product.asset_name, product.active, product.featured, now, params.id).run();
    if (!result.meta || result.meta.changes < 1) return json({ message: "Product not found." }, 404);
    return json({ product: { id: params.id, ...product, updated_at: now } });
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) return json({ message: "That product URL is already in use." }, 409);
    return json({ message: "The product could not be updated." }, 500);
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  if (!await requireAdmin(request, env)) return json({ message: "Sign in required." }, 401);
  if (!env.SHOP_DB) return json({ message: "Connect the SHOP_DB binding to manage products." }, 503);
  const result = await env.SHOP_DB.prepare(
    "UPDATE products SET archived = 1, active = 0, updated_at = ? WHERE id = ? AND archived = 0"
  ).bind(new Date().toISOString(), params.id).run();
  if (!result.meta || result.meta.changes < 1) return json({ message: "Product not found." }, 404);
  return json({ ok: true });
}
