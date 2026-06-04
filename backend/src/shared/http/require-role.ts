import type { FastifyReply, FastifyRequest } from "fastify";
import { forbidden, unauthorized } from "@/shared/http/errors";

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.authUser) {
      throw unauthorized();
    }

    if (!roles.includes(request.authUser.role)) {
      throw forbidden();
    }
  };
}
