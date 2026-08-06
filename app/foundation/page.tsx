import Link from "next/link";
import Nav from "@/components/Nav";

const IMPACT_AREAS = [
  {
    icon: "🎬",
    title: "Mentorship & Career Development",
    desc: "Connecting emerging creatives with working professionals across media, film, and television.",
  },
  {
    icon: "🎓",
    title: "Access to Media & Arts Education",
    desc: "Funding training, tools, and opportunities that are otherwise out of reach for underrepresented creatives.",
  },
  {
    icon: "🌟",
    title: "Emerging Creative Grants",
    desc: "Direct financial support for individuals pursuing careers in arts and entertainment.",
  },
  {
    icon: "🎙️",
    title: "Preserving Authentic Voices",
    desc: "Programs designed to elevate diverse perspectives and keep them from being flattened or lost.",
  },
];

export default function FoundationPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-3xl mx-auto">
        <p className="font-mono text-xs tracking-[0.3em] text-[#C9A227] mb-3">GIVING BACK</p>
        <h1 className="font-display text-3xl sm:text-4xl mb-8">
          Outlier Society Fellowship
        </h1>

        {/* ---------- MISSION ---------- */}
        <section className="mb-10">
          <h2 className="font-display text-xl text-[#C9A227] mb-3">Mission Statement</h2>
          <p className="text-sm text-[#B8B2A2] leading-relaxed">
            Outlier Society Fellowship works to elevate diverse voices, preserve
            authentic perspectives, and create opportunities for underrepresented
            communities through mentorship, access, and career development in
            media, arts, and entertainment.
          </p>
        </section>

        {/* ---------- ABOUT ---------- */}
        <section className="mb-10 rounded-lg border border-white/10 bg-[#161A20] p-6">
          <h2 className="font-display text-xl text-[#C9A227] mb-3">About the Foundation</h2>
          <p className="text-sm text-[#B8B2A2] leading-relaxed mb-4">
            Outlier Society Fellowship is a registered 501(c)(3) nonprofit
            organization founded by Michael B. Jordan. The fellowship is
            dedicated to creating pathways for emerging creatives through
            mentorship, professional development, and career opportunities
            across media, arts, film, television, and entertainment.
          </p>
          <p className="text-xs text-[#B8B2A2] font-mono">EIN: 84-3504520</p>
        </section>

        {/* ---------- MAILING ADDRESS ---------- */}
        <section className="mb-12 rounded-lg border border-white/10 bg-[#161A20] p-6">
          <h2 className="font-display text-xl text-[#C9A227] mb-3">Public Mailing Address</h2>
          <address className="text-sm text-[#B8B2A2] not-italic leading-relaxed">
            Outlier Society Fellowship
            <br />
            700 E Grinnell Dr
            <br />
            Burbank, CA 91501
            <br />
            United States
          </address>
        </section>

        {/* ---------- DONATE CTA ---------- */}
        <section className="mb-14 rounded-lg border border-[#C9A227]/40 bg-gradient-to-br from-[#1A1710] to-[#161A20] p-8 text-center">
          <p className="text-sm text-[#B8B2A2] mb-5 max-w-md mx-auto">
            Every contribution goes directly toward mentorship, access, and
            career opportunities for the next generation of creatives.
          </p>
          <Link
            href="/foundation/donate"
            className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-8 py-3.5 text-sm hover:brightness-110 transition"
          >
            💛 Donate Now
          </Link>
        </section>

        {/* ---------- WHERE YOUR DONATION GOES ---------- */}
        <section>
          <h2 className="font-display text-xl text-[#C9A227] mb-6 text-center tracking-wide">
            WHERE YOUR DONATION GOES
          </h2>
          <div className="space-y-4">
            {IMPACT_AREAS.map((area) => (
              <div
                key={area.title}
                className="rounded-lg border border-white/10 bg-[#161A20] p-5 flex gap-4"
              >
                <span className="text-2xl shrink-0">{area.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{area.title}</h3>
                  <p className="text-xs text-[#B8B2A2] leading-relaxed">{area.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
