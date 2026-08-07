import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Signup data store — now backed by the Supabase `signups` table
 * instead of an in-memory Map. Table schema:
 *
 *   create table signups (
 *     id text primary key,              -- the NOWPayments order_id
 *     name text not null,
 *     email text not null,
 *     status text not null default 'awaiting_payment',
 *     created_at timestamptz default now()
 *   );
 *
 * RLS is enabled with a deny-all policy, so every function here goes
 * through the service-role client (getSupabaseAdmin), which bypasses
 * RLS. That's why this file must only ever be imported from server
 * code (API routes) — never from a "use client" component.
 *
 * All functions are now async, unlike the old in-memory version.
 * Every caller has been updated to await them — see the API routes
 * in app/api/nowpayments/, app/api/auth/login/, and app/api/admin/.
 */

export type SignupStatus = "awaiting_payment" | "pending_approval" | "approved" | "rejected";

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

/** Called by the NOWPayments webhook when payment_status === "finished". */
export async function markPendingApproval(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .update({ status: "pending_approval" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("markPendingApproval failed:", error);
    return null;
  }
  return toSignupRecord(data);
}

/** For the admin panel — everyone waiting on a decision. */
export async function listPendingSignups(): Promise<SignupRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .select()
    .eq("status", "pending_approval")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listPendingSignups failed:", error);
    return [];
  }
  return data.map(toSignupRecord);
}

export async function approveSignup(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .update({ status: "approved" })
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
