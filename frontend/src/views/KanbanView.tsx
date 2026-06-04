"use client";

import { GripVertical } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { useApp } from "@/context/AppContext";
import type { Task, TaskStatus } from "@/types";

type Props = {
  clientId?: string;
  highlightTaskId?: string;
};

type KanbanColumn = {
  key: TaskStatus;
  name: string;
  tasksList: Task[];
};

type DraggedTask = {
  id: string;
  status: TaskStatus;
};

export function KanbanView({ clientId, highlightTaskId }: Props) {
  const { tasks, updateTaskStatus } = useApp();
  const [boardTasks, setBoardTasks] = useState<Task[]>(tasks);
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const updatingTaskIdsRef = useRef(new Set<string>());
  const [pendingTaskMoves, setPendingTaskMoves] = useState(0);
  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const openedHighlightRef = useRef<string | null>(null);

  useEffect(() => {
    if (tasks.length > 0) {
      setHasLoadedTasks(true);
      setBoardTasks(tasks);
      return;
    }

    setBoardTasks((current) => {
      if (current.length > 0 && (pendingTaskMoves > 0 || hasLoadedTasks)) return current;
      return tasks;
    });
  }, [hasLoadedTasks, pendingTaskMoves, tasks]);

  const scopedTasks = useMemo(() => (clientId ? boardTasks.filter((task) => task.clientId === clientId) : boardTasks), [boardTasks, clientId]);

  const columns = useMemo<KanbanColumn[]>(
    () => [
      { key: "todo", name: "A Fazer", tasksList: scopedTasks.filter((task) => task.status === "todo") },
      { key: "drafting", name: "Em Redação", tasksList: scopedTasks.filter((task) => task.status === "drafting") },
      { key: "review", name: "Revisão Interna", tasksList: scopedTasks.filter((task) => task.status === "review") },
      { key: "done", name: "Protocolado/Concluído", tasksList: scopedTasks.filter((task) => task.status === "done") },
    ],
    [scopedTasks]
  );

  const getNextStatus = (status: TaskStatus): TaskStatus => {
    if (status === "todo") return "drafting";
    if (status === "drafting") return "review";
    if (status === "review") return "done";
    return "done";
  };

  const getPreviousStatus = (status: TaskStatus): TaskStatus => {
    if (status === "done") return "review";
    if (status === "review") return "drafting";
    if (status === "drafting") return "todo";
    return "todo";
  };

  const formatDeadline = (value: string) => {
    const diff = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Vencido há ${Math.abs(diff)} dia(s)`;
    if (diff === 0) return "Vence hoje";
    return `Vence em ${diff} dia(s)`;
  };

  const urgencyClass = (value: string) => {
    const diff = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "bg-red-100 text-red-700";
    if (diff <= 2) return "bg-amber-100 text-amber-700";
    return "bg-zinc-100 text-zinc-600";
  };

  useEffect(() => {
    if (!highlightTaskId) return;
    if (!scopedTasks.some((task) => task.id === highlightTaskId)) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(`task-${highlightTaskId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    if (openedHighlightRef.current !== highlightTaskId) {
      openedHighlightRef.current = highlightTaskId;
      setSelectedTaskId(highlightTaskId);
    }

    return () => cancelAnimationFrame(frame);
  }, [highlightTaskId, scopedTasks]);

  const selectedTask = useMemo(
    () => (selectedTaskId ? scopedTasks.find((task) => task.id === selectedTaskId) : undefined),
    [scopedTasks, selectedTaskId]
  );

  const handleDragStart = (event: DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask({ id: task.id, status: task.status });
    setDropError(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-legalhub-task-id", task.id);
    event.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    const isSameColumn = draggedTask?.status === status;
    event.preventDefault();
    event.dataTransfer.dropEffect = isSameColumn ? "none" : "move";
    setDragOverStatus(isSameColumn ? null : status);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;

    setDragOverStatus((current) => (current === status ? null : current));
  };

  const moveTaskToStatus = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    if (updatingTaskIdsRef.current.has(task.id)) return;

    updatingTaskIdsRef.current.add(task.id);
    setUpdatingTaskId(task.id);
    setDropError(null);
    setPendingTaskMoves((current) => current + 1);
    setBoardTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)));

    try {
      await updateTaskStatus(task.id, status);
    } catch (error) {
      console.error(error);
      setBoardTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
      setDropError("Não foi possível atualizar o status do prazo. Tente novamente.");
    } finally {
      updatingTaskIdsRef.current.delete(task.id);
      setPendingTaskMoves((current) => Math.max(0, current - 1));
      setUpdatingTaskId(null);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    event.stopPropagation();
    const taskId = event.dataTransfer.getData("application/x-legalhub-task-id") || event.dataTransfer.getData("text/plain") || draggedTask?.id;

    setDraggedTask(null);
    setDragOverStatus(null);

    const task = scopedTasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    await moveTaskToStatus(task, status);
  };

  return (
    <div className="flex flex-col gap-6">
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          initialTask={selectedTask}
          onClose={() => {
            setSelectedTaskId(null);
            openedHighlightRef.current = null;
          }}
        />
      )}
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-950">Quadro de Prazos</h2>
        <p className="text-sm text-zinc-500">
          Acompanhe prazos com base em estado e data real de vencimento{clientId ? " para este cliente." : "."} Arraste um prazo entre colunas para atualizar seu status.
        </p>
        {dropError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{dropError}</div>}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.key}
            aria-label={`Coluna ${column.name}`}
            data-task-status={column.key}
            onDragOver={(event) => handleDragOver(event, column.key)}
            onDragLeave={(event) => handleDragLeave(event, column.key)}
            onDrop={(event) => void handleDrop(event, column.key)}
            className={`flex min-h-48 flex-col gap-4 rounded-xl border p-4 transition ${dragOverStatus === column.key ? "border-orange-400 bg-orange-50" : "border-zinc-200 bg-zinc-50"}`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-zinc-900">{column.name}</span>
              <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-700">{column.tasksList.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {column.tasksList.map((task) => {
                const isDragging = draggedTask?.id === task.id;
                const isUpdating = updatingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    data-task-id={task.id}
                    className={`flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-orange-200 hover:shadow-md ${highlightTaskId === task.id ? "ring-2 ring-orange-400" : ""} ${isDragging || isUpdating ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        aria-grabbed={isDragging}
                        draggable={!isUpdating}
                        onDragStart={(event) => handleDragStart(event, task)}
                        onDragEnd={() => {
                          setDraggedTask(null);
                          setDragOverStatus(null);
                        }}
                        className="mt-0.5 flex cursor-grab items-center rounded p-0.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing"
                        aria-label={`Arrastar prazo ${task.title}`}
                        title="Arrastar para outra coluna"
                      >
                        <GripVertical size={14} />
                      </div>
                      <div
                        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-3"
                        onDoubleClick={() => setSelectedTaskId(task.id)}
                        title="Duplo clique para abrir detalhes"
                      >
                        <span className="text-xs font-bold leading-tight text-zinc-900">{task.title}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">👤</span>
                          <span className="text-xs font-bold text-orange-500">{task.clientName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold ${urgencyClass(task.dueDate)}`}>
                            <span>📅</span> {formatDeadline(task.dueDate)}
                          </span>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">{task.responsible}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={(event) => {
                          event.stopPropagation();
                          void moveTaskToStatus(task, getPreviousStatus(task.status));
                        }}
                        className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={(event) => {
                          event.stopPropagation();
                          void moveTaskToStatus(task, getNextStatus(task.status));
                        }}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Avançar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
