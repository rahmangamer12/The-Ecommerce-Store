import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceKey } from "@/config/env";

/**
 * Service-role Supabase client for trusted server-side writes
 * (orders, admin actions). NEVER import this into client components.
 * Returns null when the service key is not configured.
 */
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
