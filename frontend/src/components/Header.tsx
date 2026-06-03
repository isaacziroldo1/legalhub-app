"use client";

import { Bell, Plus, Search } from "lucide-react";
import type { ViewKey } from "@/types";
import { useAuth } from "@/auth/useAuth";

type Props = {
  currentView: ViewKey;
  onQuickAction: () => void;
};

export function Header({ currentView, onQuickAction }: Props) {
  const { user, logout } = useAuth();
  const quickLabel = currentView === "clients" ? "Novo Cliente" : currentView === "documents" ? "Upload" : "Nova Tarefa";

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8">
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5">
        <Search className="text-zinc-400" size={16} />
        <input type="text" placeholder="Buscar clientes, prazos..." className="w-full bg-transparent text-xs text-zinc-700 outline-none" />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-1.5 transition hover:bg-zinc-100" aria-label="Notificações críticas">
          <Bell size={18} className="text-zinc-600" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-red-500 text-[10px] font-bold text-white">3</span>
        </button>
        {user && (
          <div className="hidden flex-col items-end leading-tight md:flex">
            <span className="text-xs font-bold text-zinc-900">{user.name}</span>
            <span className="text-[10px] text-zinc-500">{user.email}</span>
          </div>
        )}
        <button onClick={() => void logout()} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50">
          Sair
        </button>
        <button onClick={onQuickAction} className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600">
          <Plus size={14} />
          <span>{quickLabel}</span>
        </button>
      </div>
    </header>
  );
}
