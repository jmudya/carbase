// Sitemap for Google: https://carbaseusa.com/sitemap.xml
// Built automatically from the list of cars, so every car on the lot gets its own page in the sitemap.
// Hidden and sold cars are left out. Nothing needs to be updated by hand when cars are added in the admin.
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slugOf = (c) => [c.y, c.b, c.m, c.vin].join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

exports.handler = async (event) => {
  const h = (event && event.headers) || {};
  const host = String(h["x-forwarded-host"] || h.host || "carbaseusa.com").replace(/[^a-z0-9.:-]/gi, "");
  const origin = "https://" + host;
  let cars = [];
  try {
    const r = await fetch(origin + "/data/cars.json");
    const j = await r.json();
    cars = j.cars || [];
  } catch (e) { /* the sitemap still lists the main page */ }

  const today = new Date().toISOString().slice(0, 10);
  const urls = ['<url><loc>' + esc(origin + "/") + "</loc><lastmod>" + today + "</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>"];
  const seen = {};
  cars.forEach((c) => {
    if (!c || c.hide || c.sold || !/^[a-z0-9]{17}$/i.test(String(c.vin || ""))) return;
    const loc = origin + "/car/" + slugOf(c) + "/";
    if (seen[loc]) return;
    seen[loc] = 1;
    urls.push("<url><loc>" + esc(loc) + "</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>");
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join("\n") + "\n</urlset>\n";
  return { statusCode: 200, headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }, body: xml };
};
