import { NextRequest, NextResponse } from "next/server";
import { listTickets } from "@/lib/support-store";

function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const tickets = await listTickets();
    return NextResponse.json({ tickets });
  } catch (err) {
    return NextResponse.json({ error: "Server error loading tickets." }, { status: 500 });
  }
}
