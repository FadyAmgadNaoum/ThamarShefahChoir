import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { updateSong, deleteSong, getSongById } from "@/lib/songs/service";
import { z } from "zod";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const updateSongSchema = z.object({
  title: z.string().min(1, "عنوان الترنيمة مطلوب").optional(),
  copticTitle: z.string().optional().nullable(),
  musicalKey: z.string().optional().nullable(),
  tempo: z.string().optional().nullable(),
  category: z
    .enum([
      "GENERAL",
      "PASSION_WEEK",
      "RESURRECTION",
      "KOIAHK",
      "LENT",
      "NATIVITY",
      "PRAISES",
      "FEASTS",
      "CANTATA",
    ])
    .optional(),
  lyrics: z.string().optional().nullable(),
  audioFileKey: z.string().optional().nullable(),
  audioFileName: z.string().optional().nullable(),
  audioFileSize: z.number().optional().nullable(),
  audioDurationSeconds: z.number().optional().nullable(),
  sheetMusicKey: z.string().optional().nullable(),
  sheetMusicName: z.string().optional().nullable(),
  sheetMusicSize: z.number().optional().nullable(),
  voicePartNotes: z
    .object({
      soprano: z.string().optional(),
      alto: z.string().optional(),
      tenor: z.string().optional(),
      bass: z.string().optional(),
    })
    .optional()
    .nullable(),
  arrangementNotes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/admin/songs/[id]
 * Updates song fields, status, or files
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "صلاحية غير مصرح بها" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = updateSongSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const updated = await updateSong(id, parsed.data, admin.userId);

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات الترنيمة بنجاح",
      song: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تحديث الترنيمة";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/songs/[id]
 * Deletes song and cleans up storage files
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "صلاحية غير مصرح بها" }, { status: 403 });
    }

    const { id } = params;
    await deleteSong(id, admin.userId);

    return NextResponse.json({
      success: true,
      message: "تم حذف الترنيمة وملفاتها من الأرشيف بنجاح",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل حذف الترنيمة";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

