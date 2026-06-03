import { prisma } from "@/shared/prisma/client";
import { notFound } from "@/shared/http/errors";
import type { Prisma } from "@prisma/client";

export async function listTasks() {
  return prisma.task.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) throw notFound("Tarefa não encontrada");

  return task;
}

export async function createTask(data: Prisma.TaskUncheckedCreateInput) {
  return prisma.task.create({ data });
}

export async function updateTask(id: string, data: Prisma.TaskUncheckedUpdateInput) {
  await getTaskById(id);

  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(id: string) {
  await getTaskById(id);

  await prisma.task.delete({ where: { id } });
}
