import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { recordPaymentWithFIFO } from "@/lib/subscriptions/service";
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

const paymentSchema = z.object({
  userId: z.string().min(1, "معرف المرنم مطلوب"),
  amount: z.number().positive("قيمة الدفعة يجب أن تكون أكبر من صفر"),
  paymentMethod: z.enum(["CASH", "VODAFONE_CASH", "INSTAPAY", "BANK_TRANSFER"]).default("CASH"),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ الدفع يجب أن يكون بتنسيق YYYY-MM-DD"),
  notes: z.string().optional().nullable(),
  explicitChargeId: z.string().optional().nullable(),
});

/**
 * POST /api/admin/subscriptions/pay
 * Record subscription payment with automatic FIFO debt allocation
 */
export async function POST(request: Request) {
  try {
    const manager = await requireFinanceAccess();
    if (!manager) {
      return NextResponse.json({ error: "غير مصرح لك بتسجيل الدفعات المالية" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { userId, amount, paymentMethod, paymentDate, notes, explicitChargeId } = parsed.data;

    const result = await recordPaymentWithFIFO({
      userId,
      amount,
      paymentMethod,
      paymentDate,
      notes: notes || null,
      explicitChargeId: explicitChargeId || null,
      actorId: manager.userId,
    });

    return NextResponse.json({
      success: true,
      message: `تم تسجيل سداد مبلغ (${amount} ج) بنجاح بنظام الأقدمية التلقائي (FIFO)`,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تسجيل الدفعة المالية";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

