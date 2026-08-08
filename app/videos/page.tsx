"use client";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import CouponGate from "@/components/CouponGate";
import { useCouponWallet } from "@/lib/coupon-client";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = [
  {
    title: "🎬 On Set",
    items: [
      { id: "rehearsal-room", title: "Rehearsal Room", sub: "Latest Production", duration: "18:40" },
      { id: "table-read", title: "Table Read", sub: "Full Cast", duration: "24:10" },
      { id: "wrap-day", title: "Wrap Day", sub: "Final Scene", duration: "12:05" },
    ],
  },
  {
    title: "🎤 Conversations",
    items: [
      { id: "members-qa-june", title: "Members Q&A", sub: "June Session", duration: "45:00" },
      { id: "on-craft", title: "On Craft", sub: "Building a Character", duration: "31:20" },
      { id: "origins", title: "Origins", sub: "How It Started", duration: "22:00" },
    ],
  },
  {
    title: "💰 Fellowship Funding",
    items: [
      {
        id: "funding-disbursement-requirements",
        title: "Funding Disbursement Requirements & Future Funding Opportunities",
        sub: "What recipients need to know",
        duration: "7:00",
      },
    ],
  },
];

export default function VideosPage() {
  const { isMember } = useAuth();
  const wallet = useCouponWallet();

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Videos</h1>
        <p className="text-sm text-[#B8B2A2] mb-2">Exclusive video content, for Society members.</p>
        {isMember && (
          <p className="text-xs text-[#C9A227] mb-8">
            Coupon balance: {wallet.balance} — <a href="/coupons" className="underline">buy more</a>
          </p>
        )}

        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="mb-12">
            <h2 className="font-display text-xl mb-4">{cat.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cat.items.map((item) => (
                <LockGate key={item.id} minHeight="min-h-[180px]">
                  <CouponGate contentType="video" contentId={item.id} wallet={wallet} minHeight="min-h-[180px]">
                    <div className="rounded-md border border-white/10 bg-[#1A1E24] p-3 h-full flex flex-col justify-between">
                      <span className="text-[10px] font-mono text-[#B8B2A2]">{item.duration}</span>
                      <div>
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="text-xs text-[#B8B2A2]">{item.sub}</p>
                      </div>
                    </div>
                  </CouponGate>
                </LockGate>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
