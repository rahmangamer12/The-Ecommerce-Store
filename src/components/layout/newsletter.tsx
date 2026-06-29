"use client";

import { useForm, ValidationError } from "@formspree/react";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";

// Newsletter signup — submits to Formspree (same inbox as the contact form),
// tagged so you can tell newsletter signups apart.
export function Newsletter() {
  const [state, handleSubmit] = useForm(siteConfig.formspreeId);

  if (state.succeeded) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-success/30 bg-success/10 px-5 py-3.5 text-sm font-medium text-success">
        <Check className="h-5 w-5" /> Thank you — you&apos;re on the list!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input type="hidden" name="form-type" value="newsletter" />
        <input
          type="email"
          name="email"
          required
          placeholder="Enter your email"
          className="h-12 flex-1 rounded-full border border-border bg-card px-5 text-sm focus:border-gold focus-visible:outline-none"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={state.submitting}
          className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white disabled:opacity-60"
        >
          {state.submitting ? "Joining…" : "Subscribe"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1.5 text-xs text-danger" />
    </form>
  );
}
