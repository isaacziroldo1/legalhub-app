"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthCredentials, AuthState } from "@/types";
import { authRepository } from "@/auth/authRepository";

type AuthContextValue = AuthState & {
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });

  useEffect(() => {
    let mounted = true;

    authRepository.getSession().then((session) => {
      if (!mounted) return;

      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: AuthCredentials) => {
    const session = await authRepository.signIn(credentials);

    setState({
      user: session.user,
      session,
      loading: false,
    });
  };

  const logout = async () => {
    await authRepository.signOut();
    setState({ user: null, session: null, loading: false });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuthContext must be used within AuthProvider");

  return context;
}
