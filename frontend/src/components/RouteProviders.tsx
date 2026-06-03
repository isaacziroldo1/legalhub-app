"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";
import { AppProvider } from "@/context/AppContext";

export function RouteProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <RouteGuard>{children}</RouteGuard>
      </AppProvider>
    </AuthProvider>
  );
}

function RouteGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/");
  }, [loading, router, session]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-500">Carregando sessão...</div>;
  }

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-500">Redirecionando...</div>;
  }

  return children;
}
