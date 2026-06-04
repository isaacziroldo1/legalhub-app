"use client";

import { useApp } from "@/context/AppContext";
import { DocumentsView } from "@/views/DocumentsView";

type Props = {
  clientId: string;
  highlightDocId?: string;
};

export function ClientDocumentsRoute({ clientId, highlightDocId }: Props) {
  const { clients } = useApp();
  const client = clients.find((item) => item.id === clientId);

  if (!client) {
    return <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">Cliente não encontrado.</div>;
  }

  return <DocumentsView clientId={clientId} highlightDocId={highlightDocId} />;
}
