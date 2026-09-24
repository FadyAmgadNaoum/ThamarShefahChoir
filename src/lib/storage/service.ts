import fs from "fs";
import path from "path";

/**
 * Universal Audio & Media Extension and MIME Dictionary
 * Retains exact original extensions for all audio recordings & music sheets.
 */
export const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".flac",
  ".wma",
  ".aiff",
  ".aif",
  ".alac",
  ".opus",
  ".mid",
  ".midi",
  ".weba",
  ".webm",
  ".caf",
  ".mp4",
]);

export const SUPPORTED_SHEET_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".mxl",
  ".xml",
  ".musicxml",
]);

const MIME_MAP: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".oga": "audio/ogg",
  ".flac": "audio/flac",
  ".wma": "audio/x-ms-wma",
  ".aiff": "audio/aiff",
  ".aif": "audio/aiff",
  ".alac": "audio/alac",
  ".opus": "audio/opus",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".weba": "audio/webm",
  ".webm": "audio/webm",
  ".caf": "audio/x-caf",
  ".mp4": "audio/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mxl": "application/vnd.recordare.musicxml+xml",
  ".musicxml": "application/vnd.recordare.musicxml+xml",
};

/**
 * Resolve Content-Type from filename or extension
 */
export function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
}

/**
 * Local file storage directory fallback for offline local dev and test environments
 */
const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".storage");

function ensureLocalStorageDir() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

/**
 * Validate audio upload extension & MIME type
 */
export function validateAudioFile(fileName: string, mimeType?: string): { valid: boolean; ext: string; error?: string } {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext) {
    return { valid: false, ext: "", error: "الملف يفتقر إلى صيغة / امتداد صالح" };
  }
  const isAudioExt = SUPPORTED_AUDIO_EXTENSIONS.has(ext);
  const isAudioMime = mimeType ? mimeType.startsWith("audio/") || mimeType === "application/octet-stream" : false;

  if (!isAudioExt && !isAudioMime) {
    return {
      valid: false,
      ext,
      error: `امتداد الملف (${ext}) غير مدعوم كتسجيل صوتي. الامتدادات المدعومة تشمل: mp3, wav, m4a, aac, ogg, flac, aiff, opus, midi, caf`,
    };
  }

  return { valid: true, ext };
}

/**
 * Validate sheet music upload extension & MIME type
 */
export function validateSheetFile(fileName: string, mimeType?: string): { valid: boolean; ext: string; error?: string } {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext) {
    return { valid: false, ext: "", error: "الملف يفتقر إلى صيغة / امتداد صالح" };
  }
  const isSheetExt = SUPPORTED_SHEET_EXTENSIONS.has(ext);
  const isSheetMime = mimeType ? mimeType === "application/pdf" || mimeType.startsWith("image/") : false;

  if (!isSheetExt && !isSheetMime) {
    return {
      valid: false,
      ext,
      error: `امتداد الملف (${ext}) غير مدعوم كنوتة موسيقية. الامتدادات المدعومة تشمل: pdf, png, jpg, webp, mxl`,
    };
  }

  return { valid: true, ext };
}

/**
 * Save file to Cloudflare R2 or local filesystem fallback, preserving original extension
 */
export async function saveFile(params: {
  buffer: Buffer | Uint8Array;
  originalName: string;
  category: "audio" | "sheet";
  customKeyPrefix?: string;
}): Promise<{ fileKey: string; fileName: string; fileSize: number; mimeType: string }> {
  const { buffer, originalName, category, customKeyPrefix = category } = params;
  const ext = path.extname(originalName).toLowerCase();
  const rawBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now();

  // Construct secure, unique fileKey retaining exact original extension
  const fileKey = `${customKeyPrefix}_${timestamp}_${randomSuffix}${ext}`;
  const fileSize = buffer.byteLength;
  const mimeType = getMimeType(originalName);

  // Check for Cloudflare R2 bucket in global environment
  const cfEnv = (globalThis as any).env;
  if (cfEnv?.STORAGE) {
    try {
      await cfEnv.STORAGE.put(fileKey, buffer, {
        httpMetadata: {
          contentType: mimeType,
          contentDisposition: `inline; filename="${encodeURIComponent(originalName)}"`,
        },
      });
      return { fileKey, fileName: originalName, fileSize, mimeType };
    } catch (r2Err) {
      console.warn("Cloudflare R2 write error, falling back to local disk:", r2Err);
    }
  }

  // Fallback to local storage on disk
  ensureLocalStorageDir();
  const targetPath = path.join(LOCAL_STORAGE_DIR, fileKey);
  await fs.promises.writeFile(targetPath, Buffer.from(buffer));

  return {
    fileKey,
    fileName: originalName,
    fileSize,
    mimeType,
  };
}

