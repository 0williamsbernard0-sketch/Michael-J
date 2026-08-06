"use client";

import { useState } from "react";
import Link from "next/link";

const PRESET_AMOUNTS = [30, 50, 200, 250, 500];

const STATS = [
  { num: "$2M+", label: "Raised to Date" },
  { num: "15K+", label: "Youth Served" },
  { num: "50+", label: "Partner Schools" },
  { num: "12", label: "U.S. Cities" },
];

export default function FoundationDonatePage() {
  const [amount, setAmount] = useState<number | null>(200);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const selectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleDonate = async () => {
    setError(null);

    if (!finalAmount || finalAmount < 1) {
      setError("Choose or enter a donation amount.");
      return;
    }
    if (!name || !email) {
      setError("Enter your name and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/foundation-donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't start checkout. Try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.invoice_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-10 py-4 bg-[#12151A]/95 backdrop-blur border-b border-white/10">
        <span className="font-display tracking-[0.15em] text-lg">
          MBJ <span className="text-[#C9A227]">SOCIETY</span>
        </span>
        <Link href="/foundation" className="text-sm text-[#C9A227] flex items-center gap-2">
          ← Back to Foundation
        </Link>
      </header>

      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-2xl mx-auto">
        {/* ---------- IMPACT STATS ---------- */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-white/10 bg-[#161A20] p-6 text-center"
            >
              <div className="font-display text-3xl text-[#C9A227] mb-1">{s.num}</div>
              <div className="text-[11px] tracking-widest text-[#B8B2A2]">
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* ---------- DONATION FORM ---------- */}
        <div className="rounded-lg border border-white/10 bg-[#161A20] p-6 sm:p-8">
          <p className="text-xs tracking-[0.2em] text-[#C9A227] mb-4">SELECT AMOUNT (USD)</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => selectPreset(val)}
                className={`rounded-md border py-4 text-center font-display text-lg transition ${
                  amount === val && !customAmount
                    ? "border-[#C9A227] bg-[#C9A227]/10 text-[#C9A227]"
                    : "border-white/15 hover:border-white/30"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(null);
            }}
            placeholder="Or enter custom amount…"
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm mb-6"
          />

          <label className="block text-xs tracking-[0.2em] text-[#C9A227] mb-1.5">
            FULL NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm mb-5"
          />

          <label className="block text-xs tracking-[0.2em] text-[#C9A227] mb-1.5">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm mb-5"
          />

          <label className="block text-xs tracking-[0.2em] text-[#C9A227] mb-1.5">
            MESSAGE (OPTIONAL)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message of support…"
            rows={3}
            className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm mb-6"
          />

          {error && <p className="text-sm text-[#E0716B] mb-4">{error}</p>}

          <button
            onClick={handleDonate}
            disabled={loading}
            className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-4 text-sm hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Starting checkout…" : `💛 Donate $${finalAmount ?? 0} Now`}
          </button>

          <p className="text-[11px] text-[#B8B2A2] text-center mt-4 leading-relaxed">
            🔒 Secure payment via Bitcoin (BTC) through NOWPayments.
            <br />
            Confirmation sent to your email after payment.
          </p>
        </div>
      </main>
    </div>
  );
}
