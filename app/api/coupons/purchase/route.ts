import { NextRequest, NextResponse } from "next/server";
import { getRequestEmail } from "@/lib/auth-server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { MIN_COUPON_PURCHASE, USD_PER_COUPON } from "@/lib/coupon-constants";

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

export async function POST(req: NextRequest) {
  const email = await getRequestEmail(req);
  if (!email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { coupons } = (await req.json()) as { coupons: number };

    if (!coupons || coupons < MIN_COUPON_PURCHASE) {
      return NextResponse.json(
        { error: `Minimum purchase is ${MIN_COUPON_PURCHASE} coupons.` },
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
    const orderId = `mbj-coupons-${Date.now()}`;
    const usdAmount = coupons * USD_PER_COUPON;

    const res = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: usdAmount,
        price_currency: "usd",
        order_id: orderId,
        order_description: `MBJ Society — ${coupons} Coupons (${email})`,
        success_url: `${siteUrl}/coupons?purchase=success`,
        cancel_url: `${siteUrl}/coupons?purchase=cancelled`,
        ipn_callback_url: `${siteUrl}/api/coupons/webhook`,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      return NextResponse.json({ error: "Couldn't create invoice.", details }, { status: res.status });
    }

    const data = await res.json();

    const supabase = getSupabaseAdmin();
    const { error: insertError } = await supabase.from("coupon_purchases").insert({
      id: orderId,
      email,
      coupons,
      usd_amount: usdAmount,
      status: "waiting",
    });
    if (insertError) console.error("Failed to record coupon_purchases row:", insertError);

    return NextResponse.json({ invoice_url: data.invoice_url, order_id: orderId });
  } catch {
    return NextResponse.json({ error: "Server error creating invoice." }, { status: 500 });
  }
}
