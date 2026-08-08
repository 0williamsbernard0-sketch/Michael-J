"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

const GALLERY_COUNT = 36;
const galleryImages = Array.from({ length: GALLERY_COUNT }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return `/images/fan-gallery/gallery-${num}.jpeg`;
});

export default function FanGalleryPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#12151A] text-[#F1ECDF] font-body">
      <Nav />
      <main className="pt-28 pb-20 px-5 sm:px-10 max-w-6xl mx-auto">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C9A227] mb-3">
          MBJ Society
        </p>
        <h1 className="font-display text-3xl sm:text-4xl mb-3">Fan Gallery</h1>
        <p className="text-sm text-[#B8B2A2] mb-10 max-w-xl">
          Welcome to the MBJ Society fan club / membership gallery — moments
          from meetups, premieres, and appearances with the community.
        </p>

        {/* ---------- HERO IMAGE ---------- */}
        <button
          onClick={() => setSelected("/images/fan-gallery/hero.jpeg")}
          className="block w-full rounded-lg overflow-hidden border border-white/10 mb-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/fan-gallery/hero.jpeg"
            alt="MBJ Society fan club"
            className="w-full h-auto object-cover"
          />
        </button>

        {/* ---------- GRID OF 36 ---------- */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {galleryImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setSelected(src)}
              className="aspect-square rounded-md overflow-hidden border border-white/10 hover:border-[#C9A227] transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Fan gallery photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </main>

      {/* ---------- LIGHTBOX ---------- */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-5"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-5 right-5 text-3xl text-white"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected}
            alt="Enlarged fan gallery photo"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
