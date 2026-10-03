import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ValidationError } from "./errors";

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Validates magic file signatures (magic bytes) to prevent extension spoofing
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47 (0x89 'PNG')
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WebP: RIFF ... WEBP
  if (mimeType === "image/webp") {
    if (buffer.length < 12) return false;
    const isRiff = buffer.toString("ascii", 0, 4) === "RIFF";
    const isWebp = buffer.toString("ascii", 8, 12) === "WEBP";
    return isRiff && isWebp;
  }

  return false;
}

/**
 * Securely writes an uploaded file to storage
 */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  // 1. File Size Verification
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File exceeds maximum permitted size of 5MB (Uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    );
  }

  // 2. MIME Type Verification
  const mimeType = file.type.toLowerCase();
  const extension = ALLOWED_MIME_TYPES[mimeType];
  if (!extension) {
    throw new ValidationError(
      `Unsupported file type "${mimeType}". Only JPG, PNG, and WebP images are permitted.`
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 3. Magic Byte Verification (prevent extension spoofing like shell.php named image.png)
  if (!validateMagicBytes(buffer, mimeType)) {
    throw new ValidationError(
      "Corrupted or invalid image header detected. Magic signature does not match declared MIME type."
    );
  }

  // 4. Cryptographic Filename Generation (prevents path traversal and execution)
  const randomHex = crypto.randomBytes(16).toString("hex");
  const safeFilename = `${Date.now()}_${randomHex}${extension}`;

  // 5. Ensure Upload Directory Exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  // 6. Write to disk
  const filePath = path.join(uploadDir, safeFilename);
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${safeFilename}`;

  return {
    url: publicUrl,
    filename: safeFilename,
    mimeType,
    sizeBytes: file.size,
  };
}
