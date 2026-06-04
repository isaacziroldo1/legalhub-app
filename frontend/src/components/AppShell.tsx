"use client";

import { useState, type ReactNode } from "react";
import { Settings2 } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { useApp } from "@/context/AppContext";
import type { ViewKey } from "@/types";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ClientModal } from "@/components/ClientModal";
import { TaskModal } from "@/components/TaskModal";
import { UploadModal } from "@/components/UploadModal";
import { DashboardView } from "@/views/DashboardView";
import { ClientsView } from "@/views/ClientsView";
import { KanbanView } from "@/views/KanbanView";
import { DocumentsView } from "@/views/DocumentsView";

type Props = {
  currentView?: ViewKey;
  onViewChange?: (view: ViewKey) => void;
  onReturnHome?: () => void;
  initialView?: ViewKey;
  mainContent?: ReactNode;
  children?: ReactNode;
  highlightTaskId?: string;
  highlightDocId?: string;
};

const APP_VIEWS: ViewKey[] = ["dashboard", "clients", "kanban", "documents"];

function isAppView(view: ViewKey): view is "dashboard" | "clients" | "kanban" | "documents" {
  return APP_VIEWS.includes(view);
}

export function AppShell({ currentView: controlledView, onViewChange, onReturnHome, initialView = "dashboard", mainContent, children, highlightTaskId, highlightDocId }: Props) {
  const { user } = useAuth();
  const { clients, addClient, addTask, addDocument, toggleSmartScan, settings } = useApp();
  const isAdmin = user?.role === "admin";
  const [internalView, setInternalView] = useState<ViewKey>(initialView);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const currentView = controlledView ?? internalView;
  const setCurrentView = onViewChange ?? setInternalView;

  const quickAction = () => {
    if (currentView === "clients") setShowNewClient(true);
    else if (currentView === "documents") setShowUpload(true);
    else setShowNewTask(true);
  };

  const defaultMain = (
    <>
      {currentView === "dashboard" && <DashboardView />}
      {currentView === "clients" && <ClientsView />}
      {currentView === "kanban" && <KanbanView highlightTaskId={highlightTaskId} />}
      {currentView === "documents" && <DocumentsView highlightDocId={highlightDocId} />}
    </>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentView={isAppView(currentView) ? currentView : "clients"}
        onNavigate={setCurrentView}
        onReturnHome={onReturnHome ?? (() => setCurrentView("dashboard"))}
      />
      <div className="flex min-h-screen flex-1 flex-col overflow-y-auto">
        <Header currentView={isAppView(currentView) ? currentView : "clients"} onQuickAction={quickAction} />
        <main className="flex-1 p-8">{mainContent ?? defaultMain}</main>
      </div>

      {isAdmin && (
        <button
          onClick={() => void toggleSmartScan().catch((error) => console.error(error))}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 shadow-xl hover:bg-zinc-50"
        >
          <Settings2 size={14} /> SmartScan: {settings.isSmartScanEnabled ? "ON" : "OFF"}
        </button>
      )}

      {showNewClient && (
        <ClientModal
          onClose={() => setShowNewClient(false)}
          onSubmit={async (payload) => {
            await addClient(payload);
            setShowNewClient(false);
            setCurrentView("clients");
          }}
        />
      )}
      {showNewTask && (
        <TaskModal
          clients={clients}
          onClose={() => setShowNewTask(false)}
          onSubmit={async (payload) => {
            await addTask(payload);
            setShowNewTask(false);
            setCurrentView("kanban");
          }}
        />
      )}
      {showUpload && (
        <UploadModal
          clients={clients}
          onClose={() => setShowUpload(false)}
          onSubmit={async (payload) => {
            await addDocument(payload);
            setShowUpload(false);
            setCurrentView("documents");
          }}
        />
      )}

      {children}
    </div>
  );
}
