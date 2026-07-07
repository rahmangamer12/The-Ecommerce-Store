// Shared cleaners: turn CJ's raw spec-dump descriptions into a clean,
// professional "about" + tidy highlight bullets. Used by both the importer
// (new products) and the cleanup script (existing products).

const CAT_NAMES = {
  audio: "audio", fashion: "fashion", "home-living": "home", outdoors: "outdoor",
  technology: "tech", "watches-jewelry": "watches & jewellery", wellness: "wellness",
  beauty: "beauty", sports: "fitness", "kids-baby": "kids & baby", "pet-supplies": "pet",
  automotive: "car", gaming: "gaming", kitchen: "kitchen", office: "office",
  tools: "tools", bags: "bag",
};

function hashNum(s) {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}
const pick = (arr, seed) => arr[hashNum(seed) % arr.length];
const CN = /[一-鿿]/;

/** A real descriptive SENTENCE from the description (not a spec line, and not
 *  just the product name/keyword-title repeated). */
export function firstProse(desc, name = "") {
  const nm = name.toLowerCase().slice(0, 25);
  for (const raw of String(desc || "").split(/\n/)) {
    const l = raw.trim();
    if (l.length < 45 || l.length > 200) continue; // sentence, not a run-on note
    if (/^[A-Za-z][\w /&()'’.-]{1,26}:/.test(l)) continue; // spec line
    if (/^\s*\d+\s*[.)]/.test(l)) continue; // numbered disclaimer line
    if (/^(product information|overview|product overview|product details|specification|parameter|note|tips)/i.test(l)) continue;
    // Skip sizing / shipping / colour disclaimers — not a product "about".
    if (/\b(asian size|size chart|please allow|manual measurement|customer service|display colou?rs?|actual (item|product|color)|due to (the )?(manual|different|light)|please (check|contact|note|understand)|1 to 2 size|differ slightly|thank(s| you)|dear (customer|buyer)|shipping|delivery time)\b/i.test(l)) continue;
    if (CN.test(l)) continue;
    // Must read like a sentence — not a comma-separated keyword title.
    if (!/\b(is|are|with|for|made|offers?|features?|designed|perfect|ideal|provides?|helps?|comfortable|suitable|crafted|built|great|easy|can|your)\b/i.test(l)) continue;
    // Skip lines that are basically the product name again.
    if (nm && l.toLowerCase().startsWith(nm)) continue;
    return l.replace(/\s+/g, " ").trim();
  }
  return "";
}

/** Clean "Label: value" highlights — no cut-off fragments, no junk. */
export function cleanFeatures(desc) {
  const out = [];
  const seen = new Set();
  const skip = /^(product information|overview|product overview|product details|note|notes|packing list|package list|packing|tips|warm tips|features?|specifications?|parameters?)$/i;
  for (const raw of String(desc || "").split(/\n/)) {
    const l = raw.trim();
    const mm = l.match(/^([A-Za-z][A-Za-z0-9 /&()'’.-]{1,24}?):\s*(.+)$/);
    if (!mm) continue;
    const label = mm[1].trim().replace(/\.$/, "");
    const val = mm[2].trim().replace(/\s+/g, " ");
    if (skip.test(label)) continue;
    if (val.length < 2 || val.length > 55) continue;
    if (CN.test(label) || CN.test(val)) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${val}`);
    if (out.length >= 5) break;
  }
  return out;
}

/** Highlights for the card/product page — real specs, padded with quality points. */
export function makeFeatures(desc) {
  const f = cleanFeatures(desc);
  const generic = [
    "Premium quality materials",
    "Practical, everyday design",
    "Great value for the price",
    "Fast worldwide shipping",
  ];
  for (const g of generic) {
    if (f.length >= 4) break;
    if (!f.includes(g)) f.push(g);
  }
  return f.slice(0, 5);
}

const INTROS = [
  (c) => `A standout addition to our ${c} collection, chosen for quality you can see and feel.`,
  (c) => `Part of our curated ${c} range, designed to look great and perform day after day.`,
  (c) => `A smart pick from our ${c} selection — practical, well made and ready for everyday use.`,
  (c) => `Handpicked for our ${c} lineup, blending thoughtful design with genuine everyday value.`,
  (c) => `One of our favourites in the ${c} range — the little upgrade your day deserves.`,
];
const CLOSERS = [
  "Built with attention to detail, it delivers dependable performance and lasting value.",
  "Made to be both practical and good-looking, it earns its place in daily life.",
  "Quality materials and a considered design make it an easy, reliable everyday choice.",
  "Thoughtful touches and solid construction mean it looks good and holds up over time.",
];
const SHIP = "Ships worldwide with secure checkout and 30-day easy returns.";

/** A clean, professional "about" — real CJ sentence first if there is one. */
export function generateAbout(name, categorySlug, desc) {
  const cat = CAT_NAMES[categorySlug] || "premium";
  const intro = firstProse(desc, name) || pick(INTROS, name)(cat);
  const closer = pick(CLOSERS, name + "c");
  return `${intro}\n${closer}\n${SHIP}`;
}

/** Clean one-line tagline for cards/SEO. */
export function shortDesc(name, categorySlug, desc) {
  const cat = CAT_NAMES[categorySlug] || "premium";
  const s = firstProse(desc, name) || `${name} — quality ${cat} you'll love, at a price that makes sense.`;
  return s.slice(0, 150).trim();
}
