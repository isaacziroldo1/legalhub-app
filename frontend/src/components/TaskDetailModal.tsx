"use client";

import {
  Calendar,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useApp } from "@/context/AppContext";
import { downloadTaskAttachmentRequest, fetchTaskDetailRequest } from "@/lib/api";
import type { Task, TaskDetail, TaskPriority, TaskStatus } from "@/types";

type Props = {
  taskId: string;
  onClose: () => void;
  initialTask?: Task;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "A Fazer",
  drafting: "Em Redação",
  review: "Revisão Interna",
  done: "Protocolado/Concluído",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: "Crítico",
  high: "Alta",
  normal: "Normal",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskDetailModal({ taskId, onClose, initialTask }: Props) {
  const { session } = useAuth();
  const { documents, updateTaskObservations, addTaskComment, uploadTaskAttachment, removeTaskAttachment } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [observations, setObservations] = useState("");
  const [savingObservations, setSavingObservations] = useState(false);
  const [observationsMessage, setObservationsMessage] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pendingDeleteAttachment, setPendingDeleteAttachment] = useState<{ id: string; originalName: string } | null>(null);
  const [deletingAttachment, setDeletingAttachment] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchTaskDetailRequest(taskId);
      setDetail(data);
      setObservations(data.observations ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar detalhes do prazo");
    } finally {
      setLoading(false);
    }
  }, [session, taskId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (pendingDeleteAttachment) {
        if (!deletingAttachment) setPendingDeleteAttachment(null);
        return;
      }
      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deletingAttachment, onClose, pendingDeleteAttachment]);

  const clientDocuments = useMemo(() => {
    const clientId = detail?.clientId ?? initialTask?.clientId;
    if (!clientId) return [];
    return documents.filter((document) => document.clientId === clientId);
  }, [detail?.clientId, documents, initialTask?.clientId]);

  const saveObservations = async () => {
    setSavingObservations(true);
    setObservationsMessage(null);

    try {
      await updateTaskObservations(taskId, observations);
      setObservationsMessage("Observações salvas.");
      await loadDetail();
    } catch (err) {
      setObservationsMessage(err instanceof Error ? err.message : "Falha ao salvar observações");
    } finally {
      setSavingObservations(false);
    }
  };

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    const body = commentDraft.trim();
    if (!body) return;

    setSubmittingComment(true);

    try {
      const comment = await addTaskComment(taskId, body);
      setCommentDraft("");
      setDetail((current) =>
        current
          ? {
              ...current,
              comments: [...current.comments, comment],
            }
          : current
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar comentário");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;

    setUploadingAttachment(true);
    setError(null);

    try {
      const attachment = await uploadTaskAttachment(taskId, file);
      setDetail((current) =>
        current
          ? {
              ...current,
              attachments: [attachment, ...current.attachments],
            }
          : current
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar anexo");
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    if (!session) return;

    try {
      const blob = await downloadTaskAttachmentRequest(taskId, attachmentId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao baixar anexo");
    }
  };

  const confirmDeleteAttachment = async () => {
    if (!pendingDeleteAttachment) return;

    const { id: attachmentId } = pendingDeleteAttachment;
    setDeletingAttachment(true);
    setError(null);

    try {
      await removeTaskAttachment(taskId, attachmentId);
      setDetail((current) =>
        current
          ? {
              ...current,
              attachments: current.attachments.filter((item) => item.id !== attachmentId),
            }
          : current
      );
      setPendingDeleteAttachment(null);
    } catch (err) {
      setPendingDeleteAttachment(null);
      setError(err instanceof Error ? err.message : "Falha ao remover anexo");
    } finally {
      setDeletingAttachment(false);
    }
  };

  const title = detail?.title ?? initialTask?.title ?? "Prazo";
  const clientId = detail?.clientId ?? initialTask?.clientId;

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !pendingDeleteAttachment && onClose()}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="task-detail-title" className="text-xl font-extrabold text-zinc-950">
              {title}
            </h2>
            {detail && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700">{STATUS_LABELS[detail.status]}</span>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">{PRIORITY_LABELS[detail.priority]}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <Calendar size={12} />
                  {new Intl.DateTimeFormat("pt-BR").format(new Date(detail.dueDate))}
                </span>
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {loading && !detail && (
          <div className="flex flex-1 items-center justify-center gap-2 p-12 text-sm text-zinc-500">
            <Loader2 size={18} className="animate-spin" />
            Carregando detalhes...
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>
        )}

        {detail && (
          <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_320px]">
            <div className="overflow-y-auto px-6 py-5">
              <section className="mb-6">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <User size={14} />
                  Cliente
                </h3>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
                  <div className="font-bold text-zinc-900">{detail.client.name}</div>
                  <div className="mt-1 text-xs text-zinc-600">CNPJ: {detail.client.cnpj}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {detail.client.email} · {detail.client.phone}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Responsável: {detail.client.responsible} · Status: {detail.client.status}
                  </div>
                  {clientId && (
                    <Link
                      href={`/clientes/${clientId}/prontuario`}
                      className="mt-3 inline-block text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline"
                    >
                      Ver prontuário do cliente
                    </Link>
                  )}
                </div>
              </section>

              <section className="mb-6">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <FileText size={14} />
                  Documentação do cliente
                </h3>
                {clientDocuments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">Nenhum documento vinculado a este cliente.</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {clientDocuments.map((document) => (
                      <li key={document.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <div className="truncate font-bold text-zinc-800">{document.name}</div>
                          <div className="text-[10px] text-zinc-500">{document.category}</div>
                        </div>
                        {clientId && (
                          <Link
                            href={`/clientes/${clientId}/prontuario/documentos`}
                            className="shrink-0 font-bold text-orange-500 hover:underline"
                          >
                            Ver
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="mb-6">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Observações</h3>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  rows={5}
                  placeholder="Adicione observações sobre este prazo..."
                  className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={savingObservations}
                    onClick={() => void saveObservations()}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingObservations ? "Salvando..." : "Salvar observações"}
                  </button>
                  {observationsMessage && <span className="text-xs text-zinc-500">{observationsMessage}</span>}
                </div>
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <Paperclip size={14} />
                  Anexos do card
                </h3>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="hidden"
                    onChange={(event) => void handleFileUpload(event.target.files?.[0])}
                  />
                  <button
                    type="button"
                    disabled={uploadingAttachment}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50"
                  >
                    {uploadingAttachment ? "Enviando..." : "Adicionar anexo"}
                  </button>
                  <span className="text-[10px] text-zinc-400">PDF, DOCX ou TXT (máx. 50MB)</span>
                </div>
                {detail.attachments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">Nenhum anexo neste card.</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {detail.attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-zinc-800">{attachment.originalName}</div>
                          <div className="text-[10px] text-zinc-500">
                            {formatFileSize(attachment.sizeBytes)} · {formatDateTime(attachment.createdAt)}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void handleDownload(attachment.id, attachment.originalName)}
                            className="rounded p-1.5 text-zinc-500 transition hover:bg-white hover:text-orange-600"
                            aria-label={`Baixar ${attachment.originalName}`}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingDeleteAttachment({ id: attachment.id, originalName: attachment.originalName })
                            }
                            className="rounded p-1.5 text-zinc-500 transition hover:bg-white hover:text-red-600"
                            aria-label={`Remover ${attachment.originalName}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-zinc-600">
                <div>
                  <span className="font-bold text-zinc-500">Responsável do prazo</span>
                  <div className="mt-0.5 font-mono font-bold text-orange-600">{detail.responsible}</div>
                </div>
                <div>
                  <span className="font-bold text-zinc-500">Criado em</span>
                  <div className="mt-0.5">{formatDateTime(detail.createdAt)}</div>
                </div>
              </div>
            </div>

            <aside className="flex flex-col border-t border-zinc-100 bg-zinc-50 lg:border-l lg:border-t-0">
              <div className="border-b border-zinc-100 px-4 py-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-600">
                  <MessageSquare size={14} />
                  Atividade e comentários
                </h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {detail.comments.length === 0 ? (
                  <p className="text-xs text-zinc-500">Nenhum comentário ainda. Seja o primeiro a comentar.</p>
                ) : (
                  detail.comments.map((comment) => (
                    <article key={comment.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-800">{comment.userName}</span>
                        <time className="text-[10px] text-zinc-400">{formatDateTime(comment.createdAt)}</time>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-700">{comment.body}</p>
                    </article>
                  ))
                )}
              </div>
              <form onSubmit={submitComment} className="border-t border-zinc-200 p-4">
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  rows={3}
                  placeholder="Escreva um comentário..."
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentDraft.trim()}
                  className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingComment ? "Enviando..." : "Comentar"}
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
    </div>

    {pendingDeleteAttachment && (
      <ConfirmModal
        title="Remover anexo"
        message={`Remover "${pendingDeleteAttachment.originalName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="danger"
        isLoading={deletingAttachment}
        onClose={() => !deletingAttachment && setPendingDeleteAttachment(null)}
        onConfirm={confirmDeleteAttachment}
      />
    )}
    </>
  );
}
