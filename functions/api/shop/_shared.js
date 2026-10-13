const encoder = new TextEncoder();

export const seedProducts = [
  {
    id: "brand-foundation-workbook",
    slug: "brand-foundation-workbook",
    name: "Brand Foundation Workbook",
    eyebrow: "Strategy tool",
    description: "A focused workbook for defining your audience, position, brand promise, voice, and next best moves.",
    price_cents: 3900,
    compare_at_cents: 0,
    category: "Brand",
    image_url: "/shop-assets/brand-foundation.webp",
    image_alt: "Ismile brand strategy workbook preview",
    asset_key: "",
    asset_name: "Ismile Brand Foundation Workbook.pdf",
    active: 1,
    featured: 1,
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z"
  },
  {
    id: "client-onboarding-os",
    slug: "client-onboarding-os",
    name: "Client Onboarding OS",
    eyebrow: "Systems kit",
    description: "A clean client journey with intake prompts, kickoff checklists, handoff templates, and automation maps.",
    price_cents: 5900,
    compare_at_cents: 0,
    category: "Systems",
    image_url: "/shop-assets/client-onboarding.webp",
    image_alt: "Client onboarding system template preview",
    asset_key: "",
    asset_name: "Ismile Client Onboarding OS.zip",
    active: 1,
    featured: 1,
    created_at: "2026-10-02T00:00:00.000Z",
    updated_at: "2026-10-02T00:00:00.000Z"
  },
  {
    id: "website-copy-prompt-deck",
    slug: "website-copy-prompt-deck",
    name: "Website Copy Prompt Deck",
    eyebrow: "Copy resource",
    description: "Sharp prompts and page-by-page guidance for writing a website that sounds human and moves people to act.",
    price_cents: 2900,
    compare_at_cents: 0,
    category: "Web",
    image_url: "/shop-assets/copy-prompt-deck.webp",
    image_alt: "Website copy prompt deck on a laptop",
    asset_key: "",
    asset_name: "Ismile Website Copy Prompt Deck.pdf",
    active: 1,
    featured: 0,
    created_at: "2026-10-03T00:00:00.000Z",
    updated_at: "2026-10-03T00:00:00.000Z"
  },
  {
    id: "content-planning-system",
    slug: "content-planning-system",
    name: "No-Fluff Content Planner",
    eyebrow: "Marketing template",
    description: "A practical content system for turning one strong idea into a month of useful, on-brand marketing.",
    price_cents: 2400,
    compare_at_cents: 0,
    category: "Marketing",
    image_url: "/shop-assets/content-planner.webp",
    image_alt: "Digital content planning template preview",
    asset_key: "",
    asset_name: "Ismile No-Fluff Content Planner.zip",
    active: 1,
    featured: 0,
    created_at: "2026-10-04T00:00:00.000Z",
    updated_at: "2026-10-04T00:00:00.000Z"
  }
];

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

export async function verifyPassword(password, encodedHash) {
  if (typeof password !== "string" || !encodedHash) return false;
  const [version, iterationText, saltText, hashText] = encodedHash.split("$");
  const iterations = Number.parseInt(iterationText, 10);
  if (version !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < 210000) return false;
  try {
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64UrlToBytes(saltText),
      iterations
    }, key, 256);
    return safeEqual(new Uint8Array(bits), base64UrlToBytes(hashText));
  } catch {
    return false;
  }
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

export async function createSessionCookie(email, secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + (8 * 60 * 60);
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ email, expiresAt })));
  const signature = await sign(payload, secret);
  return `ismile_shop_admin=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export function clearSessionCookie() {
  return "ismile_shop_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

export async function getAdmin(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return null;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)ismile_shop_admin=([^;]+)/);
  if (!match) return null;
  const [payload, suppliedSignature] = match[1].split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = await sign(payload, env.ADMIN_SESSION_SECRET);
  if (!safeEqual(encoder.encode(suppliedSignature), encoder.encode(expectedSignature))) return null;
  try {
    const session = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    if (!session.email || session.expiresAt < Math.floor(Date.now() / 1000)) return null;
    if (env.ADMIN_EMAIL && session.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin(request, env) {
  const admin = await getAdmin(request, env);
  return admin || null;
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cleanProduct(input) {
  const name = String(input.name || "").trim().slice(0, 120);
  const slug = slugify(input.slug || name);
  const price = Number.parseInt(input.price_cents, 10);
  const compareAt = Number.parseInt(input.compare_at_cents || 0, 10);
  if (!name || !slug || !Number.isInteger(price) || price < 0 || price > 100000000) return null;
  return {
    name,
    slug,
    eyebrow: String(input.eyebrow || "Digital resource").trim().slice(0, 60),
    description: String(input.description || "").trim().slice(0, 1000),
    price_cents: price,
    compare_at_cents: Number.isInteger(compareAt) && compareAt > price ? compareAt : 0,
    category: String(input.category || "Resources").trim().slice(0, 60),
    image_url: String(input.image_url || "").trim().slice(0, 500),
    image_alt: String(input.image_alt || name).trim().slice(0, 180),
    asset_key: String(input.asset_key || "").trim().slice(0, 500),
    asset_name: String(input.asset_name || `${slug}.zip`).trim().replace(/[\r\n"]/g, "").slice(0, 180),
    active: input.active === true || input.active === 1 || input.active === "1" ? 1 : 0,
    featured: input.featured === true || input.featured === 1 || input.featured === "1" ? 1 : 0
  };
}

export async function stripeGet(env, path) {
  if (!env.STRIPE_SECRET_KEY) return null;
  return fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
}
