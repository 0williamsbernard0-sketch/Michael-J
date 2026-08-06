"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LockGate({
  children,
  title = "Members Only",
  description = "This is exclusive to MBJ Society members.",
  minHeight = "min-h-[260px]",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  minHeight?: string;
}) {
  const { isMember } = useAuth();

  if (isMember) return <>{children}</>;

  return (
    <div className={`relative rounded-lg overflow-hidden border border-white/10 ${minHeight}`}>
      <div aria-hidden className="pointer-events-none select-none opacity-30 blur-[6px] h-full">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#0C0E12]/80">
        <div className="text-center px-6 py-8">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-display text-lg mb-2">{title}</h3>
          <p className="text-sm text-[#B8B2A2] mb-5 max-w-xs mx-auto">{description}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup"
              className="rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-2.5 text-sm hover:brightness-110 transition"
            >
              Join — $100/year
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm hover:border-[#C9A227] transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
