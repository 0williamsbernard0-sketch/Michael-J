"use client";

import { ReactNode } from "react";
import { CouponWallet } from "@/lib/coupon-client";
import { UNLOCK_COST } from "@/lib/coupon-constants";

export default function CouponGate({
  contentType,
  contentId,
  wallet,
  children,
  minHeight = "min-h-[180px]",
}: {
  contentType: string;
  contentId: string;
  wallet: CouponWallet;
  children: ReactNode;
  minHeight?: string;
}) {
  const key = `${contentType}:${contentId}`;
  const unlocked = wallet.unlockedContent.has(key);

  if (wallet.loading) {
    return <div className={`rounded-md border border-white/10 bg-[#1A1E24] animate-pulse ${minHeight}`} />;
  }

  if (unlocked) return <>{children}</>;

  const handleUnlock = async () => {
    const result = await wallet.unlockContent(contentType, contentId);
    if (!result.ok) alert(result.error ?? "Couldn't unlock.");
  };

  return (
    <button
      onClick={handleUnlock}
      className={`group relative w-full text-left rounded-md overflow-hidden border border-white/10 ${minHeight}`}
    >
      <div aria-hidden className="pointer-events-none select-none opacity-30 blur-[6px] h-full">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#0C0E12]/85 group-hover:bg-[#0C0E12]/75 transition-colors">
        <div className="text-center px-4">
          <div className="text-2xl mb-1">🪙</div>
          <p className="text-xs font-semibold text-[#C9A227]">Unlock — {UNLOCK_COST} coupons</p>
          <p className="text-[10px] text-[#B8B2A2] mt-1">Balance: {wallet.balance}</p>
        </div>
      </div>
    </button>
  );
}
