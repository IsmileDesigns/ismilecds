import { json, requireAdmin, sameOrigin } from "./_shared.js";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const FILE_TYPES = new Set([
  "application/pdf", "application/zip", "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream"
]);

function safeExtension(name) {
  const match = String(name || "").toLowerCase().match(/\.([a-z0-9]{1,8})$/);
  return match ? `.${match[1]}` : "";
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ message: "Request not allowed." }, 403);
  if (!await requireAdmin(request, env)) return json({ message: "Sign in required." }, 401);
  if (!env.SHOP_ASSETS) return json({ message: "Connect the SHOP_ASSETS binding before uploading files." }, 503);

  let form;
  try { form = await request.formData(); } catch { return json({ message: "Invalid upload." }, 400); }
  const file = form.get("file");
  const kind = form.get("kind") === "download" ? "download" : "image";
  if (!(file instanceof File) || file.size < 1) return json({ message: "Choose a file to upload." }, 400);
  const allowed = kind === "image" ? IMAGE_TYPES : FILE_TYPES;
  const limit = kind === "image" ? 8 * 1024 * 1024 : 50 * 1024 * 1024;
  if (!allowed.has(file.type) || file.size > limit) {
    return json({ message: kind === "image" ? "Use a JPG, PNG, WebP, or GIF under 8 MB." : "Use a PDF, ZIP, DOCX, or XLSX under 50 MB." }, 400);
  }

  const key = `${kind === "image" ? "images" : "downloads"}/${crypto.randomUUID()}${safeExtension(file.name)}`;
  await env.SHOP_ASSETS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name.slice(0, 180) }
  });
  return json({
    key,
    name: file.name,
    url: kind === "image" ? `/api/shop/media?key=${encodeURIComponent(key)}` : ""
  }, 201);
}
