import { ClientDocumentsRoute } from "@/components/routes/ClientDocumentsRoute";

export default function Page({ params }: { params: { id: string } }) {
  return <ClientDocumentsRoute clientId={params.id} />;
}
