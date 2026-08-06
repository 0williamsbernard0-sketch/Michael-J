"use client";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LockGate({
  children,
  title = "Members Only",
  description, // accepted for backward-compat with existing call sites; not displayed
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
        <div className="text-center px-6">
          <svg
            className="mx-auto mb-3 h-7 w-7 text-[#C9A227]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <p className="font-display text-sm tracking-[0.15em] uppercase text-[#C9A227]">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
