import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type TicketStatus = "open" | "resolved";

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  reply: string | null;
  repliedAt: string | null;
  isMember: boolean;
}

function fromRow(row: any, memberEmails: Set<string>): SupportTicket {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    reply: row.reply ?? null,
    repliedAt: row.replied_at ?? null,
    isMember: memberEmails.has(row.email.toLowerCase()),
  };
}

/**
 * Emails of everyone with an approved membership — used to gate the
 * "reply" feature to members only, per the requirement that support
 * shouldn't let admins get pulled into back-and-forth with non-members
 * (trolls, spam, etc).
 */
async function getApprovedMemberEmails(): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signups")
    .select("email")
    .eq("status", "approved");

  if (error) throw error;
  return new Set((data ?? []).map((r: any) => r.email.toLowerCase()));
}

export async function createTicket(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<SupportTicket> {
  const supabase = getSupabaseAdmin();
  const id = `ticket-${Date.now()}`;

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({ id, name, email, subject, message, status: "open" })
    .select()
    .single();

  if (error) throw error;
  const memberEmails = await getApprovedMemberEmails();
  return fromRow(data, memberEmails);
}

export async function listTickets(): Promise<SupportTicket[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("support_tickets")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  const memberEmails = await getApprovedMemberEmails();
  return (data ?? []).map((row: any) => fromRow(row, memberEmails));
}

export async function setTicketStatus(
  id: string,
  status: TicketStatus
): Promise<SupportTicket | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  const memberEmails = await getApprovedMemberEmails();
  return fromRow(data, memberEmails);
}

/**
 * Records the admin's reply. Does NOT check membership itself — the
 * calling route is responsible for verifying isMember before allowing
 * this, so the restriction lives at the API boundary, not buried here.
 */
export async function replyToTicket(
  id: string,
  reply: string
): Promise<SupportTicket | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("support_tickets")
    .update({ reply, replied_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  const memberEmails = await getApprovedMemberEmails();
  return fromRow(data, memberEmails);
}

/** For the member-facing "My Tickets" view — only returns tickets for
 * that exact email, and only if they're currently an approved member. */
export async function listTicketsForMember(email: string): Promise<SupportTicket[]> {
  const memberEmails = await getApprovedMemberEmails();
  if (!memberEmails.has(email.toLowerCase())) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("support_tickets")
    .select()
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => fromRow(row, memberEmails));
}