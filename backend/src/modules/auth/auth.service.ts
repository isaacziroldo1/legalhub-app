import { prisma } from "@/shared/prisma/client";
import { env } from "@/env";
import { createJwt, verifyJwt } from "@/shared/auth/jwt";
import { verifyPassword } from "@/shared/auth/password";
import { unauthorized } from "@/shared/http/errors";

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw unauthorized("Credenciais inválidas");
  }

  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
  const token = createJwt({ sub: user.id, name: user.name, email: user.email, role: user.role }, env.JWT_SECRET, expiresAt);
  const payload = verifyJwt(token, env.JWT_SECRET);

  if (!payload) {
    throw unauthorized("Falha ao gerar sessão");
  }

  await prisma.session.create({
    data: {
      id: payload.jti,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getSession(token: string) {
  const payload = verifyJwt(token, env.JWT_SECRET);

  if (!payload) return null;

  const session = await prisma.session.findUnique({ where: { id: payload.jti }, include: { user: true } });

  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;

  return {
    token,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
  };
}

export async function signOut(token: string) {
  const payload = verifyJwt(token, env.JWT_SECRET);

  if (!payload) return;

  await prisma.session.updateMany({
    where: { id: payload.jti, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
