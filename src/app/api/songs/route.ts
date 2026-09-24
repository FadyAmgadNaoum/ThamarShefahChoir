import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { listSongs } from "@/lib/songs/service";

/**
 * GET /api/songs
 * Returns catalog of active songs for choir members with optional category and search filters
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const songs = await listSongs({
      category,
      search,
      activeOnly: true,
    });

    return NextResponse.json({ songs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تحميل مكتبة الترانيم";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

