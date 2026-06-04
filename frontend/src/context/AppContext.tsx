"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, Client, DocumentItem, Task } from "@/types";
import { useAuth } from "@/auth/useAuth";
import { replaceTaskById } from "./taskState";
import { ApiError } from "@/lib/api";
import {
  createClientRequest,
  createDocumentRequest,
  createTaskCommentRequest,
  createTaskRequest,
  deleteClientRequest,
  deleteDocumentRequest,
  deleteTaskAttachmentRequest,
  fetchClientsRequest,
  fetchDocumentsRequest,
  loadAppStateRequest,
  updateClientRequest,
  updateDocumentRequest,
  updateSettingsRequest,
  updateTaskObservationsRequest,
  updateTaskRequest,
  uploadTaskAttachmentRequest,
} from "@/lib/api";
import type { TaskAttachment, TaskComment } from "@/types";

const EMPTY_STATE: AppState = {
  clients: [],
  tasks: [],
  documents: [],
  settings: { isSmartScanEnabled: false },
};

interface AppContextType extends AppState {
  loading: boolean;
  toggleSmartScan: () => Promise<void>;
  addClient: (client: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, patch: Partial<Omit<Client, "id">>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedAt">) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  updateTaskObservations: (id: string, observations: string) => Promise<Task>;
  addTaskComment: (taskId: string, body: string) => Promise<TaskComment>;
  uploadTaskAttachment: (taskId: string, file: File) => Promise<TaskAttachment>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  addDocument: (doc: Omit<DocumentItem, "id" | "uploadedAt">) => Promise<void>;
  updateDocumentMapping: (id: string, mapping: Record<string, string>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setState(EMPTY_STATE);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    loadAppStateRequest()
      .then((data) => {
        if (active) setState(data);
      })
      .catch((error) => {
        if (active) {
          console.error(error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, session]);

  const addClient = async (client: Omit<Client, "id" | "createdAt">) => {
    if (!session) throw new Error("Sessão indisponível");
    await createClientRequest(client);
    const clients = await fetchClientsRequest();
    setState((current) => ({ ...current, clients }));
  };

  const updateClient = async (id: string, patch: Partial<Omit<Client, "id">>) => {
    if (!session) throw new Error("Sessão indisponível");
    const updated = await updateClientRequest(id, patch);
    setState((current) => ({
      ...current,
      clients: current.clients.map((item) => (item.id === id ? updated : item)),
      tasks: current.tasks.map((task) =>
        task.clientId === id && patch.name ? { ...task, clientName: patch.name } : task
      ),
    }));
  };

  const removeClient = async (id: string) => {
    if (!session) throw new Error("Sessão indisponível");
    await deleteClientRequest(id);
    setState((current) => ({
      ...current,
      clients: current.clients.filter((item) => item.id !== id),
      tasks: current.tasks.filter((task) => task.clientId !== id),
      documents: current.documents.filter((doc) => doc.clientId !== id),
    }));
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "completedAt">) => {
    if (!session) throw new Error("Sessão indisponível");
    const created = await createTaskRequest(task);
    setState((current) => ({
      ...current,
      tasks: [created, ...current.tasks],
    }));
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    if (!session) throw new Error("Sessão indisponível");

    const previousTask = stateRef.current.tasks.find((task) => task.id === id);
    if (!previousTask) throw new Error("Prazo não encontrado");
    if (previousTask.status === status) return;

    if (previousTask) {
      setState((current) => ({
        ...current,
        tasks: replaceTaskById(current.tasks, { ...previousTask, status }),
      }));
    }

    try {
      const updatedTask = await updateTaskRequest(id, { status });
      setState((current) => ({
        ...current,
        tasks: replaceTaskById(current.tasks, updatedTask),
      }));
    } catch (error) {
      if (previousTask) {
        setState((current) => ({
          ...current,
          tasks: replaceTaskById(current.tasks, previousTask),
        }));
      }

      throw error;
    }
  };

  const updateTaskObservations = async (id: string, observations: string) => {
    if (!session) throw new Error("Sessão indisponível");

    const updatedTask = await updateTaskObservationsRequest(id, observations);
    setState((current) => ({
      ...current,
      tasks: replaceTaskById(current.tasks, updatedTask),
    }));

    return updatedTask;
  };

  const addTaskComment = async (taskId: string, body: string) => {
    if (!session) throw new Error("Sessão indisponível");
    return createTaskCommentRequest(taskId, body);
  };

  const uploadTaskAttachment = async (taskId: string, file: File) => {
    if (!session) throw new Error("Sessão indisponível");
    return uploadTaskAttachmentRequest(taskId, file);
  };

  const removeTaskAttachment = async (taskId: string, attachmentId: string) => {
    if (!session) throw new Error("Sessão indisponível");
    await deleteTaskAttachmentRequest(taskId, attachmentId);
  };

  const addDocument = async (doc: Omit<DocumentItem, "id" | "uploadedAt">) => {
    if (!session) throw new Error("Sessão indisponível");
    await createDocumentRequest(doc);
    const documents = await fetchDocumentsRequest();
    setState((current) => ({ ...current, documents }));
  };

  const updateDocumentMapping = async (id: string, mapping: Record<string, string>) => {
    if (!session) throw new Error("Sessão indisponível");
    const updated = await updateDocumentRequest(id, { autoMappedFields: mapping });
    setState((current) => ({
      ...current,
      documents: current.documents.map((item) => (item.id === id ? updated : item)),
    }));
  };

  const value = useMemo(
    () => ({
      ...state,
      loading,
      toggleSmartScan: async () => {
        if (!session) throw new Error("Sessão indisponível");

        try {
          const settings = await updateSettingsRequest(!state.settings.isSmartScanEnabled);
          setState((current) => ({ ...current, settings }));
        } catch (error) {
          if (error instanceof ApiError && error.status === 403) {
            throw new Error("Apenas administradores podem alterar as configurações do SmartScan.");
          }
          throw error;
        }
      },
      addClient,
      updateClient,
      removeClient,
      addTask,
      updateTaskStatus,
      updateTaskObservations,
      addTaskComment,
      uploadTaskAttachment,
      removeTaskAttachment,
      addDocument,
      updateDocumentMapping,
    }),
    [state, loading, session]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
