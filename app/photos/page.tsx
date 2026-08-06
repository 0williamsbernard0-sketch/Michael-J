import Nav from "@/components/Nav";
import LockGate from "@/components/LockGate";

const ALBUMS = [
  { title: "Set Life", count: "38 Photos" },
  { title: "Premieres", count: "22 Photos" },
  { title: "Travel", count: "29 Photos" },
  { title: "Fellowship Events", count: "24 Photos" },
  { title: "Behind the Scenes", count: "41 Photos" },
  { title: "Personal Moments", count: "17 Photos" },
];

export default function PhotosPage() {
  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Photos</h1>
        <p className="text-sm text-[#B8B2A2] mb-10">
          Private galleries for Society members.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALBUMS.map((a) => (
            <LockGate key={a.title} minHeight="min-h-[160px]">
              <div className="rounded-md border border-white/10 bg-[#1A1E24] h-full flex flex-col justify-end p-3">
                <h3 className="text-sm font-semibold">{a.title}</h3>
                <p className="text-xs text-[#B8B2A2]">{a.count}</p>
              </div>
            </LockGate>
          ))}
        </div>
      </main>
    </div>
  );
}

