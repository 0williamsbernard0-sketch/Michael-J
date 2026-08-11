import { NextRequest, NextResponse } from "next/server";
import { replyToTicket, listTickets } from "@/lib/support-store";
import { sendSupportReplyEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-secret") === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id, reply } = (await req.json()) as { id: string; reply: string };

    if (!id || !reply) {
      return NextResponse.json({ error: "id and reply are required." }, { status: 400 });
    }

    const all = await listTickets();
    const target = all.find((t) => t.id === id);

    if (!target) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }
    if (!target.isMember) {
      return NextResponse.json(
        { error: "Replies are only available for tickets from approved members." },
        { status: 403 }
      );
    }

    const updated = await replyToTicket(id, reply);
    if (!updated) {
      return NextResponse.json({ error: "Couldn't save the reply." }, { status: 500 });
    }

    // Insert into the shared `messages` inbox so the member sees this in
    // /messages, same as fellowship committee messages. `related_proposal_id`
    // is reused generically here as a thread key — it holds the ticket id,
    // not an actual fellowship proposal id, for support-sourced threads.
    // `source: 'support'` is what lets the UI label this correctly.
    // `email` is REQUIRED — the messages RLS policy only allows a member
    // to see rows where email = their own auth email, so without this
    // the reply would insert but never be visible to them.
    const supabase = getSupabaseAdmin();
    const { error: msgError } = await supabase.from("messages").insert({
      email: updated.email,
      related_proposal_id: updated.id,
      sender: "admin",
      subject: `Support: ${updated.subject}`,
      body: reply,
      read: false,
      source: "support",
    });
    if (msgError) {
      console.error("Failed to insert support reply into messages inbox:", msgError);
    }

    await sendSupportReplyEmail({
      name: updated.name,
      email: updated.email,
      subject: updated.subject,
      originalMessage: updated.message,
      reply,
    });

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    return NextResponse.json({ error: "Server error sending reply." }, { status: 500 });
  }
}
