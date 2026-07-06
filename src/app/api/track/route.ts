import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseUserAgent } from "@/lib/ua";

// Records one page view. Called by <VisitTracker> on every page. Parses the
// device/browser/OS from the User-Agent and the country from the edge header.
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      path?: string;
      referrer?: string;
      sessionId?: string;
    };

    const path = (body.path ?? "/").slice(0, 300);
    // Never log admin/auth/account/API traffic — only real shopper browsing.
    if (/^\/(admin|login|register|account|api)(\/|$)/.test(path)) {
      return NextResponse.json({ ok: true });
    }

    const ua = req.headers.get("user-agent") ?? "";
    const { device, browser, os } = parseUserAgent(ua);
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      null;

    const admin = createAdminClient();
    if (admin) {
      await admin.from("page_views").insert({
        session_id: (body.sessionId ?? "").slice(0, 64) || null,
        path,
        referrer: (body.referrer ?? "").slice(0, 300) || null,
        device,
        browser,
        os,
        country,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
