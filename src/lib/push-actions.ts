"use server";

import webpush from "web-push";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminEmails,
  vapidPublicKey,
  vapidPrivateKey,
  vapidSubject,
  isPushConfigured,
} from "@/config/env";

// =============================================================
//  Web push: save browser subscriptions + broadcast to them.
// =============================================================

function configureWebPush(): boolean {
  if (!isPushConfigured) return false;
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  return true;
}

export type PushSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Store (or refresh) a browser's push subscription. Called from the client. */
export async function savePushSubscription(
  sub: PushSub,
  country?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { ok: false, error: "invalid subscription" };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "not configured" };

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      country: country ?? null,
    },
    { onConflict: "endpoint" },
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

async function requireAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

export type BroadcastResult =
  | { ok: true; sent: number; failed: number; total: number }
  | { ok: false; error: string };

/** Admin-only: send a notification to every stored subscriber. */
export async function sendBroadcast(input: {
  title: string;
  body: string;
  url?: string;
}): Promise<BroadcastResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  if (!configureWebPush()) {
    return { ok: false, error: "Push isn't configured (add VAPID keys)." };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  const title = input.title?.trim();
  const body = input.body?.trim();
  if (!title || !body) return { ok: false, error: "Enter a title and message." };

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");
  if (error) return { ok: false, error: error.message };
  if (!subs || subs.length === 0) {
    return { ok: false, error: "No subscribers yet." };
  }

  const payload = JSON.stringify({
    title,
    body,
    url: input.url?.trim() || "/",
    icon: "/icon.png",
  });

  let sent = 0;
  let failed = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err) {
        failed++;
        const code = (err as { statusCode?: number })?.statusCode;
        // 404/410 = subscription gone → drop it so we stop retrying.
        if (code === 404 || code === 410) dead.push(s.endpoint);
      }
    }),
  );

  if (dead.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", dead);
  }

  return { ok: true, sent, failed, total: subs.length };
}
