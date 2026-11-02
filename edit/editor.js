/* Carbase visual editor. It is loaded only when the page is opened with ?edit=1 and you are signed in to the admin.
   It edits the same data files the old admin edits (data/*.json) and saves everything in ONE commit. */
(function () {
"use strict";
if (window.__VE) return;
window.__VE = 1;

var SCHEMA = {"cars": {"y": {"name": "y", "label": "Year", "widget": "number", "required": true, "value_type": "int", "min": 1990, "max": 2035}, "b": {"name": "b", "label": "Make (brand)", "widget": "string", "required": true}, "m": {"name": "m", "label": "Model", "widget": "string", "required": true}, "mg": {"name": "mg", "label": "Model for the filter (optional: leave empty and it is detected automatically, e.g. F-150, Model 3)", "widget": "string", "required": false}, "vin": {"name": "vin", "label": "VIN", "widget": "string", "required": true, "pattern": ["^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$", "VIN must be exactly 17 characters (the letters I, O and Q are not used)"]}, "title": {"name": "title", "label": "Title", "widget": "select", "required": true, "options": ["Clean", "Rebuilt"]}, "t": {"name": "t", "label": "Body type", "widget": "select", "required": false, "options": ["Sedan", "SUV", "Truck", "Coupe", "EV"]}, "mi": {"name": "mi", "label": "Mileage", "widget": "number", "required": false, "value_type": "int"}, "p": {"name": "p", "label": "Price in USD (leave empty to show \"Call for price\")", "widget": "number", "required": false, "value_type": "int"}, "sold": {"name": "sold", "label": "Sold", "widget": "boolean", "required": false}, "pending": {"name": "pending", "label": "Sale pending (a client is considering this car: shows a PENDING badge, switch it off when the deal is decided)", "widget": "boolean", "required": false}, "hide": {"name": "hide", "label": "Hide this car on the website (temporarily)", "widget": "boolean", "required": false}, "warranty": {"name": "warranty", "label": "Show the 1 month warranty badge and warranty terms on this car (off by default)", "widget": "boolean", "required": false}, "asis": {"name": "asis", "label": "Sold as-is, no warranty (shows an AS-IS badge and notice; overrides the warranty switch)", "widget": "boolean", "required": false}, "fuel": {"name": "fuel", "label": "Fuel type", "widget": "select", "required": false, "options": ["Gasoline", "Diesel", "Hybrid", "Plug-in hybrid", "Electric"]}, "battery_kwh": {"name": "battery_kwh", "label": "Battery capacity in kWh (only for Electric)", "widget": "number", "required": false, "value_type": "float"}, "battery_type": {"name": "battery_type", "label": "Battery type (only for Electric)", "widget": "select", "required": false, "options": ["Lithium-ion", "LFP", "NMC", "NCA", "Other"]}, "e": {"name": "e", "label": "Engine", "widget": "string", "required": false}, "hp": {"name": "hp", "label": "Horsepower", "widget": "number", "required": false, "value_type": "int"}, "towing": {"name": "towing", "label": "Towing capacity (lbs)", "widget": "number", "required": false, "value_type": "int"}, "tr": {"name": "tr", "label": "Transmission", "widget": "string", "required": false}, "dr": {"name": "dr", "label": "Drivetrain", "widget": "string", "required": false}, "c": {"name": "c", "label": "Exterior color", "widget": "string", "required": false}, "desc": {"name": "desc", "label": "Description (optional, shown on the car page; you can write several lines)", "widget": "text", "required": false}, "carfax": {"name": "carfax", "label": "CARFAX report (PDF file or photo)", "widget": "file", "required": false}, "wsticker": {"name": "wsticker", "label": "Window Sticker (PDF file or photo", "widget": "file", "required": false}, "video": {"name": "video", "label": "Video file (MP4", "widget": "file", "required": false}, "v": {"name": "v", "label": "Video link (YouTube recommended; no file needed)", "widget": "string", "required": false}, "imgs": {"name": "imgs", "label": "Photos (up to 20, the first one is the cover). For many photos use the red button at the bottom right of this page", "widget": "list", "required": false, "max": 20}}, "settings": {"ph": {"name": "ph", "label": "Phone numbers (separate with | )", "widget": "string", "required": false}, "em": {"name": "em", "label": "Email", "widget": "string", "required": false}, "hr": {"name": "hr", "label": "Opening hours", "widget": "string", "required": false}, "fb": {"name": "fb", "label": "Facebook link", "widget": "string", "required": false}, "ig": {"name": "ig", "label": "Instagram link", "widget": "string", "required": false}, "tt": {"name": "tt", "label": "TikTok link", "widget": "string", "required": false}, "yt": {"name": "yt", "label": "YouTube link", "widget": "string", "required": false}, "wk": {"name": "wk", "label": "Form email access key (from web3forms.com)", "widget": "string", "required": false}, "rv_embed": {"name": "rv_embed", "label": "Google reviews widget code (paste the embed code from Elfsight, Trustindex, Featurable or a similar service, optional)", "widget": "text", "required": false}, "gr": {"name": "gr", "label": "Google review link (your Google Business Profile review link, optional)", "widget": "string", "required": false}, "ga": {"name": "ga", "label": "Google Analytics ID (looks like G-XXXXXXXXXX)", "widget": "string", "required": false, "pattern": ["^G-[A-Za-z0-9]+$", "Format: G- followed by letters and digits, for example G-AB12CD34EF"]}}, "reviews": {"name": {"name": "name", "label": "Customer name", "widget": "string", "required": true}, "loc": {"name": "loc", "label": "City, State (optional)", "widget": "string", "required": false}, "rating": {"name": "rating", "label": "Rating (stars)", "widget": "select", "required": true, "options": ["5", "4", "3", "2", "1"]}, "text": {"name": "text", "label": "Review text", "widget": "text", "required": true}, "date": {"name": "date", "label": "Date (optional, for example March 2026)", "widget": "string", "required": false}, "car": {"name": "car", "label": "Car bought (optional)", "widget": "string", "required": false}, "photo": {"name": "photo", "label": "Photo (optional)", "widget": "image", "required": false}, "video": {"name": "video", "label": "Video link (YouTube", "widget": "string", "required": false}}, "calcGroups": [{"name": "warranty", "label": "Warranty terms", "fields": [{"name": "days", "label": "Warranty length in days (30 = 1 month, 365 = 1 year)", "widget": "number", "required": false, "value_type": "int"}, {"name": "deductible", "label": "Deductible per repair claim in USD (leave empty if none)", "widget": "number", "required": false, "value_type": "float"}]}, {"name": "ship", "label": "Delivery within the USA", "fields": [{"name": "from_zip", "label": "Pickup ZIP code (your lot)", "widget": "string", "required": false}, {"name": "min", "label": "Minimum price in USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "t1", "label": "Rate in USD per mile: trips up to 250 miles", "widget": "number", "required": false, "value_type": "float"}, {"name": "t2", "label": "Rate in USD per mile: 251 to 500 miles", "widget": "number", "required": false, "value_type": "float"}, {"name": "t3", "label": "Rate in USD per mile: 501 to 1000 miles", "widget": "number", "required": false, "value_type": "float"}, {"name": "t4", "label": "Rate in USD per mile: 1001 to 2000 miles", "widget": "number", "required": false, "value_type": "float"}, {"name": "t5", "label": "Rate in USD per mile: over 2000 miles", "widget": "number", "required": false, "value_type": "float"}, {"name": "enclosed", "label": "Enclosed trailer multiplier (for example 1.5)", "widget": "number", "required": false, "value_type": "float"}, {"name": "inop", "label": "Extra for a car that does not run, USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "large", "label": "Extra for SUV, pickup or van, USD", "widget": "number", "required": false, "value_type": "float"}]}, {"name": "intl", "label": "Delivery to Ukraine", "fields": [{"name": "service_fee", "label": "Our service fee, USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "inland", "label": "Delivery within the USA to the port, USD (average)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ocean_sedan", "label": "Ocean freight, USD: sedan", "widget": "number", "required": false, "value_type": "float"}, {"name": "ocean_crossover", "label": "Ocean freight, USD: crossover", "widget": "number", "required": false, "value_type": "float"}, {"name": "ocean_suv", "label": "Ocean freight, USD: SUV or pickup", "widget": "number", "required": false, "value_type": "float"}, {"name": "forwarding", "label": "Forwarding, USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "port_truck", "label": "Truck from the destination port, USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "broker", "label": "Customs broker, USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "eur_usd", "label": "Euro rate in USD (for excise, for example 1.10)", "widget": "number", "required": false, "value_type": "float"}, {"name": "insurance_pct", "label": "Insurance, % of the car price (default 2)", "widget": "number", "required": false, "value_type": "float"}, {"name": "copart_pct", "label": "Copart fee, % of the car price", "widget": "number", "required": false, "value_type": "float"}, {"name": "copart_flat", "label": "Copart fee, fixed USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "iaai_pct", "label": "IAAI fee, % of the car price", "widget": "number", "required": false, "value_type": "float"}, {"name": "iaai_flat", "label": "IAAI fee, fixed USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "manheim_pct", "label": "Manheim fee, % of the car price", "widget": "number", "required": false, "value_type": "float"}, {"name": "manheim_flat", "label": "Manheim fee, fixed USD", "widget": "number", "required": false, "value_type": "float"}, {"name": "duty_pct", "label": "Import duty, % (default 10)", "widget": "number", "required": false, "value_type": "float"}, {"name": "vat_pct", "label": "VAT, % (default 20)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ex_petrol_lo", "label": "Excise EUR per 1000 cm3 per year: petrol up to 3000 cm3 (default 50)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ex_petrol_hi", "label": "Excise: petrol over 3000 cm3 (default 100)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ex_diesel_lo", "label": "Excise: diesel up to 3500 cm3 (default 75)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ex_diesel_hi", "label": "Excise: diesel over 3500 cm3 (default 150)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ex_hybrid", "label": "Excise: hybrid, fixed EUR per car (default 100)", "widget": "number", "required": false, "value_type": "float"}, {"name": "ex_ev_kwh", "label": "Excise: electric, EUR per kWh of battery (default 1)", "widget": "number", "required": false, "value_type": "float"}]}]};
var REPO = "jmudya/carbase", BRANCH = "main", MAXPH = 24, MAXFILE = 25 * 1048576;
var S = { token: "", headSha: "", cars: [], nid: 1, files: {}, uploads: {}, origCars: {}, extra: {}, preview: false, panel: "", openId: null, busy: false };
var uid = 0, upn = 0;

/* ---------- small helpers ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function h(tag, a, kids) {
  var e = document.createElement(tag);
  a = a || {};
  Object.keys(a).forEach(function (k) {
    var v = a[k];
    if (v == null || v === false) return;
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k === "text") e.textContent = v;
    else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  });
  (kids || []).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function utf8(b64) { var bin = atob(String(b64).replace(/\s/g, "")), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
function b64utf8(str) { var u = new TextEncoder().encode(str), s = ""; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
function token() { var k = ["decap-cms-user", "netlify-cms-user"]; for (var i = 0; i < k.length; i++) { try { var v = JSON.parse(localStorage.getItem(k[i]) || "null"); if (v && v.token) return v.token; } catch (e) { } } return ""; }
function gh(path, opt) {
  opt = opt || {};
  opt.headers = Object.assign({ Authorization: "token " + S.token, Accept: "application/vnd.github+json" }, opt.headers || {});
  return fetch("https://api.github.com/repos/" + REPO + path, opt).then(function (r) {
    return r.text().then(function (t) {
      var j = null; try { j = JSON.parse(t); } catch (e) { }
      if (!r.ok) { var er = new Error((j && j.message) || ("HTTP " + r.status)); er.status = r.status; throw er; }
      return j;
    });
  });
}
function toast(msg, bad) {
  var t = $("#ve-toast"); if (!t) return;
  t.textContent = msg; t.className = "show" + (bad ? " bad" : "");
  clearTimeout(toast.k); toast.k = setTimeout(function () { t.className = ""; }, bad ? 6000 : 2600);
}

/* ---------- data ---------- */
async function getFile(path) {
  try {
    var j = await gh("/contents/" + path + "?ref=" + encodeURIComponent(BRANCH));
    return { sha: j.sha, data: JSON.parse(utf8(j.content)) };
  } catch (e) { if (e.status === 404) return { sha: "", data: null }; throw e; }
}
async function load() {
  var r = await Promise.all([getFile("data/cars.json"), getFile("data/settings.json"), getFile("data/calc.json"), getFile("data/reviews.json"), getFile("data/texts.json")]);
  var ref = await gh("/git/ref/heads/" + encodeURIComponent(BRANCH));
  S.headSha = ref.object.sha;
  var cd = r[0].data || { cars: [] };
  S.extra = Object.assign({}, cd); delete S.extra.cars;
  S.cars = (cd.cars || []).map(function (d) { return { id: S.nid++, d: d }; });
  S.origCars = {}; S.cars.forEach(function (x) { S.origCars[x.id] = JSON.stringify(x.d); });
  S.files = {
    cars: { path: "data/cars.json", sha: r[0].sha },
    settings: { path: "data/settings.json", sha: r[1].sha, data: r[1].data || {} },
    calc: { path: "data/calc.json", sha: r[2].sha, data: r[2].data || {} },
    reviews: { path: "data/reviews.json", sha: r[3].sha, data: r[3].data || { reviews: [] } },
    texts: { path: "data/texts.json", sha: r[4].sha, data: r[4].data || {} }
  };
  if (!S.files.texts.data.texts || typeof S.files.texts.data.texts !== "object") S.files.texts.data.texts = {};
  if (!Array.isArray(S.files.reviews.data.reviews)) S.files.reviews.data.reviews = [];
  ["settings", "calc", "reviews", "texts"].forEach(function (k) { S.files[k].orig = JSON.stringify(S.files[k].data); });
}
function carChanges() {
  var added = 0, changed = 0, deleted = 0, seen = {};
  S.cars.forEach(function (x) {
    seen[x.id] = 1;
    if (!(x.id in S.origCars)) added++; else if (JSON.stringify(x.d) !== S.origCars[x.id]) changed++;
  });
  Object.keys(S.origCars).forEach(function (id) { if (!seen[id]) deleted++; });
  return { added: added, changed: changed, deleted: deleted };
}
function fileChanged(k) { var f = S.files[k]; return JSON.stringify(f.data) !== f.orig; }
function carsFileData() { var o = Object.assign({}, S.extra); o.cars = S.cars.map(function (x) { return x.d; }); return o; }
function dirtyCount() { var c = carChanges(); return c.added + c.changed + c.deleted + ["settings", "calc", "reviews", "texts"].filter(fileChanged).length; }
function usedUploads() {
  var txt = JSON.stringify([carsFileData(), S.files.settings.data, S.files.calc.data, S.files.reviews.data]);
  return Object.keys(S.uploads).filter(function (p) { return !S.uploads[p].done && txt.indexOf('"/' + p + '"') > -1; });
}

/* ---------- showing the edited data on the page ---------- */
function showUrl(p) { var u = S.uploads[String(p).replace(/^\//, "")]; return u ? "data:" + u.type + ";base64," + u.b64 : p; }
function cmp(a, b) { function r(c) { return c.sold ? 2 : (c.pending ? 1 : 0); } return r(a) - r(b); }
function applyView() {
  var list = S.cars.map(function (x) {
    var d = clone(x.d); d._id = x.id;
    if (d.imgs) d.imgs = d.imgs.map(showUrl);
    if (d.img) d.img = showUrl(d.img);
    if (!d.b && !d.m) { d.b = "New"; d.m = "car"; }
    d.y = d.y || "";
    return d;
  });
  if (S.preview) list = list.filter(function (c) { return !c.hide; });
  list.sort(cmp);
  if (window.normCars) window.normCars(list);
  window.cars = list;
  window.chipsDraw(); window.draw();
}
function applySettings() { window.cfg = clone(S.files.settings.data); window.renderCfg(); }
function applyCalc() { window.CALC = clone(S.files.calc.data); window.usEst(); window.inCalc(); }
function applyReviews() { window.RV = clone(S.files.reviews.data.reviews || []); window.renderReviews(); }
function applyTextsView() { window.applyTexts(S.files.texts.data.texts); window.applyLang(); }
var tm = null;
function touch(what) {
  clearTimeout(tm);
  tm = setTimeout(function () {
    if (what === "cars") applyView(); else if (what === "settings") applySettings(); else if (what === "calc") applyCalc(); else if (what === "reviews") applyReviews(); else if (what === "texts") applyTextsView();
    updateBar();
  }, 120);
  updateBar();
}

/* ---------- checks ---------- */
function validate(def, v) {
  var empty = v === undefined || v === null || v === "";
  if (empty) return def.required ? "Required" : "";
  if (def.pattern && !new RegExp(def.pattern[0]).test(String(v))) return def.pattern[1];
  if (def.widget === "number") {
    if (def.min != null && v < def.min) return "Minimum " + def.min;
    if (def.max != null && v > def.max) return "Maximum " + def.max;
  }
  return "";
}
function carErrors(c) {
  var out = [];
  Object.keys(SCHEMA.cars).forEach(function (k) {
    var d = SCHEMA.cars[k];
    if (["string", "select", "number"].indexOf(d.widget) < 0) return;
    var m = validate(d, c.d[k]);
    if (m) out.push({ k: k, label: d.label.split(" (")[0], msg: m });
  });
  var v = String(c.d.vin || "").toUpperCase();
  if (v && S.cars.some(function (o) { return o !== c && String(o.d.vin || "").toUpperCase() === v; })) out.push({ k: "vin", label: "VIN", msg: "Another car already has this VIN" });
  return out;
}
function allErrors() {
  var out = [];
  S.cars.forEach(function (c) { carErrors(c).forEach(function (e) { out.push({ where: "car", id: c.id, name: carName(c), label: e.label, msg: e.msg }); }); });
  var g = SCHEMA.settings.ga; var m = validate(g, S.files.settings.data.ga); if (m) out.push({ where: "settings", name: "Contacts and links", label: "Google Analytics ID", msg: m });
  (S.files.reviews.data.reviews || []).forEach(function (r, i) {
    ["name", "text"].forEach(function (k) { if (!String(r[k] || "").trim()) out.push({ where: "reviews", name: "Review " + (i + 1), label: SCHEMA.reviews[k].label.split(" (")[0], msg: "Required" }); });
  });
  var ov = S.files.texts.data.texts;
  Object.keys(ov).forEach(function (k) {
    LANGS.forEach(function (L) {
      var v = ov[k][L[0]]; if (typeof v !== "string") return;
      if (/%s/.test(origText(L[0], k) || "") && !/%s/.test(v)) out.push({ where: "text", key: k, name: "Text " + (window.D.en[k] || k).slice(0, 40), label: L[1], msg: "keep %s in the text (it is replaced by a number)" });
    });
  });
  return out;
}
function carName(c) { return (c.d.b || c.d.m) ? [c.d.y, c.d.b, c.d.m].filter(Boolean).join(" ") : "New car"; }

/* ---------- photos and files ---------- */
function readB64(blob) { return new Promise(function (ok) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1]); }; r.readAsDataURL(blob); }); }
function shrink(file) {
  return new Promise(function (ok, no) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var M = 1800, s = Math.min(1, M / Math.max(im.width, im.height)), w = Math.round(im.width * s), hh = Math.round(im.height * s), c = document.createElement("canvas");
      c.width = w; c.height = hh; c.getContext("2d").drawImage(im, 0, 0, w, hh); URL.revokeObjectURL(url);
      c.toBlob(function (b) { b ? ok(b) : no(new Error("Could not process the photo")); }, "image/jpeg", 0.82);
    };
    im.onerror = function () { URL.revokeObjectURL(url); no(new Error("This photo format is not supported by the browser (" + file.name + ")")); };
    im.src = url;
  });
}
async function prepFile(file, kind, slug) {
  var isImg = /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  var blob = file, ext, type;
  if (kind === "photo" || (kind === "doc" && isImg)) {
    if (!isImg) throw new Error("This is not a photo: " + file.name);
    blob = await shrink(file); ext = "jpg"; type = "image/jpeg";
  } else {
    if (file.size > MAXFILE) throw new Error("The file is larger than 25 MB: " + file.name);
    var m = file.name.match(/\.([a-z0-9]{2,5})$/i); ext = (m ? m[1] : "bin").toLowerCase(); type = file.type || "application/octet-stream";
  }
  var b64 = await readB64(blob);
  var path = "uploads/" + slug + "-" + Date.now().toString(36) + "-" + (++upn) + "." + ext;
  S.uploads[path] = { b64: b64, type: type, name: file.name, size: blob.size, done: false };
  return "/" + path;
}
function slugOf(c) { return String(c.d.vin || [c.d.y, c.d.b, c.d.m].join("-")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "car"; }

/* ---------- form fields ---------- */
function field(def, obj, onset, o) {
  o = o || {};
  var id = "vef" + (++uid), box = h("div", { class: "ve-f" + (o.cls ? " " + o.cls : "") }), err = h("div", { class: "ve-e" });
  var lab = h("label", { class: "ve-l", for: id, text: o.label || def.label });
  var inp, cur = obj[def.name];
  function setv(v) {
    if (v === undefined || v === "" || v === null) delete obj[def.name]; else obj[def.name] = v;
    var m = validate(def, obj[def.name]); err.textContent = m; box.classList.toggle("bad", !!m);
    if (onset) onset(def.name);
  }
  if (def.widget === "text") {
    inp = h("textarea", { id: id, rows: o.rows || 4 }); inp.value = cur == null ? "" : cur;
    inp.addEventListener("input", function () { setv(inp.value); });
  } else if (def.widget === "select") {
    inp = h("select", { id: id });
    if (!def.required || cur == null) inp.appendChild(h("option", { value: "", text: def.required ? "Choose..." : "" }));
    (def.options || []).forEach(function (op) { inp.appendChild(h("option", { value: op, text: op })); });
    if (cur != null && (def.options || []).indexOf(String(cur)) < 0) inp.appendChild(h("option", { value: cur, text: cur }));
    inp.value = cur == null ? "" : String(cur);
    inp.addEventListener("change", function () { setv(inp.value); });
  } else if (def.widget === "number") {
    inp = h("input", { id: id, type: "text", inputmode: def.value_type === "float" ? "decimal" : "numeric", autocomplete: "off" }); inp.value = cur == null ? "" : cur;
    inp.addEventListener("input", function () {
      var t = inp.value.trim().replace(",", ".");
      if (t === "") { setv(undefined); return; }
      if (!/^-?\d*\.?\d*$/.test(t) || (def.value_type !== "float" && /\./.test(t)) || t === "-" || t === ".") { err.textContent = "Enter a number"; box.classList.add("bad"); return; }
      setv(def.value_type === "float" ? parseFloat(t) : parseInt(t, 10));
    });
  } else {
    inp = h("input", { id: id, type: "text", autocomplete: "off", maxlength: o.max || (def.name === "rv_embed" ? 4000 : 400) }); inp.value = cur == null ? "" : cur;
    inp.addEventListener("input", function () {
      if (def.name === "vin" && inp.value !== inp.value.toUpperCase()) { var p = inp.selectionStart; inp.value = inp.value.toUpperCase(); try { inp.setSelectionRange(p, p); } catch (e) { } }
      setv(def.name === "vin" ? inp.value.trim() : inp.value);
    });
  }
  box.appendChild(lab); box.appendChild(inp); box.appendChild(err);
  if (cur !== undefined && cur !== null && cur !== "") { var m0 = validate(def, cur); if (m0) { err.textContent = m0; box.classList.add("bad"); } }
  return box;
}
function toggle(label, help, obj, key, onset) {
  var id = "vet" + (++uid);
  var cb = h("input", { type: "checkbox", id: id }); cb.checked = obj[key] === true;
  cb.addEventListener("change", function () { if (cb.checked) obj[key] = true; else delete obj[key]; onset && onset(key, cb.checked); });
  var row = h("label", { class: "ve-sw", for: id }, [cb, h("span", { class: "ve-knob" }), h("span", { class: "ve-swt" }, [h("b", { text: label }), help ? h("small", { text: help }) : null])]);
  row.cb = cb; return row;
}
function fileInput(accept, multiple, fn) {
  var inp = h("input", { type: "file", accept: accept, class: "ve-hide" }); if (multiple) inp.multiple = true;
  inp.addEventListener("change", function () { var f = Array.prototype.slice.call(inp.files); inp.value = ""; if (f.length) fn(f); });
  return inp;
}

/* a field that holds a link or an uploaded file (CARFAX, Window Sticker, video file) */
function docField(c, name, label, accept, kind, ph) {
  var d = c.d, id = "ved" + (++uid), box = h("div", { class: "ve-f" }), note = h("div", { class: "ve-n" });
  var inp = h("input", { id: id, type: "text", autocomplete: "off", placeholder: ph || "/uploads/file.pdf or a web link" }); inp.value = d[name] || "";
  function sync() { var p = String(d[name] || "").replace(/^\//, ""), u = S.uploads[p]; note.textContent = u ? ("New file ready: " + u.name + " (" + Math.round(u.size / 1024) + " KB). It goes live after you save and publish.") : ""; }
  inp.addEventListener("input", function () { if (inp.value.trim()) d[name] = inp.value.trim(); else delete d[name]; sync(); touch("cars"); });
  var up = fileInput(accept, false, async function (files) {
    try { var p = await prepFile(files[0], kind || "doc", slugOf(c)); d[name] = p; inp.value = p; sync(); touch("cars"); toast("File added"); } catch (e) { toast(e.message, true); }
  });
  var clr = h("button", { type: "button", class: "ve-link", text: "Remove", onclick: function () { delete d[name]; inp.value = ""; sync(); touch("cars"); } });
  box.appendChild(h("label", { class: "ve-l", for: id, text: label }));
  box.appendChild(h("div", { class: "ve-row" }, [inp, h("button", { type: "button", class: "ve-btn sm", text: "Upload file", onclick: function () { up.click(); } }), clr, up]));
  box.appendChild(note); sync(); return box;
}

/* photos grid, like eBay: first photo is the main one */
function photosEl(c) {
  var wrap = h("div", { class: "ve-ph" });
  function get() { return (c.d.imgs ? c.d.imgs : (c.d.img ? [c.d.img] : [])).slice(); }
  function set(a) { if (a.length) c.d.imgs = a; else delete c.d.imgs; delete c.d.img; }
  var dragI = -1;
  function render() {
    wrap.innerHTML = "";
    var a = get();
    wrap.appendChild(h("div", { class: "ve-cnt", text: a.length + "/" + MAXPH + " photos. The first one is the main photo." }));
    var grid = h("div", { class: "ve-pg" });
    a.forEach(function (p, i) {
      var src = S.uploads[String(p).replace(/^\//, "")] ? showUrl(p) : (window.im ? window.im(p, 300) : p);
      var img = h("img", { src: src, alt: "", draggable: "false" });
      img.addEventListener("error", function () { img.replaceWith(h("div", { class: "ve-nopic", text: "Photo goes live after publish" })); });
      var t = h("div", { class: "ve-pt", draggable: "true", "data-i": i }, [img, i === 0 ? h("span", { class: "ve-main", text: "Main" }) : null,
        h("div", { class: "ve-pb" }, [
          h("button", { type: "button", title: "Move left", "aria-label": "Move left", text: "◀", disabled: i === 0, onclick: function () { move(i, i - 1); } }),
          h("button", { type: "button", title: "Make main photo", "aria-label": "Make main photo", text: "★", disabled: i === 0, onclick: function () { move(i, 0); } }),
          h("button", { type: "button", title: "Move right", "aria-label": "Move right", text: "▶", disabled: i === a.length - 1, onclick: function () { move(i, i + 1); } }),
          h("button", { type: "button", title: "Remove", "aria-label": "Remove photo", text: "✕", class: "x", onclick: function () { var b = get(); b.splice(i, 1); set(b); render(); touch("cars"); } })])]);
      t.addEventListener("dragstart", function (e) { dragI = i; try { e.dataTransfer.setData("text/plain", String(i)); } catch (x) { } });
      t.addEventListener("dragover", function (e) { e.preventDefault(); });
      t.addEventListener("drop", function (e) { e.preventDefault(); e.stopPropagation(); if (dragI > -1 && dragI !== i) move(dragI, i); dragI = -1; });
      grid.appendChild(t);
    });
    if (a.length < MAXPH) {
      var inp = fileInput("image/*", true, addFiles);
      grid.appendChild(h("button", { type: "button", class: "ve-pa", html: '<span>+</span>Add photos', onclick: function () { inp.click(); } }));
      grid.appendChild(inp);
    }
    wrap.appendChild(grid);
  }
  function move(i, j) { var a = get(); if (j < 0 || j >= a.length) return; var x = a.splice(i, 1)[0]; a.splice(j, 0, x); set(a); render(); touch("cars"); }
  async function addFiles(files) {
    var a = get(), room = MAXPH - a.length;
    if (files.length > room) { toast("Only " + MAXPH + " photos per car. Extra photos were skipped.", true); files = files.slice(0, Math.max(0, room)); }
    if (!files.length) return;
    toast("Processing photos...");
    var added = 0;
    for (var i = 0; i < files.length; i++) {
      try { var np = await prepFile(files[i], "photo", slugOf(c)); var cur = get(); cur.push(np); set(cur); render(); added++; } catch (e) { toast(e.message, true); }
    }
    if (added) { touch("cars"); toast("Photos added. Save to upload them."); }
  }
  wrap.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1) e.preventDefault(); });
  wrap.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) { e.preventDefault(); addFiles(Array.prototype.slice.call(e.dataTransfer.files)); } });
  render(); return wrap;
}

