import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { buildKanbanColumns, moveTaskToStatus } from "./kanbanUtils";

const task = (id: string, status: Task["status"]): Task => ({
  id,
  title: `Task ${id}`,
  clientId: `client-${id}`,
  clientName: `Client ${id}`,
  dueDate: "2026-06-03T00:00:00.000Z",
  status,
  priority: "normal",
  responsible: "LH",
  createdAt: "2026-06-01T00:00:00.000Z",
});

describe("kanbanUtils", () => {
  it("moves a task to the target status without dropping other cards", () => {
    const tasks = [task("1", "todo"), task("2", "drafting"), task("3", "review"), task("4", "done")];

    const movedTasks = moveTaskToStatus(tasks, "1", "drafting");

    expect(movedTasks).toHaveLength(tasks.length);
    expect(movedTasks.find((item) => item.id === "1")?.status).toBe("drafting");
    expect(movedTasks.map((item) => item.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("builds columns with updated counts after a move", () => {
    const tasks = [task("1", "todo"), task("2", "drafting"), task("3", "review"), task("4", "review"), task("5", "done")];
    const movedTasks = moveTaskToStatus(tasks, "1", "drafting");

    const countsByStatus = Object.fromEntries(buildKanbanColumns(movedTasks).map((column) => [column.key, column.tasksList.length]));

    expect(countsByStatus).toEqual({
      todo: 0,
      drafting: 2,
      review: 2,
      done: 1,
    });
  });
});
