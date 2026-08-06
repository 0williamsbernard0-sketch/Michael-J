"use client";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLockModal } from "@/lib/lock-modal-context";

export default function LockGate({
  children,
  title = "Members Only",
  description,
  minHeight = "min-h-[260px]",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  minHeight?: string;
}) {
  const { isMember } = useAuth();
  const { openModal } = useLockModal();

  if (isMember) return <>{children}</>;

  return (
    <button
      onClick={openModal}
      className={`group relative w-full text-left rounded-lg overflow-hidden border border-white/10 ${minHeight}`}
    >
      <div aria-hidden className="pointer-events-none select-none opacity-30 blur-[6px] h-full">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#0C0E12]/80 group-hover:bg-[#0C0E12]/70 transition-colors">
        <div className="text-center px-6">
          <div className="text-3xl mb-2">🔒</div>
          <p className="font-display text-xs sm:text-sm tracking-[0.15em] uppercase text-[#C9A227] font-semibold">
            {title === "Members Only" ? "Members Only" : title}
          </p>
        </div>
      </div>
    </button>
  );
}