/* ---------- panels ---------- */
function closePanel() { var p = $("#ve-panel"); if (p) p.classList.remove("open"); S.panel = ""; S.openId = null; }
function panelShell(title, sub) {
  var p = $("#ve-panel");
  p.innerHTML = "";
  var head = h("div", { class: "ve-ph-h" }, [h("div", null, [h("div", { class: "ve-pt-t", text: title }), sub ? h("div", { class: "ve-pt-s", text: sub }) : null]), h("button", { type: "button", class: "ve-x", "aria-label": "Close", text: "✕", onclick: closePanel })]);
  var body = h("div", { class: "ve-pb-b" }), foot = h("div", { class: "ve-pf" });
  p.appendChild(head); p.appendChild(body); p.appendChild(foot); p.classList.add("open"); p.scrollTop = 0;
  return { body: body, foot: foot };
}
function sec(title, kids) { return h("section", { class: "ve-sec" }, [h("h3", { text: title })].concat(kids || [])); }
function grid2(kids) { return h("div", { class: "ve-g2" }, kids); }
function fd(name) { return SCHEMA.cars[name]; }

function openCarEditor(id) {
  var c = S.cars.filter(function (x) { return x.id === id; })[0]; if (!c) return;
  closeMenu(); S.panel = "car"; S.openId = id;
  var sh = panelShell(carName(c), "Edit the car. The page updates as you type.");
  var d = c.d, B = sh.body;
  var onset = function () { touch("cars"); var t = $(".ve-pt-t"); if (t) t.textContent = carName(c); };
  B.appendChild(sec("PHOTOS & VIDEO", [photosEl(c),
    field(fd("v"), d, onset, { label: "Video link (YouTube recommended)" }),
    docField(c, "video", "Video file (MP4, small file, up to about 25 MB)", "video/mp4,video/*", "doc", "/uploads/video.mp4")]));
  B.appendChild(sec("ITEM DETAILS", [
    grid2([field(fd("y"), d, onset), field(fd("title"), d, onset)]),
    field(fd("b"), d, onset, { label: "Make (brand)" }), field(fd("m"), d, onset),
    field(fd("vin"), d, onset, { label: "VIN", max: 17 }),
    grid2([field(fd("t"), d, onset), field(fd("mi"), d, onset), field(fd("p"), d, onset, { label: "Price in USD (empty shows Call for price)" })])]));
  var det = h("div"); B.appendChild(sec("SPECIFICATIONS", [det]));
  function renderDet() {
    det.innerHTML = "";
    var f = function (n, o) { return field(fd(n), d, function () { onset(); if (n === "fuel") renderDet(); }, o); };
    det.appendChild(grid2([f("fuel"), f("c", { label: "Exterior color" })]));
    if (d.fuel === "Electric") det.appendChild(grid2([f("battery_kwh", { label: "Battery capacity, kWh" }), f("battery_type", { label: "Battery type" })]));
    det.appendChild(grid2([f("e"), f("hp")]));
    det.appendChild(grid2([f("tr"), f("dr")]));
    det.appendChild(f("towing", { label: "Towing capacity (lbs)" }));
  }
  renderDet();
  B.appendChild(sec("DESCRIPTION", [field(fd("desc"), d, onset, { label: "Description (optional, shown on the car page; you can write several lines)", rows: 6 })]));
  B.appendChild(sec("DOCUMENTS", [docField(c, "carfax", "CARFAX report (PDF file or photo)", "application/pdf,image/*", "doc"), docField(c, "wsticker", "Window Sticker (PDF file or photo, optional)", "application/pdf,image/*", "doc")]));
  var sw = h("div", { class: "ve-sws" }), pair = {};
  function mk(key, label, help) { var r = toggle(label, help, d, key, function (k, on) { if (on && k === "warranty" && pair.asis) { delete d.asis; pair.asis.cb.checked = false; } if (on && k === "asis" && pair.warranty) { delete d.warranty; pair.warranty.cb.checked = false; } touch("cars"); }); pair[key] = r; sw.appendChild(r); }
  mk("sold", "Sold", "Shows a SOLD badge and moves the car to the end of the list");
  mk("pending", "Sale pending", "A client is considering this car. Shows a PENDING badge");
  mk("hide", "Hide on the website", "The car stays here but visitors do not see it");
  mk("warranty", "1 month warranty", "Shows the warranty badge and terms");
  mk("asis", "Sold as-is (no warranty)", "Shows an AS-IS badge and notice; replaces the warranty");
  B.appendChild(sec("STATUS", [sw]));
  B.appendChild(sec("ADVANCED", [field(fd("mg"), d, onset, { label: "Model for the filter (optional: leave empty and it is detected automatically, e.g. F-150, Model 3)" })]));
  sh.foot.appendChild(h("button", { type: "button", class: "ve-btn dng", text: "Delete car", onclick: function () {
    if (!confirm("Delete this car from the site? You can still discard all changes before saving.")) return;
    S.cars = S.cars.filter(function (x) { return x.id !== id; }); closePanel(); touch("cars"); toast("Car deleted (not saved yet)");
  } }));
  sh.foot.appendChild(h("span", { class: "ve-sp1" }));
  sh.foot.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "Done", onclick: closePanel }));
}
function addCar() {
  var x = { id: S.nid++, d: { y: new Date().getFullYear(), title: "Clean" } };
  S.cars.unshift(x); touch("cars"); openCarEditor(x.id);
}

