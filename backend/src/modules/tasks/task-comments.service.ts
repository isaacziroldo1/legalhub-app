import { prisma } from "@/shared/prisma/client";
import { notFound } from "@/shared/http/errors";

async function assertTaskExists(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { id: true } });
  if (!task) throw notFound("Tarefa não encontrada");
}

function toComment(comment: {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string };
}) {
  return {
    id: comment.id,
    taskId: comment.taskId,
    userId: comment.userId,
    userName: comment.user.name,
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

export async function listTaskComments(taskId: string) {
  await assertTaskExists(taskId);

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });

  return comments.map(toComment);
}

export async function createTaskComment(taskId: string, userId: string, body: string) {
  await assertTaskExists(taskId);

  const comment = await prisma.taskComment.create({
    data: { taskId, userId, body },
    include: { user: { select: { name: true } } },
  });

  return toComment(comment);
}

export async function getTaskCommentById(taskId: string, commentId: string) {
  const comment = await prisma.taskComment.findFirst({
    where: { id: commentId, taskId },
    include: { user: { select: { name: true } } },
  });

  if (!comment) throw notFound("Comentário não encontrado");

  return toComment(comment);
}
