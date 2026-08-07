"use client";
import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const ANNUAL_PRICE_USD = 100;

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Fill in your name, email, and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: create the real Supabase Auth user first.
      const supabase = getSupabaseBrowser();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Step 2: create the NOWPayments invoice via our API route.
      const res = await fetch("/api/nowpayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't start checkout. Try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.invoice_url;
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-32 pb-20 px-5 flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl mb-2">Join the Society</h1>
          <p className="text-sm text-[#B8B2A2] mb-6">
            One plan, billed once a year. Cancel or don&rsquo;t renew anytime.
          </p>

          <div className="rounded-lg border-2 border-[#C9A227] bg-[#C9A227]/10 p-5 mb-6 text-center">
            <div className="font-display text-3xl text-[#C9A227]">
              ${ANNUAL_PRICE_USD}
              <span className="text-sm font-body text-[#B8B2A2]"> / year</span>
            </div>
            <p className="text-xs text-[#B8B2A2] mt-1">
              No monthly option — annual membership only.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 text-xs text-[#B8B2A2] mb-6">
            <li>✓ All exclusive videos</li>
            <li>✓ Live session access</li>
            <li>✓ Community access</li>
            <li>✓ Fellowship application</li>
          </ul>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm"
                placeholder="At least 8 characters"
              />
            </div>
            {error && <p className="text-sm text-[#E0716B]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "Starting checkout…" : `Continue to Payment — $${ANNUAL_PRICE_USD}/year`}
            </button>
            <p className="text-[11px] text-[#B8B2A2] text-center">
              Paid via crypto through NOWPayments. You&rsquo;ll be redirected to
              complete payment securely.
            </p>
          </form>

          <p className="text-sm text-[#B8B2A2] mt-6 text-center">
            Already a member?{" "}
            <Link href="/login" className="text-[#C9A227]">
              Sign in →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
