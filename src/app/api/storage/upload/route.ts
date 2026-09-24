import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { saveFile, validateAudioFile, validateSheetFile } from "@/lib/storage/service";

/**
 * POST /api/storage/upload
 * Securely uploads audio files (with original extension) or PDF/image sheet music
 * Restricted to ADMIN and SUPER_ADMIN
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json(
        { error: "رفع الملفات الصوتية والنوت الموسيقية صلاحية مقصورة على مسؤولي الكورال" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "audio";

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرسال أي ملف للرفع" }, { status: 400 });
    }

    const originalName = file.name || "unnamed";
    const mimeType = file.type;

    // Validate based on declared category
    if (category === "audio") {
      const validation = validateAudioFile(originalName, mimeType);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      // Check max size: 50MB
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "حجم التسجيل الصوتي يتجاوز الحد المسموح به (50 ميجابايت)" },
          { status: 400 }
        );
      }
    } else {
      const validation = validateSheetFile(originalName, mimeType);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      // Check max size: 25MB
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: "حجم ملف النوتة الموسيقية يتجاوز الحد المسموح به (25 ميجابايت)" },
          { status: 400 }
        );
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save retaining original extension
    const saved = await saveFile({
      buffer,
      originalName,
      category: category as "audio" | "sheet",
    });

    return NextResponse.json({
      success: true,
      fileKey: saved.fileKey,
      fileName: saved.fileName,
      fileSize: saved.fileSize,
      mimeType: saved.mimeType,
      url: `/api/storage/file/${saved.fileKey}`,
      message: "تم رفع الملف بنجاح مع الاحتفاظ بصيغته الأصلية",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل رفع الملف";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

