/**
 * ⚠️ PLACEHOLDER DATA STORE — in-memory only, same caveat as
 * lib/admin-store.ts. This works for local testing but will NOT persist
 * reliably once deployed to Vercel (serverless functions don't share
 * memory across invocations, and everything resets on redeploy/cold
 * start).
 *
 * Before launch, replace with a real Supabase table:
 *
 *   create table support_tickets (
 *     id text primary key,
 *     name text not null,
 *     email text not null,
 *     subject text not null,
 *     message text not null,
 *     status text not null,     -- 'open' | 'resolved'
 *     created_at timestamptz default now()
 *   );
 *
 * Keep the function names/signatures the same and the calling routes
 * (app/api/support, app/api/admin/support-tickets/*) won't need to change.
 */

export type TicketStatus = "open" | "resolved";

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
}

const store = new Map<string, SupportTicket>();

export function createTicket(name: string, email: string, subject: string, message: string) {
  const id = `ticket-${Date.now()}`;
  const ticket: SupportTicket = {
    id,
    name,
    email,
    subject,
    message,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  store.set(id, ticket);
  return ticket;
}

export function listTickets(): SupportTicket[] {
  return Array.from(store.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function setTicketStatus(id: string, status: TicketStatus) {
  const ticket = store.get(id);
  if (!ticket) return null;
  ticket.status = status;
  store.set(id, ticket);
  return ticket;
}
