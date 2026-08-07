import { NextRequest, NextResponse } from "next/server";
import { createProposal } from "@/lib/fellowship-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, area, amountRequested, reason } = body;

    if (!fullName || !email || !reason) {
      return NextResponse.json(
        { error: "Full name, email, and reason are required." },
        { status: 400 }
      );
    }

    const record = await createProposal({ fullName, email, phone, area, amountRequested, reason });
    if (!record) {
      return NextResponse.json({ error: "Couldn't save proposal." }, { status: 500 });
    }

    return NextResponse.json({ received: true, id: record.id });
  } catch {
    return NextResponse.json({ error: "Server error submitting proposal." }, { status: 500 });
  }
}
