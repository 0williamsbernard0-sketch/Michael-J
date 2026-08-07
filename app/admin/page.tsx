"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

interface SignupRecord {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  awaiting_payment: "text-[#B8B2A2] border-white/20",
  waiting: "text-[#B8B2A2] border-white/20",
  confirming: "text-[#C9A227] border-[#C9A227]/40",
  partially_paid: "text-[#E0A83B] border-[#E0A83B]/40",
  pending_approval: "text-[#7BC96F] border-[#7BC96F]/40",
  failed: "text-[#E0716B] border-[#E0716B]/40",
  expired: "text-[#E0716B] border-[#E0716B]/40",
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [signups, setSignups] = useState<SignupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchSignups = async (secretValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pending-signups", {
        headers: { "x-admin-secret": secretValue },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't load signups.");
        setUnlocked(false);
        return;
      }
      setSignups(data.signups);
      setUnlocked(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSignups(secret);
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActioningId(id);
    try {
      const res = await fetch("/api/admin/update-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setSignups((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setActioningId(null);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
        <Nav />
        <main className="pt-32 pb-20 px-5 flex justify-center">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl mb-2">Admin Access</h1>
            <p className="text-sm text-[#B8B2A2] mb-6">
              Enter the admin key to review pending signups.
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Pending Signups</h1>
          <button
            onClick={() => fetchSignups(secret)}
            className="text-xs text-[#B8B2A2] hover:text-[#C9A227] transition"
          >
            Refresh
          </button>
        </div>

        {signups.length === 0 ? (
          <p className="text-sm text-[#B8B2A2]">No signups waiting on approval right now.</p>
        ) : (
          <div className="space-y-3">
            {signups.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-white/10 bg-[#161A20] p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <span
                      className={`text-[10px] uppercase tracking-wide border rounded px-1.5 py-0.5 ${
                        statusStyles[s.status] ?? "text-[#B8B2A2] border-white/20"
                      }`}
                    >
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8B2A2]">{s.email}</p>
                  <p className="text-[10px] text-[#B8B2A2] mt-1">
                    Started {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(s.id, "approve")}
                    disabled={actioningId === s.id}
                    className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-4 py-2 text-xs hover:brightness-110 transition disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(s.id, "reject")}
                    disabled={actioningId === s.id}
                    className="rounded-md border border-white/20 px-4 py-2 text-xs hover:border-[#E0716B] hover:text-[#E0716B] transition disabled:opacity-60"
                  >
                    Reject
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
