export async function onRequestGet({ request, env }) {
  if (!env.SHOP_ASSETS) return new Response("Not found", { status: 404 });
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!key.startsWith("images/") || key.includes("..")) return new Response("Not found", { status: 404 });
  const object = await env.SHOP_ASSETS.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
}
