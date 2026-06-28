"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input, Label } from "@/components/ui/input";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "Alex Morgan",
    email: "alex@example.com",
    phone: "+44 7700 000000",
  });
  const [prefs, setPrefs] = useState({ marketing: true, orders: true });

  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-8">
      <section>
        <h2 className="font-display text-xl font-semibold">Profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Notifications</h2>
        <div className="mt-4 space-y-3">
          <Switch
            label="Order updates"
            description="Shipping and delivery notifications"
            checked={prefs.orders}
            onChange={() => setPrefs((p) => ({ ...p, orders: !p.orders }))}
          />
          <Switch
            label="Marketing emails"
            description="New arrivals, sales and stories"
            checked={prefs.marketing}
            onChange={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
          />
        </div>
      </section>

      <button
        type="submit"
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white"
      >
        Save changes
      </button>
    </form>
  );
}

function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-border"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
