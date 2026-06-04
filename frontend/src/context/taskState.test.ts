import { describe, expect, it } from "vitest";
import type { Task } from "@/types";
import { applyTaskStatusOverrides, replaceTaskById } from "./taskState";

const baseTask: Task = {
  id: "task-1",
  title: "Contestacao",
  clientId: "client-1",
  clientName: "Cliente Teste",
  dueDate: "2026-06-10T00:00:00.000Z",
  status: "todo",
  priority: "normal",
  responsible: "IZ",
  createdAt: "2026-06-01T00:00:00.000Z",
};

describe("replaceTaskById", () => {
  it("moves a task by replacing its status without changing the collection size", () => {
    const otherTask: Task = { ...baseTask, id: "task-2", title: "Recurso", status: "review" };
    const updatedTask: Task = { ...baseTask, status: "drafting" };

    const result = replaceTaskById([baseTask, otherTask], updatedTask);

    expect(result).toHaveLength(2);
    expect(result).toEqual([updatedTask, otherTask]);
  });

  it("collapses duplicate entries for the moved task into a single updated item", () => {
    const duplicatedTaskInPreviousColumn: Task = { ...baseTask, status: "todo" };
    const duplicatedTaskInTargetColumn: Task = { ...baseTask, status: "drafting" };
    const updatedTask: Task = { ...baseTask, status: "review" };

    const result = replaceTaskById([duplicatedTaskInPreviousColumn, duplicatedTaskInTargetColumn], updatedTask);

    expect(result).toEqual([updatedTask]);
  });
});

describe("applyTaskStatusOverrides", () => {
  it("renders a pending moved task in only its target status", () => {
    const otherTask: Task = { ...baseTask, id: "task-2", title: "Recurso", status: "review" };

    const result = applyTaskStatusOverrides([baseTask, otherTask], { [baseTask.id]: "drafting" });

    expect(result).toHaveLength(2);
    expect(result.filter((task) => task.id === baseTask.id)).toEqual([{ ...baseTask, status: "drafting" }]);
    expect(result.filter((task) => task.status === "todo")).toEqual([]);
    expect(result.filter((task) => task.status === "drafting")).toHaveLength(1);
  });
});
