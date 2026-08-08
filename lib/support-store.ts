import { supabaseAdmin } from "@/lib/supabase-admin";

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

function fromRow(row: any): SupportTicket {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createTicket(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<SupportTicket> {
  const id = `ticket-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .insert({ id, name, email, subject, message, status: "open" })
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function listTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function setTicketStatus(
  id: string,
  status: TicketStatus
): Promise<SupportTicket | null> {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return fromRow(data);
}
