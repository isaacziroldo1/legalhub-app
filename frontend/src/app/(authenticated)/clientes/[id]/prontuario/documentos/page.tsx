import { ClientDocumentsRoute } from "@/components/routes/ClientDocumentsRoute";

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { doc?: string };
}) {
  return <ClientDocumentsRoute clientId={params.id} highlightDocId={searchParams.doc} />;
}
