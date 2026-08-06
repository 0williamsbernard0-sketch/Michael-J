import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * NOWPayments IPN (Instant Payment Notification) webhook.
 * NOWPayments calls this URL when a payment's status changes.
 *
 * Set this exact URL as your ipn_callback_url (already wired in
 * app/api/nowpayments/route.ts) and set NOWPAYMENTS_IPN_SECRET in your
 * env vars (from the NOWPayments dashboard) to verify authenticity.
 *
 * ⚠️ This is a stub. Before relying on it in production:
 *  - Wire the TODOs below to your actual Supabase `members` table.
 *  - Confirm you're only granting access on `payment_status === "finished"`
 *    (NOWPayments also sends "waiting", "confirming", "partially_paid",
 *    "failed", etc. — don't grant access on those).
 */

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const sorted = JSON.stringify(JSON.parse(rawBody), Object.keys(JSON.parse(rawBody)).sort());
  const hmac = crypto.createHmac("sha512", secret).update(sorted).digest("hex");
  return hmac === signatureHeader;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (secret) {
    const valid = verifySignature(rawBody, signature, secret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);
  const { order_id, payment_status } = payload;

  if (payment_status === "finished") {
    // TODO: look up the pending membership by order_id, then:
    //   - mark it active in your `members` table
    //   - set expires_at = now + 1 year
    //   - optionally send a confirmation email
    // Example (pseudocode):
    // await supabase.from("members").upsert({
    //   order_id,
    //   status: "active",
    //   plan: "annual",
    //   expires_at: addYears(new Date(), 1),
    // });
  }

  // Always respond 200 so NOWPayments doesn't keep retrying once received.
  return NextResponse.json({ received: true });
}

