import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import Countdown from "@/components/Countdown";

// Set your next real live session date/time here (ISO string, local TZ aware).
const NEXT_SESSION = new Date("2026-08-20T19:00:00-04:00");

const PAST_STREAMS = [
  { title: "May Members Q&A", meta: "312 members watched", duration: "45:00" },
  { title: "Live from Set", meta: "April", duration: "38:00" },
  { title: "Fellowship Fundraiser", meta: "March", duration: "52:00" },
];

export default function LiveStreamsPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Live Sessions</h1>
        <p className="text-sm text-[#B8B2A2] mb-10">
          Catch MBJ live — Society members only.
        </p>

        <div className="rounded-lg border border-white/10 bg-[#161A20] p-8 text-center mb-14">
          <span className="inline-block rounded-full bg-[#5C1B24] text-[#F1ECDF] text-xs font-semibold px-3 py-1 mb-5">
            ● UPCOMING LIVE
          </span>
          <h2 className="font-display text-2xl mb-2">Society Members Q&A</h2>
          <p className="text-sm text-[#B8B2A2] mb-8">
            Next exclusive session — members-only access
          </p>
          <Countdown target={NEXT_SESSION} />
          <div className="mt-8">
            <LockGate title="Session Access" description="Join to reserve your spot.">
              <div className="py-3">Join Session</div>
            </LockGate>
          </div>
        </div>

        <h2 className="font-display text-xl mb-4">Past Sessions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PAST_STREAMS.map((s) => (
            <LockGate key={s.title} minHeight="min-h-[160px]">
              <div className="rounded-md border border-white/10 bg-[#1A1E24] p-3 h-full flex flex-col justify-between">
                <span className="text-[10px] font-mono text-[#B8B2A2]">{s.duration}</span>
                <div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="text-xs text-[#B8B2A2]">{s.meta}</p>
                </div>
              </div>
            </LockGate>
          ))}
        </div>
      </main>
    </div>
  );
}

