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
    const { id, reply, attachmentUrl, attachmentName } = (await req.json()) as {
      id: string;
      reply: string;
      attachmentUrl?: string | null;
      attachmentName?: string | null;
    };
    if (!id || !reply) {
      return NextResponse.json({ error: "id and reply are required." }, { status: 400 });
    }

    const all = await listTickets();
    const target = all.find((t) => t.id === id);
    if (!target) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const updated = await replyToTicket(id, reply, attachmentUrl, attachmentName);
    if (!updated) {
      return NextResponse.json({ error: "Couldn't save the reply." }, { status: 500 });
    }

    // Only members have an account/login, so only members get the reply
    // mirrored into the in-app `messages` inbox. Non-members have no
    // account to view it in, so this insert is skipped for them —
    // they get the emailed reply below instead.
    if (updated.isMember) {
      const supabase = getSupabaseAdmin();
      const { error: msgError } = await supabase.from("messages").insert({
        email: updated.email,
        related_proposal_id: updated.id,
        sender: "admin",
        subject: `Support: ${updated.subject}`,
        body: reply,
        read: false,
        source: "support",
        attachment_url: attachmentUrl ?? null,
        attachment_name: attachmentName ?? null,
      });
      if (msgError) {
        console.error("Failed to insert support reply into messages inbox:", msgError);
      }
    }

    // Email always sends — members and non-members alike.
    await sendSupportReplyEmail({
      name: updated.name,
      email: updated.email,
      subject: updated.subject,
      originalMessage: updated.message,
      reply,
      attachmentUrl,
      attachmentName,
    });

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    return NextResponse.json({ error: "Server error sending reply." }, { status: 500 });
  }
}
