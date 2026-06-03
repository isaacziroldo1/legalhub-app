import type { FastifyInstance } from "fastify";
import { parseBody, parseParams } from "@/shared/http/validate";
import { createDocumentSchema, documentIdSchema, updateDocumentSchema } from "./documents.schemas";
import { createDocument, deleteDocument, getDocumentById, listDocuments, updateDocument } from "./documents.service";

export async function documentsRoutes(app: FastifyInstance) {
  app.get("/", async () => listDocuments());

  app.get("/:id", async (request) => {
    const { id } = parseParams(documentIdSchema, request.params);
    return getDocumentById(id);
  });

  app.post("/", async (request, reply) => {
    const input = parseBody(createDocumentSchema, request.body);
    const document = await createDocument(input);

    return reply.code(201).send(document);
  });

  app.patch("/:id", async (request) => {
    const { id } = parseParams(documentIdSchema, request.params);
    const input = parseBody(updateDocumentSchema, request.body);

    return updateDocument(id, input);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = parseParams(documentIdSchema, request.params);
    await deleteDocument(id);

    return reply.code(204).send();
  });
}
