import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import ActivityLockGate from "@/components/ActivityLockGate";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Community</h1>
        <p className="text-sm text-[#B8B2A2] mb-10">
          Connect with fellow Society members.
        </p>

        <LockGate
          title="Join the Community"
          description="Discussions are open to MBJ Society members only."
          minHeight="min-h-[320px]"
        >
          <ActivityLockGate
            title="Unlocking Soon"
            description="Community access opens automatically as you stay active on the platform. The MBJ team reviews activity periodically — no action needed on your end."
            minHeight="min-h-[320px]"
          >
            <div className="rounded-lg border border-white/10 bg-[#161A20] p-6 space-y-5">
              <ForumPost initials="JM" name="JanelleM" text="Anyone catch the rehearsal footage?" meta="2 hrs ago · 42 replies" />
              <ForumPost initials="KL" name="KeithL" text="The Fellowship info session was incredible" meta="5 hrs ago · 19 replies" />
              <ForumPost initials="TS" name="TamaraS" text="Who's going to the fan meet-up?" meta="8 hrs ago · 61 replies" />
            </div>
          </ActivityLockGate>
        </LockGate>
      </main>
    </div>
  );
}

function ForumPost({ initials, name, text, meta }: { initials: string; name: string; text: string; meta: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-full bg-[#1F6F6B] flex items-center justify-center text-xs font-semibold shrink-0">
        {initials}
      </div>
      <div>
        <p className="text-sm">{text}</p>
        <p className="text-xs text-[#B8B2A2] mt-0.5">by {name} · {meta}</p>
      </div>
    </div>
  );
}
