import { NextRequest, NextResponse } from "next/server";

/**
 * Receives financial-aid proposal submissions from members.
 *
 * This is a stub — wire it to your real storage/review workflow:
 *   - Insert into a Supabase table, e.g. `fellowship_proposals`
 *     (fullName, email, phone, area, amountRequested, reason, memberId,
 *     status: "pending", submittedAt).
 *   - Optionally notify the Fellowship review team (email/Slack) so
 *     nothing sits unseen.
 *   - Since this collects sensitive personal/financial context, make
 *     sure the table has restrictive row-level security — proposals
 *     should only be readable by whoever actually reviews them, not by
 *     other members.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, reason } = body;

    if (!fullName || !email || !reason) {
      return NextResponse.json(
        { error: "Full name, email, and reason are required." },
        { status: 400 }
      );
    }

    // TODO: replace with real persistence, e.g.:
    // const { error } = await supabase.from("fellowship_proposals").insert({
    //   ...body,
    //   status: "pending",
    //   submitted_at: new Date().toISOString(),
    // });
    // if (error) throw error;

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Server error submitting proposal." }, { status: 500 });
  }
}

