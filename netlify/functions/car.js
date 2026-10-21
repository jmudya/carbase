// Page for sharing one car: https://carbaseusa.com/car/<year-make-model-vin>/
// It gives social networks and messengers (WhatsApp, Telegram, Facebook, iMessage) a title, price and photo
// of this car for the link preview, and sends the visitor to the car on the main page.
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slugOf = (c) => [c.y, c.b, c.m, c.vin].join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

exports.handler = async (event) => {
  const h = event.headers || {};
  const host = String(h["x-forwarded-host"] || h.host || "carbaseusa.com").replace(/[^a-z0-9.:-]/gi, "");
  const origin = "https://" + host;
  let slug = (event.queryStringParameters && event.queryStringParameters.slug) || String(event.path || "").split("/").filter(Boolean).pop() || "";
  try { slug = decodeURIComponent(slug); } catch (e) { /* keep as is */ }
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const vin = slug.slice(-17);
  let cars = [];
  try {
    const r = await fetch(origin + "/data/cars.json");
    const j = await r.json();
    cars = j.cars || [];
  } catch (e) { /* fall through to the main page */ }
  const c = cars.find((x) => !x.hide && String(x.vin || "").toLowerCase() === vin);
  if (!c) return { statusCode: 302, headers: { Location: "/" }, body: "" };

  const name = [c.y, c.b, c.m].filter(Boolean).join(" ");
  const price = Number(c.p) > 0 ? "$" + Number(c.p).toLocaleString("en-US") : "Call for price";
  const title = name + " | " + price + " | Carbase LLC";
  const bits = [c.t, Number(c.mi) > 0 ? Number(c.mi).toLocaleString("en-US") + " mi" : "", c.title ? "Title: " + c.title : "", c.fuel, c.sold ? "SOLD" : (c.pending ? "SALE PENDING" : "")].filter(Boolean);
  const desc = (bits.join(" · ") + " · Tarpon Springs, FL · Carbase LLC").replace(/^ · /, "");
  const first = (c.imgs && c.imgs[0]) || c.img || "";
  const image = first
    ? (/^https?:/.test(first) ? first : origin + "/.netlify/images?url=" + encodeURIComponent(first) + "&w=1200&h=630&fit=cover")
    : origin + "/icon-512.png";
  const url = origin + "/car/" + slugOf(c) + "/";
  const app = "/?car=" + encodeURIComponent(c.vin);
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>" + esc(title) + "</title>" +
    '<meta name="description" content="' + esc(desc) + '">' +
    '<link rel="canonical" href="' + esc(url) + '">' +
    '<meta property="og:type" content="website"><meta property="og:site_name" content="Carbase LLC">' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(desc) + '">' +
    '<meta property="og:url" content="' + esc(url) + '"><meta property="og:image" content="' + esc(image) + '">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(desc) + '"><meta name="twitter:image" content="' + esc(image) + '">' +
    '<style>body{margin:0;background:#0f1114;color:#e8ecf0;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:40px 16px}a{color:#e23b2e}img{max-width:min(560px,100%);height:auto;border-radius:8px}</style>' +
    "</head><body><h1>" + esc(name) + "</h1><p>" + esc(price) + " · " + esc(desc) + "</p>" +
    (first ? '<p><img src="' + esc(image) + '" alt="' + esc(name) + '"></p>' : "") +
    '<p><a href="' + esc(app) + '">Open this car on carbaseusa.com</a></p>' +
    "<script>location.replace(" + JSON.stringify(app) + ")</script></body></html>";
  return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" }, body: html };
};
