import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Live presence: how many sessions are active right now (last_seen < ~90s) and
// what each one is doing (their latest page / device / country).
export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ online: 0, visitors: [] });

  const now = Date.now();
  const since = new Date(now - 90_000).toISOString();

  const { data: sess } = await admin
    .from("online_sessions")
    .select("session_id, last_seen")
    .gt("last_seen", since)
    .order("last_seen", { ascending: false })
    .limit(50);

  const sessions = sess ?? [];
  const ids = sessions.map((s) => s.session_id);
  const online = ids.length;

  const visitors: {
    path: string | null;
    device: string | null;
    browser: string | null;
    country: string | null;
    secondsAgo: number;
  }[] = [];

  if (ids.length) {
    const lastSeen = new Map(sessions.map((s) => [s.session_id, s.last_seen]));
    const { data: pv } = await admin
      .from("page_views")
      .select("session_id, path, device, browser, country, created_at")
      .in("session_id", ids)
      .order("created_at", { ascending: false })
      .limit(500);

    const seen = new Set<string>();
    for (const r of pv ?? []) {
      if (seen.has(r.session_id)) continue;
      seen.add(r.session_id);
      const seenAt = lastSeen.get(r.session_id) ?? r.created_at;
      visitors.push({
        path: r.path,
        device: r.device,
        browser: r.browser,
        country: r.country,
        secondsAgo: Math.max(0, Math.round((now - new Date(seenAt).getTime()) / 1000)),
      });
    }
  }

  return NextResponse.json(
    { online, visitors },
    { headers: { "Cache-Control": "no-store" } },
  );
}
