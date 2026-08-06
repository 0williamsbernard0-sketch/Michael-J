import { NextRequest, NextResponse } from "next/server";
import { approveSignup, rejectSignup } from "@/lib/admin-store";

/** See app/api/admin/pending-signups/route.ts for the auth caveats. */
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
    const { id, action } = (await req.json()) as { id: string; action: "approve" | "reject" };

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required." }, { status: 400 });
    }

    const record = action === "approve" ? approveSignup(id) : rejectSignup(id);

    if (!record) {
      return NextResponse.json({ error: "Signup not found." }, { status: 404 });
    }

    // TODO: send the member a confirmation email now that they're approved
    // (or a rejection notice), once you have an email provider wired up.

    return NextResponse.json({ signup: record });
  } catch (err) {
    return NextResponse.json({ error: "Server error updating signup." }, { status: 500 });
  }
}

