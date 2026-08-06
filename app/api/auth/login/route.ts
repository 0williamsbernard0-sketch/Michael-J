import { NextRequest, NextResponse } from "next/server";
import { findLatestSignupByEmail } from "@/lib/admin-store";

/**
 * Checks a signup's approval status by email before allowing login.
 *
 * ⚠️ Password is accepted but NOT verified here — there's no real user
 * auth wired up yet. Replace this whole route with
 * supabase.auth.signInWithPassword() once Supabase Auth is in place, and
 * keep the approval check (status === "approved") as an additional guard
 * layered on top of real auth, not a replacement for it.
 */

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string; password: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const record = findLatestSignupByEmail(email);

    if (!record) {
      return NextResponse.json(
        { error: "No account found for that email. Have you completed signup and payment?" },
        { status: 404 }
      );
    }

    if (record.status === "awaiting_payment") {
      return NextResponse.json(
        { error: "We haven't received your payment yet. If you already paid, this can take a few minutes to confirm." },
        { status: 403 }
      );
    }

    if (record.status === "pending_approval") {
      return NextResponse.json({ status: "pending" });
    }

    if (record.status === "rejected") {
      return NextResponse.json(
        { error: "Your membership application wasn't approved. Contact the MBJ team for details." },
        { status: 403 }
      );
    }

    // status === "approved"
    return NextResponse.json({ status: "approved", name: record.name, email: record.email });
  } catch (err) {
    return NextResponse.json({ error: "Server error checking account status." }, { status: 500 });
  }
}

