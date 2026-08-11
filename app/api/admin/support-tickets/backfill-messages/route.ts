import { NextRequest, NextResponse } from "next/server";
import { listTickets } from "@/lib/support-store";
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

  const supabase = getSupabaseAdmin();
  const tickets = await listTickets();

  const results: Array<{ ticketId: string; inserted: string[]; skipped: string[]; errors: string[] }> = [];

  for (const t of tickets) {
    if (!t.isMember) continue; // same rule as the live mirror — non-members can't view /messages anyway

    const entry = { ticketId: t.id, inserted: [] as string[], skipped: [] as string[], errors: [] as string[] };

    // What's already in messages for this ticket's thread?
    const { data: existing, error: fetchErr } = await supabase
      .from("messages")
      .select("sender")
      .eq("related_proposal_id", t.id)
      .eq("source", "support");

    if (fetchErr) {
      entry.errors.push(`fetch existing: ${fetchErr.message}`);
      results.push(entry);
      continue;
    }

    const hasUserMsg = (existing ?? []).some((m) => m.sender === "user");
    const hasAdminMsg = (existing ?? []).some((m) => m.sender === "admin");

    // Backfill the member's original message
    if (!hasUserMsg) {
      const { error } = await supabase.from("messages").insert({
        email: t.email,
        related_proposal_id: t.id,
        sender: "user",
        subject: `Support: ${t.subject}`,
        body: t.message,
        read: true,
        source: "support",
        created_at: t.createdAt,
      });
      if (error) entry.errors.push(`user msg: ${error.message}`);
      else entry.inserted.push("user");
    } else {
      entry.skipped.push("user");
    }

    // Backfill the admin's reply, if one exists
    if (t.reply && !hasAdminMsg) {
      const { error } = await supabase.from("messages").insert({
        email: t.email,
        related_proposal_id: t.id,
        sender: "admin",
        subject: `Support: ${t.subject}`,
        body: t.reply,
        read: false,
        source: "support",
        created_at: t.repliedAt ?? t.createdAt,
      });
      if (error) entry.errors.push(`admin msg: ${error.message}`);
      else entry.inserted.push("admin");
    } else if (t.reply) {
      entry.skipped.push("admin");
    }

    results.push(entry);
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}
