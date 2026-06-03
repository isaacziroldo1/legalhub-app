// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { Task, TaskStatus } from "@/types";
import { buildKanbanColumns, getNextStatus, getPreviousStatus, getTaskStatusFromElement } from "./kanbanUtils";

function makeTask(id: string, status: TaskStatus): Task {
  return {
    id,
    status,
    title: `Task ${id}`,
    clientId: "client-1",
    clientName: "Cliente Teste",
    dueDate: "2026-06-10",
    priority: "normal",
    responsible: "CT",
    createdAt: "2026-06-01T00:00:00.000Z",
  };
}

describe("kanbanUtils", () => {
  it("builds one column per task status without duplicating tasks", () => {
    const columns = buildKanbanColumns([makeTask("task-1", "todo"), makeTask("task-2", "drafting"), makeTask("task-3", "review"), makeTask("task-4", "done")]);

    expect(columns.map((column) => column.key)).toEqual(["todo", "drafting", "review", "done"]);
    expect(columns.map((column) => column.tasksList.map((task) => task.id))).toEqual([["task-1"], ["task-2"], ["task-3"], ["task-4"]]);
  });

  it("keeps next and previous status navigation inside kanban bounds", () => {
    expect(getNextStatus("todo")).toBe("drafting");
    expect(getNextStatus("drafting")).toBe("review");
    expect(getNextStatus("review")).toBe("done");
    expect(getNextStatus("done")).toBe("done");

    expect(getPreviousStatus("done")).toBe("review");
    expect(getPreviousStatus("review")).toBe("drafting");
    expect(getPreviousStatus("drafting")).toBe("todo");
    expect(getPreviousStatus("todo")).toBe("todo");
  });

  it("resolves the task status from the closest kanban column element", () => {
    document.body.innerHTML = `
      <section data-task-status="drafting">
        <article>
          <button id="nested-target">Move</button>
        </article>
      </section>
    `;

    expect(getTaskStatusFromElement(document.getElementById("nested-target"))).toBe("drafting");
    expect(getTaskStatusFromElement(document.body)).toBeNull();
  });
});