function openFlat(kind, title, sub, defs, obj, apply) {
  S.panel = kind; closeMenu();
  var sh = panelShell(title, sub);
  var onset = function () { touch(apply); };
  defs.forEach(function (d) {
    var o = {}; if (d.name === "rv_embed") o.rows = 5;
    sh.body.appendChild(field(d, obj, onset, o));
  });
  sh.foot.appendChild(h("span", { class: "ve-sp1" })); sh.foot.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "Done", onclick: closePanel }));
}
function openSettings() {
  var defs = Object.keys(SCHEMA.settings).map(function (k) { return SCHEMA.settings[k]; });
  openFlat("settings", "Contacts and links", "Phones, email, hours, social links, analytics.", defs, S.files.settings.data, "settings");
}
function openCalc() {
  S.panel = "calc"; closeMenu();
  var sh = panelShell("Delivery rates and warranty", "These numbers turn on the delivery estimate and set the warranty terms.");
  var data = S.files.calc.data, onset = function () { touch("calc"); };
  SCHEMA.calcGroups.forEach(function (g) {
    var obj = (data[g.name] && typeof data[g.name] === "object") ? data[g.name] : {};
    var kids = g.fields.map(function (f) { return field(f, obj, function () { if (Object.keys(obj).length) data[g.name] = obj; else delete data[g.name]; onset(); }); });
    sh.body.appendChild(sec(g.label.toUpperCase(), kids));
  });
  sh.foot.appendChild(h("span", { class: "ve-sp1" })); sh.foot.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "Done", onclick: closePanel }));
}
function openReviews() {
  S.panel = "reviews"; closeMenu();
  var sh = panelShell("Customer reviews", "Reviews appear on the site when there is at least one.");
  var arr = S.files.reviews.data.reviews;
  function render() {
    sh.body.innerHTML = "";
    arr.forEach(function (r, i) {
      var kids = ["name", "loc", "rating", "text", "date", "car", "video"].map(function (k) { return field(SCHEMA.reviews[k], r, function () { touch("reviews"); }, k === "text" ? { rows: 4 } : {}); });
      var ph = h("div", { class: "ve-f" }), pl = h("label", { class: "ve-l", text: "Photo (optional)" });
      var pi = fileInput("image/*", false, async function (f) { try { r.photo = await prepFile(f[0], "photo", "review"); render(); touch("reviews"); } catch (e) { toast(e.message, true); } });
      ph.appendChild(pl);
      if (r.photo) ph.appendChild(h("img", { class: "ve-rvp", src: S.uploads[String(r.photo).replace(/^\//, "")] ? showUrl(r.photo) : r.photo, alt: "" }));
      ph.appendChild(h("div", { class: "ve-row" }, [h("button", { type: "button", class: "ve-btn sm", text: r.photo ? "Replace photo" : "Add photo", onclick: function () { pi.click(); } }), r.photo ? h("button", { type: "button", class: "ve-link", text: "Remove", onclick: function () { delete r.photo; render(); touch("reviews"); } }) : null, pi]));
      kids.push(ph);
      kids.push(h("button", { type: "button", class: "ve-btn dng sm", text: "Delete this review", onclick: function () { arr.splice(i, 1); render(); touch("reviews"); } }));
      sh.body.appendChild(sec("REVIEW " + (i + 1), kids));
    });
    sh.body.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "+ Add review", onclick: function () { arr.push({ rating: "5" }); render(); touch("reviews"); } }));
  }
  render();
  sh.foot.appendChild(h("span", { class: "ve-sp1" })); sh.foot.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "Done", onclick: closePanel }));
}

