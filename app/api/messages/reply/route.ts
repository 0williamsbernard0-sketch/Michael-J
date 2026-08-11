// app/api/messages/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  // Identify the logged-in member from their session cookie
  const supabaseAuth = await getSupabaseServer();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const { proposalId, body, attachmentUrl, attachmentName } = (await req.json()) as {
      proposalId: string;
      body: string;
      attachmentUrl?: string | null;
      attachmentName?: string | null;
    };

    if (!proposalId || (!body?.trim() && !attachmentUrl)) {
      return NextResponse.json(
        { error: "proposalId and a body or attachment are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Confirm this thread actually belongs to the requesting member before
    // letting them post into it.
    const { data: existing, error: fetchErr } = await supabase
      .from("messages")
      .select("email, subject, source")
      .eq("related_proposal_id", proposalId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchErr || !existing || existing.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("messages")
      .insert({
        email: user.email,
        related_proposal_id: proposalId,
        sender: "user",
        subject: existing.subject,
        body: body?.trim() ?? "",
        read: true,
        source: existing.source,
        attachment_url: attachmentUrl ?? null,
        attachment_name: attachmentName ?? null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Failed to insert member reply:", insertErr);
      return NextResponse.json({ error: "Couldn't send your reply." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: inserted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error sending reply." }, { status: 500 });
  }
}
