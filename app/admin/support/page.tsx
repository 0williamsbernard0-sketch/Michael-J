"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
}

export default function AdminSupportPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");

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
        return;
      }
      setTickets(data.tickets);
      setUnlocked(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const visibleTickets = tickets.filter((t) => filter === "all" || t.status === filter);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
        <Nav />
        <main className="pt-32 pb-20 px-5 flex justify-center">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl mb-2">Admin Access</h1>
            <p className="text-sm text-[#B8B2A2] mb-6">
              Enter the passcode to view support tickets.
            </p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={secret}
                onChange={(e) => setSecret(e.target.value.replace(/\D/g, ""))}
                placeholder="4-digit passcode"
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227] tracking-[0.5em] text-center"
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-3xl">Support Tickets</h1>
          <Link href="/admin-panel" className="text-xs text-[#B8B2A2] hover:text-[#C9A227] transition">
            ← Pending Signups
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex gap-2">
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
          <button
            onClick={() => fetchTickets(secret)}
            className="text-xs text-[#B8B2A2] hover:text-[#C9A227] transition ml-auto"
          >
            Refresh
          </button>
        </div>

        {visibleTickets.length === 0 ? (
          <p className="text-sm text-[#B8B2A2]">No {filter !== "all" ? filter : ""} tickets right now.</p>
        ) : (
          <div className="space-y-3">
            {visibleTickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-white/10 bg-[#161A20] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold">{t.subject}</p>
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
