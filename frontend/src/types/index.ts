export interface Client {
  id: string;
  name: string;
  cnpj: string;
  status: "Ativo" | "Em Prospecção" | "Inativo";
  responsible: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  observations?: string;
  createdAt: string;
}

export type TaskStatus = "todo" | "drafting" | "review" | "done";
export type TaskPriority = "critical" | "high" | "normal";

export interface Task {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  responsible: string;
  observations?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface TaskDetailClient {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  status: string;
  responsible: string;
}

export interface TaskDetail extends Task {
  client: TaskDetailClient;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  variables: string[];
  autoMappedFields?: Record<string, string>;
  clientId?: string;
  uploadedAt: string;
}

export interface AppSettings {
  isSmartScanEnabled: boolean;
}

export interface AppState {
  clients: Client[];
  tasks: Task[];
  documents: DocumentItem[];
  settings: AppSettings;
}

export type ViewKey = "landing" | "login" | "dashboard" | "clients" | "kanban" | "documents";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: User["role"];
  iat: number;
  exp: number;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthRepository {
  signIn(credentials: AuthCredentials): Promise<Session>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
}
