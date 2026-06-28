"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Message sent", { description: "We'll be in touch shortly." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Could not send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" required value={form.subject} onChange={(e) => set("subject", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" required value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send message"}
        {!loading && <Send className="h-4 w-4" />}
      </button>
    </form>
  );
}
