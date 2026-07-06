import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Heartbeat: <VisitTracker> pings this every ~45s while the tab is open, so we
// know the session is still active (for the live "online now" count).
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
    const sessionId = (body.sessionId ?? "").slice(0, 64);
    if (sessionId) {
      const admin = createAdminClient();
      if (admin) {
        await admin
          .from("online_sessions")
          .upsert(
            { session_id: sessionId, last_seen: new Date().toISOString() },
            { onConflict: "session_id" },
          );
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
