"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      // Sends to /api/newsletter — which forwards to Resend/Mailchimp/
      // ConvertKit if configured, otherwise just acknowledges.
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
      toast.success("You're in!", { description: "Welcome to the inner circle." });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-success/30 bg-success/10 px-5 py-3.5 text-sm font-medium text-success">
        <Check className="h-5 w-5" /> Thank you — check your inbox for 10% off.
      </div>
    );
  }

  return (
    <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="h-12 flex-1 rounded-full border border-border bg-card px-5 text-sm focus:border-gold focus-visible:outline-none"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white disabled:opacity-60"
      >
        {loading ? "Joining…" : "Subscribe"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
