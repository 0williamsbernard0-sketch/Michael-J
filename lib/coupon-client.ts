"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export interface CouponWallet {
  balance: number;
  membershipActive: boolean;
  unlockedContent: Set<string>;
  unlockedLivestreams: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
  unlockContent: (type: string, id: string) => Promise<{ ok: boolean; error?: string }>;
  unlockLivestream: (sessionId: string) => Promise<{ ok: boolean; error?: string }>;
}

async function getToken() {
  const supabase = getSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function useCouponWallet(): CouponWallet {
  const [balance, setBalance] = useState(0);
  const [membershipActive, setMembershipActive] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<Set<string>>(new Set());
  const [unlockedLivestreams, setUnlockedLivestreams] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/coupons/status", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance);
      setMembershipActive(data.membershipActive);
      setUnlockedContent(new Set(data.unlockedContent as string[]));
      setUnlockedLivestreams(new Set(data.unlockedLivestreams as string[]));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlockContent = async (type: string, id: string) => {
    const token = await getToken();
    if (!token) return { ok: false, error: "Not signed in." };
    const res = await fetch("/api/coupons/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kind: "content", contentType: type, contentId: id }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Couldn't unlock." };
    await refresh();
    return { ok: true };
  };

  const unlockLivestream = async (sessionId: string) => {
    const token = await getToken();
    if (!token) return { ok: false, error: "Not signed in." };
    const res = await fetch("/api/coupons/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kind: "livestream", sessionId }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Couldn't unlock." };
    await refresh();
    return { ok: true };
  };

  return { balance, membershipActive, unlockedContent, unlockedLivestreams, loading, refresh, unlockContent, unlockLivestream };
}