export interface StreamFileResult {
  data: Buffer | ReadableStream | Uint8Array;
  contentType: string;
  contentLength: number;
  contentRange?: string;
  status: 200 | 206;
}

/**
 * Retrieve file stream with full HTTP Range request support (essential for audio scrubber seeking)
 */
export async function getFileWithRange(
  fileKey: string,
  rangeHeader?: string | null
): Promise<StreamFileResult | null> {
  const cfEnv = (globalThis as any).env;

  // 1. Try Cloudflare R2
  if (cfEnv?.STORAGE) {
    try {
      let r2Options: any = {};
      if (rangeHeader) {
        // Parse range e.g. "bytes=0-1048575"
        const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (matches) {
          const offset = parseInt(matches[1], 10);
          const length = matches[2] ? parseInt(matches[2], 10) - offset + 1 : undefined;
          r2Options.range = { offset, length };
        }
      }

      const obj = await cfEnv.STORAGE.get(fileKey, r2Options);
      if (obj) {
        const contentType = obj.httpMetadata?.contentType || getMimeType(fileKey);
        const totalSize = obj.size;
        const body = obj.body;

        if (rangeHeader && obj.range) {
          const start = (obj.range as any).offset || 0;
          const end = start + (obj.range as any).length - 1;
          return {
            data: body,
            contentType,
            contentLength: (obj.range as any).length,
            contentRange: `bytes ${start}-${end}/${totalSize}`,
            status: 206,
          };
        }

        return {
          data: body,
          contentType,
          contentLength: totalSize,
          status: 200,
        };
      }
    } catch (r2Err) {
      console.warn("Cloudflare R2 read error, checking local disk:", r2Err);
    }
  }

  // 2. Fallback to Local Disk
  ensureLocalStorageDir();
  const safeKey = path.basename(fileKey);
  const targetPath = path.join(LOCAL_STORAGE_DIR, safeKey);

  if (!fs.existsSync(targetPath)) {
    return null;
  }

  const stat = await fs.promises.stat(targetPath);
  const totalSize = stat.size;
  const contentType = getMimeType(safeKey);

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (start >= totalSize || end >= totalSize) {
      return null;
    }

    const chunkSize = end - start + 1;
    const fileHandle = await fs.promises.open(targetPath, "r");
    const buffer = Buffer.alloc(chunkSize);
    await fileHandle.read(buffer, 0, chunkSize, start);
    await fileHandle.close();

    return {
      data: buffer,
      contentType,
      contentLength: chunkSize,
      contentRange: `bytes ${start}-${end}/${totalSize}`,
      status: 206,
    };
  }

  const fileBuffer = await fs.promises.readFile(targetPath);
  return {
    data: fileBuffer,
    contentType,
    contentLength: totalSize,
    status: 200,
  };
}

/**
 * Delete a file from Cloudflare R2 or local filesystem
 */
export async function deleteFile(fileKey: string): Promise<boolean> {
  const cfEnv = (globalThis as any).env;
  if (cfEnv?.STORAGE) {
    try {
      await cfEnv.STORAGE.delete(fileKey);
    } catch (err) {
      console.warn("Failed to delete from R2:", err);
    }
  }

  ensureLocalStorageDir();
  const safeKey = path.basename(fileKey);
  const targetPath = path.join(LOCAL_STORAGE_DIR, safeKey);

  if (fs.existsSync(targetPath)) {
    try {
      await fs.promises.unlink(targetPath);
      return true;
    } catch (err) {
      console.warn("Failed to unlink local file:", err);
    }
  }

  return true;
}

