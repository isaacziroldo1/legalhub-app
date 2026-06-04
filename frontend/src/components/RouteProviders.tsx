"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/useAuth";

export function RouteProviders({ children }: { children: ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
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
