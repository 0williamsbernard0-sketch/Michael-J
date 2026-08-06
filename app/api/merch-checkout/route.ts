import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a NOWPayments invoice for a merch store cart.
 *
 * Unlike app/api/nowpayments/route.ts (fixed $100 membership price),
 * this route accepts a cart of items and computes the total server-side
 * from a trusted price list — never trust the price sent by the client.
 *
 * Env vars required (same as the membership route):
 *   NOWPAYMENTS_API_KEY   — from your NOWPayments dashboard
 *   NEXT_PUBLIC_SITE_URL  — e.g. https://mbjsociety.com
 */

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

// Server-side source of truth for prices — keep in sync with
// app/merch/page.tsx. Do not trust prices sent from the client.
const PRICES: Record<string, number> = {
  "tee-classic": 35,
  "hoodie-society": 68,
  "cap-crest": 28,
  "mug-signature": 18,
  "tote-canvas": 22,
  "pin-set": 15,
};

interface CartItem {
  id: string;
  name: string;
  qty: number;
}

export async function POST(req: NextRequest) {
  try {
    const { email, items } = (await req.json()) as { email: string; items: CartItem[] };

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    let total = 0;
    const lineDescriptions: string[] = [];
    for (const item of items) {
      const unitPrice = PRICES[item.id];
      if (unitPrice === undefined || !item.qty || item.qty < 1) {
        return NextResponse.json({ error: `Invalid item: ${item.id}` }, { status: 400 });
      }
      total += unitPrice * item.qty;
      lineDescriptions.push(`${item.qty}x ${item.name}`);
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Set NOWPAYMENTS_API_KEY." },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderId = `mbj-merch-${Date.now()}`;

    const res = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: total,
        price_currency: "usd",
        order_id: orderId,
        order_description: `MBJ Merch — ${lineDescriptions.join(", ")} (${email})`,
        success_url: `${siteUrl}/merch?order=success`,
        cancel_url: `${siteUrl}/merch?order=cancelled`,
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

    // TODO: store { orderId, email, items, total, status: "pending" } in
    // your DB (e.g. a `merch_orders` Supabase table) so the NOWPayments
    // webhook can mark it fulfilled and you know what to ship.

    return NextResponse.json({ invoice_url: data.invoice_url, order_id: orderId, total });
  } catch (err) {
    return NextResponse.json({ error: "Server error creating order." }, { status: 500 });
  }
}

