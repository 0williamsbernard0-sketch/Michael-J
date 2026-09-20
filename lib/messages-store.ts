import { getSupabaseAdmin } from "@/lib/supabase";

/** Admin-only: sends an in-app message to a member's inbox. */
export async function sendMessage(data: {
  email: string;
  subject: string;
  body: string;
  relatedProposalId?: string;
  sender?: "admin" | "user";
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("messages")
    .insert({
      email: data.email,
      subject: data.subject,
      body: data.body,
      related_proposal_id: data.relatedProposalId ?? null,
      sender: data.sender ?? "admin",
      attachment_url: data.attachmentUrl ?? null,
      attachment_name: data.attachmentName ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("sendMessage failed:", error);
    return null;
  }
  return row;
}
