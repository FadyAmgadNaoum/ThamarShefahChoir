import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { listSongs, createSong, SongCategory } from "@/lib/songs/service";
import { z } from "zod";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const createSongSchema = z.object({
  title: z.string().min(1, "عنوان الترنيمة مطلوب"),
  copticTitle: z.string().optional().nullable(),
  musicalKey: z.string().optional().nullable(),
  tempo: z.string().optional().nullable(),
  category: z.enum([
    "GENERAL",
    "PASSION_WEEK",
    "RESURRECTION",
    "KOIAHK",
    "LENT",
    "NATIVITY",
    "PRAISES",
    "FEASTS",
    "CANTATA",
  ]),
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
 * GET /api/admin/songs
 * Lists all songs (active and archived) for choir administrators
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "صلاحية غير مصرح بها" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const songs = await listSongs({
      category,
      search,
      activeOnly: false,
    });

    return NextResponse.json({ songs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تحميل قائمة الترانيم";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/songs
 * Creates a new choir hymn with audio & sheet music links
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "صلاحية غير مصرح بها" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSongSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const song = await createSong(parsed.data, admin.userId);

    return NextResponse.json({
      success: true,
      message: "تم حفظ الترنيمة بنجاح في أرشيف الكورال",
      song,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل إنشاء الترنيمة";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

