"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";
import { useAuth } from "@/lib/auth-context";
import { useLockModal } from "@/lib/lock-modal-context";

const EXCLUSIVE_CONTENT = [
  { badge: "NEW", duration: "18:40", title: "On the Boards", sub: "Rehearsal Room Footage" },
  { badge: "BTS", duration: "22:10", title: "Behind the Scenes", sub: "Set Life, Latest Production" },
  { badge: "LIFE", duration: "10:55", title: "Off Camera", sub: "A Day Away from the Set" },
  { badge: "LIVE", duration: "40:00", title: "Members Q&A", sub: "Live with MBJ" },
];

const BENEFITS = [
  "Exclusive Videos & Behind-the-Scenes Footage",
  "Live Sessions & Members Q&As",
  "Early Access to Appearances & Drops",
  "Priority Access to Live Events",
  "Members-Only Community",
  "The Craft — Acting Masterclasses",
  "Fellowship Proposal Access",
  "Direct Support for the Fellowship",
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />

      {/* ---------- HERO ---------- */}
      <section className="relative pt-28 sm:pt-32 pb-16 px-5 sm:px-10 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 70% 20%, rgba(201,162,39,0.14), transparent 55%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto grid sm:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#1F6F6B] mb-4">
              WELCOME TO
            </p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] mb-4">
              The MBJ
              <br />
              Society
            </h1>
            <p className="text-[#C9A227] italic font-display text-xl mb-4">MBJ</p>
            <p className="text-[#B8B2A2] text-sm sm:text-base mb-8 max-w-md">
              Actor · Producer · Mentor
              <br />
              Thank you for being part of the story.
            </p>
            <div className="flex flex-wrap gap-3">
              <WelcomeMessageButton />
              <Link
                href="/signup"
                className="rounded-md border border-white/20 px-5 py-3 text-sm hover:border-[#C9A227] transition self-start"
              >
                Join the Society — $100/year
              </Link>
            </div>
          </div>

          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mbj-hero.jpg" alt="MBJ" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, transparent 40%, rgba(18,21,26,0.85) 100%)",
              }}
            />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-white/10 py-6 text-center">
          <Stat num="1.8M" label="Society Members" />
          <Stat num="340+" label="Exclusive Videos" />
          <Stat num="12" label="Live Sessions / Month" />
          <Stat num="560+" label="Fellowship Grants" />
        </div>
      </section>

      {/* ---------- EXCLUSIVE CONTENT ---------- */}
      <section className="px-5 sm:px-10 py-14 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl">Exclusive Content</h2>
          <Link href="/videos" className="text-[#C9A227] text-sm">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {EXCLUSIVE_CONTENT.map((item) => (
            <LockGate key={item.title} minHeight="min-h-[180px]">
              <div className="rounded-md border border-white/10 bg-[#1A1E24] p-3 h-full flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-[#B8B2A2]">
                  <span>{item.badge}</span>
                  <span>{item.duration}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="text-xs text-[#B8B2A2]">{item.sub}</p>
                </div>
              </div>
            </LockGate>
          ))}
        </div>
      </section>

      {/* ---------- BENEFITS + PERKS ---------- */}
      <section className="px-5 sm:px-10 py-14 max-w-5xl mx-auto grid sm:grid-cols-2 gap-8">
        <div className="rounded-lg border border-white/10 p-6 bg-[#161A20]">
          <h3 className="font-display text-xl text-[#C9A227] mb-5">Membership Benefits</h3>
          <ul className="space-y-3 mb-6">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <span className="text-[#1F6F6B] mt-0.5">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block text-center w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold py-3 text-sm hover:brightness-110 transition"
          >
            Join — $100/year
          </Link>
        </div>

        <div className="rounded-lg border border-white/10 p-6 bg-[#161A20]">
          <h3 className="font-display text-xl text-[#C9A227] mb-5">Your Perks</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Perk main="MEMBER DISCOUNT" sub="On appearances" />
            <Perk main="EARLY ACCESS" sub="New releases" />
            <Perk main="LIVE ACCESS" sub="All sessions" />
            <Perk main="MONTHLY" sub="Community spotlight" />
          </div>
          <Link
            href="/signup"
            className="block text-center w-full rounded-md border border-white/20 py-3 text-sm hover:border-[#C9A227] transition"
          >
            Get Access
          </Link>
        </div>
      </section>

      {/* ---------- FELLOWSHIP TEASER ---------- */}
      <section className="px-5 sm:px-10 py-16 max-w-5xl mx-auto">
        <div className="rounded-lg border border-[#5C1B24]/50 bg-gradient-to-br from-[#1A1416] to-[#161A20] p-8">
          <p className="font-mono text-xs tracking-[0.3em] text-[#1F6F6B] mb-3">GIVING BACK</p>
          <h2 className="font-display text-2xl sm:text-3xl mb-4">
            MBJ Signature Society Fellowship
          </h2>
          <p className="text-sm text-[#B8B2A2] max-w-2xl mb-6 leading-relaxed">
            Founded through MBJ&rsquo;s production company, the Fellowship
            provides paid internships, mentorship, and career pathways for
            underrepresented young people pursuing careers in media, film,
            arts, and entertainment. Members can also submit financial aid
            proposals directly.
          </p>
          <Link
            href="/fellowship"
            className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-3 text-sm hover:brightness-110 transition"
          >
            Learn More & Apply
          </Link>
        </div>
      </section>

      {/* ---------- FOUNDATION TEASER ---------- */}
      <section className="px-5 sm:px-10 py-16 max-w-5xl mx-auto">
        <div className="rounded-lg border border-[#C9A227]/40 bg-gradient-to-br from-[#1A1710] to-[#161A20] p-8">
          <p className="font-mono text-xs tracking-[0.3em] text-[#C9A227] mb-3">GIVING BACK</p>
          <h2 className="font-display text-2xl sm:text-3xl mb-2">MBJ Foundation</h2>
          <div className="font-display text-3xl text-[#C9A227] mb-4">$1.5M+ Raised</div>
          <p className="text-sm text-[#B8B2A2] max-w-2xl mb-6 leading-relaxed">
            Every membership contributes directly to the MBJ Foundation and its
            ongoing community and youth empowerment initiatives.
          </p>
          <Link
            href="/foundation"
            className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-3 text-sm hover:brightness-110 transition"
          >
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
}

function WelcomeMessageButton() {
  const { isMember } = useAuth();
  const { openModal } = useLockModal();

  return (
    <button
      onClick={isMember ? undefined : openModal}
      className="flex items-center justify-center gap-2 rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-6 py-3 text-sm hover:brightness-110 transition"
    >
      {!isMember && "🔒"} ▶ Watch Welcome Message
    </button>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl sm:text-3xl text-[#C9A227]">{num}</div>
      <div className="text-[10px] sm:text-xs tracking-wide text-[#B8B2A2] mt-1">{label}</div>
    </div>
  );
}

function Perk({ main, sub }: { main: string; sub: string }) {
  return (
    <div className="rounded-md border border-white/10 p-4 text-center">
      <div className="text-xs font-semibold tracking-wide">{main}</div>
      <div className="text-[11px] text-[#C9A227] mt-1">{sub}</div>
    </div>
  );
}
