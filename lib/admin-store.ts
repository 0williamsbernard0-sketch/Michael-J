import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Signup data store — backed by the Supabase `signups` table.
 * Table schema:
 *
 *   create table signups (
 *     id text primary key,              -- the NOWPayments order_id
 *     name text not null,
 *     email text not null,
 *     status text not null default 'awaiting_payment',
 *     expires_at timestamptz,           -- set to now() + 1 year on approval
 *     coupon_balance integer not null default 0,
 *     created_at timestamptz default now()
 *   );
 *
 * RLS is enabled with a deny-all policy, so every function here goes
 * through the service-role client (getSupabaseAdmin), which bypasses
 * RLS. That's why this file must only ever be imported from server
 * code (API routes) — never from a "use client" component.
 */

export type SignupStatus =
  | "awaiting_payment"
  | "waiting"
  | "confirming"
  | "partially_paid"
  | "pending_approval"
  | "failed"
  | "expired"
  | "approved"
  | "rejected";

export interface SignupRecord {
  id: string;
  name: string;
  email: string;
  status: SignupStatus;
  createdAt: string;
}

// Supabase rows use snake_case; map to the camelCase shape the rest
// of the app already expects.
function toSignupRecord(row: {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}): SignupRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status as SignupStatus,
    createdAt: row.created_at,
  };
}

/** Called right after a NOWPayments invoice is created (signup started, not yet paid). */
export async function createAwaitingPayment(id: string, name: string, email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .insert({ id, name, email, status: "awaiting_payment" })
    .select()
    .single();

  if (error) {
    console.error("createAwaitingPayment failed:", error);
    return null;
  }
  return toSignupRecord(data);
}

/**
 * Called by the webhook on EVERY IPN callback, for every payment status
 * (waiting, confirming, partially_paid, finished, failed, expired).
 * Won't clobber a decision an admin already made (approved/rejected) —
 * once you've acted on a signup, late or duplicate IPNs can't reopen it.
 *
 * Returns `changed: true` only when the status actually moved, so the
 * webhook can avoid re-sending admin notification emails on retries.
 */
export async function upsertSignupStatus(id: string, newStatus: SignupStatus) {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from("signups")
    .select()
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("upsertSignupStatus fetch failed:", fetchError);
    return { record: null as SignupRecord | null, changed: false };
  }
  if (!existing) {
    console.error("upsertSignupStatus: no signup row for id", id);
    return { record: null as SignupRecord | null, changed: false };
  }
  if (existing.status === "approved" || existing.status === "rejected") {
    return { record: toSignupRecord(existing), changed: false };
  }
  if (existing.status === newStatus) {
    return { record: toSignupRecord(existing), changed: false };
  }

  const { data, error } = await supabase
    .from("signups")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("upsertSignupStatus update failed:", error);
    return { record: null as SignupRecord | null, changed: false };
  }
  return { record: toSignupRecord(data), changed: true };
}

/** For the admin panel — everyone NOT yet decided on, at any payment state. */
export async function listPendingSignups(): Promise<SignupRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .select()
    .not("status", "in", "(approved,rejected)")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listPendingSignups failed:", error);
    return [];
  }
  return data.map(toSignupRecord);
}

/**
 * Approving a signup now also grants exactly one year of active
 * membership from this moment — expires_at drives both the coupon
 * system (lib/coupon-store.ts) and any future renewal logic.
 */
export async function approveSignup(id: string) {
  const supabase = getSupabaseAdmin();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { data, error } = await supabase
    .from("signups")
    .update({ status: "approved", expires_at: expiresAt.toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("approveSignup failed:", error);
    return null;
  }
  return toSignupRecord(data);
}

export async function rejectSignup(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .update({ status: "rejected" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("rejectSignup failed:", error);
    return null;
  }
  return toSignupRecord(data);
}

/** For login — most recent signup for this email, regardless of status. */
export async function findLatestSignupByEmail(email: string): Promise<SignupRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .select()
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("findLatestSignupByEmail failed:", error);
    return null;
  }
  return data ? toSignupRecord(data) : null;
}
