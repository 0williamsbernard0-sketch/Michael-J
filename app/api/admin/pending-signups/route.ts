import { NextRequest, NextResponse } from "next/server";
import { listPendingSignups } from "@/lib/admin-store";

/**
 * Gated by a single shared secret (ADMIN_SECRET env var), not real
 * admin user accounts/roles. Fine to ship with for a small team, but
 * replace with real authenticated admin roles (e.g. a Supabase `is_admin`
 * flag checked server-side) before this panel is your only line of
 * defense on sensitive data.
 */
function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false; // fail closed if not configured
  return req.headers.get("x-admin-secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ signups: await listPendingSignups() });
}
