import { NextRequest, NextResponse } from "next/server";
import { sendAdminDirectEmail } from "@/lib/email";

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
    const { name, email, subject, message } = (await req.json()) as {
      name?: string;
      email: string;
      subject: string;
      message: string;
    };
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required." },
        { status: 400 }
      );
    }
    await sendAdminDirectEmail({ name, email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send direct admin email:", err);
    return NextResponse.json({ error: "Server error sending message." }, { status: 500 });
  }
}
