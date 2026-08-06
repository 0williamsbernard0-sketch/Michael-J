"use client";
import Link from "next/link";
import { useLockModal } from "@/lib/lock-modal-context";
import { useAuth } from "@/lib/auth-context";

const BENEFITS = [
  { icon: "🎬", label: "340+ Exclusive Videos" },
  { icon: "📸", label: "Private Photo Galleries" },
  { icon: "📡", label: "All Live Streams" },
  { icon: "🤝", label: "Fellowship & Financial Aid Access" },
  { icon: "🎟️", label: "Priority Event Access" },
  { icon: "🎤", label: "Monthly Member Shoutouts" },
];

export default function MembersOnlyModal() {
  const { open, closeModal } = useLockModal();
  const { isMember } = useAuth();

  if (!open || isMember) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0C0E12]/95 backdrop-blur-sm flex items-start justify-center overflow-y-auto px-5 pt-24 pb-16">
      <div className="relative w-full max-w-md rounded-xl border border-[#C9A227]/30 bg-[#161A20] p-8 text-center">
        <button
          onClick={closeModal}
          aria-label="Close"
          className="absolute top-4 right-4 text-xl text-[#B8B2A2] hover:text-[#F1ECDF]"
        >
          ✕
        </button>

        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-display text-2xl mb-3">Members Only Content</h2>
        <p className="text-sm text-[#B8B2A2] mb-7 max-w-xs mx-auto">
          This content is exclusively for MBJ Society members. Join now to unlock everything.
        </p>

        <div className="flex flex-col gap-2.5 mb-7">
          {BENEFITS.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-3 rounded-md border border-white/10 bg-[#12151A] px-4 py-3 text-left"
            >
              <span className="text-lg">{b.icon}</span>
              <span className="text-sm">{b.label}</span>
            </div>
          ))}
        </div>

        <Link
          href="/signup"
          onClick={closeModal}
          className="block w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3.5 text-sm mb-3"
        >
          Join — $100/year
        </Link>
        <Link
          href="/login"
          onClick={closeModal}
          className="block w-full rounded-md border border-white/20 py-3.5 text-sm hover:border-[#C9A227] transition"
        >
          Already a Member? Login
        </Link>
      </div>
    </div>
  );
}
