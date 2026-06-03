"use client";

import { useApp } from "@/context/AppContext";
import { ClientSectionLayout } from "@/components/ClientSectionLayout";
import { DocumentsView } from "@/views/DocumentsView";

type Props = {
  clientId: string;
};

export function ClientDocumentsRoute({ clientId }: Props) {
  const { clients } = useApp();
  const client = clients.find((item) => item.id === clientId);

  if (!client) {
    return <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">Cliente não encontrado.</div>;
  }

  return (
    <ClientSectionLayout clientId={clientId} activeSection="documentos">
      <DocumentsView clientId={clientId} />
    </ClientSectionLayout>
  );
}
