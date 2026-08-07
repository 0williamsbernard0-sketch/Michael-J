"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import MessagesBell from "@/components/MessagesBell";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/videos", label: "Videos" },
  { href: "/photos", label: "Photos" },
  { href: "/livestreams", label: "Live Sessions" },
  { href: "/community", label: "Community" },
  { href: "/craft", label: "The Craft" },
  { href: "/events", label: "Events" },
  { href: "/fellowship", label: "Fellowship" },
  { href: "/foundation", label: "Foundation" },
  { href: "/merch", label: "Merch" },
  { href: "/coupons", label: "Coupons" },
  { href: "/messages", label: "Messages" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isMember, memberName, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-10 py-4 bg-[#12151A]/95 backdrop-blur border-b border-white/10">
        <Link href="/" className="font-display font-semibold tracking-[0.2em] text-lg sm:text-xl">
          MBJ <span className="text-[#C9A227]">SOCIETY</span>
        </Link>
        <div className="flex items-center gap-3">
          {isMember && <MessagesBell />}
          {isMember ? (
            <Link
              href="/account"
              className="rounded-full border border-[#1F6F6B] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              {memberName ?? "My Account"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[#C9A227] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              Login
            </Link>
          )}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2"
          >
            <span className="block h-[1.5px] w-6 bg-[#F1ECDF]" />
            <span className="block h-[1.5px] w-6 bg-[#F1ECDF]" />
            <span className="block h-[1.5px] w-6 bg-[#F1ECDF]" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-y-auto bg-[#0C0E12] flex flex-col px-8 pt-24">
          <button
            className="absolute top-5 right-5 text-2xl"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>

          <p className="font-body text-[11px] uppercase tracking-[0.35em] text-[#B8B2A2] mb-6">
            Menu
          </p>

          <ul className="flex flex-col">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.href} className="border-b border-white/10">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={
                    "flex items-baseline gap-4 py-4 font-display font-semibold text-2xl transition-colors " +
                    (pathname === item.href
                      ? "text-[#C9A227]"
                      : "text-[#F1ECDF] hover:text-[#C9A227]")
                  }
                >
                  <span className="font-body text-[11px] text-[#B8B2A2] tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-6 border-t border-white/10 pb-10">
            {isMember ? (
              <button
                onClick={async () => {
                  await logout();
                  setMenuOpen(false);
                }}
                className="text-xs uppercase tracking-wider text-[#B8B2A2] font-semibold"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="inline-block rounded-md bg-[#C9A227] text-[#12151A] font-semibold uppercase tracking-wider text-xs px-6 py-3.5"
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
