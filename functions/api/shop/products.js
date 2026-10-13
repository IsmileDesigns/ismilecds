import { cleanProduct, json, requireAdmin, sameOrigin, seedProducts } from "./_shared.js";

export async function onRequestGet({ env }) {
  if (!env.SHOP_DB) return json({ products: seedProducts, preview: true });
  try {
    const result = await env.SHOP_DB.prepare(
      "SELECT * FROM products WHERE active = 1 AND archived = 0 ORDER BY featured DESC, created_at DESC"
    ).all();
    return json({ products: result.results || [] }, 200, { "Cache-Control": "public, max-age=60" });
  } catch {
    return json({ products: seedProducts, preview: true });
  }
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  if (!await requireAdmin(request, env)) return json({ message: "Sign in required." }, 401);
  if (!env.SHOP_DB) return json({ message: "Connect the SHOP_DB binding before adding products." }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ message: "Invalid product data." }, 400); }
  const product = cleanProduct(input);
  if (!product) return json({ message: "Add a valid product name and price." }, 400);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await env.SHOP_DB.prepare(
      `INSERT INTO products (id, slug, name, eyebrow, description, price_cents, compare_at_cents, category, image_url, image_alt, asset_key, asset_name, active, featured, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, product.slug, product.name, product.eyebrow, product.description, product.price_cents,
      product.compare_at_cents, product.category, product.image_url, product.image_alt, product.asset_key,
      product.asset_name, product.active, product.featured, now, now).run();
    return json({ product: { id, ...product, created_at: now, updated_at: now } }, 201);
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) return json({ message: "That product URL is already in use." }, 409);
    return json({ message: "The product could not be saved." }, 500);
  }
}
