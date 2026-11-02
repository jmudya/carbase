// Old address of the Google reviews function. Replaced: the real function now lives at /api/google-reviews
// (netlify/functions/places-reviews.mjs) with protection against too many requests. This file does nothing and can be deleted.
exports.handler = async () => ({ statusCode: 410, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ ok: false, error: "moved to /api/google-reviews" }) });