/* ---------- page texts ---------- */
var LANGS = [["en", "English"], ["ua", "Українська"], ["ru", "Русский"], ["es", "Español"]];
function origText(l, k) { var id = l + "|" + k; return window.TXD && window.TXD[id] ? window.TXD[id].v : window.D[l][k]; }
function ovAll() { return S.files.texts.data.texts; }
function textGroup(k) {
  var el = document.querySelector('[data-i="' + k + '"]');
  if (!el) return "Messages and labels used by the site scripts";
  if (el.closest("dialog")) return "Car page and pop-up windows";
  if (el.closest("header")) return "Header";
  if (el.closest("nav")) return "Menu";
  if (el.closest(".hero")) return "Top block";
  if (el.closest("footer")) return "Footer";
  var sec = el.closest("section[id]"), names = { inventory: "Inventory", find: "Find me a car", about: "About us", services: "Services", buy: "We buy cars", delivery: "Delivery", reviews: "Customer reviews", contact: "Visit the lot (contact)" };
  return sec ? (names[sec.id] || "Other page texts") : "Other page texts";
}
var TEXT_ORDER = ["Menu", "Header", "Top block", "Inventory", "Find me a car", "About us", "Services", "We buy cars", "Delivery", "Customer reviews", "Visit the lot (contact)", "Footer", "Other page texts", "Car page and pop-up windows", "Messages and labels used by the site scripts"];
function shownText(k) { var L = window.L || "en"; return window.D[L][k] || window.D.en[k] || k; }
function openTexts() {
  S.panel = "texts"; closeMenu();
  var sh = panelShell("Page texts", "Click a text to edit it in all 4 languages. Tip: press Aa Texts in the bar and click a text right on the page.");
  var q = h("input", { type: "text", placeholder: "Search texts...", autocomplete: "off" });
  sh.body.appendChild(h("div", { class: "ve-f", style: "margin-top:14px" }, [q]));
  var list = h("div"), keys = {};
  LANGS.forEach(function (L) { Object.keys(window.D[L[0]]).forEach(function (k) { keys[k] = 1; }); });
  var groups = {}; Object.keys(keys).forEach(function (k) { var g = textGroup(k); (groups[g] = groups[g] || []).push(k); });
  function render() {
    list.innerHTML = ""; var term = q.value.trim().toLowerCase();
    TEXT_ORDER.forEach(function (g) {
      var items = (groups[g] || []).filter(function (k) { return !term || k.toLowerCase().indexOf(term) > -1 || LANGS.some(function (L) { return String(window.D[L[0]][k] || "").toLowerCase().indexOf(term) > -1; }); });
      if (!items.length) return;
      list.appendChild(h("div", { class: "ve-gh", text: g + " (" + items.length + ")" }));
      items.forEach(function (k) {
        var t = shownText(k); if (t.length > 110) t = t.slice(0, 108) + "…";
        list.appendChild(h("button", { type: "button", class: "ve-ti", onclick: function () { openTextKey(k, true); } }, [h("span", { text: t }), ovAll()[k] ? h("span", { class: "ve-ed", text: "edited" }) : null]));
      });
    });
    if (!list.children.length) list.appendChild(h("p", { class: "ve-sm", text: "Nothing found." }));
  }
  q.addEventListener("input", render); render(); sh.body.appendChild(list);
  sh.foot.appendChild(h("span", { class: "ve-sp1" })); sh.foot.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "Done", onclick: closePanel }));
}
function openTextKey(key, fromList) {
  S.panel = "text"; closeMenu();
  var sh = panelShell("Edit text", textGroup(key) + ". Leave a language empty to keep the original text.");
  var ov = ovAll(), cur = window.L || "en";
  LANGS.forEach(function (L) {
    var l = L[0], orig = origText(l, key) || "", have = ov[key] && typeof ov[key][l] === "string";
    var lab = h("label", { class: "ve-l" }), box = h("div", { class: "ve-f" });
    var ta = h("textarea", { rows: Math.min(8, Math.max(2, Math.ceil((have ? ov[key][l] : orig).length / 55))), placeholder: orig || "(empty)" });
    ta.value = have ? ov[key][l] : orig;
    function label() { var e = ov[key] && typeof ov[key][l] === "string"; lab.textContent = L[1] + (l === cur ? "  ·  shown on the page now" : "") + (e ? "  ·  edited" : ""); }
    ta.addEventListener("input", function () {
      var v = ta.value, o = ov[key] || (ov[key] = {});
      if (!v.trim() || v === orig) delete o[l]; else o[l] = v;
      if (!Object.keys(o).length) delete ov[key];
      label(); touch("texts");
    });
    label(); box.appendChild(lab); box.appendChild(ta); sh.body.appendChild(box);
  });
  if (/%s/.test(origText("en", key) || "")) sh.body.appendChild(h("p", { class: "ve-sm", text: "Keep %s in the text: the site replaces it with a number." }));
  sh.body.appendChild(h("p", { class: "ve-sm", text: "Plain text only: the characters < and > are removed." }));
  sh.foot.appendChild(h("button", { type: "button", class: "ve-btn", text: "Reset to original", onclick: function () { delete ov[key]; touch("texts"); openTextKey(key, fromList); toast("Original text restored"); } }));
  sh.foot.appendChild(h("span", { class: "ve-sp1" }));
  if (fromList) sh.foot.appendChild(h("button", { type: "button", class: "ve-btn", text: "← All texts", onclick: openTexts }));
  sh.foot.appendChild(h("button", { type: "button", class: "ve-btn pri", text: "Done", onclick: closePanel }));
}
function toggleTextMode(on) {
  S.textMode = on == null ? !S.textMode : on;
  document.body.classList.toggle("ve-txm", S.textMode);
  var b = $("#ve-tx"); if (b) { b.textContent = S.textMode ? "Aa Texts: ON" : "Aa Texts"; b.classList.toggle("on", S.textMode); }
  if (S.textMode) toast("Click any text on the page to edit it");
}
function textClick(e) {
  if (!S.textMode || S.preview) return;
  if (e.target.closest("#ve-root")) return;
  var el = e.target.closest("[data-i]");
  if (!el || el.closest("dialog")) return;
  e.preventDefault(); e.stopPropagation(); openTextKey(el.dataset.i);
}

