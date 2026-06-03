import type { AuthCredentials, AuthRepository, Session } from "@/types";
import { ApiError, getSessionRequest, signInRequest, signOutRequest } from "@/lib/api";

const SESSION_KEY = "legalhub.session";

function readStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function persistSession(session: Session) {
  const storage = readStorage();
  if (!storage) return;

  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  const storage = readStorage();
  if (!storage) return;

  storage.removeItem(SESSION_KEY);
}

function loadSession() {
  const storage = readStorage();
  if (!storage) return null;

  const raw = storage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export const authRepository: AuthRepository = {
  async signIn(credentials: AuthCredentials) {
    const session = await signInRequest(credentials);
    persistSession(session);
    return session;
  },

  async signOut() {
    const session = loadSession();

    if (session) {
      try {
        await signOutRequest(session.token);
      } catch {
        // Ignore logout failures and clear local session anyway.
      }
    }

    clearSession();
  },

  async getSession() {
    const session = loadSession();

    if (!session) return null;

    try {
      const remoteSession = await getSessionRequest(session.token);
      persistSession(remoteSession);
      return remoteSession;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
      }

      return null;
    }
  },
};
