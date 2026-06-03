"use client";

import { X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { Client } from "@/types";

type TaskPriority = "critical" | "high" | "normal";

type Props = {
  clients: Client[];
  onClose: () => void;
  onSubmit: (payload: { title: string; clientId: string; clientName: string; dueDate: string; priority: TaskPriority; status: "todo"; responsible: string }) => void;
};

export function TaskModal({ clients, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [responsible, setResponsible] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const selectedClient = clients.find((item) => item.id === clientId);
    if (!selectedClient) return;

    try {
      await onSubmit({
        title,
        clientId,
        clientName: selectedClient.name,
        dueDate,
        priority,
        status: "todo",
        responsible,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar tarefa");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Nova Tarefa</h3>
          <button type="button" onClick={onClose} className="font-bold text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>

        <Field label="Título da Tarefa" value={title} onChange={setTitle} placeholder="Ex: Protocolar Petição de Embargos" />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-700">Associar ao Cliente</span>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500" required>
            <option value="">Selecione o cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Data Fatal" value={dueDate} onChange={setDueDate} type="date" />
          <Field label="Responsável" value={responsible} onChange={setResponsible} placeholder="Ex: JS" maxLength={2} />
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-zinc-700">Prioridade</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Crítico", val: "critical" as const },
              { label: "Alta", val: "high" as const },
              { label: "Normal", val: "normal" as const },
            ].map((opt) => (
              <button key={opt.val} type="button" onClick={() => setPriority(opt.val)} className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition ${priority === opt.val ? "border-orange-500 bg-zinc-100 text-zinc-900" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100">Cancelar</button>
          <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600">Criar Tarefa</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, maxLength, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      <input type={type} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500" required />
    </label>
  );
}
