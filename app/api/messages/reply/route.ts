import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { proposalId, body } = await req.json();
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("messages").insert({
    email: user.email,
    related_proposal_id: proposalId,
    sender: "user",
    subject: "Re: your proposal",
    body,
    read: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
