import type { AuthCredentials, AuthRepository } from "@/types";
import { ApiError, getSessionRequest, signInRequest, signOutRequest } from "@/lib/api";

export const authRepository: AuthRepository = {
  async signIn(credentials: AuthCredentials) {
    return signInRequest(credentials);
  },

  async signOut() {
    try {
      await signOutRequest();
    } catch {
      // Ignore logout failures and clear local session anyway.
    }
  },

  async getSession() {
    try {
      return await getSessionRequest();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }

      return null;
    }
  },
};
