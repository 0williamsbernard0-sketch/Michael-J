"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface MessageRow {
  id: string;
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
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase
      .from("messages")
      .select()
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, []);

  const openMessage = async (m: MessageRow) => {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.read) {
      const supabase = getSupabaseBrowser();
      await supabase.from("messages").update({ read: true }).eq("id", m.id);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
    }
  };

  if (loading) return <p className="text-sm text-[#B8B2A2]">Loading…</p>;
  if (messages.length === 0) return <p className="text-sm text-[#B8B2A2]">No messages yet.</p>;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="rounded-lg border border-white/10 bg-[#161A20] p-4">
          <button onClick={() => openMessage(m)} className="w-full text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!m.read && <span className="w-2 h-2 rounded-full bg-[#C9A227] shrink-0" />}
              <span className={`text-sm ${m.read ? "text-[#B8B2A2]" : "font-semibold"}`}>{m.subject}</span>
            </div>
            <span className="text-[10px] text-[#B8B2A2] shrink-0">
              {new Date(m.created_at).toLocaleDateString()}
            </span>
          </button>
          {openId === m.id && (
            <p className="text-sm text-[#B8B2A2] mt-3 pt-3 border-t border-white/10 whitespace-pre-wrap">
              {m.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
