import assert from "node:assert/strict";
import test from "node:test";
import type { Task, TaskStatus } from "../types";
import { replaceTaskById, updateTaskStatusInList } from "./task-state";

function makeTask(id: string, status: TaskStatus): Task {
  return {
    id,
    title: `Prazo ${id}`,
    clientId: "client-1",
    clientName: "Cliente Teste",
    dueDate: "2026-06-10T00:00:00.000Z",
    status,
    priority: "normal",
    responsible: "IZ",
    createdAt: "2026-06-01T00:00:00.000Z",
  };
}

test("updates a dropped task status without removing tasks from other columns", () => {
  const tasks = [makeTask("task-1", "todo"), makeTask("task-2", "drafting"), makeTask("task-3", "review"), makeTask("task-4", "done")];

  const result = updateTaskStatusInList(tasks, "task-1", "review");

  assert.equal(result.changed, true);
  assert.equal(result.previousTask?.status, "todo");
  assert.deepEqual(
    result.tasks.map((task) => [task.id, task.status]),
    [
      ["task-1", "review"],
      ["task-2", "drafting"],
      ["task-3", "review"],
      ["task-4", "done"],
    ]
  );
  assert.equal(result.tasks.length, tasks.length);
});

test("keeps the current task list untouched when dropping in the same column", () => {
  const tasks = [makeTask("task-1", "todo"), makeTask("task-2", "drafting")];

  const result = updateTaskStatusInList(tasks, "task-1", "todo");

  assert.equal(result.changed, false);
  assert.equal(result.tasks, tasks);
});

test("reconciles one updated task and preserves every other card", () => {
  const tasks = [makeTask("task-1", "todo"), makeTask("task-2", "drafting"), makeTask("task-2", "drafting"), makeTask("task-3", "done")];
  const updatedTask = { ...makeTask("task-2", "review"), title: "Prazo reconciliado" };

  const result = replaceTaskById(tasks, updatedTask);

  assert.deepEqual(
    result.map((task) => [task.id, task.status, task.title]),
    [
      ["task-1", "todo", "Prazo task-1"],
      ["task-2", "review", "Prazo reconciliado"],
      ["task-3", "done", "Prazo task-3"],
    ]
  );
});
