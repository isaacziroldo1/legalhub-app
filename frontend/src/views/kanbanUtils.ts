import type { Task, TaskStatus } from "../types";

export type KanbanColumn = {
  key: TaskStatus;
  name: string;
  tasksList: Task[];
};

export const KANBAN_COLUMN_DEFINITIONS: Array<Pick<KanbanColumn, "key" | "name">> = [
  { key: "todo", name: "A Fazer" },
  { key: "drafting", name: "Em Redação" },
  { key: "review", name: "Revisão Interna" },
  { key: "done", name: "Protocolado/Concluído" },
];

export function buildKanbanColumns(tasks: Task[]): KanbanColumn[] {
  return KANBAN_COLUMN_DEFINITIONS.map((column) => ({
    ...column,
    tasksList: tasks.filter((task) => task.status === column.key),
  }));
}

export function moveTaskToStatus(tasks: Task[], taskId: string, status: TaskStatus) {
  return tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
}
