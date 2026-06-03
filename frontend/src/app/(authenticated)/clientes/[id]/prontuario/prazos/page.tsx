import { ClientPrazosRoute } from "@/components/routes/ClientPrazosRoute";

export default function Page({ params }: { params: { id: string } }) {
  return <ClientPrazosRoute clientId={params.id} />;
}
