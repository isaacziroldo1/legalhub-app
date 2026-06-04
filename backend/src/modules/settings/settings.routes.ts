import type { FastifyInstance } from "fastify";
import { requireRole } from "@/shared/http/require-role";
import { parseBody } from "@/shared/http/validate";
import { updateSettingsSchema } from "./settings.schemas";
import { getSettings, updateSettings } from "./settings.service";

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/", async () => getSettings());

  app.patch("/", { preHandler: requireRole("admin") }, async (request) => {
    const input = parseBody(updateSettingsSchema, request.body);
    return updateSettings(input.isSmartScanEnabled);
  });
}
