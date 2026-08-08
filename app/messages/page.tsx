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
  attachment_url: string | null;
  attachment_name: string | null;
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
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("messages")
      .select()
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const threads = messages.reduce<Record<string, MessageRow[]>>((acc, m) => {
    if (!m.related_proposal_id) return acc;
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
    if (!reply.trim() && !file) return;
    setSending(true);
    try {
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;

      if (file) {
        setUploading(true);
        const supabase = getSupabaseBrowser();
        const path = `${proposalId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("message-attachments")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: signed } = await supabase.storage
          .from("message-attachments")
          .createSignedUrl(path, 60 * 60 * 24 * 30);
        attachmentUrl = signed?.signedUrl ?? null;
        attachmentName = file.name;
        setUploading(false);
      }

      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          body: reply.trim(),
          attachmentUrl,
          attachmentName,
        }),
      });
      if (res.ok) {
        setReply("");
        setFile(null);
        await load();
      } else {
        alert("Couldn't send — try again.");
      }
    } catch {
      alert("Couldn't send — try again.");
    } finally {
      setSending(false);
      setUploading(false);
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
                    {m.attachment_url && (
                      <a
                        href={m.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-xs text-[#C9A227] underline"
                      >
                        📎 {m.attachment_name ?? "View attachment"}
                      </a>
                    )}
                  </div>
                ))}

                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
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
                      {uploading ? "Uploading…" : sending ? "…" : "Send"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="text-xs text-[#B8B2A2] flex-1"
                    />
                    {file && (
                      <button
                        onClick={() => setFile(null)}
                        className="text-xs text-[#E0716B]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
