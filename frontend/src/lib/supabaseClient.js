"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient;

/**
 * Browser-side Supabase client (anon key only).
 * Used for: Admin login/logout (Supabase Auth) and public, read-only
 * product catalog queries. Never use the service role key here.
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}
