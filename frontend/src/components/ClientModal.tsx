"use client";

import { X } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    responsible: string;
    status: "Ativo" | "Em Prospecção" | "Inativo";
    address: string;
    city: string;
    observations?: string;
  }) => void;
};

export function ClientModal({ onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [responsible, setResponsible] = useState("");
  const [status, setStatus] = useState<"Ativo" | "Em Prospecção" | "Inativo">("Em Prospecção");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [observations, setObservations] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({ name, cnpj, email, phone, responsible, status, address, city, observations });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar cliente");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Novo Cliente</h3>
          <button type="button" onClick={onClose} className="font-bold text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>

        <Field label="Nome / Razão Social" value={name} onChange={setName} placeholder="Ex: Silva & Advogados Associados" />
        <Field label="CPF / CNPJ" value={cnpj} onChange={setCnpj} placeholder="00.000.000/0000-00" />
        <Field label="E-mail de Contato" value={email} onChange={setEmail} placeholder="exemplo@dominio.com" type="email" />
        <Field label="Telefone" value={phone} onChange={setPhone} placeholder="(11) 99999-9999" />
        <Field label="Responsável Legal" value={responsible} onChange={setResponsible} placeholder="Ex: Dr. João Carlos" />
        <Field label="Endereço" value={address} onChange={setAddress} placeholder="Av. Paulista, 1000" />
        <Field label="Cidade" value={city} onChange={setCity} placeholder="São Paulo, SP" />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-700">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as "Ativo" | "Em Prospecção" | "Inativo")} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500">
            <option value="Ativo">Ativo</option>
            <option value="Em Prospecção">Em Prospecção</option>
            <option value="Inativo">Inativo</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-700">Observações</span>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Observações importantes sobre o cliente..."
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500 min-h-[60px] resize-y"
          />
        </label>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100">Cancelar</button>
          <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600">Criar Cliente</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500" required={label.includes("Nome") || label.includes("CNPJ") || label.includes("E-mail")} />
    </label>
  );
}
