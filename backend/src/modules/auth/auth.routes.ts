import type { FastifyInstance } from "fastify";
import { getBearerToken } from "@/shared/http/auth";
import { parseBody } from "@/shared/http/validate";
import { loginSchema } from "./auth.schemas";
import { getSession, signIn, signOut } from "./auth.service";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const input = parseBody(loginSchema, request.body);
    const session = await signIn(input.email, input.password);

    return reply.code(200).send(session);
  });

  app.get("/session", async (request, reply) => {
    const token = getBearerToken(request);

    if (!token) {
      return reply.code(401).send({ message: "Não autorizado" });
    }

    const session = await getSession(token);

    if (!session) {
      return reply.code(401).send({ message: "Sessão inválida" });
    }

    return reply.code(200).send(session);
  });

  app.post("/logout", async (request, reply) => {
    const token = getBearerToken(request);

    if (token) {
      await signOut(token);
    }

    return reply.code(204).send();
  });
}
