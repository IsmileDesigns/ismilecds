import { json, sameOrigin } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  if (!env.SHOP_DB) return json({ message: "The shop database is not connected yet." }, 503);
  if (!env.STRIPE_SECRET_KEY) return json({ message: "Checkout is not configured yet." }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ message: "Invalid cart." }, 400); }
  const cart = Array.isArray(input.items) ? input.items.slice(0, 10) : [];
  const ids = [...new Set(cart.map((item) => String(item.id || "")).filter(Boolean))];
  if (!ids.length) return json({ message: "Your cart is empty." }, 400);

  const placeholders = ids.map(() => "?").join(",");
  const result = await env.SHOP_DB.prepare(
    `SELECT id, name, price_cents, image_url, asset_key FROM products WHERE active = 1 AND archived = 0 AND id IN (${placeholders})`
  ).bind(...ids).all();
  const byId = new Map((result.results || []).map((product) => [product.id, product]));
  const products = cart.map((item) => ({
    product: byId.get(String(item.id)),
    quantity: Math.min(10, Math.max(1, Number.parseInt(item.quantity, 10) || 1))
  })).filter((item) => item.product);
  if (!products.length || products.some((item) => item.product.price_cents < 50 || !item.product.asset_key)) {
    return json({ message: "One or more product downloads are not ready yet." }, 409);
  }

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/shop-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop.html?checkout=cancelled`,
    allow_promotion_codes: "true",
    "metadata[product_ids]": products.map((item) => item.product.id).join(","),
    "metadata[quantities]": products.map((item) => item.quantity).join(",")
  });
  products.forEach(({ product, quantity }, index) => {
    params.set(`line_items[${index}][price_data][currency]`, "cad");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(product.price_cents));
    params.set(`line_items[${index}][price_data][product_data][name]`, product.name);
    if (/^https:\/\//.test(product.image_url)) {
      params.set(`line_items[${index}][price_data][product_data][images][0]`, product.image_url);
    }
    params.set(`line_items[${index}][quantity]`, String(quantity));
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const session = await stripeResponse.json();
  if (!stripeResponse.ok || !session.url) return json({ message: "Checkout could not be started. Please try again." }, 502);
  return json({ url: session.url });
}
