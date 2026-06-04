import { prisma } from "@/shared/prisma/client";
import { conflict, notFound } from "@/shared/http/errors";
import type { Prisma } from "@prisma/client";

export async function listClients() {
  return prisma.client.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) throw notFound("Cliente não encontrado");

  return client;
}

export async function createClient(data: Prisma.ClientCreateInput) {
  const exists = await prisma.client.findUnique({ where: { cnpj: data.cnpj } });

  if (exists) throw conflict("CPF/CNPJ já cadastrado");

  return prisma.client.create({ data });
}

export async function updateClient(id: string, data: Prisma.ClientUpdateInput) {
  await getClientById(id);

  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: string) {
  await getClientById(id);

  await prisma.client.delete({ where: { id } });
}
