import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client that reads the logged-in user's session
 * from cookies. Use this in API routes / Server Components when you
 * need to know *which member* is making the request (respects RLS).
 *
 * Do NOT use this for admin actions — use getSupabaseAdmin() instead.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component - safe to ignore
            // if you have middleware refreshing sessions
          }
        },
      },
    }
  );
}
