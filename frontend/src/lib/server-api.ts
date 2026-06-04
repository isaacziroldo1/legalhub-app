import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export function getApiInternalUrl() {
  return (process.env.API_INTERNAL_URL ?? "http://localhost:3001/api").replace(/\/$/, "");
}

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = await getTokenFromCookies();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${getApiInternalUrl()}${normalizedPath}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
