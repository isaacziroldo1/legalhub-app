import type { AppSettings, AppState, Client, DocumentItem, Session, Task } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api").replace(/\/$/, "");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const { token, body, headers, ...init } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Falha na requisição");
  }

  return payload as T;
}

function normalizeDocument(document: DocumentItem & { autoMappedFields?: Record<string, string> | null; clientId?: string | null }) {
  return {
    ...document,
    autoMappedFields: document.autoMappedFields ?? undefined,
    clientId: document.clientId ?? undefined,
  };
}

function normalizeTask(task: Task & { completedAt?: string | null }) {
  return {
    ...task,
    completedAt: task.completedAt ?? undefined,
  };
}

function normalizeAppState(payload: {
  clients: Client[];
  tasks: Array<Task & { completedAt?: string | null }>;
  documents: Array<DocumentItem & { autoMappedFields?: Record<string, string> | null; clientId?: string | null }>;
  settings: AppSettings;
}): AppState {
  return {
    clients: payload.clients,
    tasks: payload.tasks.map(normalizeTask),
    documents: payload.documents.map(normalizeDocument),
    settings: payload.settings,
  };
}

export async function signInRequest(credentials: { email: string; password: string }) {
  return requestJson<Session>("/auth/login", { method: "POST", body: credentials });
}

export async function getSessionRequest(token: string) {
  return requestJson<Session>("/auth/session", { token, method: "GET" });
}

export async function signOutRequest(token: string) {
  return requestJson<void>("/auth/logout", { token, method: "POST" });
}

export async function loadAppStateRequest(token: string) {
  const [clients, tasks, documents, settings] = await Promise.all([
    requestJson<Client[]>("/clients", { token }),
    requestJson<Array<Task & { completedAt?: string | null }>>("/tasks", { token }),
    requestJson<Array<DocumentItem & { autoMappedFields?: Record<string, string> | null; clientId?: string | null }>>("/documents", { token }),
    requestJson<AppSettings>("/settings", { token }),
  ]);

  return normalizeAppState({ clients, tasks, documents, settings });
}

export async function createClientRequest(token: string, client: Omit<Client, "id" | "createdAt">) {
  return requestJson<Client>("/clients", { token, method: "POST", body: client });
}

export async function updateClientRequest(token: string, id: string, patch: Partial<Omit<Client, "id">>) {
  return requestJson<Client>(`/clients/${id}`, { token, method: "PATCH", body: patch });
}

export async function deleteClientRequest(token: string, id: string) {
  return requestJson<void>(`/clients/${id}`, { token, method: "DELETE" });
}

export async function createTaskRequest(token: string, task: Omit<Task, "id" | "createdAt" | "completedAt">) {
  const createdTask = await requestJson<Task & { completedAt?: string | null }>("/tasks", { token, method: "POST", body: task });
  return normalizeTask(createdTask);
}

export async function updateTaskRequest(token: string, id: string, patch: Partial<Omit<Task, "id">>) {
  const updatedTask = await requestJson<Task & { completedAt?: string | null }>(`/tasks/${id}`, { token, method: "PATCH", body: patch });
  return normalizeTask(updatedTask);
}

export async function deleteTaskRequest(token: string, id: string) {
  return requestJson<void>(`/tasks/${id}`, { token, method: "DELETE" });
}

export async function createDocumentRequest(token: string, document: Omit<DocumentItem, "id" | "uploadedAt">) {
  return requestJson<DocumentItem>("/documents", { token, method: "POST", body: document });
}

export async function updateDocumentRequest(token: string, id: string, patch: Partial<Omit<DocumentItem, "id">>) {
  return requestJson<DocumentItem>(`/documents/${id}`, { token, method: "PATCH", body: patch });
}

export async function deleteDocumentRequest(token: string, id: string) {
  return requestJson<void>(`/documents/${id}`, { token, method: "DELETE" });
}

export async function updateSettingsRequest(token: string, isSmartScanEnabled: boolean) {
  return requestJson<AppSettings>("/settings", { token, method: "PATCH", body: { isSmartScanEnabled } });
}

export { ApiError };
