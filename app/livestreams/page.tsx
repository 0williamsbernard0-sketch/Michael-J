"use client";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import CouponGate from "@/components/CouponGate";
import Countdown from "@/components/Countdown";
import { useCouponWallet } from "@/lib/coupon-client";
import { useAuth } from "@/lib/auth-context";

const NEXT_SESSION = new Date("2026-08-24T19:00:00-04:00");
const NEXT_SESSION_ID = "session-2026-08-24"; // must match the row you inserted in livestream_sessions

const PAST_STREAMS = [
  { id: "may-qa", title: "May Members Q&A", meta: "312 members watched", duration: "45:00" },
  { id: "live-from-set-april", title: "Live from Set", meta: "April", duration: "38:00" },
  { id: "fellowship-fundraiser-march", title: "Fellowship Fundraiser", meta: "March", duration: "52:00" },
];

export default function LiveStreamsPage() {
  const { isMember } = useAuth();
  const wallet = useCouponWallet();
  const joined = wallet.unlockedLivestreams.has(NEXT_SESSION_ID);

  const handleJoin = async () => {
    const result = await wallet.unlockLivestream(NEXT_SESSION_ID);
    if (!result.ok) alert(result.error ?? "Couldn't join session.");
  };

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Live Sessions</h1>
        <p className="text-sm text-[#B8B2A2] mb-2">Catch MBJ live — Society members only.</p>
        {isMember && (
          <p className="text-xs text-[#C9A227] mb-8">
            Coupon balance: {wallet.balance} — <a href="/coupons" className="underline">buy more</a>
          </p>
        )}

        <div className="rounded-lg border border-white/10 bg-[#161A20] p-8 text-center mb-14">
          <span className="inline-block rounded-full bg-[#5C1B24] text-[#F1ECDF] text-xs font-semibold px-3 py-1 mb-5">
            ● UPCOMING LIVE
          </span>
          <h2 className="font-display text-2xl mb-2">Society Members Q&A</h2>
          <p className="text-sm text-[#B8B2A2] mb-8">Next exclusive session — members-only access</p>
          <Countdown target={NEXT_SESSION} />
          <div className="mt-8">
            <LockGate title="Session Access" description="Join to reserve your spot.">
              {joined ? (
                <div className="py-3 text-[#7BC96F] text-sm font-semibold">✓ You&rsquo;re in — see you live</div>
              ) : (
                <button
                  onClick={handleJoin}
                  className="w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition"
                >
                  Join Session — 50 coupons
                </button>
              )}
            </LockGate>
          </div>
        </div>

        <h2 className="font-display text-xl mb-4">Past Sessions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PAST_STREAMS.map((s) => (
            <LockGate key={s.id} minHeight="min-h-[160px]">
              <CouponGate contentType="video" contentId={s.id} wallet={wallet} minHeight="min-h-[160px]">
                <div className="rounded-md border border-white/10 bg-[#1A1E24] p-3 h-full flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-[#B8B2A2]">{s.duration}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{s.title}</h3>
                    <p className="text-xs text-[#B8B2A2]">{s.meta}</p>
                  </div>
                </div>
              </CouponGate>
            </LockGate>
          ))}
        </div>
      </main>
    </div>
  );
}
