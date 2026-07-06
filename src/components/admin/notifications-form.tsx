"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Loader2, Send } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { sendBroadcast } from "@/lib/push-actions";

// Admin tool: type a title/message and push it to every subscriber's browser.
export function NotificationsForm({ configured }: { configured: boolean }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!title.trim() || !body.trim()) {
      toast.error("Enter a title and message.");
      return;
    }
    setSending(true);
    try {
      const res = await sendBroadcast({
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Sent to ${res.sent} of ${res.total} subscribers`, {
        description: res.failed ? `${res.failed} failed / expired` : undefined,
      });
      setTitle("");
      setBody("");
      setUrl("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Bell className="h-4 w-4 text-gold-strong" /> Send a push notification
      </h2>
      <p className="mt-1 text-sm text-muted">
        Reaches everyone who allowed notifications — even when they&apos;re not on
        the site. Great for flash sales &amp; new arrivals.
      </p>

      {!configured && (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          Push isn&apos;t configured yet. Add the VAPID keys to your environment
          variables (see the setup note), then redeploy.
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="🔥 Flash Sale — up to 50% off"
            maxLength={60}
          />
        </div>
        <div>
          <Label>Message</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={160}
            placeholder="Today only — grab your favourites before they're gone!"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-gold focus-visible:outline-none"
          />
        </div>
        <div>
          <Label>Link (optional)</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/shop  or  /products/some-product"
          />
          <p className="mt-1 text-xs text-muted">
            Where the notification opens when tapped. Defaults to the homepage.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={send}
        disabled={sending || !configured}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send to all subscribers
      </button>
    </section>
  );
}
