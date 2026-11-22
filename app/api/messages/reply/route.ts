// app/api/messages/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseServer } from "@/lib/supabase-server";
import { setTicketStatus } from "@/lib/support-store";
import { sendAdminMemberReplyNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
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

    // Confirm this thread belongs to the requesting member
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
        read: false,
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

    // Reopen the support ticket so it shows under the admin's "Open" filter
    if (existing.source === "support") {
      try {
        await setTicketStatus(proposalId, "open");
      } catch (e) {
        console.error("Failed to reopen ticket:", e);
      }
    }

    // Email the admin (the helper never throws, so it can't block the reply)
    await sendAdminMemberReplyNotification({
      memberEmail: user.email,
      subject: existing.subject,
      body: body?.trim() ?? "",
      attachmentUrl,
      attachmentName,
    });

    return NextResponse.json({ ok: true, message: inserted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error sending reply." }, { status: 500 });
  }
}
