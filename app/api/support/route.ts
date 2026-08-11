import { NextRequest, NextResponse } from "next/server";
import { createTicket } from "@/lib/support-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = (await req.json()) as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are all required." },
        { status: 400 }
      );
    }

    const ticket = await createTicket(name, email, subject, message);

    // Mirror the member's own message into their /messages inbox right
    // away, so the thread exists (with their message in it) even before
    // any admin reply. Only for approved members — guests can't log in
    // to view /messages anyway, so there's nothing to mirror for them.
    if (ticket.isMember) {
      const supabase = getSupabaseAdmin();
      const { error: msgError } = await supabase.from("messages").insert({
        email,
        related_proposal_id: ticket.id,
        sender: "user",
        subject: `Support: ${subject}`,
        body: message,
        read: true,
        source: "support",
      });
      if (msgError) {
        console.error("Failed to mirror support ticket into messages inbox:", msgError);
      }
    }

    return NextResponse.json({ ok: true, id: ticket.id });
  } catch (err) {
    return NextResponse.json({ error: "Server error submitting your message." }, { status: 500 });
  }
}