import type { FastifyInstance } from "fastify";
import { parseBody, parseParams } from "@/shared/http/validate";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "./tasks.schemas";
import { createTask, deleteTask, getTaskById, listTasks, updateTask } from "./tasks.service";

export async function tasksRoutes(app: FastifyInstance) {
  app.get("/", async () => listTasks());

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
