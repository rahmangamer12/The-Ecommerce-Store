"use client";

import { useForm, ValidationError } from "@formspree/react";
import { Send, CheckCircle2 } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { usePrefs } from "@/components/providers/prefs-provider";

// Contact form powered by Formspree — submissions land in your Formspree
// inbox (and forward to your email). Change the ID in src/config/site.ts.
export function ContactForm() {
  const [state, handleSubmit] = useForm(siteConfig.formspreeId);
  const { t } = usePrefs();

  if (state.succeeded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success/10 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="mt-4 font-display text-xl font-semibold">{t("contact.sent")}</h3>
        <p className="mt-2 text-sm text-ink-soft">
          {t("contact.sentDesc")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t("contact.name")}</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">{t("contact.email")}</Label>
          <Input id="email" type="email" name="email" required />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-xs text-danger" />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">{t("contact.subject")}</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div>
        <Label htmlFor="message">{t("contact.message")}</Label>
        <Textarea id="message" name="message" required />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-xs text-danger" />
      </div>
      <button
        type="submit"
        disabled={state.submitting}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white disabled:opacity-60"
      >
        {state.submitting ? t("contact.sending") : t("contact.send")}
        {!state.submitting && <Send className="h-4 w-4" />}
      </button>
    </form>
  );
}
