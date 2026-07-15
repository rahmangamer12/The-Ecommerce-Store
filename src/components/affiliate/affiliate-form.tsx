"use client";

import { useForm, ValidationError } from "@formspree/react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { usePrefs } from "@/components/providers/prefs-provider";

// Affiliate application form (uses the same Formspree inbox, tagged so you
// can tell applications apart from contact messages).
export function AffiliateForm() {
  const { t } = usePrefs();
  const [state, handleSubmit] = useForm(siteConfig.formspreeId);

  if (state.succeeded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success/10 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="mt-4 font-display text-xl font-semibold">{t("aff.successTitle")}</h3>
        <p className="mt-2 text-sm text-ink-soft">
          {t("aff.successDesc")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tags the submission so you can filter affiliate applications */}
      <input type="hidden" name="form-type" value="affiliate-application" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t("checkout.fullName")}</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">{t("contact.email")}</Label>
          <Input id="email" type="email" name="email" required />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-xs text-danger" />
        </div>
      </div>
      <div>
        <Label htmlFor="channel">{t("aff.channelLabel")}</Label>
        <Input id="channel" name="channel" placeholder="https://instagram.com/yourhandle" required />
      </div>
      <div>
        <Label htmlFor="audience">{t("aff.audienceLabel")}</Label>
        <Textarea id="audience" name="audience" placeholder={t("aff.audiencePlaceholder")} required />
        <ValidationError prefix="Audience" field="audience" errors={state.errors} className="mt-1 text-xs text-danger" />
      </div>
      <button
        type="submit"
        disabled={state.submitting}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
      >
        {state.submitting ? t("aff.submitting") : t("aff.submit")}
        {!state.submitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
