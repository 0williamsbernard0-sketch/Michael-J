/**
 * ⚠️ PLACEHOLDER DATA STORE — in-memory only. Read this before launch.
 *
 * This exists so the full signup → payment → admin approval → login flow
 * is wired end-to-end and demoable. It will NOT work correctly once
 * deployed to Vercel:
 *
 *   - Vercel serverless functions do not share memory across invocations
 *     or instances. An admin approving a signup in one request is not
 *     guaranteed to be visible when a user tries to log in on the next
 *     request — they may hit a different, cold instance with an empty Map.
 *   - All data is wiped on every deploy and on cold starts.
 *
 * Before launch, replace every function below with real queries against a
 * Supabase table, e.g.:
 *
 *   create table signups (
 *     id text primary key,        -- the NOWPayments order_id
 *     name text not null,
 *     email text not null,
 *     status text not null,       -- 'awaiting_payment' | 'pending_approval' | 'approved' | 'rejected'
 *     created_at timestamptz default now()
 *   );
 *
 * Keep the function names/signatures the same and the calling code in
 * app/api/nowpayments/route.ts, app/api/nowpayments/webhook/route.ts,
 * app/api/auth/login/route.ts, and app/api/admin/* won't need to change.
 */

export type SignupStatus = "awaiting_payment" | "pending_approval" | "approved" | "rejected";

export interface SignupRecord {
  id: string;
  name: string;
  email: string;
  status: SignupStatus;
  createdAt: string;
}

const store = new Map<string, SignupRecord>();

/** Called right after a NOWPayments invoice is created (signup started, not yet paid). */
export function createAwaitingPayment(id: string, name: string, email: string) {
  const record: SignupRecord = {
    id,
    name,
    email,
    status: "awaiting_payment",
    createdAt: new Date().toISOString(),
  };
  store.set(id, record);
  return record;
}

/** Called by the NOWPayments webhook when payment_status === "finished". */
export function markPendingApproval(id: string) {
  const record = store.get(id);
  if (!record) return null; // TODO: with Supabase this shouldn't happen — look up by id and fail loudly if missing
  record.status = "pending_approval";
  store.set(id, record);
  return record;
}

/** For the admin panel — everyone waiting on a decision. */
export function listPendingSignups(): SignupRecord[] {
  return Array.from(store.values())
    .filter((r) => r.status === "pending_approval")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function approveSignup(id: string) {
  const record = store.get(id);
  if (!record) return null;
  record.status = "approved";
  store.set(id, record);
  return record;
}

export function rejectSignup(id: string) {
  const record = store.get(id);
  if (!record) return null;
  record.status = "rejected";
  store.set(id, record);
  return record;
}

/** For login — most recent signup for this email, regardless of status. */
export function findLatestSignupByEmail(email: string): SignupRecord | null {
  const matches = Array.from(store.values())
    .filter((r) => r.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return matches[0] ?? null;
}

