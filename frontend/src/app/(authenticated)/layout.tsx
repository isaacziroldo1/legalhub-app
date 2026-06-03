"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RouteProviders } from "@/components/RouteProviders";
import { AppShell } from "@/components/AppShell";
import type { ViewKey } from "@/types";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigateToAppView = (view: ViewKey) => {
    if (view === "dashboard" || view === "clients" || view === "kanban" || view === "documents") {
      router.push(`/?view=${view}`);
    }
  };

  return (
    <RouteProviders>
      <div className="min-h-screen bg-zinc-100 text-zinc-900">
        <AppShell currentView="clients" onViewChange={navigateToAppView} onReturnHome={() => router.push("/?view=dashboard")} mainContent={children} />
      </div>
    </RouteProviders>
  );
}
