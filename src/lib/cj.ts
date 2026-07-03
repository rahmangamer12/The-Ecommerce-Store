import {
  cjApiKey,
  cjBaseUrl,
  cjEmail,
  cjLogistic,
  isCjConfigured,
} from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

// =============================================================
//  CJ Dropshipping API client (api2.0)
// -------------------------------------------------------------
//  Same philosophy as the PayPal client: plain async functions
//  over fetch, guarded by `isCjConfigured`, and everything
//  returns null / { ok:false } on failure so the store keeps
//  working even when CJ is down or not configured.
//
//  Auth note: CJ's access-token endpoint is rate-limited to ONE
//  call per 300 seconds, and serverless functions are stateless,
//  so we MUST persist the token. We cache it in the `settings`
//  table (key = 'cj_auth') and reuse it until it's near expiry.
//  Docs: https://developers.cjdropshipping.com/
// =============================================================

export { isCjConfigured };

const AUTH_KEY = "cj_auth";
// Refresh a little before the real expiry to avoid edge-of-expiry failures.
const EXPIRY_SKEW_MS = 60 * 60 * 1000; // 1 hour

type CjEnvelope<T> = {
  code?: number;
  result?: boolean;
  message?: string;
  data?: T;
};

type CachedAuth = { token: string; expiresAt: number };

/** Read the cached CJ token from the settings table (if still valid). */
async function readCachedToken(): Promise<CachedAuth | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  try {
    const { data } = await admin
      .from("settings")
      .select("value")
      .eq("key", AUTH_KEY)
      .maybeSingle();
    const value = data?.value as CachedAuth | undefined;
    if (value?.token && typeof value.expiresAt === "number") return value;
  } catch {
    // ignore — we'll just fetch a fresh token
  }
  return null;
}

/** Persist a freshly-issued CJ token so other requests reuse it. */
async function writeCachedToken(auth: CachedAuth): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  try {
    await admin
      .from("settings")
      .upsert({ key: AUTH_KEY, value: auth }, { onConflict: "key" });
  } catch {
    // best-effort cache; a failure just means we re-auth next time
  }
}

/**
 * Get a valid CJ access token, reusing the cached one when possible.
 * `nowMs` is passed in because scripts/tests can't call Date.now() freely,
 * but in the app we use the real clock.
 */
