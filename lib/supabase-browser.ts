import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client — safe to use in "use client" components.
 * Uses the public anon key only (never the service role key).
 */
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
