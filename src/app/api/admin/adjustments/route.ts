import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { recordManualAdjustment } from "@/lib/points/engine";
import { eq, desc, and, ne } from "drizzle-orm";
import { z } from "zod";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const adjustmentSchema = z.object({
  recipientId: z.string().min(1, "المرنم المستفيد مطلوب"),
  quarterId: z.string().min(1, "الربع السنوي مطلوب"),
  rehearsalId: z.string().nullable().optional(),
  delta: z.number().int().refine((val) => val !== 0, "قيمة التعديل لا يمكن أن تكون صفراً"),
  type: z.enum(["MANUAL_BONUS", "MANUAL_DEDUCTION", "ADJUSTMENT"]),
  reason: z.string().min(3, "سبب التعديل إلزامي لغايات التدقيق الإداري (3 أحرف على الأقل)"),
});

/**
 * GET /api/admin/adjustments
 * List manual adjustments with rich filters and summaries
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const quarterId = searchParams.get("quarterId");
    const userId = searchParams.get("userId");
    const typeParam = searchParams.get("type") || "ALL";
    const searchParam = (searchParams.get("q") || "").trim().toLowerCase();

    const db = await getDb();

    // Fetch manual transactions (non-AUTOMATIC)
    const [allTx, allUsers, allRehearsals, allQuarters] = await Promise.all([
      db
        .select()
        .from(schema.pointTransactions)
        .where(ne(schema.pointTransactions.transactionType, "AUTOMATIC"))
        .orderBy(desc(schema.pointTransactions.createdAt)),
      db.select().from(schema.users),
      db.select().from(schema.rehearsals),
      db.select().from(schema.quarters),
    ]);

    const userMap = new Map(allUsers.map((u) => [u.id, u]));
    const rehearsalMap = new Map(allRehearsals.map((r) => [r.id, r]));
    const quarterMap = new Map(allQuarters.map((q) => [q.id, q]));

    let filtered = allTx;

    if (quarterId) {
      filtered = filtered.filter((t) => t.quarterId === quarterId);
    }
    if (userId) {
      filtered = filtered.filter((t) => t.userId === userId);
    }
    if (typeParam !== "ALL") {
      filtered = filtered.filter((t) => t.transactionType === typeParam);
    }

    let enriched = filtered.map((tx) => {
      const recipient = userMap.get(tx.userId);
      const actor = tx.createdBy ? userMap.get(tx.createdBy) : null;
      const rehearsal = tx.rehearsalId ? rehearsalMap.get(tx.rehearsalId) : null;
      const quarter = quarterMap.get(tx.quarterId);

      return {
        ...tx,
        recipientName: recipient?.fullName || "مرنم غير معروف",
        recipientPhone: recipient?.phone || "",
        recipientVoicePart: recipient?.voicePart || "غير محدد",
        actorName: actor?.fullName || "النظام الإداري",
        rehearsalTitle: rehearsal?.title || null,
        rehearsalDate: rehearsal?.date || null,
        quarterName: quarter?.name || "الربع السنوي",
      };
    });

    if (searchParam) {
      enriched = enriched.filter(
        (t) =>
          t.recipientName.toLowerCase().includes(searchParam) ||
          t.recipientPhone.includes(searchParam) ||
          t.reason.toLowerCase().includes(searchParam) ||
          t.actorName.toLowerCase().includes(searchParam)
      );
    }

    // Stats calculations
    let totalPositivePoints = 0;
    let totalNegativePoints = 0;
    for (const t of enriched) {
      if (t.pointsDelta > 0) {
        totalPositivePoints += t.pointsDelta;
      } else {
        totalNegativePoints += Math.abs(t.pointsDelta);
      }
    }

    return NextResponse.json({
      adjustments: enriched,
      stats: {
        totalCount: enriched.length,
        totalPositivePoints,
        totalNegativePoints,
      },
    });
  } catch (err: unknown) {
    console.error("Fetch adjustments error:", err);
    return NextResponse.json({ error: "فشل استرجاع سجل التعديلات اليدوية" }, { status: 500 });
  }
}

/**
 * POST /api/admin/adjustments
 * Record a new manual point adjustment (bonus or deduction)
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = adjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { recipientId, quarterId, rehearsalId, delta, type, reason } = parsed.data;

    const result = await recordManualAdjustment({
      actorId: admin.userId,
      recipientId,
      quarterId,
      rehearsalId,
      delta,
      type,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: `تم تسجيل التعديل اليدوي بنجاح (${delta >= 0 ? `+${delta}` : delta} نقطة)`,
      adjustment: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تسجيل التعديل اليدوي";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

