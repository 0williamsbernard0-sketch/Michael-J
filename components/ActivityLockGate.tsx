"use client";
import { ReactNode } from "react";

export default function ActivityLockGate({
  children,
  title = "Unlocking Soon",
  description = "This unlocks automatically based on your activity on the platform. Check back soon.",
  minHeight = "min-h-[260px]",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  minHeight?: string;
}) {
  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-white/10 ${minHeight}`}>
      <div aria-hidden className="pointer-events-none select-none opacity-30 blur-[6px] h-full">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#0C0E12]/85">
        <div className="text-center px-6 max-w-xs">
          <div className="text-3xl mb-2">🔒</div>
          <p className="font-display text-xs sm:text-sm tracking-[0.15em] uppercase text-[#C9A227] font-semibold mb-2">
            {title}
          </p>
          <p className="text-xs text-[#B8B2A2] leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
