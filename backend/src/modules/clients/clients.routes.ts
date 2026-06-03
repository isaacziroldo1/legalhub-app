import type { FastifyInstance } from "fastify";
import { parseBody, parseParams } from "@/shared/http/validate";
import { clientIdSchema, createClientSchema, updateClientSchema } from "./clients.schemas";
import { createClient, deleteClient, getClientById, listClients, updateClient } from "./clients.service";

export async function clientsRoutes(app: FastifyInstance) {
  app.get("/", async () => listClients());

  app.get("/:id", async (request) => {
    const { id } = parseParams(clientIdSchema, request.params);
    return getClientById(id);
  });

  app.post("/", async (request, reply) => {
    const input = parseBody(createClientSchema, request.body);
    const client = await createClient(input);

    return reply.code(201).send(client);
  });

  app.patch("/:id", async (request) => {
    const { id } = parseParams(clientIdSchema, request.params);
    const input = parseBody(updateClientSchema, request.body);

    return updateClient(id, input);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = parseParams(clientIdSchema, request.params);
    await deleteClient(id);

    return reply.code(204).send();
  });
}
