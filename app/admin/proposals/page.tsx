"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

interface Proposal {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  area: string | null;
  amountRequested: string | null;
  reason: string;
  status: "under_review" | "approved" | "rejected" | "needs_more_info";
  createdAt: string;
}

const STATUS_OPTIONS: Proposal["status"][] = [
  "under_review",
  "approved",
  "rejected",
  "needs_more_info",
];

const statusStyles: Record<string, string> = {
  under_review: "text-[#C9A227] border-[#C9A227]/40",
  approved: "text-[#7BC96F] border-[#7BC96F]/40",
  rejected: "text-[#E0716B] border-[#E0716B]/40",
  needs_more_info: "text-[#E0A83B] border-[#E0A83B]/40",
};

export default function AdminProposalsPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyStatus, setReplyStatus] = useState<Record<string, Proposal["status"]>>({});
  const [replySubject, setReplySubject] = useState<Record<string, string>>({});
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchProposals = async (secretValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/fellowship-proposals", {
        headers: { "x-admin-secret": secretValue },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't load proposals.");
        setUnlocked(false);
        return;
      }
      setProposals(data.proposals);
      setUnlocked(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProposals(secret);
  };

  const handleRespond = async (p: Proposal) => {
    const status = replyStatus[p.id] ?? p.status;
    const subject = replySubject[p.id]?.trim();
    const body = replyBody[p.id]?.trim();

    if (!subject || !body) {
      alert("Write a subject and message before sending.");
      return;
    }

    setSendingId(p.id);
    try {
      const res = await fetch("/api/admin/fellowship-proposals/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ id: p.id, email: p.email, status, subject, body }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: data.proposal.status } : x)));
        setOpenId(null);
        setReplySubject((s) => ({ ...s, [p.id]: "" }));
        setReplyBody((b) => ({ ...b, [p.id]: "" }));
      } else {
        alert("Couldn't send response.");
      }
    } finally {
      setSendingId(null);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
        <Nav />
        <main className="pt-32 pb-20 px-5 flex justify-center">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl mb-2">Admin Access</h1>
            <p className="text-sm text-[#B8B2A2] mb-6">Enter the admin key to review proposals.</p>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Fellowship Proposals</h1>
          <button
            onClick={() => fetchProposals(secret)}
            className="text-xs text-[#B8B2A2] hover:text-[#C9A227] transition"
          >
            Refresh
          </button>
        </div>

        {proposals.length === 0 ? (
          <p className="text-sm text-[#B8B2A2]">No proposals yet.</p>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/10 bg-[#161A20] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{p.fullName}</p>
                      <span
                        className={`text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 ${statusStyles[p.status]}`}
                      >
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-[#B8B2A2]">{p.email}</p>
                    {p.area && <p className="text-[11px] text-[#B8B2A2] mt-1">{p.area}{p.amountRequested ? ` · ${p.amountRequested}` : ""}</p>}
                    <p className="text-[10px] text-[#B8B2A2] mt-1">
                      Submitted {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setOpenId(openId === p.id ? null : p.id)}
                    className="text-xs text-[#C9A227] shrink-0"
                  >
                    {openId === p.id ? "Close" : "Review"}
                  </button>
                </div>

                {openId === p.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                    <p className="text-sm text-[#B8B2A2] whitespace-pre-wrap">{p.reason}</p>
                    {p.phone && <p className="text-xs text-[#B8B2A2]">Phone: {p.phone}</p>}

                    <div>
                      <label className="block text-xs text-[#B8B2A2] mb-1.5">Set status</label>
                      <select
                        value={replyStatus[p.id] ?? p.status}
                        onChange={(e) =>
                          setReplyStatus((s) => ({ ...s, [p.id]: e.target.value as Proposal["status"] }))
                        }
                        className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-2.5 text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#B8B2A2] mb-1.5">Message subject</label>
                      <input
                        type="text"
                        value={replySubject[p.id] ?? ""}
                        onChange={(e) => setReplySubject((s) => ({ ...s, [p.id]: e.target.value }))}
                        placeholder="Re: Your Fellowship proposal"
                        className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#B8B2A2] mb-1.5">Message to member</label>
                      <textarea
                        value={replyBody[p.id] ?? ""}
                        onChange={(e) => setReplyBody((b) => ({ ...b, [p.id]: e.target.value }))}
                        rows={4}
                        placeholder="Write your response…"
                        className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-2.5 text-sm resize-none"
                      />
                    </div>

                    <button
                      onClick={() => handleRespond(p)}
                      disabled={sendingId === p.id}
                      className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-2.5 text-sm hover:brightness-110 transition disabled:opacity-60"
                    >
                      {sendingId === p.id ? "Sending…" : "Send Response"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
