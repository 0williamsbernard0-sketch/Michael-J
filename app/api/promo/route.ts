import { NextRequest, NextResponse } from "next/server";
import { getPrice } from "@/lib/promo";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const r = getPrice(code);
    if (!r.valid || !r.code) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
    }
    return NextResponse.json({ code: r.code, price: r.price });
  } catch {
    return NextResponse.json({ error: "Could not check code." }, { status: 500 });
  }
}
