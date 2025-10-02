import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

export async function saveFile(buffer: Buffer, originalName: string) {
  await ensureUploadDir();
  const ext = path.extname(originalName);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  return { name: originalName, url: `/uploads/${filename}`, path: filePath };
}
