"use client";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import CouponGate from "@/components/CouponGate";
import { useCouponWallet } from "@/lib/coupon-client";
import { useAuth } from "@/lib/auth-context";

const PROGRAMS = [
  { id: "building-a-character", icon: "🎭", title: "Building a Character", desc: "A 6-part breakdown of MBJ's process, from script to screen.", level: "All Levels" },
  { id: "on-camera-technique", icon: "🎬", title: "On-Camera Technique", desc: "Practical exercises for screen presence and timing.", level: "Intermediate" },
  { id: "voice-and-delivery", icon: "🗣️", title: "Voice & Delivery", desc: "Vocal control, dialects, and command of a scene.", level: "Intermediate" },
  { id: "audition-to-set", icon: "🌟", title: "From Audition to Set", desc: "What actually happens between casting and your first day filming.", level: "All Levels" },
];

export default function CraftPage() {
  const { isMember } = useAuth();
  const wallet = useCouponWallet();

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">The Craft</h1>
        <p className="text-sm text-[#B8B2A2] mb-2 max-w-xl">
          Masterclasses and workshops from MBJ on the work of acting.
        </p>
        {isMember && (
          <p className="text-xs text-[#C9A227] mb-8">
            Coupon balance: {wallet.balance} — <a href="/coupons" className="underline">buy more</a>
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {PROGRAMS.map((p) => (
            <LockGate key={p.id} minHeight="min-h-[160px]">
              <CouponGate contentType="craft" contentId={p.id} wallet={wallet} minHeight="min-h-[160px]">
                <div className="rounded-lg border border-white/10 bg-[#161A20] p-5 h-full">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-[#B8B2A2] mb-3">{p.desc}</p>
                  <span className="text-[10px] tracking-wide text-[#1F6F6B] border border-[#1F6F6B] rounded-full px-2 py-0.5">
                    {p.level}
                  </span>
                </div>
              </CouponGate>
            </LockGate>
          ))}
        </div>
      </main>
    </div>
  );
}
