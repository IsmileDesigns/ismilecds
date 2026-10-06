const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

const isValidEmail = (email) => (
  typeof email === "string"
  && email.length <= 254
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
);

export async function onRequestPost({ request, env }) {
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return jsonResponse({ message: "Request not allowed." }, 403);
  }

  let payload;
  try {
    const contentType = request.headers.get("Content-Type") || "";
    payload = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return jsonResponse({ message: "Please enter a valid email address." }, 400);
  }

  // Silently accept bot submissions so the field cannot be used to probe protection.
  if (payload.company) return jsonResponse({ message: "You're on the list." });

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return jsonResponse({ message: "Please enter a valid email address." }, 400);
  }

  if (!env.BREVO_API_KEY) {
    return jsonResponse({ message: "Newsletter signup is temporarily unavailable." }, 503);
  }

  const configuredListId = env.BREVO_LIST_ID || "2";
  const listId = Number.parseInt(configuredListId, 10);
  if (!Number.isInteger(listId) || listId < 1) {
    return jsonResponse({ message: "Newsletter signup is temporarily unavailable." }, 503);
  }

  let brevoResponse;
  try {
    brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true
      })
    });
  } catch {
    return jsonResponse({ message: "Unable to subscribe right now. Please try again." }, 502);
  }

  if (!brevoResponse.ok) {
    console.error("Brevo newsletter request failed", { status: brevoResponse.status });
    return jsonResponse({ message: "Unable to subscribe right now. Please try again." }, 502);
  }

  return jsonResponse({ message: "You're on the list." });
}
