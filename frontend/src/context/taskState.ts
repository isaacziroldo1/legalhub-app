import type { Task } from "@/types";

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
