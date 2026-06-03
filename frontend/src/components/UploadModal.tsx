"use client";

import { X, ScanLine, ArrowRightLeft } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { Client, DocumentItem } from "@/types";
import { useApp } from "@/context/AppContext";

type Props = {
  clients: Client[];
  onClose: () => void;
  onSubmit: (payload: Omit<DocumentItem, "id" | "uploadedAt">) => void;
  initialClientId?: string;
};

const DEMO_TEXT = `Contrato de prestação de serviços entre [Nome_Cliente] e [CNPJ_Empresa]. O valor total de [Valor_Contrato] será pago em 12 parcelas.`;

export function UploadModal({ clients, onClose, onSubmit, initialClientId }: Props) {
  const { settings } = useApp();
  const [category, setCategory] = useState("Petições Iniciais");
  const [clientId, setClientId] = useState(initialClientId || "");
  const [isTemplate, setIsTemplate] = useState(false);
  const [phase, setPhase] = useState<"idle" | "scanning" | "ready">("idle");
  const [mappedFields, setMappedFields] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectedVariables = useMemo(() => Array.from(new Set((DEMO_TEXT.match(/\[(.*?)\]/g) || []))), []);
  const selectedClient = useMemo(() => clients.find((item) => item.id === clientId), [clients, clientId]);

  const startScan = () => {
    setPhase("scanning");
    window.setTimeout(() => {
      setPhase("ready");
      setMappedFields(Object.fromEntries(detectedVariables.map((v) => [v, selectedClient?.name || "Preenchimento manual"])));
    }, 900);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({
        name: `Modelo ${category} [Nome_Cliente]`,
        category,
        tags: [selectedClient?.name || "Cliente Geral", "Upload Automático"],
        variables: isTemplate ? detectedVariables : [],
        autoMappedFields: isTemplate ? mappedFields ?? Object.fromEntries(detectedVariables.map((v) => [v, selectedClient?.name || "Preenchimento manual"])) : undefined,
        clientId: selectedClient?.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar documento");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Upload de Documento</h3>
          <button type="button" onClick={onClose} className="font-bold text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>

        <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 text-center">
          <ScanLine className="mb-2 text-zinc-500" size={34} />
          <div className="text-xs font-bold text-zinc-800">Arraste e solte o arquivo aqui</div>
          <div className="mt-1 text-[10px] text-zinc-400">PDF, DOCX, TXT (Max 50MB)</div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-700">Selecionar Pasta / Categoria</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500">
            <option>Petições Iniciais</option>
            <option>Contratos</option>
            <option>Procurações</option>
            <option>Pareceres</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-700">Vincular ao Cliente (Opcional)</span>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500">
            <option value="">Selecione o cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-1">
          <input type="checkbox" checked={isTemplate} onChange={(e) => { setIsTemplate(e.target.checked); if (e.target.checked && settings.isSmartScanEnabled) startScan(); }} className="rounded border-zinc-300 text-orange-500 focus:ring-orange-500" />
          <span className="text-xs text-zinc-700 leading-tight">Este arquivo é um modelo com variáveis dinâmicas</span>
        </label>

        {isTemplate && settings.isSmartScanEnabled && phase !== "idle" && (
          <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
              <ArrowRightLeft size={14} /> SmartScan analisando documento...
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {phase === "scanning" ? (
                <div className="h-2 overflow-hidden rounded-full bg-orange-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {detectedVariables.map((variable) => (
                    <div key={variable} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-[11px] text-zinc-700">
                      <span className="font-mono font-semibold text-orange-600">{variable}</span>
                      <span className="text-zinc-400">Mapeado automaticamente</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100">Cancelar</button>
          <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600">Salvar e Processar</button>
        </div>
      </form>
    </div>
  );
}
