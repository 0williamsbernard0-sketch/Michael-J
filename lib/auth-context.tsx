"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * ⚠️ PLACEHOLDER AUTH — for UI/demo purposes only.
 *
 * This stores membership status in localStorage so the locked/unlocked
 * states in this scaffold are visible and testable. It is NOT secure and
 * does not verify anything server-side.
 *
 * To make this real:
 *  1. Replace this with Supabase Auth (you're already using Supabase
 *     elsewhere) — use supabase.auth.getSession() / onAuthStateChange().
 *  2. Store membership/subscription status in a `members` table keyed by
 *     user id, updated by your NOWPayments IPN webhook when a payment
 *     confirms (see app/api/nowpayments/webhook/route.ts).
 *  3. Re-check membership status server-side (e.g. in a layout or
 *     middleware) for any route serving real locked content — never trust
 *     a client-only flag to gate content that actually matters.
 */

interface AuthState {
  isMember: boolean;
  memberName: string | null;
  memberEmail: string | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "marvics_demo_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isMember, setIsMember] = useState(false);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setIsMember(true);
        setMemberName(parsed.name);
        setMemberEmail(parsed.email);
      } catch {
        // ignore bad stored value
      }
    }
  }, []);

  const login = (name: string, email: string) => {
    setIsMember(true);
    setMemberName(name);
    setMemberEmail(email);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email }));
    }
  };

  const logout = () => {
    setIsMember(false);
    setMemberName(null);
    setMemberEmail(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isMember, memberName, memberEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

