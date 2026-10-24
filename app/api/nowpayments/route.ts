import { NextRequest, NextResponse } from "next/server";
import { createAwaitingPayment } from "@/lib/admin-store";
import { getPrice } from "@/lib/promo";

/**
 * Creates a NOWPayments invoice for the single MBJ Society plan:
 * $100 USD, billed annually (less any valid promo code, e.g. MD101 = 60% off).
 * The price is always calculated here on the server from lib/promo.ts,
 * never taken from the client.
 *
 * Env vars required (set in .env.local / your hosting provider):
 *   NOWPAYMENTS_API_KEY   — from your NOWPayments dashboard
 *   NEXT_PUBLIC_SITE_URL  — e.g. https://mbjsociety.com
 */

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

export async function POST(req: NextRequest) {
  try {
    const { name, email, promo } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const priced = getPrice(promo);
    if (!priced.valid) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
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
        price_amount: priced.price,
        price_currency: "usd",
        order_id: orderId,
        order_description: `MBJ Society — Annual Membership (${email})${
          priced.code ? ` [promo ${priced.code}]` : ""
        }`,
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
    await createAwaitingPayment(orderId, name, email);

    return NextResponse.json({ invoice_url: data.invoice_url, order_id: orderId });
  } catch (err) {
    return NextResponse.json({ error: "Server error creating invoice." }, { status: 500 });
  }
}
