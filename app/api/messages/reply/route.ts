// app/api/messages/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server"; // your session-aware client

export async function POST(req: NextRequest) {
  const { proposalId, body } = await req.json();
  if (!proposalId || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = getSupabaseServer();
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
      body: body.trim(),
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
