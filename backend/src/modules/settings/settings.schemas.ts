import { z } from "zod";

export const updateSettingsSchema = z.object({
  isSmartScanEnabled: z.boolean(),
});
