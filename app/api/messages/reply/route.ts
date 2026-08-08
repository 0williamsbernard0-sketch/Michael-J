import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { proposalId, body, attachmentUrl, attachmentName } = await req.json();

  if (!proposalId || (!body?.trim() && !attachmentUrl)) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      email: user.email,
      related_proposal_id: proposalId,
      sender: "user",
      subject: "Re: your proposal",
      body: body?.trim() || (attachmentName ? `Sent a file: ${attachmentName}` : ""),
      attachment_url: attachmentUrl ?? null,
      attachment_name: attachmentName ?? null,
      read: true,
    })
    .select()
    .single();

  if (error) {
    console.error("user reply failed:", error);
    return NextResponse.json({ error: "Couldn't send reply." }, { status: 400 });
  }
  return NextResponse.json({ message: data });
}