/* ---------- menu, bar, modal ---------- */
function closeMenu() { var m = $("#ve-menu"); if (m) m.classList.remove("open"); }
function modal(title, bodyEl, buttons) {
  var m = $("#ve-modal"); m.innerHTML = "";
  var card = h("div", { class: "ve-mc", role: "dialog" }, [h("h2", { text: title }), bodyEl, h("div", { class: "ve-mf" }, buttons || [])]);
  m.appendChild(card); m.classList.add("open");
}
function closeModal() { var m = $("#ve-modal"); if (m) { m.classList.remove("open"); m.innerHTML = ""; } }
function updateBar() {
  var n = dirtyCount(), up = usedUploads().length, st = $("#ve-status"), sv = $("#ve-save"), ds = $("#ve-discard");
  if (!st) return;
  st.textContent = n ? ("● " + n + " unsaved change" + (n > 1 ? "s" : "") + (up ? " · " + up + " new file" + (up > 1 ? "s" : "") : "")) : "All changes saved";
  st.className = n ? "dirty" : "";
  sv.disabled = !n || S.busy; sv.textContent = n ? "Save changes (" + n + ")" : "Save changes"; ds.hidden = !n;
}
function buildUI() {
  var root = h("div", { id: "ve-root" });
  root.appendChild(h("div", { id: "ve-bar", class: "ve-bar" }, [
    h("button", { type: "button", class: "ve-btn", id: "ve-menubtn", text: "☰ Menu", onclick: function () { $("#ve-menu").classList.toggle("open"); } }),
    h("span", { id: "ve-status", text: "" }), h("span", { class: "ve-sp1" }),
    h("button", { type: "button", class: "ve-btn", id: "ve-tx", text: "Aa Texts", onclick: function () { if (S.preview) return; toggleTextMode(); } }),
    h("button", { type: "button", class: "ve-btn", id: "ve-prev", text: "Preview", onclick: function () { S.preview = !S.preview; if (S.preview) toggleTextMode(false); document.body.classList.toggle("ve-prev", S.preview); $("#ve-prev").textContent = S.preview ? "Back to editing" : "Preview"; closePanel(); applyView(); } }),
    h("button", { type: "button", class: "ve-btn", id: "ve-discard", text: "Discard", hidden: true, onclick: discardAll }),
    h("button", { type: "button", class: "ve-btn pri", id: "ve-save", text: "Save changes", onclick: saveFlow }),
    h("button", { type: "button", class: "ve-btn", id: "ve-exit", text: "Exit", onclick: exitEditor })]));
  var menu = h("aside", { id: "ve-menu", class: "ve-menu" }, [h("div", { class: "ve-mh" }, [h("b", { text: "Site editor" }), h("button", { type: "button", class: "ve-x", text: "✕", onclick: closeMenu })])]);
  [["Cars", function () { closeMenu(); var i = $("#inventory"); if (i) i.scrollIntoView({ behavior: "smooth" }); }],
  ["+ Add car", function () { addCar(); }],
  ["Page texts (headings, descriptions, buttons)", openTexts], ["Contacts and links", openSettings], ["Delivery rates and warranty", openCalc], ["Customer reviews", openReviews],
  ["Classic admin (old way)", function () { window.open("/admin/", "_blank"); }]].forEach(function (it) { menu.appendChild(h("button", { type: "button", class: "ve-mi", text: it[0], onclick: it[1] })); });
  menu.appendChild(h("p", { class: "ve-hint", text: "Tip: click a car to edit it, or the pencil buttons next to page blocks. Nothing goes to the site until you press Save changes." }));
  root.appendChild(menu); root.appendChild(h("aside", { id: "ve-panel", class: "ve-panel" })); root.appendChild(h("div", { id: "ve-modal", class: "ve-modal" })); root.appendChild(h("div", { id: "ve-toast" }));
  document.body.appendChild(root);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if ($("#ve-modal").classList.contains("open")) closeModal(); else if ($("#ve-panel").classList.contains("open")) closePanel(); else closeMenu(); } });
  window.addEventListener("beforeunload", function (e) { if (!S.leaving && (dirtyCount() || usedUploads().length)) { e.preventDefault(); e.returnValue = ""; } });
}

