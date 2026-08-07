import { getSupabaseAdmin } from "@/lib/supabase";

export type ProposalStatus = "under_review" | "approved" | "rejected" | "needs_more_info";

export interface ProposalRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  area: string | null;
  amountRequested: string | null;
  reason: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
}

function toRecord(row: any): ProposalRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    area: row.area,
    amountRequested: row.amount_requested,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProposal(data: {
  fullName: string;
  email: string;
  phone?: string;
  area?: string;
  amountRequested?: string;
  reason: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("fellowship_proposals")
    .insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      area: data.area ?? null,
      amount_requested: data.amountRequested ?? null,
      reason: data.reason,
    })
    .select()
    .single();

  if (error) {
    console.error("createProposal failed:", error);
    return null;
  }
  return toRecord(row);
}

/** For the admin panel — all proposals, newest first. */
export async function listProposals(): Promise<ProposalRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("fellowship_proposals")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProposals failed:", error);
    return [];
  }
  return data.map(toRecord);
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("fellowship_proposals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateProposalStatus failed:", error);
    return null;
  }
  return toRecord(data);
}
