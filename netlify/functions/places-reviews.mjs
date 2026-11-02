// Google reviews for the "Customer reviews" section (address: /api/google-reviews).
// Asks Google Places API (New) for the Place ID that is set in the site settings (data/settings.json, field gpid).
// Google returns at most 5 reviews and does not allow caching them, so nothing is stored: every request goes to Google.
// The key stays secret in Netlify (GOOGLE_PLACES_API_KEY).
// COST PROTECTION (Google's own quota for this request cannot be lowered, so it is done here):
//   1) Netlify rate limit below: one visitor (IP) can ask only a few times per minute.
//   2) A daily ceiling per running copy of the function (GOOGLE_DAILY_MAX, default 150).
//   3) Only requests made by the site's own pages are served.
const clean = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const okUrl = (u, host) => { try { const x = new URL(String(u)); return x.protocol === "https:" && (!host || host.test(x.hostname)) ? x.href : ""; } catch (e) { return ""; } };
const env = (k) => (typeof Netlify !== "undefined" && Netlify.env && Netlify.env.get(k)) || (typeof process !== "undefined" && process.env && process.env[k]) || "";
let dayKey = "", dayCount = 0;

export default async (req) => {
  const J = (o, code) => new Response(JSON.stringify(o), { status: code || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
  const key = env("GOOGLE_PLACES_API_KEY");
  if (!key) return J({ ok: false, error: "GOOGLE_PLACES_API_KEY is not set" });
  const site = req.headers.get("sec-fetch-site");
  // same-origin = our own page; none = the address typed in the browser (used for checking). Requests made by other sites are refused.
  if (site && site !== "same-origin" && site !== "none") return J({ ok: false, error: "not allowed" }, 403);
  const day = new Date().toISOString().slice(0, 10);
  if (day !== dayKey) { dayKey = day; dayCount = 0; }
  const max = Number(env("GOOGLE_DAILY_MAX")) || 150;
  if (dayCount >= max) return J({ ok: false, error: "daily limit reached" }, 429);
  let origin = "https://carbaseusa.com";
  try { origin = new URL(req.url).origin; } catch (e) { /* default */ }
  let id = "";
  try {
    const r = await fetch(origin + "/data/settings.json");
    id = String(((await r.json()) || {}).gpid || "").trim();
  } catch (e) { /* no settings */ }
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(id)) return J({ ok: false, error: "no Place ID in the settings" });
  dayCount++;
  try {
    const r = await fetch("https://places.googleapis.com/v1/places/" + encodeURIComponent(id) + "?languageCode=en", {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "displayName,rating,userRatingCount,googleMapsUri,reviews" }
    });
    if (!r.ok) return J({ ok: false, error: "Google answered " + r.status });
    const p = await r.json();
    const reviews = (p.reviews || []).slice(0, 5).map((v) => {
      const a = v.authorAttribution || {};
      const t = (v.originalText && v.originalText.text) || (v.text && v.text.text) || "";
      return {
        src: "g", name: clean(a.displayName, 80), url: okUrl(a.uri, /(^|\.)google\.com$/), photo: okUrl(a.photoUri, /(^|\.)googleusercontent\.com$/),
        rating: Math.max(1, Math.min(5, Math.round(Number(v.rating) || 5))), text: clean(t, 1200), date: clean(v.relativePublishTimeDescription, 40)
      };
    }).filter((x) => x.name && x.text);
    return J({ ok: true, name: clean(p.displayName && p.displayName.text, 100), rating: Number(p.rating) || 0, count: Number(p.userRatingCount) || 0, mapsUri: okUrl(p.googleMapsUri, /(^|\.)google\.com$/), reviews });
  } catch (e) { return J({ ok: false, error: "Could not reach Google" }); }
};

export const config = {
  path: "/api/google-reviews",
  method: ["GET"],
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ["ip", "domain"] }
};