/* ---------- decoration of the page ---------- */
function decorate() {
  var g = $("#grid"); if (!g || S.preview) return;
  g.querySelectorAll(".card").forEach(function (card) {
    var c = window.cars[+card.dataset.i]; if (!c) return;
    card.dataset.vid = c._id; card.classList.add("ve-card");
    card.appendChild(h("span", { class: "ve-pen", text: "✎ Edit" }));
    if (c.hide) { card.classList.add("is-hidden"); card.appendChild(h("span", { class: "ve-hid", text: "Hidden on the site" })); }
  });
  g.appendChild(h("button", { type: "button", class: "ve-addtile", html: "<span>+</span>Add car" }));
}
function gridClick(e) {
  if (S.preview) return;
  var add = e.target.closest(".ve-addtile"), card = e.target.closest(".card");
  if (add) { e.preventDefault(); e.stopPropagation(); addCar(); return; }
  if (card && card.dataset.vid) { e.preventDefault(); e.stopPropagation(); openCarEditor(+card.dataset.vid); }
}
function addPen(t, label, fn, inline) {
  if (!t || t.querySelector(":scope > .ve-sp")) return;
  if (!inline && getComputedStyle(t).position === "static") t.style.position = "relative";
  t.appendChild(h("button", { type: "button", class: "ve-sp" + (inline ? " ve-in" : ""), text: "✎ " + label, onclick: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } }));
}
function pens() {
  addPen($("header .hinfo"), "Edit contacts", openSettings, true);
  addPen($("#contact .wrap"), "Edit contacts", openSettings);
  addPen($("#delivery .wrap"), "Edit rates", openCalc);
  addPen($("#reviews .wrap"), "Edit reviews", openReviews);
  addPen($("#inventory .wrap"), "+ Add car", addCar);
}

