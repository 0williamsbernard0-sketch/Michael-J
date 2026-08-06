mimport { NextRequest, NextResponse } from "next/server";
import { createAwaitingPayment } from "@/lib/admin-store";

/**
 * Creates a NOWPayments invoice for the single MBJ Society plan:
 * $100 USD, billed annually. There is no monthly option — do not add
 * a `plan` param that changes the price without updating this file
 * intentionally.
 *
 * Env vars required (set in .env.local / your hosting provider):
 *   NOWPAYMENTS_API_KEY   — from your NOWPayments dashboard
 *   NEXT_PUBLIC_SITE_URL  — e.g. https://mbjsociety.com
 *
 * If you already have working NOWPayments invoice-creation code from
 * MBJ Signature, you can drop it in here in place of the fetch
 * call below — keep the request/response shape the same so
 * app/signup/page.tsx doesn't need changes.
 */

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const ANNUAL_PRICE_USD = 100;

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Set NOWPAYMENTS_API_KEY." },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderId = `mbj-society-${Date.now()}`;

    const res = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: ANNUAL_PRICE_USD,
        price_currency: "usd",
        order_id: orderId,
        order_description: `MBJ Society — Annual Membership (${email})`,
        success_url: `${siteUrl}/account?payment=success`,
        cancel_url: `${siteUrl}/signup?payment=cancelled`,
        ipn_callback_url: `${siteUrl}/api/nowpayments/webhook`,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      return NextResponse.json(
        { error: "Couldn't create invoice.", details },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Record the signup as "awaiting_payment" so the webhook can flip it
    // to "pending_approval" once NOWPayments confirms payment, and so the
    // admin panel / login route have a record to work with. See the
    // warning at the top of lib/admin-store.ts before relying on this in
    // production.
    createAwaitingPayment(orderId, name, email);

    return NextResponse.json({ invoice_url: data.invoice_url, order_id: orderId });
  } catch (err) {
    return NextResponse.json({ error: "Server error creating invoice." }, { status: 500 });
  }
}

