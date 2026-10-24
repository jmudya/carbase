// Sends an instant notification (Telegram and/or SMS via Twilio) when someone submits a form on the site.
// Secrets are read from Netlify environment variables (never stored in the repository):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID                       -> Telegram message
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, NOTIFY_SMS_TO -> SMS (optional)
const TYPES = ["Car inquiry", "Service request", "US shipping quote", "International quote", "Find a car", "We buy your car", "Europe shipping quote", "Other countries quote"];
const ALLOWED = ["https://carbaseusa.com", "https://www.carbaseusa.com"];

function clean(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, n || 500); }

exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "method" });
  const origin = (event.headers.origin || event.headers.Origin || "").toLowerCase();
  const okOrigin = !origin || ALLOWED.includes(origin) || /^https:\/\/[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app$/.test(origin);
  if (!okOrigin) return json(403, { ok: false, error: "origin" });
  if ((event.body || "").length > 8000) return json(413, { ok: false, error: "size" });
  let data;
  try { data = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { ok: false, error: "json" }); }
  const type = clean(data.type, 40);
  if (!TYPES.includes(type) || !data.fields || typeof data.fields !== "object") return json(400, { ok: false, error: "type" });
  if (data.hp) return json(200, { ok: true, skipped: true }); // honeypot
  const lines = ["New request: " + type];
  Object.keys(data.fields).slice(0, 20).forEach((k) => {
    const v = clean(data.fields[k], 600);
    if (v) lines.push(clean(k, 40) + ": " + v);
  });
  const text = lines.join("\n").slice(0, 3500);
  const sent = [];
  const e = process.env;
  try {
    if (e.TELEGRAM_BOT_TOKEN && e.TELEGRAM_CHAT_ID) {
      const r = await fetch("https://api.telegram.org/bot" + e.TELEGRAM_BOT_TOKEN + "/sendMessage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: e.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      });
      if (r.ok) sent.push("telegram");
    }
  } catch (err) { /* ignore, other channels may still work */ }
  try {
    if (e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_FROM && e.NOTIFY_SMS_TO) {
      const body = new URLSearchParams({ From: e.TWILIO_FROM, To: e.NOTIFY_SMS_TO, Body: text.slice(0, 320) });
      const r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + e.TWILIO_ACCOUNT_SID + "/Messages.json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: "Basic " + Buffer.from(e.TWILIO_ACCOUNT_SID + ":" + e.TWILIO_AUTH_TOKEN).toString("base64") },
        body: body.toString(),
      });
      if (r.ok) sent.push("sms");
    }
  } catch (err) { /* ignore */ }
  if (!sent.length) return json(202, { ok: false, skipped: true });
  return json(200, { ok: true, sent });
};
