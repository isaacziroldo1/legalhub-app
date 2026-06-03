import { ClientProntuarioRoute } from "@/components/routes/ClientProntuarioRoute";

export default function Page({ params }: { params: { id: string } }) {
  return <ClientProntuarioRoute clientId={params.id} />;
}
