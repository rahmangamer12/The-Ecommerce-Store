"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const NOT_CONFIGURED =
  "Sign-in isn't connected yet. Add your Supabase keys to .env.local to enable accounts.";

export type AuthResult = { ok: true } | { ok: false; error: string };

const credsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signInAction(input: unknown): Promise<AuthResult> {
  const parsed = credsSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signUpAction(input: unknown): Promise<AuthResult> {
  const schema = credsSchema.extend({ fullName: z.string().min(2) });
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resetPasswordAction(input: unknown): Promise<AuthResult> {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
}