/* ---------- save ---------- */
function discardAll() {
  modal("Discard all changes?", h("p", { text: "Everything you changed since you opened the editor (or since the last save) will be lost." }), [
    h("button", { type: "button", class: "ve-btn", text: "Keep editing", onclick: closeModal }),
    h("button", { type: "button", class: "ve-btn dng", text: "Discard", onclick: async function () { closeModal(); closePanel(); await reloadAll("Changes discarded"); } })]);
}
async function reloadAll(msg) {
  try { await load(); } catch (e) { toast(e.message, true); return; }
  S.uploads = Object.keys(S.uploads).reduce(function (o, k) { if (S.uploads[k].done) o[k] = S.uploads[k]; return o; }, {});
  applyView(); applySettings(); applyCalc(); applyReviews(); applyTextsView(); updateBar(); if (msg) toast(msg);
}
function exitEditor() {
  function leave() { S.leaving = true; location.href = "/"; }
  if (dirtyCount() || usedUploads().length) {
    modal("You have unsaved changes", h("p", { text: "If you exit now they will be lost." }), [
      h("button", { type: "button", class: "ve-btn", text: "Keep editing", onclick: closeModal }),
      h("button", { type: "button", class: "ve-btn dng", text: "Exit without saving", onclick: leave })]);
  } else leave();
}
function summaryEl() {
  var c = carChanges(), ul = h("ul", { class: "ve-sum" });
  if (c.added) ul.appendChild(h("li", { text: c.added + " car" + (c.added > 1 ? "s" : "") + " added" }));
  if (c.changed) ul.appendChild(h("li", { text: c.changed + " car" + (c.changed > 1 ? "s" : "") + " changed" }));
  if (c.deleted) ul.appendChild(h("li", { text: c.deleted + " car" + (c.deleted > 1 ? "s" : "") + " deleted" }));
  if (fileChanged("settings")) ul.appendChild(h("li", { text: "Contacts and links changed" }));
  if (fileChanged("calc")) ul.appendChild(h("li", { text: "Delivery rates or warranty changed" }));
  if (fileChanged("reviews")) ul.appendChild(h("li", { text: "Customer reviews changed" }));
  if (fileChanged("texts")) ul.appendChild(h("li", { text: "Page texts changed (" + Object.keys(S.files.texts.data.texts).length + ")" }));
  var n = usedUploads().length; if (n) ul.appendChild(h("li", { text: n + " new photo/file" + (n > 1 ? "s" : "") + " to upload" }));
  return ul;
}
function commitMessage() {
  var c = carChanges(), p = [];
  if (c.added) p.push(c.added + " added"); if (c.changed) p.push(c.changed + " changed"); if (c.deleted) p.push(c.deleted + " deleted");
  var m = "Edit site: " + (p.length ? "cars " + p.join(", ") : "");
  var o = []; if (fileChanged("settings")) o.push("contacts"); if (fileChanged("calc")) o.push("rates"); if (fileChanged("reviews")) o.push("reviews"); if (fileChanged("texts")) o.push("texts");
  return (m + (p.length && o.length ? "; " : "") + o.join(", ")).replace(/: $/, "").trim();
}
function saveFlow() {
  if (S.busy) return;
  var errs = allErrors();
  if (errs.length) {
    var ul = h("ul", { class: "ve-sum" });
    errs.slice(0, 12).forEach(function (e) {
      ul.appendChild(h("li", null, [h("b", { text: e.name + ": " }), e.label + " (" + e.msg + ") ", h("button", { type: "button", class: "ve-link", text: "Fix", onclick: function () { closeModal(); if (e.where === "car") openCarEditor(e.id); else if (e.where === "settings") openSettings(); else if (e.where === "text") openTextKey(e.key); else openReviews(); } })]));
    });
    modal("Fix these before saving", ul, [h("button", { type: "button", class: "ve-btn pri", text: "OK", onclick: closeModal })]); return;
  }
  modal("Save to the site?", h("div", null, [summaryEl(), h("p", { class: "ve-sm", text: "This saves everything in one go. Then publish the new build in Netlify to make it live." })]), [
    h("button", { type: "button", class: "ve-btn", text: "Cancel", onclick: closeModal }),
    h("button", { type: "button", class: "ve-btn pri", id: "ve-go", text: "Save changes", onclick: doSave })]);
}
async function doSave() {
  S.busy = true; updateBar();
  var go = $("#ve-go"); if (go) { go.disabled = true; go.textContent = "Saving..."; }
  try {
    var files = [], names = [];
    // somebody else may have changed the same file while we were editing
    var ref = await gh("/git/ref/heads/" + encodeURIComponent(BRANCH));
    var changed = [];
    if (carChanges().added + carChanges().changed + carChanges().deleted) changed.push("cars");
    ["settings", "calc", "reviews", "texts"].forEach(function (k) { if (fileChanged(k)) changed.push(k); });
    if (ref.object.sha !== S.headSha) {
      for (var i = 0; i < changed.length; i++) {
        var cur = await getFile(S.files[changed[i]].path);
        if ((cur.sha || "") !== (S.files[changed[i]].sha || "")) throw new Error("conflict:" + S.files[changed[i]].path);
      }
    }
    changed.forEach(function (k) {
      var data = k === "cars" ? carsFileData() : S.files[k].data;
      files.push({ path: S.files[k].path, b64: b64utf8(JSON.stringify(data, null, 2) + "\n") });
    });
    var up = usedUploads(); up.forEach(function (p) { files.push({ path: p, b64: S.uploads[p].b64 }); });
    if (!files.length) throw new Error("Nothing to save");
    var parent = ref.object.sha, com = await gh("/git/commits/" + parent), entries = [];
    for (var j = 0; j < files.length; j++) {
      if (go) go.textContent = "Uploading " + (j + 1) + " of " + files.length + "...";
      var b = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: files[j].b64, encoding: "base64" }) });
      entries.push({ path: files[j].path, mode: "100644", type: "blob", sha: b.sha });
    }
    var t = await gh("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: com.tree.sha, tree: entries }) });
    var nc = await gh("/git/commits", { method: "POST", body: JSON.stringify({ message: commitMessage(), tree: t.sha, parents: [parent] }) });
    await gh("/git/refs/heads/" + encodeURIComponent(BRANCH), { method: "PATCH", body: JSON.stringify({ sha: nc.sha }) });
    S.headSha = nc.sha;
    // the new state becomes the starting point
    for (var k = 0; k < changed.length; k++) {
      var key = changed[k], fresh = await getFile(S.files[key].path); S.files[key].sha = fresh.sha;
      if (key === "cars") { S.origCars = {}; S.cars.forEach(function (x) { S.origCars[x.id] = JSON.stringify(x.d); }); } else S.files[key].orig = JSON.stringify(S.files[key].data);
    }
    up.forEach(function (p) { S.uploads[p].done = true; });
    S.busy = false; updateBar();
    modal("Saved ✓", h("div", null, [h("p", { text: "Your changes are saved to GitHub (" + files.length + " file" + (files.length > 1 ? "s" : "") + " in one commit)." }), h("p", { class: "ve-sm", html: "<b>Now make it live:</b> open Netlify, <b>Deploys</b>, open the newest build and press <b>Publish deploy</b>. That costs 15 credits once, no matter how many changes you made." })]), [
      h("button", { type: "button", class: "ve-btn", text: "Continue editing", onclick: closeModal }),
      h("button", { type: "button", class: "ve-btn pri", text: "Open Netlify", onclick: function () { window.open("https://app.netlify.com/", "_blank"); } })]);
  } catch (e) {
    S.busy = false; updateBar();
    var msg = String(e.message || e), body;
    if (/^conflict:/.test(msg)) body = h("div", null, [h("p", { text: "Someone saved changes to " + msg.slice(9) + " while you were editing. To avoid overwriting their work nothing was saved." }), h("p", { class: "ve-sm", text: "Reload the editor, then repeat your changes (your photos stay in the editor until you reload)." })]);
    else if (e.status === 401 || e.status === 403) body = h("p", { text: "GitHub did not accept the sign-in (" + msg + "). Open the classic admin, sign in again, then come back." });
    else body = h("p", { text: "Could not save: " + msg + ". Nothing was changed on the site." });
    modal("Not saved", body, [h("button", { type: "button", class: "ve-btn", text: "Close", onclick: closeModal })].concat(/^conflict:/.test(msg) ? [h("button", { type: "button", class: "ve-btn dng", text: "Reload editor", onclick: function () { location.reload(); } })] : []));
  }
}

