"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function MessagesBell() {
  const { isMember } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isMember) return;
    const supabase = getSupabaseBrowser();

    const fetchCount = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      setUnreadCount(count ?? 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [isMember]);

  if (!isMember) return null;

  return (
    <Link href="/messages" className="relative inline-flex items-center">
      <span className="text-lg">✉️</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#C9A227] text-[#12151A] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
