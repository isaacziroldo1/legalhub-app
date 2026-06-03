import { createHmac, randomUUID } from "node:crypto";

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export interface TokenPayload {
  sub: string;
  jti: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function createJwt(payload: Omit<TokenPayload, "iat" | "exp" | "jti">, secret: string, expiresAt: Date) {
  const header = { alg: "HS256", typ: "JWT" };
  const tokenPayload: TokenPayload = {
    ...payload,
    jti: randomUUID(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = createHmac("sha256", secret).update(`${headerPart}.${payloadPart}`).digest("base64url");

  return `${headerPart}.${payloadPart}.${signature}`;
}

export function verifyJwt(token: string, secret: string) {
  const [headerPart, payloadPart, signaturePart] = token.split(".");

  if (!headerPart || !payloadPart || !signaturePart) return null;

  const expectedSignature = createHmac("sha256", secret).update(`${headerPart}.${payloadPart}`).digest("base64url");

  if (expectedSignature !== signaturePart) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as TokenPayload;

    if (payload.exp * 1000 <= Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
