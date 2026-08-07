"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import { useCouponWallet } from "@/lib/coupon-client";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { MIN_COUPON_PURCHASE } from "@/lib/coupon-constants";

const PRESETS = [200, 300, 500, 1000];

export default function CouponsPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl mb-8">Coupons</h1>
        <LockGate title="Sign in required" description="Log in to buy coupons.">
          <Wallet />
        </LockGate>
      </main>
    </div>
  );
}

function Wallet() {
  const wallet = useCouponWallet();
  const [amount, setAmount] = useState(MIN_COUPON_PURCHASE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setError(null);
    if (amount < MIN_COUPON_PURCHASE) {
      setError(`Minimum purchase is ${MIN_COUPON_PURCHASE} coupons.`);
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("Please sign in again.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/coupons/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coupons: amount }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Couldn't start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = resData.invoice_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#161A20] p-6 space-y-6">
      <div>
        <p className="text-xs text-[#B8B2A2]">Current balance</p>
        <p className="text-3xl font-display text-[#C9A227]">
          {wallet.loading ? "…" : wallet.balance} coupons
        </p>
        {!wallet.loading && !wallet.membershipActive && (
          <p className="text-[11px] text-[#E0716B] mt-1">
            Your membership isn&rsquo;t active — coupons can&rsquo;t be spent until you renew.
          </p>
        )}
      </div>

      <div className="text-xs text-[#B8B2A2] space-y-1">
        <p>• Unlock any photo, video, or craft item — 10 coupons</p>
        <p>• Join a live session — 50 coupons</p>
        <p>• 100 coupons = $100 · minimum purchase {MIN_COUPON_PURCHASE} coupons</p>
      </div>

      <div>
        <label className="block text-xs text-[#B8B2A2] mb-1.5">Coupons to buy</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`rounded-md border px-4 py-2 text-xs font-semibold transition ${
                amount === p ? "border-[#C9A227] text-[#C9A227]" : "border-white/20 text-[#B8B2A2]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={MIN_COUPON_PURCHASE}
          step={100}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-md bg-[#12151A] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
        />
        <p className="text-[11px] text-[#B8B2A2] mt-1">${amount} USD</p>
      </div>

      {error && <p className="text-sm text-[#E0716B]">{error}</p>}

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition disabled:opacity-60"
      >
        {loading ? "Starting checkout…" : `Buy ${amount} Coupons — $${amount}`}
      </button>
    </div>
  );
}
