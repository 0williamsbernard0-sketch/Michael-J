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
      <section className="relative pt-28 sm:pt-32 pb-20 px-5 sm:px-10 overflow-hidden min-h-[680px] flex items-end">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mbj-hero.jpeg"
            alt="MBJ"
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(18,21,26,0.97) 0%, rgba(18,21,26,0.88) 35%, rgba(18,21,26,0.35) 65%, rgba(18,21,26,0.05) 100%), linear-gradient(0deg, rgba(18,21,26,0.95) 0%, rgba(18,21,26,0.4) 40%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 70% 20%, rgba(201,162,39,0.14), transparent 55%)",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto w-full">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-[#1F6F6B] mb-5">
            Welcome to
          </p>
          <h1 className="font-display font-extrabold text-6xl sm:text-7xl leading-[0.98] mb-5">
            The MBJ
            <br />
            Society
          </h1>
          <p className="text-[#C9A227] italic font-display font-medium text-xl tracking-wide mb-4">
            Michael B. Jordan
          </p>
          <p className="text-[#B8B2A2] font-body text-xs uppercase tracking-[0.15em] mb-10 max-w-md">
            Actor · Producer · Mentor
            <br />
            <span className="normal-case tracking-normal text-sm block mt-2">
              Thank you for being part of the story.
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <WelcomeMessageButton />
            <Link
              href="/signup"
              className="flex items-center rounded-md border border-white/30 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider hover:border-[#C9A227] transition self-start backdrop-blur-sm"
            >
              Join the Society — $100/year
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="px-5 sm:px-10 py-12 border-y border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <Stat num="1.8M" label="Society Members" />
          <Stat num="340+" label="Exclusive Videos" />
          <Stat num="12" label="Live Sessions / Month" />
          <Stat num="560+" label="Fellowship Grants" />
        </div>
      </section>

      {/* ---------- EXCLUSIVE CONTENT ---------- */}
      <section className="px-5 sm:px-10 py-16 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[#B8B2A2] mb-2">
              Members Only
            </p>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl">Exclusive Content</h2>
          </div>
          <Link href="/videos" className="text-[#C9A227] text-xs font-semibold uppercase tracking-wider">
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
      <section className="px-5 sm:px-10 py-16 max-w-5xl mx-auto grid sm:grid-cols-2 gap-8">
        <div className="rounded-lg border border-white/10 p-8 bg-[#161A20]">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C9A227] mb-2">
            Included
          </p>
          <h3 className="font-display font-semibold text-2xl mb-6">Membership Benefits</h3>
          <ul className="space-y-3.5 mb-8">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="text-[#1F6F6B] mt-0.5">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block text-center w-full rounded-md bg-[#C9A227] text-[#12151A] font-semibold uppercase tracking-wider text-xs py-3.5 hover:brightness-110 transition"
          >
            Join — $100/year
          </Link>
        </div>

        <div className="rounded-lg border border-white/10 p-8 bg-[#161A20]">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C9A227] mb-2">
            Member Status
          </p>
          <h3 className="font-display font-semibold text-2xl mb-6">Your Perks</h3>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Perk main="MEMBER DISCOUNT" sub="On appearances" />
            <Perk main="EARLY ACCESS" sub="New releases" />
            <Perk main="LIVE ACCESS" sub="All sessions" />
            <Perk main="MONTHLY" sub="Community spotlight" />
          </div>
          <Link
            href="/signup"
            className="block text-center w-full rounded-md border border-white/20 py-3.5 text-xs font-semibold uppercase tracking-wider hover:border-[#C9A227] transition"
          >
            Get Access
          </Link>
        </div>
      </section>

      {/* ---------- FELLOWSHIP TEASER ---------- */}
      <section className="px-5 sm:px-10 py-16 max-w-5xl mx-auto">
        <div className="rounded-lg border border-[#5C1B24]/50 bg-gradient-to-br from-[#1A1416] to-[#161A20] p-8 sm:p-10">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-[#1F6F6B] mb-4">
            Giving Back
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl mb-5">
            MBJ Signature Society Fellowship
          </h2>
          <p className="text-sm text-[#B8B2A2] max-w-2xl mb-8 leading-relaxed">
            Founded through MBJ&rsquo;s production company, the Fellowship
            provides paid internships, mentorship, and career pathways for
            underrepresented young people pursuing careers in media, film,
            arts, and entertainment. Members can also submit financial aid
            proposals directly.
          </p>
          <Link
            href="/fellowship"
            className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold uppercase tracking-wider text-xs px-6 py-3.5 hover:brightness-110 transition"
          >
            Learn More & Apply
          </Link>
        </div>
      </section>

      {/* ---------- FOUNDATION TEASER ---------- */}
      <section className="px-5 sm:px-10 py-16 max-w-5xl mx-auto">
        <div className="rounded-lg border border-[#C9A227]/40 bg-gradient-to-br from-[#1A1710] to-[#161A20] p-8 sm:p-10">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C9A227] mb-4">
            Giving Back
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl mb-5">
            Outlier Society Fellowship
          </h2>
          <p className="text-sm text-[#B8B2A2] max-w-2xl mb-8 leading-relaxed">
            A registered 501(c)(3) nonprofit founded by Michael B. Jordan,
            Outlier Society Fellowship works to elevate diverse voices,
            preserve authentic perspectives, and create opportunities for
            underrepresented communities through mentorship, access, and
            career development in media, arts, and entertainment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/foundation"
              className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold uppercase tracking-wider text-xs px-6 py-3.5 hover:brightness-110 transition"
            >
              Learn More
            </Link>
            <Link
              href="/foundation/donate"
              className="inline-block rounded-md border border-white/20 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider hover:border-[#C9A227] transition"
            >
              💛 Donate Now
            </Link>
          </div>
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
      className="flex items-center justify-center gap-2 rounded-md bg-[#C9A227] text-[#12151A] font-semibold uppercase tracking-wider text-xs px-7 py-3.5 hover:brightness-110 transition"
    >
      {!isMember && "🔒"} ▶ Watch Welcome Message
    </button>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#C9A227]">{num}</div>
      <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#B8B2A2] mt-2">
        {label}
      </div>
    </div>
  );
}

function Perk({ main, sub }: { main: string; sub: string }) {
  return (
    <div className="rounded-md border border-white/10 p-4 text-center">
      <div className="text-xs font-semibold uppercase tracking-wider">{main}</div>
      <div className="text-[11px] text-[#C9A227] mt-1">{sub}</div>
    </div>
  );
}
