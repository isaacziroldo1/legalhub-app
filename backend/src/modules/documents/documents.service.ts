import { prisma } from "@/shared/prisma/client";
import { notFound } from "@/shared/http/errors";

type DocumentInput = {
  name: string;
  category: string;
  tags: string[];
  variables: string[];
  autoMappedFields?: Record<string, string>;
  clientId?: string | null;
};

type DocumentPatch = Partial<DocumentInput>;

type DocumentRecord = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

function parseJsonArray(value: string) {
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

function parseJsonRecord(value: string | null) {
  if (!value) return undefined;

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;

  return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"));
}

function serializeDocumentInput(data: DocumentPatch) {
  return {
    ...data,
    ...(data.tags ? { tags: JSON.stringify(data.tags) } : {}),
    ...(data.variables ? { variables: JSON.stringify(data.variables) } : {}),
    autoMappedFields: data.autoMappedFields ? JSON.stringify(data.autoMappedFields) : null,
    clientId: data.clientId ?? null,
  };
}

function toDocument(document: DocumentRecord) {
  return {
    ...document,
    tags: parseJsonArray(document.tags),
    variables: parseJsonArray(document.variables),
    autoMappedFields: parseJsonRecord(document.autoMappedFields),
    clientId: document.clientId ?? undefined,
  };
}

export async function listDocuments() {
  const documents = await prisma.document.findMany({ orderBy: { uploadedAt: "desc" } });
  return documents.map(toDocument);
}

export async function getDocumentById(id: string) {
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) throw notFound("Documento não encontrado");

  return toDocument(document);
}

export async function createDocument(data: DocumentInput) {
  const document = await prisma.document.create({ data: serializeDocumentInput(data) as never });

  return toDocument(document);
}

export async function updateDocument(id: string, data: DocumentPatch) {
  await getDocumentById(id);

  const document = await prisma.document.update({ where: { id }, data: serializeDocumentInput(data) as never });

  return toDocument(document);
}

export async function deleteDocument(id: string) {
  await getDocumentById(id);

  await prisma.document.delete({ where: { id } });
}
