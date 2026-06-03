"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}

function daysUntil(value: string) {
  const now = new Date();
  const target = new Date(value);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function DashboardView() {
  const { clients, documents, tasks } = useApp();

  const metrics = useMemo(() => {
    const activeClients = clients.filter((client) => client.status === "Ativo").length;
    const prospectingClients = clients.filter((client) => client.status === "Em Prospecção").length;
    const inactiveClients = clients.filter((client) => client.status === "Inativo").length;
    const overdueTasks = tasks.filter((task) => task.status !== "done" && daysUntil(task.dueDate) < 0).length;
    const dueSoonTasks = tasks.filter((task) => task.status !== "done" && daysUntil(task.dueDate) >= 0 && daysUntil(task.dueDate) <= 2).length;
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const categories = new Set(documents.map((document) => document.category));

    return {
      activeClients,
      prospectingClients,
      inactiveClients,
      overdueTasks,
      dueSoonTasks,
      completedTasks,
      documentCount: documents.length,
      categoryCount: categories.size,
    };
  }, [clients, documents, tasks]);

  const alerts = useMemo(() => {
    const criticalTask = tasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];
    const mappedDocument = documents.find((document) => document.autoMappedFields && Object.keys(document.autoMappedFields).length > 0);

    return [
      criticalTask && { tone: "red", icon: "⚠️", text: `Prazo de ${criticalTask.title} vence em ${formatDate(criticalTask.dueDate)}` },
      metrics.overdueTasks > 0 && { tone: "amber", icon: "⏰", text: `${metrics.overdueTasks} prazo(s) vencido(s) precisam de atenção` },
      mappedDocument && { tone: "blue", icon: "🧠", text: `Documento inteligente ativo em ${mappedDocument.name}` },
    ].filter(Boolean) as Array<{ tone: string; icon: string; text: string }>;
  }, [documents, metrics.overdueTasks, tasks]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-950">Bem-vindo ao Painel Geral</h2>
        <p className="text-sm text-zinc-500">Resumo em tempo real de clientes, prazos e documentos do escritório.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Clientes Ativos", val: String(metrics.activeClients), color: "text-orange-500" },
          { label: "Em Prospecção", val: String(metrics.prospectingClients), color: "text-amber-500" },
          { label: "Documentos", val: String(metrics.documentCount), color: "text-zinc-600" },
          { label: "Prazos Críticos", val: String(metrics.overdueTasks + metrics.dueSoonTasks), color: "text-red-500" },
        ].map((metric) => (
          <div key={metric.label} className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-zinc-400">{metric.label}</span>
            <span className={`mt-3 text-3xl font-extrabold ${metric.color}`}>{metric.val}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Clientes Inativos", val: metrics.inactiveClients },
          { label: "Tarefas Concluídas", val: metrics.completedTasks },
          { label: "Categorias", val: metrics.categoryCount },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-zinc-400">{metric.label}</span>
            <div className="mt-3 text-2xl font-extrabold text-zinc-950">{metric.val}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-zinc-950">Alertas Críticos</h3>
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.text}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold ${alert.tone === "red" ? "border border-red-200 bg-red-50 text-red-700" : alert.tone === "amber" ? "border border-amber-200 bg-amber-50 text-amber-700" : "border border-blue-200 bg-blue-50 text-blue-700"}`}
            >
              <span>{alert.icon}</span>
              <span>{alert.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
