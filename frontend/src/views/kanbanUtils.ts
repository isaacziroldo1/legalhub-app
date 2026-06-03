import type { Task, TaskStatus } from "@/types";

export type KanbanColumn = {
  key: TaskStatus;
  name: string;
  tasksList: Task[];
};

const TASK_STATUSES: TaskStatus[] = ["todo", "drafting", "review", "done"];

export const KANBAN_COLUMN_NAMES: Record<TaskStatus, string> = {
  todo: "A Fazer",
  drafting: "Em Redação",
  review: "Revisão Interna",
  done: "Protocolado/Concluído",
};

export function getNextStatus(status: TaskStatus): TaskStatus {
  const currentIndex = TASK_STATUSES.indexOf(status);
  return TASK_STATUSES[Math.min(currentIndex + 1, TASK_STATUSES.length - 1)] ?? "done";
}

export function getPreviousStatus(status: TaskStatus): TaskStatus {
  const currentIndex = TASK_STATUSES.indexOf(status);
  return TASK_STATUSES[Math.max(currentIndex - 1, 0)] ?? "todo";
}

export function buildKanbanColumns(tasks: Task[]): KanbanColumn[] {
  return TASK_STATUSES.map((status) => ({
    key: status,
    name: KANBAN_COLUMN_NAMES[status],
    tasksList: tasks.filter((task) => task.status === status),
  }));
}

export function isTaskStatus(value: string | null | undefined): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function getTaskStatusFromElement(element: Element | null): TaskStatus | null {
  const status = element?.closest<HTMLElement>("[data-task-status]")?.dataset.taskStatus;
  return isTaskStatus(status) ? status : null;
}
