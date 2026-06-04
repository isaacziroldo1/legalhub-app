import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseBody, parseParams } from "@/shared/http/validate";
import { badRequest, unauthorized } from "@/shared/http/errors";
import {
  createTaskCommentSchema,
  createTaskSchema,
  taskAttachmentIdSchema,
  taskIdSchema,
  updateTaskSchema,
} from "./tasks.schemas";
import { createTask, deleteTask, getTaskById, getTaskDetail, listTasks, updateTask } from "./tasks.service";
import { createTaskComment, listTaskComments } from "./task-comments.service";
import {
  createTaskAttachment,
  deleteTaskAttachment,
  getTaskAttachmentStream,
  listTaskAttachments,
} from "./task-attachments.service";

function requireAuthUser(request: FastifyRequest) {
  if (!request.authUser) throw unauthorized();
  return request.authUser;
}

export async function tasksRoutes(app: FastifyInstance) {
  app.get("/", async () => listTasks());

  app.get("/:id/detail", async (request) => {
    const { id } = parseParams(taskIdSchema, request.params);
    return getTaskDetail(id);
  });

  app.get("/:id/comments", async (request) => {
    const { id } = parseParams(taskIdSchema, request.params);
    return listTaskComments(id);
  });

  app.post("/:id/comments", async (request, reply) => {
    const { id } = parseParams(taskIdSchema, request.params);
    const { body } = parseBody(createTaskCommentSchema, request.body);
    const user = requireAuthUser(request);
    const comment = await createTaskComment(id, user.id, body);

    return reply.code(201).send(comment);
  });

  app.get("/:id/attachments", async (request) => {
    const { id } = parseParams(taskIdSchema, request.params);
    return listTaskAttachments(id);
  });

  app.post("/:id/attachments", async (request, reply) => {
    const { id } = parseParams(taskIdSchema, request.params);
    const user = requireAuthUser(request);
    const file = await request.file();

    if (!file) throw badRequest("Arquivo não enviado");

    const buffer = await file.toBuffer();
    const originalName = file.filename || "arquivo";
    const mimeType = file.mimetype || "application/octet-stream";

    const attachment = await createTaskAttachment(id, user.id, {
      buffer,
      originalName,
      mimeType,
    });

    return reply.code(201).send(attachment);
  });

  app.get("/:id/attachments/:attachmentId/download", async (request, reply) => {
    const { id, attachmentId } = parseParams(taskAttachmentIdSchema, request.params);
    const { attachment, stream } = await getTaskAttachmentStream(id, attachmentId);

    return reply
      .header("Content-Type", attachment.mimeType)
      .header("Content-Disposition", `attachment; filename="${encodeURIComponent(attachment.originalName)}"`)
      .send(stream);
  });

  app.delete("/:id/attachments/:attachmentId", async (request, reply) => {
    const { id, attachmentId } = parseParams(taskAttachmentIdSchema, request.params);
    await deleteTaskAttachment(id, attachmentId);

    return reply.code(204).send();
  });

  app.get("/:id", async (request) => {
    const { id } = parseParams(taskIdSchema, request.params);
    return getTaskById(id);
  });

  app.post("/", async (request, reply) => {
    const input = parseBody(createTaskSchema, request.body);
    const task = await createTask(input);

    return reply.code(201).send(task);
  });

  app.patch("/:id", async (request) => {
    const { id } = parseParams(taskIdSchema, request.params);
    const input = parseBody(updateTaskSchema, request.body);

    return updateTask(id, input);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = parseParams(taskIdSchema, request.params);
    await deleteTask(id);

    return reply.code(204).send();
  });
}
