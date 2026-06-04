"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";

type Props = {
  clientId?: string;
  highlightDocId?: string;
};

export function DocumentsView({ clientId, highlightDocId }: Props) {
  const { documents, clients } = useApp();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const scopedDocuments = useMemo(() => (clientId ? documents.filter((document) => document.clientId === clientId) : documents), [clientId, documents]);

  const categories = useMemo(() => {
    const counts = scopedDocuments.reduce<Record<string, number>>((acc, document) => {
      acc[document.category] = (acc[document.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([label, count]) => ({ label, count, icon: "📄" }));
  }, [scopedDocuments]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scopedDocuments.filter((document) => {
      const matchesCategory = selectedCategory === "all" || document.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        document.name.toLowerCase().includes(normalizedQuery) ||
        document.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [query, scopedDocuments, selectedCategory]);

  const categoryList = ["all", ...categories.map((category) => category.label)];

  useEffect(() => {
    if (!highlightDocId) return;
    setSelectedCategory("all");
    setQuery("");
  }, [highlightDocId]);

  useEffect(() => {
    if (!highlightDocId) return;
    if (!scopedDocuments.some((document) => document.id === highlightDocId)) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(`doc-${highlightDocId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => cancelAnimationFrame(frame);
  }, [highlightDocId, scopedDocuments, filteredDocuments]);

  const listTitle =
    selectedCategory === "all" ? "Todos os documentos" : selectedCategory;

  return (
    <div className="flex flex-col gap-6">
      {clientId && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-950">Documentos do cliente</h2>
            <p className="text-sm text-zinc-500">
              {filteredDocuments.length} documento{filteredDocuments.length === 1 ? "" : "s"} vinculado
              {filteredDocuments.length === 1 ? "" : "s"} a este cliente. Use a busca e as categorias para filtrar os arquivos.
            </p>
          </div>
          <Link
            href={`/clientes/${clientId}/prontuario`}
            className="shrink-0 text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline"
          >
            Voltar ao prontuário
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="h-fit w-full rounded-xl border border-zinc-200 bg-zinc-100 p-4 lg:w-64">
        <span className="text-sm font-bold text-zinc-800">Categorias</span>
        <nav className="mt-4 flex flex-col gap-1">
          {categoryList.map((folder) => (
            <button key={folder} onClick={() => setSelectedCategory(folder)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${selectedCategory === folder ? "bg-orange-500 text-white" : "text-zinc-700 hover:bg-zinc-200"}`}>
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span>{folder === "all" ? "Todas" : folder}</span>
              </div>
              <span className={selectedCategory === folder ? "text-white" : "text-zinc-400"}>{folder === "all" ? scopedDocuments.length : categories.find((item) => item.label === folder)?.count ?? 0}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <div className="mb-4 flex flex-col gap-1">
          {!clientId && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Documentos &gt; Biblioteca Dinamica</span>
          )}
          <h2 className="text-xl font-bold text-zinc-900">
            {listTitle} ({filteredDocuments.length} documentos)
          </h2>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar documento ou tag" className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-orange-500 md:max-w-md" />
          {!clientId && <div className="text-xs text-zinc-500">Clientes vinculados: {clients.length}</div>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              id={`doc-${doc.id}`}
              className={`flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${highlightDocId === doc.id ? "ring-2 ring-orange-400" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">📄</span>
                <span className="text-xs font-bold leading-snug text-zinc-900">{doc.name}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => <span key={tag} className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500">{tag}</span>)}
              </div>
              <div className="text-[11px] text-zinc-500">Categoria: {doc.category}</div>
              <div className="text-[11px] text-zinc-500">Enviado em: {new Intl.DateTimeFormat("pt-BR").format(new Date(doc.uploadedAt))}</div>
              {doc.clientId && <div className="text-[11px] text-zinc-500">Cliente: {clients.find((client) => client.id === doc.clientId)?.name ?? "N/A"}</div>}
              {doc.variables.length > 0 && (
                <div className="flex flex-col gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3">
                  <span className="text-[9px] font-bold uppercase text-orange-600">Variáveis Dinâmicas:</span>
                  <div className="flex flex-wrap gap-1">
                    {doc.variables.map((variable) => <span key={variable} className="rounded bg-orange-100/50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-orange-600">{variable}</span>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {filteredDocuments.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">Nenhum documento encontrado com os filtros atuais.</div>}
      </div>
      </div>
    </div>
  );
}
