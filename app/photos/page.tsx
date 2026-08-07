"use client";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import CouponGate from "@/components/CouponGate";
import { useCouponWallet } from "@/lib/coupon-client";
import { useAuth } from "@/lib/auth-context";

const ALBUMS = [
  { id: "set-life", title: "Set Life", count: "38 Photos" },
  { id: "premieres", title: "Premieres", count: "22 Photos" },
  { id: "travel", title: "Travel", count: "29 Photos" },
  { id: "fellowship-events", title: "Fellowship Events", count: "24 Photos" },
  { id: "behind-the-scenes", title: "Behind the Scenes", count: "41 Photos" },
  { id: "personal-moments", title: "Personal Moments", count: "17 Photos" },
];

export default function PhotosPage() {
  const { isMember } = useAuth();
  const wallet = useCouponWallet();

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Photos</h1>
        <p className="text-sm text-[#B8B2A2] mb-2">Private galleries for Society members.</p>
        {isMember && (
          <p className="text-xs text-[#C9A227] mb-8">
            Coupon balance: {wallet.balance} — <a href="/coupons" className="underline">buy more</a>
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALBUMS.map((a) => (
            <LockGate key={a.id} minHeight="min-h-[160px]">
              <CouponGate contentType="photo" contentId={a.id} wallet={wallet} minHeight="min-h-[160px]">
                <div className="rounded-md border border-white/10 bg-[#1A1E24] h-full flex flex-col justify-end p-3">
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  <p className="text-xs text-[#B8B2A2]">{a.count}</p>
                </div>
              </CouponGate>
            </LockGate>
          ))}
        </div>
      </main>
    </div>
  );
}
