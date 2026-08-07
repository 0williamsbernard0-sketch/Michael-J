import { NextRequest, NextResponse } from "next/server";
import { getRequestEmail } from "@/lib/auth-server";
import { getWalletStatus } from "@/lib/coupon-store";

export async function GET(req: NextRequest) {
  const email = await getRequestEmail(req);
  if (!email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json(await getWalletStatus(email));
}
