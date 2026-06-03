"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";

type Props = {
  clientId: string;
  activeSection: "prontuario" | "prazos" | "documentos";
  children: ReactNode;
};

export function ClientSectionLayout({ clientId, activeSection, children }: Props) {
  const { clients } = useApp();
  const client = clients.find((item) => item.id === clientId);

  if (!client) {
    return <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">Cliente não encontrado.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Clientes &gt; {client.name}</span>
          <h2 className="text-2xl font-extrabold text-zinc-950">{client.name}</h2>
          <span className="font-mono text-xs text-zinc-500">{client.cnpj}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: "prontuario", label: "Prontuário", href: `/clientes/${client.id}/prontuario` },
            { key: "prazos", label: "Prazos", href: `/clientes/${client.id}/prontuario/prazos` },
            { key: "documentos", label: "Documentos", href: `/clientes/${client.id}/prontuario/documentos` },
          ].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${activeSection === item.key ? "bg-orange-500 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