async function getAccessToken(): Promise<string | null> {
  if (!isCjConfigured) return null;

  const now = Date.now();
  const cached = await readCachedToken();
  if (cached && cached.expiresAt - EXPIRY_SKEW_MS > now) {
    return cached.token;
  }

  try {
    const res = await fetch(`${cjBaseUrl}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cjEmail, password: cjApiKey }),
    });
    const json = (await res.json()) as CjEnvelope<{
      accessToken?: string;
      accessTokenExpiryDate?: string;
    }>;

    const token = json.data?.accessToken;
    if (!res.ok || !token) {
      // Rate-limited or failed — fall back to a stale-but-present token so
      // in-flight work can still proceed rather than hard-failing.
      return cached?.token ?? null;
    }

    // CJ tokens last ~15 days; parse the expiry it returns, else assume 14 days.
    const expiryStr = json.data?.accessTokenExpiryDate;
    const parsed = expiryStr ? Date.parse(expiryStr) : NaN;
    const expiresAt = Number.isNaN(parsed) ? now + 14 * 24 * 3600 * 1000 : parsed;

    await writeCachedToken({ token, expiresAt });
    return token;
  } catch {
    return cached?.token ?? null;
  }
}

/** Authenticated GET/POST against the CJ API. Returns the parsed envelope. */
async function cjRequest<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<CjEnvelope<T> | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${cjBaseUrl}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": token,
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      // CJ data changes rarely and can be slow; don't let Next cache it.
      cache: "no-store",
    });
    return (await res.json()) as CjEnvelope<T>;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
//  Public types (only the fields we actually use are typed)
// -------------------------------------------------------------

export type CjListItem = {
  pid: string;
  name: string;
  image: string;
  price: number; // CJ sell price (your cost, USD)
  categoryName?: string;
};

export type CjVariant = {
  vid: string;
  sku: string;
  name: string;
  price: number;
  image?: string;
};

export type CjProductDetail = {
  pid: string;
  name: string;
  description: string;
  images: string[];
  price: number; // lowest variant / product sell price
  categoryName?: string;
  variants: CjVariant[];
};

// -------------------------------------------------------------
//  Products
// -------------------------------------------------------------

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// -------------------------------------------------------------
//  CJ product data is raw: names repeat, descriptions are HTML
//  with the detail photos embedded as <img> tags. These helpers
//  turn that into a clean, professional product listing.
// -------------------------------------------------------------

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#3[49];/g, "'");
}

/** Strip HTML to clean, readable text (keeps line breaks between blocks). */
function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

/**
 * Turn a cleaned description into a few short bullet "highlights", the way the
 * hand-picked sample products have them. We take the shortest, punchiest lines
 * (a real feature is a phrase, not a paragraph) and tidy them up.
 */
export function featuresFromText(text: string, max = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/\n|(?:[.;•·]|(?<=\w) - )/)) {
    const line = raw
      .replace(/^[\s\-–—*•·:]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const words = line.split(" ").length;
    // A good highlight: a short phrase, not a sentence-long paragraph.
    if (line.length < 8 || line.length > 70 || words < 2 || words > 11) continue;
    // Skip bare section headers like "Product information:" (label, no value).
    if (/:\s*$/.test(line)) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    // Capitalise the first letter for a clean look.
    out.push(line.charAt(0).toUpperCase() + line.slice(1));
    if (out.length >= max) break;
  }
  return out;
}

/** Collapse repeated words CJ leaves in names (e.g. "... Watch Watch"). */
function tidyName(s: string): string {
  const words = s.trim().split(/\s+/);
  const out: string[] = [];
  for (const w of words) {
    if (out.length && out[out.length - 1].toLowerCase() === w.toLowerCase()) {
      continue;
    }
    out.push(w);
  }
  return out.join(" ").trim();
}

/** Shorten a variant label by removing the (long) product-name prefix. */
function shortVariant(raw: string, productName: string): string {
  let s = raw.trim();
  const p = productName.trim().toLowerCase();
  if (p && s.toLowerCase().startsWith(p)) s = s.slice(productName.length);
  s = s.replace(/^[-–—:,\s]+/, "").trim();
  return s || raw.trim();
}

/** Search CJ's catalogue by keyword (paged). */
export async function cjSearchProducts(
  keyword: string,
  page = 1,
  pageSize = 20,
): Promise<CjListItem[]> {
  const query = new URLSearchParams({
    pageNum: String(page),
    pageSize: String(pageSize),
    productNameEn: keyword,
  });
  const env = await cjRequest<{ list?: Record<string, unknown>[] }>(
    `/product/list?${query.toString()}`,
  );
  const list = env?.data?.list ?? [];
  return list.map((r) => ({
    pid: String(r.pid ?? r.id ?? ""),
    name: String(r.productNameEn ?? r.productName ?? ""),
    image: String(r.productImage ?? r.bigImage ?? ""),
    price: num(r.sellPrice ?? r.price),
    categoryName: r.categoryName ? String(r.categoryName) : undefined,
  }));
}

/** Pull the CJ product id out of a CJ product URL, or accept a raw id. */
export function parseCjPid(input: string): string {
  const s = input.trim();
  // Raw id (CJ pids are long numeric/uuid-like strings, no slashes).
  if (!s.includes("/") && !s.includes("?")) return s;
  // URLs commonly carry the id as ...-p-<pid>.html or ?pid=/?id=
  const dashP = s.match(/-p-([A-Za-z0-9-]+)\.html/);
  if (dashP) return dashP[1];
  try {
    const url = new URL(s);
    const q = url.searchParams.get("pid") || url.searchParams.get("id");
    if (q) return q;
  } catch {
    // not a URL — fall through
  }
  // Last resort: the longest id-looking segment in the string.
  const seg = s.split(/[/?=&]/).filter((p) => /[A-Za-z0-9-]{8,}/.test(p));
  return seg[seg.length - 1] ?? s;
}

/** Fetch a single CJ product's full detail (with variants) by pid or URL. */
export async function cjGetProduct(
  pidOrUrl: string,
): Promise<CjProductDetail | null> {
  const pid = parseCjPid(pidOrUrl);
  if (!pid) return null;
  const env = await cjRequest<Record<string, unknown>>(
    `/product/query?pid=${encodeURIComponent(pid)}`,
  );
  const d = env?.data;
  if (!d) return null;

  const productName = tidyName(String(d.productNameEn ?? d.productName ?? ""));

  // Gallery = ONLY the clean, square product photos (productImageSet). We
  // deliberately DON'T pull the <img> banners out of the HTML description —
  // those are tall marketing strips of all shapes/sizes and dumping them in
  // the gallery is exactly what made imports look messy. Keep it like the
  // hand-picked sample products: a few consistent product shots.
  const rawImages = d.productImageSet ?? d.productImage ?? [];
  const galleryImages = Array.isArray(rawImages)
    ? rawImages.map(String)
    : [String(rawImages)];
  const images = Array.from(new Set(galleryImages))
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u))
    .slice(0, 8);

  // Clean, readable description text (the raw HTML/img soup is dropped).
  const rawDesc = String(d.description ?? d.productDescription ?? "");
  const description = htmlToText(rawDesc);

  const rawVariants = Array.isArray(d.variants) ? d.variants : [];
  const variants: CjVariant[] = rawVariants.map((v) => {
    const rv = v as Record<string, unknown>;
    const label = String(rv.variantKey ?? rv.variantNameEn ?? "");
    return {
      vid: String(rv.vid ?? ""),
      sku: String(rv.variantSku ?? rv.variantKey ?? ""),
      name: shortVariant(label, productName),
      price: num(rv.variantSellPrice ?? rv.variantSugSellPrice),
      image: rv.variantImage ? String(rv.variantImage) : undefined,
    };
  });

  const basePrice =
    num(d.sellPrice) ||
    (variants.length
      ? Math.min(...variants.map((v) => v.price).filter((n) => n > 0))
      : 0);

  return {
    pid: String(d.pid ?? pid),
    name: productName,
    description,
    images,
    price: basePrice,
    categoryName: d.categoryName ? String(d.categoryName) : undefined,
    variants,
  };
}

// -------------------------------------------------------------
//  Orders / fulfilment
// -------------------------------------------------------------

export type CjOrderInput = {
  orderNumber: string;
  shipping: {
    name: string;
    countryCode: string;
    province?: string;
    city: string;
    address: string;
    zip: string;
    phone: string;
    email?: string;
  };
  products: { vid: string; quantity: number }[];
};

export type CjOrderResult = {
  ok: boolean;
  cjOrderId?: string;
  cjOrderNum?: string;
  error?: string;
};

/**
 * Ask CJ for available shipping methods and return the cheapest one's name.
 * Falls back to the configured CJ_LOGISTIC (or undefined) if this fails.
 */
async function pickLogistic(input: CjOrderInput): Promise<string | undefined> {
  if (cjLogistic) return cjLogistic;
  try {
    const env = await cjRequest<{ name?: string; logisticPrice?: number }[]>(
      `/logistic/freightCalculate`,
      {
        method: "POST",
        body: {
          startCountryCode: "CN",
          endCountryCode: input.shipping.countryCode,
          products: input.products.map((p) => ({
            quantity: p.quantity,
            vid: p.vid,
          })),
        },
      },
    );
    const options = Array.isArray(env?.data) ? env!.data! : [];
    if (!options.length) return undefined;
    const cheapest = options
      .slice()
      .sort((a, b) => num(a.logisticPrice) - num(b.logisticPrice))[0];
    return cheapest?.name ? String(cheapest.name) : undefined;
  } catch {
    return undefined;
  }
}

/** Forward an order to CJ for fulfilment. */
export async function createCjOrder(
  input: CjOrderInput,
): Promise<CjOrderResult> {
  if (!isCjConfigured) return { ok: false, error: "CJ isn't configured." };
  if (!input.products.length) {
    return { ok: false, error: "No CJ-linked items to fulfil." };
  }

  const logisticName = await pickLogistic(input);

  const env = await cjRequest<{ orderId?: string; orderNumber?: string }>(
    `/shopping/order/createOrder`,
    {
      method: "POST",
      body: {
        orderNumber: input.orderNumber,
        shippingCountryCode: input.shipping.countryCode,
        shippingProvince: input.shipping.province ?? "",
        shippingCity: input.shipping.city,
        shippingAddress: input.shipping.address,
        shippingCustomerName: input.shipping.name,
        shippingZip: input.shipping.zip,
        shippingPhone: input.shipping.phone,
        email: input.shipping.email ?? "",
        fromCountryCode: "CN",
        ...(logisticName ? { logisticName } : {}),
        products: input.products.map((p) => ({
          vid: p.vid,
          quantity: p.quantity,
        })),
      },
    },
  );

  if (!env) return { ok: false, error: "CJ request failed (network)." };
  const ok = env.result === true || env.code === 200;
  if (!ok) {
    return { ok: false, error: env.message || "CJ rejected the order." };
  }
  return {
    ok: true,
    cjOrderId: env.data?.orderId ? String(env.data.orderId) : undefined,
    cjOrderNum: env.data?.orderNumber
      ? String(env.data.orderNumber)
      : undefined,
  };
}

export type CjTracking = {
  trackingNumber?: string;
  status?: string;
};

/** Look up tracking info for a CJ order. */
export async function getCjTracking(
  cjOrderId: string,
): Promise<CjTracking | null> {
  const env = await cjRequest<Record<string, unknown>>(
    `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(cjOrderId)}`,
  );
  const d = env?.data;
  if (!d) return null;
  return {
    trackingNumber: d.trackNumber ? String(d.trackNumber) : undefined,
    status: d.orderStatus ? String(d.orderStatus) : undefined,
  };
}