/* ---------- start ---------- */
var CSS = "body.ve-on{padding-bottom:72px}body.ve-on #totop,body.ve-on .cbn,body.ve-on .pvbar{display:none!important}#ve-root,#ve-root *{box-sizing:border-box}#ve-root{font:15px/1.4 system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif;color:#111}.ve-bar{position:fixed;left:0;right:0;bottom:0;z-index:9990;background:#191919;color:#fff;display:flex;align-items:center;gap:8px;padding:10px 14px;box-shadow:0 -6px 24px rgba(0,0,0,.45);flex-wrap:wrap}#ve-status{font-weight:600;font-size:14px;color:#cfd3d8}#ve-status.dirty{color:#ffb020}.ve-sp1{flex:1}.ve-btn{font:600 14px system-ui,sans-serif;border-radius:999px;border:1px solid #8a8f98;background:transparent;color:inherit;padding:9px 16px;cursor:pointer;white-space:nowrap}.ve-bar .ve-btn{color:#fff}.ve-btn.pri,.ve-bar .ve-btn.pri{background:#3665f3;border-color:#3665f3;color:#fff}.ve-btn.dng{border-color:#d0021b;color:#d0021b;background:#fff}.ve-btn.sm{padding:6px 12px;font-size:13px}.ve-btn[disabled]{opacity:.4;cursor:default}.ve-link{background:none;border:0;color:#3665f3;font:600 13px system-ui;cursor:pointer;text-decoration:underline;padding:4px}.ve-hide{display:none!important}.ve-panel{position:fixed;top:0;bottom:0;right:0;width:min(580px,100vw);background:#fff;color:#111;z-index:9995;transform:translateX(102%);transition:transform .22s ease;display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(0,0,0,.4);visibility:hidden}.ve-panel.open{transform:none;visibility:visible}.ve-ph-h{display:flex;justify-content:space-between;gap:10px;padding:16px 20px;border-bottom:1px solid #e5e5e5}.ve-pt-t{font:700 20px system-ui}.ve-pt-s{font-size:13px;color:#666;margin-top:2px}.ve-x{background:none;border:0;font-size:20px;cursor:pointer;color:#333;width:36px;height:36px;border-radius:50%}.ve-x:hover{background:#eee}.ve-pb-b{flex:1;overflow:auto;padding:6px 20px 24px}.ve-pf{display:flex;gap:10px;align-items:center;padding:12px 20px;border-top:1px solid #e5e5e5;background:#fff}.ve-sec{padding:18px 0;border-bottom:1px solid #eee}.ve-sec h3{font:700 17px system-ui;margin:0 0 14px;letter-spacing:.2px;color:#111}.ve-f{margin:0 0 14px}.ve-l{display:block;font-size:13px;color:#555;margin:0 0 5px}.ve-f input[type=text],.ve-f select,.ve-f textarea{width:100%;font:15px system-ui;border:1px solid #c7c7c7;border-radius:8px;background:#f7f7f7;color:#111;padding:0 12px;height:44px}.ve-f textarea{height:auto;padding:10px 12px;resize:vertical}.ve-f input:focus,.ve-f select:focus,.ve-f textarea:focus{outline:2px solid #3665f3;background:#fff}.ve-f.bad input,.ve-f.bad select,.ve-f.bad textarea{border-color:#d0021b}.ve-e{color:#d0021b;font-size:12px;margin-top:3px}.ve-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}@media(max-width:520px){.ve-g2{grid-template-columns:1fr}.ve-pg{grid-template-columns:repeat(3,minmax(0,1fr))!important}}.ve-row{display:flex;gap:8px;align-items:center}.ve-row input{flex:1;min-width:0}.ve-n{font-size:12px;color:#2a7d2e;margin-top:4px}.ve-cnt{font-size:13px;color:#666;margin-bottom:10px}.ve-pg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.ve-pt{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#f1f1f1;cursor:grab}.ve-pt:first-child{grid-column:span 2;grid-row:span 2;aspect-ratio:auto}.ve-pt img{width:100%;height:100%;object-fit:cover;display:block}.ve-nopic{display:flex;align-items:center;justify-content:center;text-align:center;height:100%;font-size:11px;color:#777;padding:6px}.ve-main{position:absolute;left:6px;top:6px;background:#111;color:#fff;font:700 12px system-ui;padding:3px 9px;border-radius:999px}.ve-pb{position:absolute;left:0;right:0;bottom:0;display:flex;gap:2px;justify-content:center;padding:4px;background:linear-gradient(0deg,rgba(0,0,0,.6),transparent)}.ve-pb button{background:rgba(255,255,255,.92);border:0;border-radius:6px;font-size:12px;width:28px;height:26px;cursor:pointer;color:#111}.ve-pb button[disabled]{opacity:.35;cursor:default}.ve-pb .x{color:#d0021b}.ve-pa{aspect-ratio:4/3;border:2px dashed #b9b9b9;border-radius:10px;background:#f7f7f7;cursor:pointer;font:600 13px system-ui;color:#333;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.ve-pa span{font-size:26px;line-height:1}.ve-sws{display:flex;flex-direction:column;gap:12px}.ve-sw{display:flex;gap:12px;align-items:flex-start;cursor:pointer;position:relative}.ve-sw input{position:absolute;opacity:0;pointer-events:none}.ve-knob{flex:none;width:44px;height:26px;border-radius:999px;background:#c7c7c7;position:relative;margin-top:2px;transition:background .15s}.ve-knob::after{content:\"\";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .15s}.ve-sw input:checked+.ve-knob{background:#3665f3}.ve-sw input:checked+.ve-knob::after{transform:translateX(18px)}.ve-sw input:focus-visible+.ve-knob{outline:2px solid #3665f3;outline-offset:2px}.ve-swt b{display:block;font-size:15px}.ve-swt small{color:#666;font-size:12px}.ve-menu{position:fixed;top:0;bottom:0;left:0;width:min(300px,86vw);background:#fff;color:#111;z-index:9996;transform:translateX(-102%);transition:transform .2s;box-shadow:10px 0 40px rgba(0,0,0,.4);padding:14px;display:flex;flex-direction:column;gap:4px;visibility:hidden}.ve-menu.open{transform:none;visibility:visible}.ve-mh{display:flex;justify-content:space-between;align-items:center;padding:4px 4px 12px;font-size:18px}.ve-mi{text-align:left;background:none;border:0;padding:13px 12px;border-radius:10px;font:600 15px system-ui;color:#111;cursor:pointer}.ve-mi:hover{background:#f0f3ff}.ve-hint{font-size:12px;color:#666;margin:auto 4px 6px}.ve-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:16px}.ve-modal.open{display:flex}.ve-login{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px}.ve-mc{background:#fff;color:#111;border-radius:16px;padding:22px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5);font:15px/1.45 system-ui;max-height:90vh;overflow:auto}.ve-mc h2{margin:0 0 10px;font:700 21px system-ui;color:#111}.ve-mc p{margin:8px 0}.ve-mf{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:16px}.ve-mc .ve-btn{border-color:#8a8f98;color:#111}.ve-mc .ve-btn.pri{color:#fff;border-color:#3665f3;background:#3665f3}.ve-mc .ve-btn.dng{color:#d0021b;border-color:#d0021b}.ve-sum{margin:6px 0 10px;padding-left:20px}.ve-sum li{margin:4px 0}.ve-sm{font-size:13px;color:#555}#ve-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%) translateY(20px);background:#111;color:#fff;padding:11px 18px;border-radius:999px;z-index:10000;font:600 14px system-ui;opacity:0;pointer-events:none;transition:all .2s;max-width:92vw;text-align:center}#ve-toast.show{opacity:1;transform:translateX(-50%)}#ve-toast.bad{background:#d0021b}.ve-rvp{display:block;max-width:160px;border-radius:8px;margin:0 0 8px}.ve-card{position:relative;cursor:pointer;outline:2px solid transparent;outline-offset:2px;transition:outline-color .15s}.ve-card:hover{outline-color:#3665f3}.ve-pen{position:absolute;top:10px;right:10px;z-index:5;background:#fff;color:#111;border-radius:999px;font:700 13px system-ui;padding:6px 12px;box-shadow:0 2px 8px rgba(0,0,0,.4)}.ve-hid{position:absolute;left:10px;top:10px;z-index:5;background:#111;color:#fff;border:1px solid #888;border-radius:999px;font:700 12px system-ui;padding:4px 10px}.card.is-hidden .pic{opacity:.4}.ve-addtile{min-height:260px;border:2px dashed #4a5260;border-radius:14px;background:rgba(255,255,255,.03);color:#c8ced6;font:600 16px system-ui;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.ve-addtile span{font-size:38px;line-height:1}.ve-addtile:hover{border-color:#3665f3;color:#fff}.ve-sp{position:absolute;top:6px;right:6px;z-index:30;background:#fff;color:#111;border:0;border-radius:999px;font:700 13px system-ui;padding:7px 13px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.45)}.ve-sp:hover{background:#eef2ff}body.ve-prev .ve-sp{display:none}.ve-ph{margin-bottom:16px}.ve-sp.ve-in{position:static;align-self:center;margin-left:12px;white-space:nowrap}body.ve-txm [data-i]:not(dialog *){outline:1.5px dashed #5b86ff;outline-offset:3px;cursor:text}body.ve-txm [data-i]:not(dialog *):hover{background:rgba(54,101,243,.22)}.ve-gh{font:700 12px system-ui;color:#555;text-transform:uppercase;letter-spacing:.6px;margin:18px 0 6px}.ve-ti{display:flex;justify-content:space-between;gap:10px;width:100%;text-align:left;background:#f7f7f7;border:1px solid #e3e3e3;border-radius:10px;padding:10px 12px;margin:0 0 6px;font:14px system-ui;color:#111;cursor:pointer}.ve-ti:hover{border-color:#3665f3;background:#f0f3ff}.ve-ed{font:700 11px system-ui;background:#3665f3;color:#fff;border-radius:999px;padding:2px 8px;flex:none;align-self:center}.ve-bar #ve-tx.on{background:#ffb020;border-color:#ffb020;color:#111}";
function css() { var s = document.createElement("style"); s.id = "ve-css"; s.textContent = CSS; document.head.appendChild(s); }
function loginView(note) {
  var old = $("#ve-login"); if (old) old.remove();
  var box = h("div", { id: "ve-login", class: "ve-login" }, [h("div", { class: "ve-mc" }, [
    h("h2", { text: "Sign in to edit the site" }),
    h("p", { text: note || "This editor uses the same sign-in as the admin (your GitHub account)." }),
    h("p", { class: "ve-sm", text: "1. Press the button and sign in with GitHub in the admin. 2. Come back to this page and press Try again." }),
    h("div", { class: "ve-mf" }, [
      h("button", { type: "button", class: "ve-btn", text: "Back to the site", onclick: function () { location.href = "/"; } }),
      h("button", { type: "button", class: "ve-btn", text: "Try again", onclick: function () { box.remove(); start(); } }),
      h("button", { type: "button", class: "ve-btn pri", text: "Open admin sign-in", onclick: function () { location.href = "/admin/"; } })])])]);
  document.body.appendChild(box);
}
function waitReady() {
  return new Promise(function (ok, no) {
    var t0 = Date.now();
    (function poll() { if (window.__siteReady && window.draw && window.chipsDraw && window.renderCfg) return ok(); if (Date.now() - t0 > 25000) return no(new Error("The site did not finish loading")); setTimeout(poll, 60); })();
  });
}
async function start() {
  S.token = token();
  try { var t = await fetch("/admin/config.yml").then(function (r) { return r.text(); }); var a = t.match(/^\s*repo:\s*([^\s#]+)/m), b = t.match(/^\s*branch:\s*([^\s#]+)/m); if (a) REPO = a[1]; if (b) BRANCH = b[1]; } catch (e) { }
  if (!S.token) { loginView(); return; }
  var wait = h("div", { id: "ve-wait", class: "ve-login" }, [h("div", { class: "ve-mc" }, [h("h2", { text: "Opening the editor..." })])]);
  document.body.appendChild(wait);
  try { await load(); } catch (e) { wait.remove(); loginView(e.status === 401 || e.status === 403 ? "Your sign-in has expired or has no access. Please sign in again." : "Could not read the site data from GitHub: " + e.message); return; }
  wait.remove();
  buildUI(); pens();
  var g = $("#grid"); g.addEventListener("click", gridClick, true);
  g.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("card") && !S.preview) { e.preventDefault(); e.stopPropagation(); openCarEditor(+e.target.dataset.vid); } }, true);
  var _draw = window.draw; window.draw = function () { _draw.apply(this, arguments); decorate(); };
  window.track = function () { };
  applyView(); applySettings(); applyCalc(); applyReviews(); applyTextsView(); updateBar();
  document.addEventListener("click", textClick, true);
  toast("Editing mode. Click a car or a pencil.");
}
(async function boot() {
  css(); document.body.classList.add("ve-on");
  try { await waitReady(); } catch (e) { loginView(e.message); return; }
  start();
})();
})();
