"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppState, Client, DocumentItem, Task } from "@/types";
import { useAuth } from "@/auth/useAuth";
import {
  createClientRequest,
  createDocumentRequest,
  createTaskRequest,
  deleteClientRequest,
  deleteDocumentRequest,
  deleteTaskRequest,
  loadAppStateRequest,
  updateClientRequest,
  updateDocumentRequest,
  updateSettingsRequest,
  updateTaskRequest,
} from "@/lib/api";

const EMPTY_STATE: AppState = {
  clients: [],
  tasks: [],
  documents: [],
  settings: { isSmartScanEnabled: false },
};

function replaceTaskById(tasks: Task[], updatedTask: Task) {
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

interface AppContextType extends AppState {
  loading: boolean;
  toggleSmartScan: () => Promise<void>;
  addClient: (client: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, patch: Partial<Omit<Client, "id">>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedAt">) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  addDocument: (doc: Omit<DocumentItem, "id" | "uploadedAt">) => Promise<void>;
  updateDocumentMapping: (id: string, mapping: Record<string, string>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setState(EMPTY_STATE);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    loadAppStateRequest(session.token)
      .then((data) => {
        if (active) setState(data);
      })
      .catch((error) => {
        if (active) {
          console.error(error);
          setState(EMPTY_STATE);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, session]);

  const refreshState = async () => {
    if (!session) throw new Error("Sessão indisponível");
    setState(await loadAppStateRequest(session.token));
  };

  const addClient = async (client: Omit<Client, "id" | "createdAt">) => {
    if (!session) throw new Error("Sessão indisponível");
    await createClientRequest(session.token, client);
    await refreshState();
  };

  const updateClient = async (id: string, patch: Partial<Omit<Client, "id">>) => {
    if (!session) throw new Error("Sessão indisponível");
    await updateClientRequest(session.token, id, patch);
    await refreshState();
  };

  const removeClient = async (id: string) => {
    if (!session) throw new Error("Sessão indisponível");
    await deleteClientRequest(session.token, id);
    await refreshState();
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "completedAt">) => {
    if (!session) throw new Error("Sessão indisponível");
    await createTaskRequest(session.token, task);
    await refreshState();
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    if (!session) throw new Error("Sessão indisponível");

    const previousTask = state.tasks.find((task) => task.id === id);
    if (previousTask?.status === status) return;

    if (previousTask) {
      setState((current) => ({
        ...current,
        tasks: replaceTaskById(current.tasks, { ...previousTask, status }),
      }));
    }

    try {
      const updatedTask = await updateTaskRequest(session.token, id, { status });
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

  const addDocument = async (doc: Omit<DocumentItem, "id" | "uploadedAt">) => {
    if (!session) throw new Error("Sessão indisponível");
    await createDocumentRequest(session.token, doc);
    await refreshState();
  };

  const updateDocumentMapping = async (id: string, mapping: Record<string, string>) => {
    if (!session) throw new Error("Sessão indisponível");
    await updateDocumentRequest(session.token, id, { autoMappedFields: mapping });
    await refreshState();
  };

  const value = useMemo(
    () => ({
      ...state,
      loading,
      toggleSmartScan: async () => {
        if (!session) throw new Error("Sessão indisponível");

        await updateSettingsRequest(session.token, !state.settings.isSmartScanEnabled);
        await refreshState();
      },
      addClient,
      updateClient,
      removeClient,
      addTask,
      updateTaskStatus,
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
