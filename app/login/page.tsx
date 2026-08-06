"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    // ============================================================
    // REPLACE WITH REAL AUTH — e.g.:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) { setError(error.message); return; }
    // Then check the user's membership/subscription status before
    // redirecting to a members-only page.
    // ============================================================
    login(email.split("@")[0], email);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-32 pb-20 px-5 flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl mb-2">Welcome Back</h1>
          <p className="text-sm text-[#B8B2A2] mb-8">
            Sign in to your MBJ Society account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B2A2] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-[#161A20] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#C9A227]"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-[#E0716B]">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition"
            >
              Sign In
            </button>
          </form>

          <p className="text-sm text-[#B8B2A2] mt-6 text-center">
            Not a member yet?{" "}
            <Link href="/signup" className="text-[#C9A227]">
              Join for $100/year →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

