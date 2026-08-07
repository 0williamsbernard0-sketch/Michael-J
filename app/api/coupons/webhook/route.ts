import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { creditCoupons } from "@/lib/coupon-store";

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
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { order_id, payment_status } = payload;

  const supabase = getSupabaseAdmin();
  const { data: purchase, error: fetchError } = await supabase
    .from("coupon_purchases")
    .select()
    .eq("id", order_id)
    .maybeSingle();

  if (fetchError || !purchase) {
    console.error("Coupon webhook: no purchase row for", order_id);
    return NextResponse.json({ received: true });
  }

  // Already finished — don't double-credit on a duplicate/retry IPN.
  if (purchase.status === "finished") {
    return NextResponse.json({ received: true });
  }

  await supabase.from("coupon_purchases").update({ status: payment_status }).eq("id", order_id);

  if (payment_status === "finished") {
    await creditCoupons(purchase.email, purchase.coupons);
  }

  return NextResponse.json({ received: true });
}
