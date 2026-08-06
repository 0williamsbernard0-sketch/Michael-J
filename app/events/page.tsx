import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";

const EVENTS = [
  { month: "SEP", day: "06", title: "Fellowship Fundraiser Gala", location: "Lagos, Nigeria" },
  { month: "OCT", day: "18", title: "Society Fan Meet-Up", location: "Lagos, Nigeria" },
  { month: "NOV", day: "02", title: "On the Craft — Live Workshop", location: "Virtual" },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Events</h1>
        <p className="text-sm text-[#B8B2A2] mb-10">
          Members get priority access to every appearance.
        </p>

        <div className="space-y-4">
          {EVENTS.map((e) => (
            <div
              key={e.title}
              className="rounded-lg border border-white/10 bg-[#161A20] p-5 flex gap-5 items-center"
            >
              <div className="text-center shrink-0 w-14">
                <div className="text-[10px] tracking-widest text-[#C9A227]">{e.month}</div>
                <div className="font-display text-2xl">{e.day}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{e.title}</h3>
                <p className="text-xs text-[#B8B2A2]">📍 {e.location}</p>
              </div>
              <LockGate
                title="RSVP"
                description="Ticket details are for members."
                minHeight="min-h-[70px]"
              >
                <span className="text-xs rounded-full border border-white/20 px-3 py-1.5">
                  Details
                </span>
              </LockGate>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

