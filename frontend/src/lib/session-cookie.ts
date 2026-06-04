export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "legalhub_token";

export function getSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.max(0, maxAgeSeconds),
  };
}
