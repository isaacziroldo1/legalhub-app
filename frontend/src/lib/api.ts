import type { AppSettings, AppState, Client, DocumentItem, Session, Task, TaskAttachment, TaskComment, TaskDetail } from "@/types";

const PROXY_BASE_URL = "/api/proxy";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
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
  const { body, headers, ...init } = options;

  const response = await fetch(`${PROXY_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
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

function normalizeTask(task: Task & { completedAt?: string | null; observations?: string | null }) {
  return {
    ...task,
    observations: task.observations ?? undefined,
    completedAt: task.completedAt ?? undefined,
  };
}

function normalizeTaskDetail(
  detail: TaskDetail & {
    completedAt?: string | null;
    observations?: string | null;
    dueDate?: string | Date;
    createdAt?: string | Date;
  }
) {
  return {
    ...normalizeTask({
      ...detail,
      dueDate: typeof detail.dueDate === "string" ? detail.dueDate : new Date(detail.dueDate as Date).toISOString(),
      createdAt: typeof detail.createdAt === "string" ? detail.createdAt : new Date(detail.createdAt as Date).toISOString(),
    }),
    client: detail.client,
    comments: detail.comments.map((comment) => ({
      ...comment,
      createdAt: typeof comment.createdAt === "string" ? comment.createdAt : new Date(comment.createdAt).toISOString(),
    })),
    attachments: detail.attachments.map((attachment) => ({
      ...attachment,
      createdAt: typeof attachment.createdAt === "string" ? attachment.createdAt : new Date(attachment.createdAt).toISOString(),
    })),
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
  const response = await fetch("/api/session/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Falha no login");
  }

  return payload as Session;
}

export async function getSessionRequest() {
  const response = await fetch("/api/session/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Sessão inválida");
  }

  return payload as Session;
}

export async function signOutRequest() {
  const response = await fetch("/api/session/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(response.status, payload?.message ?? "Falha ao encerrar sessão");
  }
}

export async function loadAppStateRequest() {
  const [clients, tasks, documents, settings] = await Promise.all([
    requestJson<Client[]>("/clients"),
    requestJson<Array<Task & { completedAt?: string | null }>>("/tasks"),
    requestJson<Array<DocumentItem & { autoMappedFields?: Record<string, string> | null; clientId?: string | null }>>("/documents"),
    requestJson<AppSettings>("/settings"),
  ]);

  return normalizeAppState({ clients, tasks, documents, settings });
}

export async function fetchClientsRequest() {
  return requestJson<Client[]>("/clients");
}

export async function fetchTasksRequest() {
  const tasks = await requestJson<Array<Task & { completedAt?: string | null }>>("/tasks");
  return tasks.map(normalizeTask);
}

export async function fetchDocumentsRequest() {
  const documents = await requestJson<Array<DocumentItem & { autoMappedFields?: Record<string, string> | null; clientId?: string | null }>>("/documents");
  return documents.map(normalizeDocument);
}

export async function fetchSettingsRequest() {
  return requestJson<AppSettings>("/settings");
}

export async function createClientRequest(client: Omit<Client, "id" | "createdAt">) {
  return requestJson<Client>("/clients", { method: "POST", body: client });
}

export async function updateClientRequest(id: string, patch: Partial<Omit<Client, "id">>) {
  return requestJson<Client>(`/clients/${id}`, { method: "PATCH", body: patch });
}

export async function deleteClientRequest(id: string) {
  return requestJson<void>(`/clients/${id}`, { method: "DELETE" });
}

export async function createTaskRequest(task: Omit<Task, "id" | "createdAt" | "completedAt">) {
  const createdTask = await requestJson<Task & { completedAt?: string | null }>("/tasks", { method: "POST", body: task });
  return normalizeTask(createdTask);
}

export async function updateTaskRequest(id: string, patch: Partial<Omit<Task, "id">>) {
  const updatedTask = await requestJson<Task & { completedAt?: string | null }>(`/tasks/${id}`, { method: "PATCH", body: patch });
  return normalizeTask(updatedTask);
}

export async function deleteTaskRequest(id: string) {
  return requestJson<void>(`/tasks/${id}`, { method: "DELETE" });
}

export async function fetchTaskDetailRequest(id: string) {
  const detail = await requestJson<TaskDetail & { completedAt?: string | null; observations?: string | null }>(`/tasks/${id}/detail`);
  return normalizeTaskDetail(detail);
}

export async function updateTaskObservationsRequest(id: string, observations: string) {
  const updatedTask = await requestJson<Task & { completedAt?: string | null; observations?: string | null }>(`/tasks/${id}`, {
    method: "PATCH",
    body: { observations },
  });
  return normalizeTask(updatedTask);
}

export async function createTaskCommentRequest(taskId: string, body: string) {
  const comment = await requestJson<TaskComment & { createdAt: string | Date }>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: { body },
  });
  return {
    ...comment,
    createdAt: typeof comment.createdAt === "string" ? comment.createdAt : new Date(comment.createdAt).toISOString(),
  };
}

export async function uploadTaskAttachmentRequest(taskId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PROXY_BASE_URL}/tasks/${taskId}/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Falha no upload do anexo");
  }

  const attachment = payload as TaskAttachment & { createdAt: string | Date };
  return {
    ...attachment,
    createdAt: typeof attachment.createdAt === "string" ? attachment.createdAt : new Date(attachment.createdAt).toISOString(),
  };
}

export async function downloadTaskAttachmentRequest(taskId: string, attachmentId: string) {
  const response = await fetch(`${PROXY_BASE_URL}/tasks/${taskId}/attachments/${attachmentId}/download`, {
    credentials: "include",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(response.status, payload?.message ?? "Falha ao baixar anexo");
  }

  return response.blob();
}

export async function deleteTaskAttachmentRequest(taskId: string, attachmentId: string) {
  return requestJson<void>(`/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" });
}

export async function createDocumentRequest(document: Omit<DocumentItem, "id" | "uploadedAt">) {
  return requestJson<DocumentItem>("/documents", { method: "POST", body: document });
}

export async function updateDocumentRequest(id: string, patch: Partial<Omit<DocumentItem, "id">>) {
  return requestJson<DocumentItem>(`/documents/${id}`, { method: "PATCH", body: patch });
}

export async function deleteDocumentRequest(id: string) {
  return requestJson<void>(`/documents/${id}`, { method: "DELETE" });
}

export async function updateSettingsRequest(isSmartScanEnabled: boolean) {
  return requestJson<AppSettings>("/settings", { method: "PATCH", body: { isSmartScanEnabled } });
}

export { ApiError };
