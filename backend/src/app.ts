import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "@/env";
import { ensureUploadDir } from "@/modules/tasks/task-upload.storage";
import { HttpError } from "@/shared/http/errors";
import { requireAuth } from "@/shared/http/require-auth";
import { authRoutes } from "@/modules/auth/auth.routes";
import { clientsRoutes } from "@/modules/clients/clients.routes";
import { tasksRoutes } from "@/modules/tasks/tasks.routes";
import { documentsRoutes } from "@/modules/documents/documents.routes";
import { settingsRoutes } from "@/modules/settings/settings.routes";

export function createApp() {
  const app = fastify({ logger: true });

  void ensureUploadDir();

  app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_BYTES,
    },
  });

  app.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((item) => item.trim()),
    credentials: true,
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes, { prefix: "/api/auth" });

  app.register(async (api) => {
    api.addHook("preHandler", requireAuth);
    api.register(clientsRoutes, { prefix: "/clients" });
    api.register(tasksRoutes, { prefix: "/tasks" });
    api.register(documentsRoutes, { prefix: "/documents" });
    api.register(settingsRoutes, { prefix: "/settings" });
  }, { prefix: "/api" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    app.log.error(error);
    return reply.code(500).send({ message: "Erro interno do servidor" });
  });

  return app;
}
