import { NextRequest, NextResponse } from "next/server";
import { getRequestEmail } from "@/lib/auth-server";
import { unlockContentItem, unlockLivestreamAccess } from "@/lib/coupon-store";

export async function POST(req: NextRequest) {
  const email = await getRequestEmail(req);
  if (!email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  if (body.kind === "content") {
    const { contentType, contentId } = body;
    if (!contentType || !contentId) {
      return NextResponse.json({ error: "contentType and contentId are required." }, { status: 400 });
    }
    const result = await unlockContentItem(email, contentType, contentId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ unlocked: true });
  }

  if (body.kind === "livestream") {
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }
    const result = await unlockLivestreamAccess(email, sessionId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ unlocked: true });
  }

  return NextResponse.json({ error: "Invalid kind." }, { status: 400 });
}
