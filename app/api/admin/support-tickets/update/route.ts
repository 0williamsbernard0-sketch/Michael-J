import { NextRequest, NextResponse } from "next/server";
import { setTicketStatus } from "@/lib/support-store";

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
    const { id, status } = (await req.json()) as { id: string; status: "open" | "resolved" };

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required." }, { status: 400 });
    }

    const ticket = await setTicketStatus(id, status);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    return NextResponse.json({ error: "Server error updating ticket." }, { status: 500 });
  }
}
