import { prisma } from "@/shared/prisma/client";
import { notFound } from "@/shared/http/errors";
import { deleteStoredFile, openStoredFileStream, saveUploadedFile } from "./task-upload.storage";

async function assertTaskExists(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { id: true } });
  if (!task) throw notFound("Tarefa não encontrada");
}

function toAttachment(attachment: {
  id: string;
  taskId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}) {
  return {
    id: attachment.id,
    taskId: attachment.taskId,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    createdAt: attachment.createdAt,
  };
}

export async function listTaskAttachments(taskId: string) {
  await assertTaskExists(taskId);

  const attachments = await prisma.taskAttachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });

  return attachments.map(toAttachment);
}

export async function createTaskAttachment(taskId: string, uploadedById: string | undefined, file: { buffer: Buffer; originalName: string; mimeType: string }) {
  await assertTaskExists(taskId);

  const storedName = await saveUploadedFile(file.buffer, file.originalName, file.mimeType);

  try {
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        originalName: file.originalName,
        storedName,
        mimeType: file.mimeType,
        sizeBytes: file.buffer.length,
        uploadedById: uploadedById ?? null,
      },
    });

    return toAttachment(attachment);
  } catch (error) {
    await deleteStoredFile(storedName);
    throw error;
  }
}

export async function getTaskAttachmentById(taskId: string, attachmentId: string) {
  const attachment = await prisma.taskAttachment.findFirst({
    where: { id: attachmentId, taskId },
  });

  if (!attachment) throw notFound("Anexo não encontrado");

  return attachment;
}

export async function deleteTaskAttachment(taskId: string, attachmentId: string) {
  const attachment = await getTaskAttachmentById(taskId, attachmentId);

  await prisma.taskAttachment.delete({ where: { id: attachment.id } });
  await deleteStoredFile(attachment.storedName);
}

export function getTaskAttachmentStream(taskId: string, attachmentId: string) {
  return getTaskAttachmentById(taskId, attachmentId).then((attachment) => ({
    attachment,
    stream: openStoredFileStream(attachment.storedName),
  }));
}

export async function deleteAllTaskAttachmentFiles(taskId: string) {
  const attachments = await prisma.taskAttachment.findMany({ where: { taskId } });

  await Promise.all(attachments.map((item) => deleteStoredFile(item.storedName)));
}
