"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface MessageRow {
  id: string;
  related_proposal_id: string;
  sender: "admin" | "user";
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl mb-8">Messages</h1>
        <LockGate title="Sign in required" description="Log in to view your messages.">
          <Inbox />
        </LockGate>
      </main>
    </div>
  );
}

function Inbox() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("messages")
      .select()
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const threads = messages.reduce<Record<string, MessageRow[]>>((acc, m) => {
    if (!m.related_proposal_id) return acc; // skip messages not tied to a proposal
    (acc[m.related_proposal_id] ??= []).push(m);
    return acc;
  }, {});

  const markRead = async (m: MessageRow) => {
    if (m.read) return;
    const supabase = getSupabaseBrowser();
    await supabase.from("messages").update({ read: true }).eq("id", m.id);
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
  };

  const sendReply = async (proposalId: string) => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, body: reply.trim() }),
      });
      if (res.ok) {
        setReply("");
        await load();
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-sm text-[#B8B2A2]">Loading…</p>;
  if (Object.keys(threads).length === 0) return <p className="text-sm text-[#B8B2A2]">No messages yet.</p>;

  return (
    <div className="space-y-3">
      {Object.entries(threads).map(([proposalId, thread]) => {
        const latest = thread[thread.length - 1];
        const isOpen = openThread === proposalId;
        const hasUnread = thread.some((m) => !m.read && m.sender === "admin");
        return (
          <div key={proposalId} className="rounded-lg border border-white/10 bg-[#161A20] p-4">
            <button
              onClick={() => {
                setOpenThread(isOpen ? null : proposalId);
                thread.forEach(markRead);
              }}
              className="w-full text-left flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                {hasUnread && <span className="w-2 h-2 rounded-full bg-[#C9A227] shrink-0" />}
                <span className={`text-sm ${hasUnread ? "font-semibold" : "text-[#B8B2A2]"}`}>
                  {thread[0].subject}
                </span>
              </div>
              <span className="text-[10px] text-[#B8B2A2] shrink-0">
                {new Date(latest.created_at).toLocaleDateString()}
              </span>
            </button>

            {isOpen && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                {thread.map((m) => (
                  <div
                    key={m.id}
                    className={`text-sm rounded-md p-3 whitespace-pre-wrap ${
                      m.sender === "admin"
                        ? "bg-[#12151A] text-[#F1ECDF]"
                        : "bg-[#1F6F6B]/20 text-[#F1ECDF] ml-6"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide text-[#B8B2A2] mb-1">
                      {m.sender === "admin" ? "MBJ Society" : "You"}
                    </p>
                    {m.body}
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    className="flex-1 rounded-md bg-[#12151A] border border-white/10 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                  />
                  <button
                    onClick={() => sendReply(proposalId)}
                    disabled={sending}
                    className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-4 py-2 text-xs disabled:opacity-60"
                  >
                    {sending ? "…" : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
