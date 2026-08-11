import { NextRequest, NextResponse } from "next/server";
import { replyToTicket, listTickets } from "@/lib/support-store";
import { sendSupportReplyEmail } from "@/lib/email";

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

    // Enforce members-only replies at the API boundary, not just in the UI —
    // find the ticket first to check isMember before writing anything.
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
