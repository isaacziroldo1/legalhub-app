import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/server-api";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function POST() {
  try {
    await backendFetch("/auth/logout", { method: "POST" });
  } catch {
    // Best effort logout on backend.
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
