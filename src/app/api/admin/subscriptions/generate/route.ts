import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { generateMonthlyCharges } from "@/lib/subscriptions/service";
import { z } from "zod";

async function requireFinanceAccess() {
  const user = await getCurrentUser();
  if (
    !user ||
    (!user.roles.includes("SUBSCRIPTION_MANAGER") &&
      !user.roles.includes("ADMIN") &&
      !user.roles.includes("SUPER_ADMIN"))
  ) {
    return null;
  }
  return user;
}

const generateSchema = z.object({
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, "صيغة الشهر يجب أن تكون بتنسيق YYYY-MM (مثال: 2026-10)"),
  rates: z
    .object({
      STUDENT: z.number().positive().optional(),
      WORKING: z.number().positive().optional(),
      OTHER: z.number().positive().optional(),
    })
    .optional(),
});

/**
 * POST /api/admin/subscriptions/generate
 * Issue monthly charges for all approved members
 */
export async function POST(request: Request) {
  try {
    const manager = await requireFinanceAccess();
    if (!manager) {
      return NextResponse.json({ error: "غير مصرح لك بإصدار المطالبات المالية" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { monthYear, rates } = parsed.data;

    const result = await generateMonthlyCharges({
      monthYear,
      rates,
      actorId: manager.userId,
    });

    return NextResponse.json({
      success: true,
      message:
        result.generatedCount > 0
          ? `تم بنجاح إصدار مطالبات شهر (${result.monthYearAr}) لعدد (${result.generatedCount}) مرنم بإجمالي ${result.totalBilled} ج`
          : `تم بالفعل إصدار مطالبات شهر (${result.monthYearAr}) مسبقاً لجميع المرنمين المصرحين`,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل إصدار المطالبات الشهرية";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

