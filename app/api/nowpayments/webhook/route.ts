import { sendAdminSignupNotification } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { upsertSignupStatus, SignupStatus } from "@/lib/admin-store";

/**
 * NOWPayments IPN (Instant Payment Notification) webhook.
 * NOWPayments calls this URL when a payment's status changes — it may
 * fire multiple times per order (waiting -> confirming -> partially_paid
 * -> finished, or waiting -> expired, etc.). We record every status so
 * nothing falls through the cracks, and only notify the admin when the
 * status actually changes to something needing a decision.
 *
 * Payment confirmation does NOT grant login access by itself — "finished"
 * moves the signup to "pending_approval" so it shows up in /admin for a
 * team member to approve. Only after approval can the user log in.
 */

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const sorted = JSON.stringify(JSON.parse(rawBody), Object.keys(JSON.parse(rawBody)).sort());
  const hmac = crypto.createHmac("sha512", secret).update(sorted).digest("hex");
  return hmac === signatureHeader;
}

// Map NOWPayments' payment_status values to our internal status enum.
function mapStatus(paymentStatus: string): SignupStatus | null {
  switch (paymentStatus) {
    case "waiting":
      return "waiting";
    case "confirming":
    case "sending":
      return "confirming";
    case "partially_paid":
      return "partially_paid";
    case "finished":
      return "pending_approval";
    case "failed":
      return "failed";
    case "expired":
      return "expired";
    default:
      return null; // unknown status — ignore rather than guess
  }
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

  const mapped = mapStatus(payment_status);
  if (!mapped) {
    console.warn("Unrecognized payment_status from NOWPayments:", payment_status, order_id);
    return NextResponse.json({ received: true });
  }

  const { record, changed } = await upsertSignupStatus(order_id, mapped);

  // Notify admin whenever the status actually changes to something that
  // needs a human look — full payment, partial payment, or a stall/failure.
  if (record && changed) {
    const notifyOn: SignupStatus[] = ["pending_approval", "partially_paid", "failed", "expired"];
    if (notifyOn.includes(mapped)) {
      await sendAdminSignupNotification({
        name: record.name,
        email: record.email,
        orderId: record.id,
      });
    }
  }

  // Always respond 200 so NOWPayments doesn't keep retrying once received.
  return NextResponse.json({ received: true });
}
