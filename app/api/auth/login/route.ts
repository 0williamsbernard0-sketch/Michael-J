import { NextRequest, NextResponse } from "next/server";
import { findLatestSignupByEmail } from "@/lib/admin-store";

/**
 * Checks a signup's approval status by email before allowing login.
 *
 * This route does NOT verify the password — verification happens
 * client-side via supabase.auth.signInWithPassword() in
 * app/login/page.tsx, AFTER this route confirms the signup is
 * approved. That ordering matters: we check approval first so a
 * pending or rejected user never even attempts a real Supabase
 * sign-in, and instead sees the correct pending/rejected message.
 *
 * The approval check is layered on top of real auth, not a
 * replacement for it — Supabase Auth still owns the actual password
 * verification.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string; password: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const record = await findLatestSignupByEmail(email);

    if (!record) {
      return NextResponse.json(
        { error: "No account found for that email. Have you completed signup and payment?" },
        { status: 404 }
      );
    }

    if (record.status === "awaiting_payment") {
      return NextResponse.json(
        { error: "We haven't received your payment yet. If you already paid, this can take a few minutes." },
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

    // status === "approved" — clear to attempt real Supabase sign-in client-side.
    return NextResponse.json({ status: "approved", name: record.name, email: record.email });
  } catch (err) {
    return NextResponse.json({ error: "Server error checking account status." }, { status: 500 });
  }
}
