import { NextRequest, NextResponse } from "next/server";
import { updateProposalStatus, ProposalStatus } from "@/lib/fellowship-store";
import { sendMessage } from "@/lib/messages-store";

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
    const { id, email, status, subject, body } = (await req.json()) as {
      id: string;
      email: string;
      status: ProposalStatus;
      subject: string;
      body: string;
    };

    if (!id || !email || !status || !subject || !body) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const proposal = await updateProposalStatus(id, status);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }

    await sendMessage({ email, subject, body, relatedProposalId: id });

    return NextResponse.json({ proposal });
  } catch {
    return NextResponse.json({ error: "Server error responding to proposal." }, { status: 500 });
  }
}
