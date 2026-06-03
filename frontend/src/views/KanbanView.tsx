"use client";

import { useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";

type Props = {
  clientId?: string;
  highlightTaskId?: string;
};

export function KanbanView({ clientId, highlightTaskId }: Props) {
  const { tasks, updateTaskStatus } = useApp();

  const scopedTasks = useMemo(() => (clientId ? tasks.filter((task) => task.clientId === clientId) : tasks), [clientId, tasks]);

  const columns = useMemo(
    () => [
      { key: "todo", name: "A Fazer", tasksList: scopedTasks.filter((task) => task.status === "todo") },
      { key: "drafting", name: "Em Redação", tasksList: scopedTasks.filter((task) => task.status === "drafting") },
      { key: "review", name: "Revisão Interna", tasksList: scopedTasks.filter((task) => task.status === "review") },
      { key: "done", name: "Protocolado/Concluído", tasksList: scopedTasks.filter((task) => task.status === "done") },
    ],
    [scopedTasks]
  );

  const getNextStatus = (status: string) => {
    if (status === "todo") return "drafting";
    if (status === "drafting") return "review";
    if (status === "review") return "done";
    return "done";
  };

  const getPreviousStatus = (status: string) => {
    if (status === "done") return "review";
    if (status === "review") return "drafting";
    if (status === "drafting") return "todo";
    return "todo";
  };

  const formatDeadline = (value: string) => {
    const diff = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Vencido há ${Math.abs(diff)} dia(s)`;
    if (diff === 0) return "Vence hoje";
    return `Vence em ${diff} dia(s)`;
  };

  const urgencyClass = (value: string) => {
    const diff = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "bg-red-100 text-red-700";
    if (diff <= 2) return "bg-amber-100 text-amber-700";
    return "bg-zinc-100 text-zinc-600";
  };

  useEffect(() => {
    if (!highlightTaskId) return;
    if (!scopedTasks.some((task) => task.id === highlightTaskId)) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(`task-${highlightTaskId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => cancelAnimationFrame(frame);
  }, [highlightTaskId, scopedTasks]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-950">Quadro de Prazos</h2>
        <p className="text-sm text-zinc-500">Acompanhe prazos com base em estado e data real de vencimento{clientId ? " para este cliente." : "."}</p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.name} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-zinc-900">{column.name}</span>
              <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-700">{column.tasksList.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {column.tasksList.map((task) => (
                <div
                  key={task.id}
                  id={`task-${task.id}`}
                  className={`flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ${highlightTaskId === task.id ? "ring-2 ring-orange-400" : ""}`}
                >
                  <span className="text-xs font-bold leading-tight text-zinc-900">{task.title}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">👤</span>
                    <span className="text-xs font-bold text-orange-500">{task.clientName}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold ${urgencyClass(task.dueDate)}`}>
                      <span>📅</span> {formatDeadline(task.dueDate)}
                    </span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">{task.responsible}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button onClick={() => void updateTaskStatus(task.id, getPreviousStatus(task.status) as typeof task.status).catch((error) => console.error(error))} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900">
                      Voltar
                    </button>
                    <button onClick={() => void updateTaskStatus(task.id, getNextStatus(task.status) as typeof task.status).catch((error) => console.error(error))} className="text-[10px] font-bold text-orange-500 hover:text-orange-600">
                      Avancar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
