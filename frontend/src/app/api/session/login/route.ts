import { NextResponse } from "next/server";
import { getApiInternalUrl } from "@/lib/server-api";
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/session-cookie";

type BackendSession = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  expiresAt: string | number;
};

export async function POST(request: Request) {
  const credentials = await request.json();
  const response = await fetch(`${getApiInternalUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as BackendSession | { message?: string } | null;

  if (!response.ok) {
    return NextResponse.json(payload ?? { message: "Falha no login" }, { status: response.status });
  }

  const session = payload as BackendSession;
  const expiresAtMs =
    typeof session.expiresAt === "number" ? session.expiresAt : new Date(session.expiresAt).getTime();
  const maxAgeSeconds = Math.floor((expiresAtMs - Date.now()) / 1000);

  const jsonResponse = NextResponse.json({
    user: session.user,
    expiresAt: expiresAtMs,
  });

  jsonResponse.cookies.set(SESSION_COOKIE_NAME, session.token, getSessionCookieOptions(maxAgeSeconds));

  return jsonResponse;
}
