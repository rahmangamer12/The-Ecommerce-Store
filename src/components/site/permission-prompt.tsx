"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, MapPin, X } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { siteConfig } from "@/config/site";
import { savePushSubscription } from "@/lib/push-actions";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Convert a base64url VAPID key to the Uint8Array the browser expects. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/** Register the service worker and subscribe this browser to web push. */
async function subscribeToPush(country?: string): Promise<void> {
  if (
    !VAPID_PUBLIC ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      }));
    const json = sub.toJSON() as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
      await savePushSubscription(
        { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } },
        country,
      );
    }
  } catch {
    /* subscription failed (unsupported / blocked) — non-fatal */
  }
}

// A friendly "enable notifications & location" card — like most shops show.
// Location auto-detects the shopper's country so shipping & tax are accurate;
// notifications let us ping deals/order updates. We ask on a button click
// (browsers block permission prompts that aren't triggered by a user gesture).

const HANDLED_KEY = "luxora.perm";

/** Reverse-geocode lat/lng → ISO country code (free, no API key needed). */
async function countryFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as { countryCode?: string };
    return data.countryCode ? data.countryCode.toUpperCase() : null;
  } catch {
    return null;
  }
}

export function PermissionPrompt() {
  const { setShipCountry } = useStore();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // Show once, a moment after load, unless already handled/dismissed.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(HANDLED_KEY)) return;
    const id = window.setTimeout(() => setShow(true), 2500);
    return () => window.clearTimeout(id);
  }, []);

  function close(remember: boolean) {
    if (remember && typeof window !== "undefined") {
      window.localStorage.setItem(HANDLED_KEY, "1");
    }
    setShow(false);
  }

  async function enable() {
    setBusy(true);

    // 1) Location — detect country for accurate shipping & tax.
    let detected: string | undefined;
    if ("geolocation" in navigator) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const code = await countryFromCoords(
              pos.coords.latitude,
              pos.coords.longitude,
            );
            if (code) {
              detected = code;
              setShipCountry(code);
              toast.success("Location set", {
                description: `Showing shipping & tax for ${code}.`,
              });
            }
            resolve();
          },
          () => resolve(), // denied / unavailable — no problem
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
        );
      });
    }

    // 2) Notifications — request permission, subscribe to push, welcome ping.
    try {
      if ("Notification" in window && Notification.permission !== "denied") {
        const perm =
          Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();
        if (perm === "granted") {
          await subscribeToPush(detected);
          try {
            new Notification(`Welcome to ${siteConfig.name}! 🎉`, {
              body: "You'll get our best deals & order updates here.",
              icon: "/icon.png",
            });
          } catch {
            /* some browsers only show via the service worker — ignore */
          }
        }
      }
    } catch {
      /* ignore */
    }

    setBusy(false);
    close(true);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:left-4 sm:max-w-sm">
      <div className="relative animate-in slide-in-from-bottom-4 rounded-2xl border border-border bg-card p-5 shadow-luxe">
        <button
          type="button"
          onClick={() => close(true)}
          aria-label="Dismiss"
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-strong">
            <Bell className="h-5 w-5" />
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-strong">
            <MapPin className="h-5 w-5" />
          </span>
        </div>

        <p className="mt-3 font-semibold">Stay in the loop</p>
        <p className="mt-1 text-sm text-ink-soft">
          Allow <span className="font-medium">notifications</span> for deals &amp;
          order updates, and <span className="font-medium">location</span> so we
          show the right shipping &amp; tax for your country.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="flex-1 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
          >
            {busy ? "Enabling…" : "Allow"}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className="rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink/30"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
