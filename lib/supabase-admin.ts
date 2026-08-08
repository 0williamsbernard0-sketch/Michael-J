// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service_role key — full
 * read/write access, bypasses Row Level Security.
 *
 * NEVER import this file into a "use client" component. It's only safe
 * inside app/api/*/route.ts files, which run exclusively on the server.
 * These routes already gate admin access with ADMIN_SECRET, so this
 * client intentionally skips RLS rather than needing separate policies.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
