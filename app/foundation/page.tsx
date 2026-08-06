import Nav from "@/components/Nav";

export default function FoundationPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-3xl mx-auto">
        <p className="font-mono text-xs tracking-[0.3em] text-[#C9A227] mb-3">GIVING BACK</p>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">MBJ Foundation</h1>
        <div className="font-display text-3xl text-[#C9A227] mb-6">$1.5M+ Raised</div>
        <p className="text-sm text-[#B8B2A2] leading-relaxed max-w-xl">
          Full foundation page content coming soon.
        </p>
      </main>
    </div>
  );
}
