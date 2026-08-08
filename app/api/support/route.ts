import { NextRequest, NextResponse } from "next/server";
import { createTicket } from "@/lib/support-store";

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

    const ticket = createTicket(name, email, subject, message);

    return NextResponse.json({ ok: true, id: ticket.id });
  } catch (err) {
    return NextResponse.json({ error: "Server error submitting your message." }, { status: 500 });
  }
}
