import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// How many sessions are active right now (last_seen within ~90 seconds).
export async function GET() {
  let online = 0;
  const admin = createAdminClient();
  if (admin) {
    const since = new Date(Date.now() - 90_000).toISOString();
    const { count } = await admin
      .from("online_sessions")
      .select("*", { count: "exact", head: true })
      .gt("last_seen", since);
    online = count ?? 0;
  }
  return NextResponse.json(
    { online },
    { headers: { "Cache-Control": "no-store" } },
  );
}
