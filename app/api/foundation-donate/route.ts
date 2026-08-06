import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a NOWPayments invoice for a one-off foundation donation.
 *
 * Unlike app/api/nowpayments/route.ts (fixed $100 membership) and
 * app/api/merch-checkout/route.ts (cart with server-trusted prices),
 * this route accepts a donor-chosen amount — donations don't have a
 * fixed price list to validate against, so we just sanity-check bounds.
 *
 * Env vars required (same as the other NOWPayments routes):
 *   NOWPAYMENTS_API_KEY — from your NOWPayments dashboard
 *   NEXT_PUBLIC_SITE_URL — e.g. https://mbjsociety.com
 */
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const MIN_DONATION = 1;
const MAX_DONATION = 50000; // sanity ceiling — adjust as needed

export async function POST(req: NextRequest) {
  try {
    const { amount, name, email, message } = (await req.json()) as {
      amount: number;
      name: string;
      email: string;
      message?: string;
    };

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount < MIN_DONATION || donationAmount > MAX_DONATION) {
      return NextResponse.json(
        { error: `Enter an amount between $${MIN_DONATION} and $${MAX_DONATION}.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Set NOWPAYMENTS_API_KEY." },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderId = `outlier-donation-${Date.now()}`;

    const res = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: donationAmount,
        price_currency: "usd",
        order_id: orderId,
        order_description: `Outlier Society Fellowship — Donation from ${name} (${email})`,
        success_url: `${siteUrl}/foundation?donation=success`,
        cancel_url: `${siteUrl}/foundation/donate?donation=cancelled`,
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

    // TODO: once you're off the in-memory admin-store and on Supabase,
    // persist { orderId, name, email, amount, message, status: "pending" }
    // to a `donations` table here so you have a record independent of
    // NOWPayments, and so the webhook can mark it "paid" on confirmation.

    return NextResponse.json({ invoice_url: data.invoice_url, order_id: orderId });
  } catch (err) {
    return NextResponse.json({ error: "Server error creating donation." }, { status: 500 });
  }
}
