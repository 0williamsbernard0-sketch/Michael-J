"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(false);

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: check approval status (does NOT verify password).
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't sign in. Try again.");
        setLoading(false);
        return;
      }

      if (data.status === "pending") {
        setPending(true);
        setLoading(false);
        return;
      }

      // Step 2: status === "approved" — now do the real password check.
      const supabase = getSupabaseBrowser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
  setError(signInError.message);
  setLoading(false);
  return;
}

      login(data.name);
      router.push("/");
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
          <h1 className="font-display text-3xl mb-2">Welcome Back</h1>
          <p className="text-sm text-[#B8B2A2] mb-8">
            Sign in to your MBJ Society account.
          </p>

          {pending ? (
            <div className="rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 p-5 text-center">
              <p className="text-sm">
                MBJ team is processing your dashboard and should be available soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-[#E0716B]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition disabled:opacity-60"
              >
                {loading ? "Checking…" : "Sign In"}
              </button>
            </form>
          )}

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
