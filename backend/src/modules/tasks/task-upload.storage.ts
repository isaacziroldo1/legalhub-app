import { createReadStream, promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "@/env";
import { badRequest } from "@/shared/http/errors";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt"]);

const STORED_NAME_PATTERN = /^[a-f0-9-]{36}\.(pdf|docx|txt)$/;

export function assertSafeStoredName(storedName: string) {
  if (!STORED_NAME_PATTERN.test(storedName)) {
    throw badRequest("Nome de arquivo armazenado inválido.");
  }
}

export function getUploadRoot() {
  return path.resolve(process.cwd(), env.UPLOAD_DIR);
}

export function getStoredFilePath(storedName: string) {
  assertSafeStoredName(storedName);
  return path.join(getUploadRoot(), storedName);
}

export async function ensureUploadDir() {
  await fs.mkdir(getUploadRoot(), { recursive: true });
}

export function validateUploadFile(fileName: string, mimeType: string, sizeBytes: number) {
  const extension = path.extname(fileName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw badRequest("Tipo de arquivo não permitido. Use PDF, DOCX ou TXT.");
  }

  const mimeAllowed = ALLOWED_MIME_TYPES.has(mimeType) || mimeType === "application/octet-stream";
  if (!mimeAllowed) {
    throw badRequest("MIME type não permitido para anexo.");
  }

  if (sizeBytes <= 0 || sizeBytes > env.MAX_UPLOAD_BYTES) {
    throw badRequest(`Arquivo excede o limite de ${Math.floor(env.MAX_UPLOAD_BYTES / (1024 * 1024))}MB.`);
  }
}

export async function saveUploadedFile(buffer: Buffer, originalName: string, mimeType: string) {
  validateUploadFile(originalName, mimeType, buffer.length);
  await ensureUploadDir();

  const extension = path.extname(originalName).toLowerCase();
  const storedName = `${randomUUID()}${extension}`;
  const storedPath = getStoredFilePath(storedName);

  await fs.writeFile(storedPath, buffer);

  return storedName;
}

export async function deleteStoredFile(storedName: string) {
  const storedPath = getStoredFilePath(storedName);

  try {
    await fs.unlink(storedPath);
  } catch {
    // ignore missing files on disk
  }
}

export function openStoredFileStream(storedName: string) {
  return createReadStream(getStoredFilePath(storedName));
}
