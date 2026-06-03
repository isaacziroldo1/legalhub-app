"use client";

import { ChevronRight, X, Pencil, ChevronDown, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { Client } from "@/types";
import { UploadModal } from "@/components/UploadModal";

type Props = {
  client: Client;
  onClose: () => void;
};

type TabKey = "cadastro" | "prazos" | "documentos";

type ClientForm = {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  responsible: string;
  status: Client["status"];
  address: string;
  city: string;
  observations: string;
};

function clientToForm(client: Client): ClientForm {
  return {
    name: client.name,
    cnpj: client.cnpj,
    email: client.email,
    phone: client.phone,
    responsible: client.responsible,
    status: client.status,
    address: client.address,
    city: client.city,
    observations: client.observations || "",
  };
}

export function ClientDrawer({ client, onClose }: Props) {
  const router = useRouter();
  const { documents, tasks, updateClient, clients, addDocument } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("cadastro");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ClientForm>(() => clientToForm(client));
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const relatedDocs = useMemo(() => documents.filter((document) => document.clientId === client.id), [client.id, documents]);
  const relatedTasks = useMemo(() => tasks.filter((task) => task.clientId === client.id), [client.id, tasks]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(clientToForm(client)), [client, form]);

  useEffect(() => {
    setIsEditing(false);
    setActiveTab("cadastro");
    setError(null);
    setSuccessMessage(null);
  }, [client.id]);

  useEffect(() => {
    if (!isEditing) {
      setForm(clientToForm(client));
    }
  }, [client, isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const requestClose = useCallback(() => {
    if (isEditing && isDirty) {
      if (!window.confirm("Descartar alterações não salvas?")) return;
    }
    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 300);
  }, [isDirty, isEditing, onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      requestClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  const cancelEditing = () => {
    setForm(clientToForm(client));
    setIsEditing(false);
    setError(null);
  };

  const startEditing = () => {
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleStatusChange = async (newStatus: Client["status"]) => {
    if (client.status === newStatus) {
      setIsStatusDropdownOpen(false);
      return;
    }

    setIsStatusUpdating(true);
    setIsStatusDropdownOpen(false);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateClient(client.id, { status: newStatus });
      setForm((prev) => ({ ...prev, status: newStatus }));
      setSuccessMessage(`Status do cliente atualizado para "${newStatus}" com sucesso.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar o status");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const saveClient = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await updateClient(client.id, form);
      setIsEditing(false);
      setSuccessMessage("Alterações salvas com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar cliente");
    } finally {
      setIsSaving(false);
    }
  };

  const openKanban = (taskId?: string) => {
    router.push(taskId ? `/?view=kanban&task=${taskId}` : "/?view=kanban");
  };

  const openDocuments = (docId?: string) => {
    router.push(docId ? `/?view=documents&doc=${docId}` : "/?view=documents");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" role="presentation">
      <button
        type="button"
        aria-label="Fechar prontuário"
        className={`h-full flex-1 cursor-default bg-black/40 transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={requestClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-drawer-title"
        tabIndex={-1}
        className={`flex h-full w-full max-w-md flex-col bg-white shadow-2xl outline-none sm:w-[450px] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-5">
          <div className="flex flex-col gap-1">
            <h3 id="client-drawer-title" className="text-lg font-bold text-zinc-900">
              Prontuário do Cliente
            </h3>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                disabled={isStatusUpdating}
                className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition shadow-sm hover:brightness-95 active:scale-95 disabled:opacity-75 ${
                  client.status === "Ativo"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : client.status === "Em Prospecção"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-700"
                }`}
              >
                {isStatusUpdating ? (
                  <Loader2 size={12} className="animate-spin text-zinc-500" />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      client.status === "Ativo"
                        ? "bg-emerald-500 animate-pulse"
                        : client.status === "Em Prospecção"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-zinc-400"
                    }`}
                  />
                )}
                <span>{client.status}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 mt-1.5 z-50 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-1">
                    Alterar Status
                  </div>
                  {(["Em Prospecção", "Ativo", "Inativo"] as const).map((statusOption) => {
                    const isSelected = client.status === statusOption;
                    return (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => void handleStatusChange(statusOption)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-zinc-50 ${
                          isSelected ? "font-bold text-zinc-900 bg-zinc-50/50" : "text-zinc-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              statusOption === "Ativo"
                                ? "bg-emerald-500"
                                : statusOption === "Em Prospecção"
                                ? "bg-amber-500"
                                : "bg-zinc-400"
                            }`}
                          />
                          <span>{statusOption}</span>
                        </div>
                        {isSelected && <Check size={12} className="text-zinc-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <button type="button" onClick={requestClose} aria-label="Fechar" className="text-xl font-bold text-zinc-400 hover:text-zinc-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-5 flex flex-col gap-1">
            <span className="text-xl font-extrabold text-zinc-950">{client.name}</span>
            <span className="font-mono text-xs text-zinc-500">{client.cnpj}</span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openKanban()}
              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-center text-xs font-bold text-orange-700 transition hover:bg-orange-100"
            >
              Ver prazos ativos
            </button>
            <button
              type="button"
              onClick={() => openDocuments()}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              Ver documentos
            </button>
          </div>

          <div className="flex border-b border-zinc-200 text-xs">
            {[
              ["cadastro", "Dados Cadastrais"],
              ["prazos", "Prazos Ativos"],
              ["documentos", "Documentos"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as TabKey)}
                className={`flex-1 border-b-2 py-2.5 text-center font-bold transition ${activeTab === key ? "border-orange-500 text-orange-500" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {successMessage && !isEditing && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">{successMessage}</div>
          )}

          {error && !isEditing && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>
          )}

          {activeTab === "cadastro" && (
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-zinc-700">Cadastro do cliente</span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    title="Editar cliente"
                    className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <Field label="Nome / Razão Social" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
                  <Field label="CPF / CNPJ" value={form.cnpj} onChange={(value) => setForm((prev) => ({ ...prev, cnpj: value }))} />
                  <Field label="E-mail" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} type="email" />
                  <Field label="Telefone" value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
                  <Field label="Responsável Jurídico" value={form.responsible} onChange={(value) => setForm((prev) => ({ ...prev, responsible: value }))} />
                  <Field label="Endereço" value={form.address} onChange={(value) => setForm((prev) => ({ ...prev, address: value }))} />
                  <Field label="Cidade" value={form.city} onChange={(value) => setForm((prev) => ({ ...prev, city: value }))} />

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-zinc-700">Status</span>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Client["status"] }))}
                      className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Em Prospecção">Em Prospecção</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-zinc-700">Observações</span>
                    <textarea
                      value={form.observations}
                      onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
                      placeholder="Ex: Cliente prefere contato via WhatsApp. Caso complexo de tributário."
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500 min-h-[80px] resize-y"
                    />
                  </label>

                  {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}
                </div>
              ) : (
                <>
                  {[
                    ["Endereço", client.address],
                    ["Cidade", client.city],
                    ["Telefone", client.phone],
                    ["E-mail", client.email],
                    ["Responsável Jurídico", client.responsible],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">{label}</span>
                      <span className="text-sm font-semibold text-zinc-800">{value}</span>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Observações</span>
                    <span className="text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                      {client.observations || "Nenhuma observação registrada."}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "prazos" && (
            <div className="mt-5 flex flex-col gap-3">
              {relatedTasks.length === 0 && <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">Nenhum prazo vinculado a este cliente.</div>}
              {relatedTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => openKanban(task.id)}
                  aria-label={`Abrir prazo ${task.title} no quadro de prazos`}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-zinc-800">{task.title}</div>
                    <div className={`font-mono text-[10px] font-bold ${task.status === "done" ? "text-green-600" : task.status === "review" ? "text-amber-500" : "text-red-500"}`}>
                      📅 {new Intl.DateTimeFormat("pt-BR").format(new Date(task.dueDate))}
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-500">
                      Responsavel: {task.responsible} | Status: {task.status}
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-orange-500" aria-hidden />
                </button>
              ))}
              {relatedTasks.length > 0 && (
                <button type="button" onClick={() => openKanban()} className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">
                  Ver todos os prazos no quadro
                </button>
              )}
            </div>
          )}

          {activeTab === "documentos" && (
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700">Documentos do cliente</span>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-orange-600"
                >
                  Anexar documento
                </button>
              </div>

              {relatedDocs.length === 0 && <div className="rounded-lg border border-dashed border-zinc-200 p-3 text-xs text-zinc-500">Nenhum documento vinculado a este cliente.</div>}
              {relatedDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDocuments(doc.id)}
                  aria-label={`Abrir documento ${doc.name} na biblioteca`}
                  className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/50"
                >
                  <div className="text-2xl">📄</div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">{doc.name}</span>
                    <span className="text-[10px] text-zinc-400">
                      {doc.category} - {new Intl.DateTimeFormat("pt-BR").format(new Date(doc.uploadedAt))}
                    </span>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-orange-500" aria-hidden />
                </button>
              ))}
              {relatedDocs.length > 0 && (
                <button type="button" onClick={() => openDocuments()} className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">
                  Ver todos os documentos
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-zinc-200 bg-zinc-50 p-6">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveClient()}
                disabled={isSaving || !isDirty}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </>
          ) : (
            <button type="button" onClick={requestClose} className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-800 transition hover:bg-zinc-50">
              Fechar Prontuário
            </button>
          )}
        </div>
      </div>

      {showUploadModal && (
        <UploadModal
          clients={clients}
          initialClientId={client.id}
          onClose={() => setShowUploadModal(false)}
          onSubmit={async (payload) => {
            await addDocument(payload);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500"
        required={label.includes("Nome") || label.includes("CNPJ") || label.includes("E-mail")}
      />
    </label>
  );
}
