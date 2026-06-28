"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import {
  signInAction,
  signUpAction,
  resetPasswordAction,
} from "@/lib/auth-actions";

type Mode = "login" | "register" | "forgot";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await signInAction({ email: form.email, password: form.password });
        if (!res.ok) return toast.error(res.error);
        toast.success("Welcome back!");
        router.push("/account");
        router.refresh();
      } else if (mode === "register") {
        const res = await signUpAction(form);
        if (!res.ok) return toast.error(res.error);
        toast.success("Account created", { description: "Check your email to confirm." });
        router.push("/account");
        router.refresh();
      } else {
        const res = await resetPasswordAction({ email: form.email });
        if (!res.ok) return toast.error(res.error);
        toast.success("Reset link sent", { description: "Check your inbox." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {mode !== "forgot" && (
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {mode === "login" && (
        <div className="flex justify-end">
          <a href="/forgot-password" className="text-sm text-gold-strong hover:underline">
            Forgot password?
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-full bg-ink font-medium text-paper transition-colors hover:bg-gold hover:text-white disabled:opacity-60"
      >
        {loading
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : mode === "register"
              ? "Create account"
              : "Send reset link"}
      </button>
    </form>
  );
}
