"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/videos", label: "Videos" },
  { href: "/photos", label: "Photos" },
  { href: "/livestreams", label: "Live Sessions" },
  { href: "/community", label: "Community" },
  { href: "/craft", label: "The Craft" },
  { href: "/events", label: "Events" },
  { href: "/fellowship", label: "Fellowship" },
  { href: "/merch", label: "Merch" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isMember, memberName, logout } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-10 py-4 backdrop-blur-md bg-[#12151A]/85 border-b border-white/5">
        <Link href="/" className="font-display tracking-[0.15em] text-lg sm:text-xl">
          MBJ <span className="text-[#C9A227]">SOCIETY</span>
        </Link>
        <div className="flex items-center gap-3">
          {isMember ? (
            <Link
              href="/account"
              className="rounded-full border border-[#1F6F6B] px-4 py-1.5 text-sm font-medium text-[#1F6F6B] hover:bg-[#1F6F6B] hover:text-[#12151A] transition-colors hidden sm:inline-block"
            >
              {memberName ?? "My Account"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[#C9A227] px-4 py-1.5 text-sm font-medium text-[#C9A227] hover:bg-[#C9A227] hover:text-[#12151A] transition-colors"
            >
              Login
            </Link>
          )}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2"
          >
            <span className="block h-[2px] w-6 bg-[#F1ECDF]" />
            <span className="block h-[2px] w-6 bg-[#F1ECDF]" />
            <span className="block h-[2px] w-6 bg-[#F1ECDF]" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="fixed inset-0 z-50 bg-[#0C0E12]/98 flex flex-col px-8 pt-24">
          <button
            className="absolute top-5 right-5 text-2xl"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          <ul className="flex flex-col gap-6 font-display text-2xl">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={
                    pathname === item.href
                      ? "text-[#C9A227]"
                      : "hover:text-[#C9A227] transition-colors"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 pt-6 border-t border-white/10">
            {isMember ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-sm text-[#B8B2A2]"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold px-5 py-3 text-sm"
              >
                Join — $100/year
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

