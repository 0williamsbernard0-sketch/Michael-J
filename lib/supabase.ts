import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, using the service role key.
 *
 * This bypasses Row Level Security — that's intentional, since the
 * `signups` table has RLS set to deny all public access (see the SQL
 * setup). Only server-side code (API routes) should ever import this
 * file. Never import it into a "use client" component — the service
 * role key must never reach the browser.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
