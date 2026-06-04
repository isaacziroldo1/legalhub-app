"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useApp } from "@/context/AppContext";
import type { Task, TaskStatus } from "@/types";
import { buildKanbanColumns, getNextStatus, getPreviousStatus, getTaskStatusFromElement } from "./kanbanUtils";

type Props = {
  clientId?: string;
  highlightTaskId?: string;
};

type DraggedTask = {
  id: string;
  status: TaskStatus;
};

export function KanbanView({ clientId, highlightTaskId }: Props) {
  const { tasks, updateTaskStatus } = useApp();
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const handledDropTaskIdRef = useRef<string | null>(null);
  const lastDragOverStatusRef = useRef<TaskStatus | null>(null);
  const mouseDraggedTaskRef = useRef<Task | null>(null);

  const scopedTasks = useMemo(() => (clientId ? tasks.filter((task) => task.clientId === clientId) : tasks), [clientId, tasks]);

  const columns = useMemo(() => buildKanbanColumns(scopedTasks), [scopedTasks]);

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

    return () => cancelAnimationFrame(frame);
  }, [highlightTaskId, scopedTasks]);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask({ id: task.id, status: task.status });
    lastDragOverStatusRef.current = null;
    setDropError(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-legalhub-task-id", task.id);
    event.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    const isSameColumn = draggedTask?.status === status;
    event.preventDefault();
    event.dataTransfer.dropEffect = isSameColumn ? "none" : "move";
    lastDragOverStatusRef.current = isSameColumn ? null : status;
    setDragOverStatus(isSameColumn ? null : status);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;

    setDragOverStatus((current) => (current === status ? null : current));
  };

  const markDropHandled = (taskId: string) => {
    handledDropTaskIdRef.current = taskId;
    window.setTimeout(() => {
      if (handledDropTaskIdRef.current === taskId) handledDropTaskIdRef.current = null;
    }, 250);
  };

  const moveTaskToStatus = async (task: Task, status: TaskStatus) => {
    setUpdatingTaskId(task.id);
    setDropError(null);

    try {
      await updateTaskStatus(task.id, status);
    } catch (error) {
      console.error(error);
      setDropError("Não foi possível atualizar o status do prazo. Tente novamente.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("application/x-legalhub-task-id") || event.dataTransfer.getData("text/plain") || draggedTask?.id;

    setDraggedTask(null);
    setDragOverStatus(null);
    lastDragOverStatusRef.current = null;

    const task = scopedTasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    if (handledDropTaskIdRef.current === task.id) return;

    markDropHandled(task.id);

    await moveTaskToStatus(task, status);
  };

  const handleDragEnd = async (event: DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(null);
    setDragOverStatus(null);

    if (handledDropTaskIdRef.current === task.id) {
      handledDropTaskIdRef.current = null;
      lastDragOverStatusRef.current = null;
      return;
    }

    const elementTargetStatus = getTaskStatusFromElement(document.elementFromPoint(event.clientX, event.clientY));
    const targetStatus = elementTargetStatus ?? lastDragOverStatusRef.current;
    lastDragOverStatusRef.current = null;
    if (!targetStatus || targetStatus === task.status) return;

    await moveTaskToStatus(task, targetStatus);
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>, task: Task) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button")) return;

    mouseDraggedTaskRef.current = task;
    lastDragOverStatusRef.current = null;
    setDraggedTask({ id: task.id, status: task.status });
    setDropError(null);
  };

  const handleMouseOverColumn = (status: TaskStatus) => {
    const task = mouseDraggedTaskRef.current;
    if (!task) return;

    const targetStatus = task.status === status ? null : status;
    lastDragOverStatusRef.current = targetStatus;
    setDragOverStatus(targetStatus);
  };

  const handleMouseUp = async (event: ReactMouseEvent<HTMLDivElement>, status: TaskStatus) => {
    const task = mouseDraggedTaskRef.current;
    mouseDraggedTaskRef.current = null;
    setDraggedTask(null);
    setDragOverStatus(null);
    if (!task || handledDropTaskIdRef.current === task.id) return;

    const targetStatus = getTaskStatusFromElement(document.elementFromPoint(event.clientX, event.clientY)) ?? lastDragOverStatusRef.current ?? status;
    lastDragOverStatusRef.current = null;
    if (targetStatus === task.status) return;

    markDropHandled(task.id);
    await moveTaskToStatus(task, targetStatus);
  };

  return (
    <div className="flex select-none flex-col gap-6">
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
            onMouseMove={() => handleMouseOverColumn(column.key)}
            onMouseUp={(event) => void handleMouseUp(event, column.key)}
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
                    aria-grabbed={isDragging}
                    data-task-id={task.id}
                    draggable={false}
                    onMouseDown={(event) => handleMouseDown(event, task)}
                    onDragStart={(event) => handleDragStart(event, task)}
                    onDragEnd={(event) => void handleDragEnd(event, task)}
                    className={`flex cursor-grab flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition active:cursor-grabbing ${highlightTaskId === task.id ? "ring-2 ring-orange-400" : ""} ${isDragging || isUpdating ? "opacity-50" : ""}`}
                  >
                    <span className="text-xs font-bold leading-tight text-zinc-900">{task.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">👤</span>
                      <span className="text-xs font-bold text-orange-500">{task.clientName}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold ${urgencyClass(task.dueDate)}`}>
                        <span>📅</span> {formatDeadline(task.dueDate)}
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">{task.responsible}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button disabled={isUpdating} onClick={() => void updateTaskStatus(task.id, getPreviousStatus(task.status)).catch((error) => console.error(error))} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50">
                        Voltar
                      </button>
                      <button disabled={isUpdating} onClick={() => void updateTaskStatus(task.id, getNextStatus(task.status)).catch((error) => console.error(error))} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
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
