import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getSongById } from "@/lib/songs/service";

/**
 * GET /api/songs/[id]
 * Returns song details including lyrics and vocal part directions
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const { id } = params;
    const song = await getSongById(id);

    if (!song) {
      return NextResponse.json({ error: "الترنيمة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل جلب بيانات الترنيمة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

