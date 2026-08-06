import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";

const CATEGORIES = [
  {
    title: "🎬 On Set",
    items: [
      { title: "Rehearsal Room", sub: "Latest Production", duration: "18:40" },
      { title: "Table Read", sub: "Full Cast", duration: "24:10" },
      { title: "Wrap Day", sub: "Final Scene", duration: "12:05" },
    ],
  },
  {
    title: "🎤 Conversations",
    items: [
      { title: "Members Q&A", sub: "June Session", duration: "45:00" },
      { title: "On Craft", sub: "Building a Character", duration: "31:20" },
      { title: "Origins", sub: "How It Started", duration: "22:00" },
    ],
  },
];

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Videos</h1>
        <p className="text-sm text-[#B8B2A2] mb-10">
          Exclusive video content, for Society members.
        </p>

        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="mb-12">
            <h2 className="font-display text-xl mb-4">{cat.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cat.items.map((item) => (
                <LockGate key={item.title} minHeight="min-h-[180px]">
                  <div className="rounded-md border border-white/10 bg-[#1A1E24] p-3 h-full flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-[#B8B2A2]">
                      {item.duration}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="text-xs text-[#B8B2A2]">{item.sub}</p>
                    </div>
                  </div>
                </LockGate>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

