import { NextResponse } from "next/server";
import { backendFetch, getTokenFromCookies } from "@/lib/server-api";

type BackendSession = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  expiresAt: string | number;
};

export async function GET() {
  const token = await getTokenFromCookies();

  if (!token) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const response = await backendFetch("/auth/session", { method: "GET" });
  const payload = (await response.json().catch(() => null)) as BackendSession | { message?: string } | null;

  if (!response.ok) {
    return NextResponse.json(payload ?? { message: "Sessão inválida" }, { status: response.status });
  }

  const session = payload as BackendSession;
  const expiresAtMs =
    typeof session.expiresAt === "number" ? session.expiresAt : new Date(session.expiresAt).getTime();

  return NextResponse.json({
    user: session.user,
    expiresAt: expiresAtMs,
  });
}
