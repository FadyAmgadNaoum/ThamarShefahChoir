import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { seedDefaultQuarterRules } from "@/lib/points/engine";
import { z } from "zod";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const seedSchema = z.object({
  quarterId: z.string().min(1, "معرف الربع السنوي مطلوب"),
});

/**
 * POST /api/admin/rules/seed-defaults
 * 1-Click action to seed standard occurrence-based rules for a quarter
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = seedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { quarterId } = parsed.data;
    const seededRules = await seedDefaultQuarterRules(quarterId, admin.userId);

    return NextResponse.json({
      success: true,
      message: `تم تطبيق القواعد القياسية التلقائية بنجاح (${seededRules.length} قواعد تكرار)`,
      rules: seededRules,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تهيئة القواعد القياسية";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

