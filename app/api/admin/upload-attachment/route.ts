import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-secret") === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "admin";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const path = `${folder}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("message-attachments")
      .upload(path, Buffer.from(arrayBuffer), { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 30);

    if (signError || !signed) {
      return NextResponse.json({ error: "Couldn't create signed URL." }, { status: 500 });
    }

    return NextResponse.json({
      attachmentUrl: signed.signedUrl,
      attachmentName: file.name,
    });
  } catch (err) {
    console.error("Admin attachment upload failed:", err);
    return NextResponse.json({ error: "Server error uploading file." }, { status: 500 });
  }
}
