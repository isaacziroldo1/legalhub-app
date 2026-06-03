import { prisma } from "@/shared/prisma/client";

export async function getSettings() {
  return prisma.appSetting.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", isSmartScanEnabled: true },
  });
}

export async function updateSettings(isSmartScanEnabled: boolean) {
  return prisma.appSetting.upsert({
    where: { id: "global" },
    update: { isSmartScanEnabled },
    create: { id: "global", isSmartScanEnabled },
  });
}
