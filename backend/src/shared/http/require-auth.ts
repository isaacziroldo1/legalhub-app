import type { FastifyReply, FastifyRequest } from "fastify";
import { getSession } from "@/modules/auth/auth.service";
import { getBearerToken } from "@/shared/http/auth";
import { unauthorized } from "@/shared/http/errors";

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const token = getBearerToken(request);

  if (!token) {
    throw unauthorized();
  }

  const session = await getSession(token);

  if (!session) {
    throw unauthorized("Sessão inválida");
  }

  request.authUser = session.user;
}
