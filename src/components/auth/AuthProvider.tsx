import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession } from "../../lib/authStorage";
import { clearSession, getSession, setSession } from "../../lib/authStorage";

type AuthContextValue = {
  session: AuthSession | null;
  hydrated: boolean;
  login: (s: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      hydrated,
      login: (s) => {
        setSession(s);
        setSessionState(s);
      },
      logout: () => {
        clearSession();
        setSessionState(null);
      },
    };
  }, [session, hydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
