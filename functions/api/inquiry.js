// Handles the "Start a project" lead form and the client onboarding questionnaire.
// Sends two emails through Brevo: a structured notification to the studio inbox
// and an automatic reply to the person who filled in the form.
//
// Environment variables (Cloudflare Pages > Settings > Environment variables):
//   BREVO_API_KEY     required, the same key the newsletter signup uses
//   INQUIRY_TO        optional, where notifications go (default hello@byismile.com)
//   INQUIRY_FROM      optional, verified Brevo sender (default hello@byismile.com)
//   BOOKING_URL       optional, call link offered to qualified leads only

const DEFAULT_TO = "hello@byismile.com";
const DEFAULT_FROM = "hello@byismile.com";
const DEFAULT_BOOKING = "https://calendar.app.google/6uRHVV9isKULbUzd9";

// A lead is offered the booking link only when all three hold. Edit these lists to move the bar.
const QUALIFYING_BUDGETS = ["$1,000 to $2,500", "$2,500 to $5,000", "$5,000 to $10,000", "$10,000 or more"];
const QUALIFYING_TIMELINES = ["As soon as possible", "Within 1 month", "In 1 to 3 months"];
const QUALIFYING_AUTHORITY = ["Yes, I make the decision", "I decide with a partner"];

const FIELDS = {
  project: [
    ["name", "Name", 120, true],
    ["business", "Business", 160, false],
    ["email", "Email", 254, true],
    ["link", "Website or social", 300, false],
    ["service", "Service", 80, true],
    ["budget", "Budget", 40, true],
    ["timeline", "Timeline", 40, true],
    ["authority", "Decision maker", 60, true],
    ["heard", "Source", 60, true],
    ["details", "What they need", 4000, true]
  ],
  onboarding: [
    ["name", "Name", 120, true],
    ["business", "Business", 160, true],
    ["email", "Email", 254, true],
    ["phone", "Phone", 40, false],
    ["link", "Website and social links", 600, false],
    ["oneLine", "What the business does", 600, true],
    ["customer", "Ideal customer", 2000, true],
    ["goals", "Goals for this project", 2000, true],
    ["success", "What success looks like", 2000, false],
    ["admire", "Brands or sites they like, and why", 2000, false],
    ["avoid", "What to avoid", 2000, false],
    ["voice", "Brand voice in a few words", 400, false],
    ["assets", "Existing brand assets", 1200, false],
    ["content", "Who provides copy and photos", 1200, false],
    ["scope", "Pages or features needed", 2000, false],
    ["access", "Domain, hosting and account access", 1200, false],
    ["files", "Shared folder link", 400, false],
    ["deadline", "Launch date or deadline", 120, false],
    ["approver", "Who gives final approval", 200, false],
    ["contactPref", "Preferred way to communicate", 60, false],
    ["extra", "Anything else", 3000, false]
  ]
};

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

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
));

const clean = (value, max) => (typeof value === "string" ? value.replace(/\r/g, "").trim().slice(0, max) : "");
const oneLine = (value) => value.replace(/\s+/g, " ").trim();

async function sendEmail(env, message) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": env.BREVO_API_KEY
    },
    body: JSON.stringify(message)
  });
  if (!response.ok) {
    console.error("Brevo inquiry email failed", { status: response.status });
    throw new Error("send_failed");
  }
}

