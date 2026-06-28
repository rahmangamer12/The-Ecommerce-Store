"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/config/env";

/**
 * Browser Supabase client.
 * Returns `null` when Supabase keys are not set, so the UI can fall
 * back gracefully instead of crashing. Always null-check the result.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
