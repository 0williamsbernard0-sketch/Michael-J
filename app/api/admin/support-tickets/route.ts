import { NextRequest, NextResponse } from "next/server";
import { listTickets } from "@/lib/support-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isAuthorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-secret") === secret;
}

type FollowUp = {
  id: string;
  body: string;
  createdAt: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isNew: boolean;
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const tickets = await listTickets();
    const followUps: Record<string, FollowUp[]> = {};
    const unreadIds: string[] = [];

    if (tickets.length > 0) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("messages")
        .select("id, related_proposal_id, body, read, created_at, attachment_url, attachment_name")
        .eq("source", "support")
        .eq("sender", "user")
        .in("related_proposal_id", tickets.map((t) => t.id))
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load member follow-ups:", error);
      } else {
        const byId = new Map(tickets.map((t) => [t.id, t]));
        for (const m of data ?? []) {
          const t = byId.get(m.related_proposal_id);
          if (!t) continue;
          // Skip the mirrored copy of the original ticket message
          if ((m.body ?? "").trim() === (t.message ?? "").trim()) continue;
          (followUps[t.id] ??= []).push({
            id: m.id,
            body: m.body ?? "",
            createdAt: m.created_at,
            attachmentUrl: m.attachment_url ?? null,
            attachmentName: m.attachment_name ?? null,
            isNew: m.read === false,
          });
          if (m.read === false) unreadIds.push(m.id);
        }

        if (unreadIds.length > 0) {
          await supabase.from("messages").update({ read: true }).in("id", unreadIds);
        }
      }
    }

    return NextResponse.json({
      tickets: tickets.map((t) => ({ ...t, followUps: followUps[t.id] ?? [] })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error loading tickets." }, { status: 500 });
  }
}
