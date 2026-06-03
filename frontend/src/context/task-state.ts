import type { Task, TaskStatus } from "../types";

export function replaceTaskById(tasks: Task[], updatedTask: Task) {
  let replaced = false;

  return tasks.reduce<Task[]>((nextTasks, task) => {
    if (task.id !== updatedTask.id) {
      nextTasks.push(task);
      return nextTasks;
    }

    if (!replaced) {
      nextTasks.push(updatedTask);
      replaced = true;
    }

    return nextTasks;
  }, []);
}

export function updateTaskStatusInList(tasks: Task[], id: string, status: TaskStatus) {
  const previousTask = tasks.find((task) => task.id === id);

  if (!previousTask || previousTask.status === status) {
    return { tasks, previousTask, changed: false };
  }

  return {
    tasks: replaceTaskById(tasks, { ...previousTask, status }),
    previousTask,
    changed: true,
  };
}
