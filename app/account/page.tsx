"use client";

import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { memberName, memberEmail, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl mb-8">My Account</h1>

        <LockGate title="Sign in required" description="Log in to view your account.">
          <div className="rounded-lg border border-white/10 bg-[#161A20] p-6 space-y-6">
            <div>
              <p className="text-xs text-[#B8B2A2]">Name</p>
              <p className="text-sm">{memberName}</p>
            </div>
            <div>
              <p className="text-xs text-[#B8B2A2]">Email</p>
              <p className="text-sm">{memberEmail}</p>
            </div>
            <div>
              <p className="text-xs text-[#B8B2A2]">Plan</p>
              <p className="text-sm">MBJ Society — Annual — $100/year</p>
            </div>
            <button
              onClick={logout}
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm hover:border-[#C9A227] transition"
            >
              Sign out
            </button>
          </div>
        </LockGate>
      </main>
    </div>
  );
}

