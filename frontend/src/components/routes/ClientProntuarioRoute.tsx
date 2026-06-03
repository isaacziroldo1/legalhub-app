"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ClientDrawer } from "@/components/ClientDrawer";
import { ClientsView } from "@/views/ClientsView";

type Props = {
  clientId: string;
};

export function ClientProntuarioRoute({ clientId }: Props) {
  const router = useRouter();
  const { clients } = useApp();
  const client = clients.find((item) => item.id === clientId);

  if (!client) {
    return <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">Cliente não encontrado.</div>;
  }

  return (
    <>
      <ClientsView highlightClientId={clientId} />
      <ClientDrawer client={client} onClose={() => router.push("/?view=clients")} />
    </>
  );
}
