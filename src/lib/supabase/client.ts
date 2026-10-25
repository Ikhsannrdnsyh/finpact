import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/** Client untuk komponen browser. null bila Supabase belum dikonfigurasi. */
export function createClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  return env ? createBrowserClient(env.url, env.key) : null;
}