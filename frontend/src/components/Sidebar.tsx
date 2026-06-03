"use client";

import { FileText, LayoutDashboard, Settings, Users, CalendarDays } from "lucide-react";
import type { ViewKey } from "@/types";

type Props = {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  onReturnHome: () => void;
};

const items: { view: ViewKey; label: string; icon: React.ReactNode }[] = [
  { view: "dashboard", label: "Painel Geral", icon: <LayoutDashboard size={18} /> },
  { view: "clients", label: "Clientes (CRM)", icon: <Users size={18} /> },
  { view: "kanban", label: "Prazos (Kanban)", icon: <CalendarDays size={18} /> },
  { view: "documents", label: "Documentos", icon: <FileText size={18} /> },
];

export function Sidebar({ currentView, onNavigate, onReturnHome }: Props) {
  return (
    <aside className="flex w-64 flex-col justify-between border-r border-zinc-900 bg-zinc-950 py-6 text-zinc-200">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-bold text-white">L</div>
          <span className="text-lg font-bold text-white">LegalHub</span>
        </div>
        <div className="border-t border-zinc-900" />
        <nav className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${currentView === item.view ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="px-4">
        <button onClick={onReturnHome} className="w-full rounded-lg border border-zinc-800 py-2 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-900 hover:text-white">
          ↩ Voltar para Home
        </button>
      </div>
    </aside>
  );
}
