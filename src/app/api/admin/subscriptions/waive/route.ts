import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { waiveSubscriptionCharge } from "@/lib/subscriptions/service";
import { z } from "zod";

async function requireAdminOnly() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const waiveSchema = z.object({
  chargeId: z.string().min(1, "معرف المطالبة مطلوب"),
  reason: z.string().min(3, "سبب الإعفاء إلزامي للرقابة والتدقيق (3 أحرف على الأقل)"),
});

/**
 * POST /api/admin/subscriptions/waive
 * Strictly restricted to ADMIN and SUPER_ADMIN
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdminOnly();
    if (!admin) {
      return NextResponse.json(
        { error: "إعفاء الاشتراكات صلاحية أمنية مقصورة حصراً على المشرف العام وأدمن النظام" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = waiveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { chargeId, reason } = parsed.data;

    const result = await waiveSubscriptionCharge({
      chargeId,
      reason,
      actorId: admin.userId,
    });

    return NextResponse.json({
      success: true,
      message: "تم إعفاء المطالبة الشهرية بنجاح وتوثيق العملية في سجل التدقيق",
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل إعفاء المطالبة";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

