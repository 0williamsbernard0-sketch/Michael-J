"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { uploadAdminAttachment } from "@/lib/admin-attachment-upload";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
  reply: string | null;
  repliedAt: string | null;
  isMember: boolean;
  replyAttachmentUrl?: string | null;
  replyAttachmentName?: string | null;
}

interface DirectMessage {
  id: string;
  name: string | null;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

export default function AdminSupportPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyFiles, setReplyFiles] = useState<Record<string, File | null>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  // Direct-message-by-email composer (no ticket required)
  const [directOpen, setDirectOpen] = useState(false);
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directSubject, setDirectSubject] = useState("");
  const [directMessage, setDirectMessage] = useState("");
  const [directFile, setDirectFile] = useState<File | null>(null);
  const [directStatus, setDirectStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [directError, setDirectError] = useState<string | null>(null);
  const [directHistory, setDirectHistory] = useState<DirectMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const fetchTickets = async (secretValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support-tickets", {
        headers: { "x-admin-secret": secretValue },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't load tickets.");
        setUnlocked(false);
        sessionStorage.removeItem("mbj_admin_secret");
        return;
      }
      setTickets(data.tickets);
      setUnlocked(true);
      sessionStorage.setItem("mbj_admin_secret", secretValue);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectHistory = async (secretValue: string) => {
    try {
      const res = await fetch("/api/admin/direct-message", {
        headers: { "x-admin-secret": secretValue },
      });
      const data = await res.json();
      if (res.ok) {
        setDirectHistory(data.messages);
      }
    } finally {
      setHistoryLoaded(true);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("mbj_admin_secret");
    if (saved) {
      setSecret(saved);
      fetchTickets(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets(secret);
  };

  const handleStatusChange = async (id: string, status: "open" | "resolved") => {
    setActioningId(id);
    try {
      const res = await fetch("/api/admin/support-tickets/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      }
    } finally {
      setActioningId(null);
    }
  };

  const handleSendReply = async (id: string) => {
    const reply = replyDrafts[id]?.trim();
    if (!reply) return;
    setSendingReplyId(id);
    try {
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;
      const file = replyFiles[id];
      if (file) {
        const uploaded = await uploadAdminAttachment(file, `support/${id}`, secret);
        attachmentUrl = uploaded.attachmentUrl;
        attachmentName = uploaded.attachmentName;
      }

      const res = await fetch("/api/admin/support-tickets/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, reply, attachmentUrl, attachmentName }),
      });
      const data = await res.json();
      if (res.ok) {
        setTickets((prev) => prev.map((t) => (t.id === id ? data.ticket : t)));
        setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
        setReplyFiles((prev) => ({ ...prev, [id]: null }));
      } else {
        setError(data.error ?? "Couldn't send reply.");
      }
    } catch {
      setError("Couldn't send reply.");
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim() || !directSubject.trim() || !directMessage.trim()) {
      setDirectError("Email, subject, and message are all required.");
      return;
    }
    setDirectStatus("sending");
    setDirectError(null);
    try {
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;
      if (directFile) {
        const uploaded = await uploadAdminAttachment(directFile, "direct", secret);
        attachmentUrl = uploaded.attachmentUrl;
        attachmentName = uploaded.attachmentName;
      }

      const res = await fetch("/api/admin/direct-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          name: directName.trim() || undefined,
          email: directEmail.trim(),
          subject: directSubject.trim(),
          message: directMessage.trim(),
          attachmentUrl,
          attachmentName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDirectError(data.error ?? "Couldn't send message.");
        setDirectStatus("error");
        return;
      }
      setDirectStatus("sent");
      setDirectHistory((prev) => [data.message, ...prev]);
      setDirectName("");
      setDirectEmail("");
      setDirectSubject("");
      setDirectMessage("");
      setDirectFile(null);
    } catch {
      setDirectError("Network error — please try again.");
      setDirectStatus("error");
    }
  };

  const toggleDirectPanel = () => {
    const next = !directOpen;
    setDirectOpen(next);
    if (next && !historyLoaded) {
      fetchDirectHistory(secret);
    }
  };

  const priorMessagesToEmail = directEmail.trim()
    ? directHistory.filter((m) => m.email.toLowerCase() === directEmail.trim().toLowerCase())
    : [];

  const visibleTickets = tickets.filter((t) => filter === "all" || t.status === filter);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
        <Nav />
        <main className="pt-32 pb-20 px-5 flex justify-center">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl mb-2">Admin Access</h1>
            <p className="text-sm text-[#B8B2A2] mb-6">
              Enter the admin key to view support tickets.
            </p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Admin key"
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
              />
              {error && <p className="text-sm text-[#E0716B]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition disabled:opacity-60"
              >
                {loading ? "Checking…" : "Enter"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-6 mb-8 border-b border-white/10">
          <Link
            href="/admin"
            className="text-sm text-[#B8B2A2] hover:text-[#C9A227] pb-3 transition"
          >
            Signups
          </Link>
          <Link
            href="/admin/proposals"
            className="text-sm text-[#B8B2A2] hover:text-[#C9A227] pb-3 transition"
          >
            Fellowship Proposals
          </Link>
          <span className="text-sm font-semibold pb-3 border-b-2 border-[#C9A227] text-[#C9A227]">
            Support Tickets
          </span>
        </div>

        {/* Direct message composer — for emailing anyone (e.g. incomplete
            signups) who hasn't submitted a support ticket */}
        <div className="rounded-lg border border-white/10 bg-[#161A20] p-5 mb-8">
          <button
            onClick={toggleDirectPanel}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h2 className="font-display text-lg">Message Someone Directly</h2>
              <p className="text-xs text-[#B8B2A2] mt-0.5">
                Email anyone by address — no ticket needed. Useful for reaching people who
                started signing up but never finished.
              </p>
            </div>
            <span className="text-xs text-[#B8B2A2] shrink-0 ml-4">{directOpen ? "Hide" : "Open"}</span>
          </button>

          {directOpen && (
            <>
              <form onSubmit={handleSendDirect} className="space-y-3 mt-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#B8B2A2] mb-1.5">Name (optional)</label>
                    <input
                      type="text"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      className="w-full rounded-md bg-[#0C0E12] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                      placeholder="Their name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8B2A2] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      className="w-full rounded-md bg-[#0C0E12] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                      placeholder="them@example.com"
                    />
                  </div>
                </div>

                {priorMessagesToEmail.length > 0 && (
                  <p className="text-xs text-[#C9A227]">
                    You've already messaged this address {priorMessagesToEmail.length}{" "}
                    time{priorMessagesToEmail.length > 1 ? "s" : ""} before — see history below.
                  </p>
                )}

                <div>
                  <label className="block text-xs text-[#B8B2A2] mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={directSubject}
                    onChange={(e) => setDirectSubject(e.target.value)}
                    className="w-full rounded-md bg-[#0C0E12] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8B2A2] mb-1.5">Message</label>
                  <textarea
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-[#0C0E12] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] resize-none"
                    placeholder="Write your message…"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8B2A2] mb-1.5">Attachment (optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setDirectFile(e.target.files?.[0] ?? null)}
                      className="text-xs text-[#B8B2A2] flex-1"
                    />
                    {directFile && (
                      <button
                        type="button"
                        onClick={() => setDirectFile(null)}
                        className="text-xs text-[#E0716B]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {directError && <p className="text-sm text-[#E0716B]">{directError}</p>}
                {directStatus === "sent" && (
                  <p className="text-sm text-[#1F6F6B]">Sent.</p>
                )}

                <button
                  type="submit"
                  disabled={directStatus === "sending"}
                  className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-2.5 text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-60"
                >
                  {directStatus === "sending" ? "Sending…" : "Send Email"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-[#B8B2A2] mb-3">
                  Sent History
                </p>
                {directHistory.length === 0 ? (
                  <p className="text-xs text-[#B8B2A2]">No direct messages sent yet.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {directHistory.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-md border border-white/10 bg-[#0C0E12] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold truncate">{m.subject}</p>
                          <p className="text-[10px] text-[#B8B2A2] shrink-0">
                            {new Date(m.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-[10px] text-[#B8B2A2] mt-0.5">
                          {m.name ? `${m.name} · ` : ""}
                          {m.email}
                        </p>
                        <p className="text-xs mt-1.5 whitespace-pre-wrap leading-relaxed line-clamp-3">
                          {m.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-3xl">Support Tickets</h1>
          <button
            onClick={() => fetchTickets(secret)}
            className="text-xs text-[#B8B2A2] hover:text-[#C9A227] transition"
          >
            Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-8">
          {(["open", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border transition " +
                (filter === f
                  ? "border-[#C9A227] text-[#C9A227]"
                  : "border-white/15 text-[#B8B2A2] hover:border-white/30")
              }
            >
              {f}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-[#E0716B] mb-4">{error}</p>}

        {visibleTickets.length === 0 ? (
          <p className="text-sm text-[#B8B2A2]">No {filter !== "all" ? filter : ""} tickets right now.</p>
        ) : (
          <div className="space-y-3">
            {visibleTickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-white/10 bg-[#161A20] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{t.subject}</p>
                      {t.isMember ? (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#C9A227]/50 text-[#C9A227]">
                          Member
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 text-[#B8B2A2]">
                          Not a Member
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#B8B2A2] mt-0.5">
                      {t.name} · {t.email}
                    </p>
                    <p className="text-[10px] text-[#B8B2A2] mt-1">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={
                      "text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 " +
                      (t.status === "open"
                        ? "border-[#C9A227]/50 text-[#C9A227]"
                        : "border-[#1F6F6B]/50 text-[#1F6F6B]")
                    }
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-sm text-[#F1ECDF] mb-4 whitespace-pre-wrap leading-relaxed">
                  {t.message}
                </p>

                {t.reply && (
                  <div className="rounded-md border border-[#1F6F6B]/40 bg-[#12151A] p-3 mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#1F6F6B] mb-1">
                      Your Reply · {t.repliedAt ? new Date(t.repliedAt).toLocaleString() : ""}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{t.reply}</p>
                    {t.replyAttachmentUrl && (
                      <a
                        href={t.replyAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-xs text-[#C9A227] underline"
                      >
                        📎 {t.replyAttachmentName ?? "View attachment"}
                      </a>
                    )}
                  </div>
                )}

                {!t.isMember && (
                  <p className="text-[10px] text-[#B8B2A2] italic mb-3">
                    Not an approved member — reply will be sent by email only, no site login for them to view it in.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <button
                    onClick={() =>
                      handleStatusChange(t.id, t.status === "open" ? "resolved" : "open")
                    }
                    disabled={actioningId === t.id}
                    className="rounded-md border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:border-[#C9A227] transition disabled:opacity-60"
                  >
                    {t.status === "open" ? "Mark Resolved" : "Reopen"}
                  </button>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={replyDrafts[t.id] ?? ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    rows={3}
                    placeholder={t.reply ? "Send a follow-up reply…" : "Write a reply…"}
                    className="w-full rounded-md bg-[#0C0E12] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) =>
                        setReplyFiles((prev) => ({ ...prev, [t.id]: e.target.files?.[0] ?? null }))
                      }
                      className="text-xs text-[#B8B2A2] flex-1"
                    />
                    {replyFiles[t.id] && (
                      <button
                        onClick={() => setReplyFiles((prev) => ({ ...prev, [t.id]: null }))}
                        className="text-xs text-[#E0716B]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleSendReply(t.id)}
                    disabled={sendingReplyId === t.id || !replyDrafts[t.id]?.trim()}
                    className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-4 py-2 text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                  >
                    {sendingReplyId === t.id ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
