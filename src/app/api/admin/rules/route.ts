import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { getQuarterRules, RuleType } from "@/lib/points/engine";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const createRuleSchema = z.object({
  quarterId: z.string().min(1, "معرف الربع السنوي مطلوب"),
  ruleType: z.enum([
    "PRESENT",
    "LATE",
    "VERY_LATE",
    "EXTREME_LATE",
    "ABSENT",
    "EXCUSED_ABSENCE",
    "EARLY_LEAVE",
  ] as const),
  occurrenceStart: z.number().int().min(1, "بداية التكرار يجب أن تكون 1 على الأقل"),
  occurrenceEnd: z.number().int().min(1).nullable().optional(),
  pointsDelta: z.number().int(),
  description: z.string().min(2, "وصف القاعدة مطلوب"),
});

/**
 * GET /api/admin/rules?quarterId=...
 * Fetch all point rules for a quarter
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let quarterId = searchParams.get("quarterId");

    const db = await getDb();

    if (!quarterId) {
      // Find active quarter
      const activeQuarter = await db
        .select()
        .from(schema.quarters)
        .where(eq(schema.quarters.status, "ACTIVE"))
        .limit(1);

      if (activeQuarter.length > 0) {
        quarterId = activeQuarter[0].id;
      } else {
        // Fallback to latest quarter
        const latest = await db.select().from(schema.quarters).limit(1);
        if (latest.length > 0) {
          quarterId = latest[0].id;
        }
      }
    }

    if (!quarterId) {
      return NextResponse.json({ rules: [], quarter: null });
    }

    const [rules, quarterRes] = await Promise.all([
      getQuarterRules(quarterId),
      db.select().from(schema.quarters).where(eq(schema.quarters.id, quarterId)).limit(1),
    ]);

    const quarter = quarterRes.length > 0 ? quarterRes[0] : null;

    return NextResponse.json({
      quarter,
      rules,
      isClosed: quarter?.status === "CLOSED",
    });
  } catch (err: unknown) {
    console.error("Fetch rules error:", err);
    return NextResponse.json({ error: "فشل تحميل قواعد النقاط" }, { status: 500 });
  }
}

/**
 * POST /api/admin/rules
 * Create a new occurrence tier rule for a quarter
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات القاعدة غير صحيحة" },
        { status: 400 }
      );
    }

    const { quarterId, ruleType, occurrenceStart, occurrenceEnd, pointsDelta, description } =
      parsed.data;

    // Validate occurrence range logic
    if (occurrenceEnd !== null && occurrenceEnd !== undefined && occurrenceEnd < occurrenceStart) {
      return NextResponse.json(
        { error: "نهاية التكرار يجب أن تكون أكبر من أو تساوي بداية التكرار" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify quarter is not CLOSED
    const quarterRes = await db
      .select()
      .from(schema.quarters)
      .where(eq(schema.quarters.id, quarterId))
      .limit(1);

    if (quarterRes.length === 0) {
      return NextResponse.json({ error: "الربع السنوي غير موجود" }, { status: 404 });
    }

    if (quarterRes[0].status === "CLOSED") {
      return NextResponse.json(
        { error: "لا يمكن إضافة قواعد جديدة لربع سنوي مغلق ومجمد تاريخياً" },
        { status: 400 }
      );
    }

    const ruleId = `prule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newRule = {
      id: ruleId,
      quarterId,
      ruleType: ruleType as RuleType,
      occurrenceStart,
      occurrenceEnd: occurrenceEnd || null,
      pointsDelta,
      description: description.trim(),
      createdAt: nowIso,
    };

    await db.insert(schema.pointRules).values(newRule);

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "POINT_RULE_CREATED",
      entity: "point_rules",
      entityId: ruleId,
      oldValue: null,
      newValue: JSON.stringify(newRule),
      reason: `إضافة قاعدة نقاط جديدة (${ruleType}: من ${occurrenceStart} إلى ${occurrenceEnd || "+"})`,
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ قاعدة النقاط بنجاح",
      rule: newRule,
    });
  } catch (err: unknown) {
    console.error("Create rule error:", err);
    return NextResponse.json({ error: "فشل إضافة قاعدة النقاط" }, { status: 500 });
  }
}

