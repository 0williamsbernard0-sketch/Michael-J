import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface DirectMessage {
  id: string;
  name: string | null;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
}

function fromRow(row: any): DirectMessage {
  return {
    id: row.id,
    name: row.name ?? null,
    email: row.email,
    subject: row.subject,
    message: row.message,
    sentAt: row.sent_at,
    attachmentUrl: row.attachment_url ?? null,
    attachmentName: row.attachment_name ?? null,
  };
}

export async function logDirectMessage(params: {
  name?: string;
  email: string;
  subject: string;
  message: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}): Promise<DirectMessage> {
  const supabase = getSupabaseAdmin();
  const id = `dm-${Date.now()}`;
  const { data, error } = await supabase
    .from("direct_messages")
    .insert({
      id,
      name: params.name ?? null,
      email: params.email,
      subject: params.subject,
      message: params.message,
      attachment_url: params.attachmentUrl ?? null,
      attachment_name: params.attachmentName ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function listDirectMessages(): Promise<DirectMessage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("direct_messages")
    .select()
    .order("sent_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

/** Used to warn the admin they've already reached out to this email before. */
export async function listDirectMessagesForEmail(email: string): Promise<DirectMessage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("direct_messages")
    .select()
    .eq("email", email.toLowerCase())
    .order("sent_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}
