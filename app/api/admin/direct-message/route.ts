import { NextRequest, NextResponse } from "next/server";
import { sendAdminDirectEmail } from "@/lib/email";
import { logDirectMessage, listDirectMessages } from "@/lib/direct-messages-store";

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
    const { name, email, subject, message, attachmentUrl, attachmentName } = (await req.json()) as {
      name?: string;
      email: string;
      subject: string;
      message: string;
      attachmentUrl?: string | null;
      attachmentName?: string | null;
    };
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required." },
        { status: 400 }
      );
    }
    await sendAdminDirectEmail({ name, email, subject, message, attachmentUrl, attachmentName });
    const logged = await logDirectMessage({ name, email, subject, message, attachmentUrl, attachmentName });
    return NextResponse.json({ ok: true, message: logged });
  } catch (err) {
    console.error("Failed to send direct admin email:", err);
    return NextResponse.json({ error: "Server error sending message." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const messages = await listDirectMessages();
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: "Server error loading messages." }, { status: 500 });
  }
}
