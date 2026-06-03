"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";
import type { ViewKey } from "@/types";
import { AppShell } from "@/components/AppShell";
import { LandingPageView } from "@/views/LandingPageView";
import { LoginView } from "@/views/LoginView";

function PublicShell({ currentView, setCurrentView }: { currentView: ViewKey; setCurrentView: (view: ViewKey) => void }) {
  if (currentView === "landing") {
    return <LandingPageView onLogin={() => setCurrentView("login")} />;
  }

  return <LoginView onBackToLanding={() => setCurrentView("landing")} />;
}

function AppGateContent() {
  const { session, loading } = useAuth();
  const { loading: appLoading } = useApp();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<ViewKey>("landing");

  useEffect(() => {
    if (session) {
      const viewParam = searchParams.get("view");
      if (viewParam === "clients" || viewParam === "kanban" || viewParam === "documents" || viewParam === "dashboard") {
        setCurrentView(viewParam);
        return;
      }
      setCurrentView((prev) => (prev === "landing" || prev === "login" ? "dashboard" : prev));
    } else {
      setCurrentView((prev) => (prev === "dashboard" || prev === "clients" || prev === "kanban" || prev === "documents" ? "login" : prev));
    }
  }, [session, searchParams]);

  if (loading || appLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-500">Carregando sessão...</div>;
  }

  const highlightTaskId = currentView === "kanban" ? searchParams.get("task") ?? undefined : undefined;
  const highlightDocId = currentView === "documents" ? searchParams.get("doc") ?? undefined : undefined;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      {session ? (
        <AppShell currentView={currentView} onViewChange={setCurrentView} highlightTaskId={highlightTaskId} highlightDocId={highlightDocId} />
      ) : (
        <PublicShell currentView={currentView} setCurrentView={setCurrentView} />
      )}
    </div>
  );
}

function AppGate() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-500">Carregando...</div>}>
      <AppGateContent />
    </Suspense>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppGate />
      </AppProvider>
    </AuthProvider>
  );
}
