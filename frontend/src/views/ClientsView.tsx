"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Client } from "@/types";
import { ClientDrawer } from "@/components/ClientDrawer";

type Props = {
  highlightClientId?: string;
};

export function ClientsView({ highlightClientId }: Props) {
  const { clients, removeClient } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Client["status"]>("all");

  const prontuarioId = searchParams.get("prontuario");

  const selectedClientForProntuario = useMemo(() => {
    if (!prontuarioId) return null;
    return clients.find((c) => c.id === prontuarioId) || null;
  }, [clients, prontuarioId]);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesQuery =
        !normalizedQuery ||
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.cnpj.toLowerCase().includes(normalizedQuery) ||
        client.responsible.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [clients, query, statusFilter]);

  const metrics = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((client) => client.status === "Ativo").length,
      prospecting: clients.filter((client) => client.status === "Em Prospecção").length,
      inactive: clients.filter((client) => client.status === "Inativo").length,
    }),
    [clients]
  );

  const deleteClient = (client: Client) => {
    if (window.confirm(`Excluir ${client.name}? Os prazos e documentos vinculados também serão removidos.`)) {
      void removeClient(client.id).catch((error) => console.error(error));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-950">Gerenciamento de Clientes</h2>
        <p className="text-sm text-zinc-500">Gestão dinâmica do CRM com busca, filtros e exclusão segura.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: metrics.total, color: "text-zinc-900" },
          { label: "Ativos", value: metrics.active, color: "text-green-600" },
          { label: "Em Prospecção", value: metrics.prospecting, color: "text-amber-600" },
          { label: "Inativos", value: metrics.inactive, color: "text-red-600" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold text-zinc-400">{metric.label}</span>
            <div className={`mt-2 text-2xl font-extrabold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, CNPJ ou responsável" className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-orange-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Todos" },
            { key: "Ativo", label: "Ativos" },
            { key: "Em Prospecção", label: "Prospecção" },
            { key: "Inativo", label: "Inativos" },
          ].map((filter) => (
            <button key={filter.key} onClick={() => setStatusFilter(filter.key as typeof statusFilter)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${statusFilter === filter.key ? "bg-orange-500 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"}`}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase text-zinc-500">
                <th className="px-6 py-4">Nome/Razão Social</th>
                <th className="px-6 py-4">CPF/CNPJ</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className={`transition hover:bg-zinc-50/60 ${highlightClientId === client.id ? "bg-orange-50/80 ring-1 ring-inset ring-orange-200" : ""}`}
                >
                  <td className="px-6 py-4 font-bold text-zinc-950">{client.name}</td>
                  <td className="px-6 py-4 font-mono text-zinc-500">{client.cnpj}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${client.status === "Ativo" ? "bg-green-100 text-green-700" : client.status === "Em Prospecção" ? "bg-amber-100 text-amber-700" : "bg-zinc-200 text-zinc-700"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${client.status === "Ativo" ? "bg-green-600" : client.status === "Em Prospecção" ? "bg-amber-600" : "bg-zinc-600"}`} />
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{client.responsible}</td>
                  <td className="px-6 py-4 text-zinc-500">{new Intl.DateTimeFormat("pt-BR").format(new Date(client.createdAt))}</td>
                    <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => router.push(`/?view=clients&prontuario=${client.id}`)} className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">
                        <Eye size={14} /> Prontuário
                      </button>
                      <button onClick={() => deleteClient(client)} className="text-xs font-bold text-red-500 hover:underline">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filteredClients.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">Nenhum cliente encontrado com os filtros atuais.</div>}

      {selectedClientForProntuario && (
        <ClientDrawer
          client={selectedClientForProntuario}
          onClose={() => router.push("/?view=clients")}
        />
      )}
    </div>
  );
}