export async function onRequestPost({ request, env }) {
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return jsonResponse({ message: "Request not allowed." }, 403);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ message: "Something was wrong with the form. Please try again." }, 400);
  }
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ message: "Something was wrong with the form. Please try again." }, 400);
  }

  // Silently accept bot submissions so the hidden field cannot be used to probe protection.
  if (payload.company_site) return jsonResponse({ ok: true, qualified: false });

  const type = payload.type === "onboarding" ? "onboarding" : "project";
  const data = {};
  for (const [key, label, max, required] of FIELDS[type]) {
    data[key] = clean(payload[key], max);
    if (required && !data[key]) {
      return jsonResponse({ message: `Please fill in: ${label}.` }, 400);
    }
  }
  if (!isValidEmail(data.email)) {
    return jsonResponse({ message: "Please enter a valid email address." }, 400);
  }
  data.name = oneLine(data.name);

  if (!env.BREVO_API_KEY) {
    return jsonResponse({ message: "The form is temporarily unavailable. Please email hello@byismile.com." }, 503);
  }

  const to = env.INQUIRY_TO || DEFAULT_TO;
  const from = { name: "ISMILE CDS", email: env.INQUIRY_FROM || DEFAULT_FROM };
  const bookingUrl = env.BOOKING_URL || DEFAULT_BOOKING;
  const firstName = data.name.split(" ")[0];

  const tracked = [
    ["Campaign tag", clean(payload.track_source, 80)],
    ["Came from", clean(payload.track_referrer, 200)],
    ["First page", clean(payload.track_landing, 200)]
  ].filter(([, value]) => value);

  const qualified = type === "project"
    && QUALIFYING_BUDGETS.includes(data.budget)
    && QUALIFYING_TIMELINES.includes(data.timeline)
    && QUALIFYING_AUTHORITY.includes(data.authority);

  const rows = FIELDS[type].map(([key, label]) => [label, data[key]]).filter(([, value]) => value);
  if (type === "project") rows.unshift(["Ready now", qualified ? "Yes, booking link was offered" : "No, booking link was held back"]);
  const allRows = rows.concat(tracked);

  const subject = type === "project"
    ? `New project inquiry: ${data.name}${data.business ? `, ${oneLine(data.business)}` : ""} (${data.heard})`
    : `Onboarding questionnaire: ${oneLine(data.business)} (${data.name})`;

  const notifyText = allRows.map(([label, value]) => `${label}: ${value}`).join("\n\n");
  const notifyHtml = `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A1410;max-width:640px">${
    allRows.map(([label, value]) => `<tr><td style="padding:8px 14px 8px 0;vertical-align:top;font-weight:bold;white-space:nowrap;border-bottom:1px solid #e5e2db">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #e5e2db">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`).join("")
  }</table>`;

  let replySubject;
  let replyLines;
  if (type === "onboarding") {
    replySubject = "Got your onboarding questionnaire";
    replyLines = [
      `Hi ${firstName},`,
      "Thank you for filling in the onboarding questionnaire. I have everything you sent.",
      "I will read through it and come back to you within 2 business days with next steps, or with questions if anything needs clearing up.",
      "Yazmine Ismile\nISMILE CDS\nwww.byismile.com"
    ];
  } else {
    replySubject = "Got your project details";
    replyLines = [
      `Hi ${firstName},`,
      `Thank you for sending the details on your ${data.service.toLowerCase()} project. I have them.`,
      "Here is what happens next. I will review what you sent and reply within 2 business days with a written plan and a quote. No call is needed to get that."
    ];
    if (qualified) replyLines.push(`If you would like to talk it through first, you can pick a time here: ${bookingUrl}`);
    replyLines.push("Yazmine Ismile\nISMILE CDS\nwww.byismile.com");
  }
  const replyText = replyLines.join("\n\n");
  const replyHtml = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1A1410;max-width:560px">${
    replyLines.map((line) => `<p>${escapeHtml(line).replace(/\n/g, "<br>").replace(/(https:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`).join("")
  }</div>`;

  try {
    await sendEmail(env, {
      sender: from,
      to: [{ email: to }],
      replyTo: { email: data.email, name: data.name },
      subject,
      textContent: notifyText,
      htmlContent: notifyHtml
    });
  } catch {
    return jsonResponse({ message: "We could not send your details. Please email hello@byismile.com." }, 502);
  }

  // The inquiry is already delivered. A failed auto-reply should not look like a failed submission.
  try {
    await sendEmail(env, {
      sender: from,
      to: [{ email: data.email, name: data.name }],
      replyTo: { email: to },
      subject: replySubject,
      textContent: replyText,
      htmlContent: replyHtml
    });
  } catch {
    console.error("Inquiry auto-reply failed");
  }

  return jsonResponse({ ok: true, qualified, bookingUrl: qualified ? bookingUrl : "" });
}
