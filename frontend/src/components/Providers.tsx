"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import { AppProvider } from "@/context/AppContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
}
