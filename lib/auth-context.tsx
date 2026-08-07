"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Real auth session, backed by Supabase Auth.
 *
 * isMember here means "has a valid Supabase session AND their signup
 * has been approved" — approval status is checked separately (see
 * app/api/auth/login/route.ts and app/account/page.tsx), since a
 * logged-in Supabase user might still be pending or rejected.
 *
 * This provider only tracks the Supabase session itself. The approval
 * gate on login (pending/rejected) is enforced by the login API route
 * before this context's login() is ever called — so if isMember is
 * true here, the user has already cleared that check once.
 */
interface AuthState {
  isMember: boolean;
  memberName: string | null;
  memberEmail: string | null;
  loading: boolean;
  login: (name: string, email: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setMemberName((data.session?.user.user_metadata?.name as string) ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setMemberName((newSession?.user.user_metadata?.name as string) ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Called after app/login/page.tsx has already confirmed approval
  // status via /api/auth/login. By this point Supabase's own
  // signInWithPassword() has already set the real session — this
  // just updates the display name shown in Nav/Account immediately
  // without waiting for the next getSession() tick.
  const login = (name: string) => {
    setMemberName(name);
  };

  const logout = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setSession(null);
    setMemberName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isMember: !!session,
        memberName,
        memberEmail: session?.user.email ?? null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
