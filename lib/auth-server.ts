import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

/**
 * Verifies the Supabase access token sent as `Authorization: Bearer <token>`
 * and returns the caller's email, or null if missing/invalid.
 * Used by any API route that needs to know which member is calling
 * (coupon balance, unlocking content, buying coupons).
 */
export async function getRequestEmail(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;
  return data.user.email;
}
