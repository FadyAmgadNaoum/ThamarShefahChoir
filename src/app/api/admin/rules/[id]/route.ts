import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

const updateRuleSchema = z.object({
  occurrenceStart: z.number().int().min(1).optional(),
  occurrenceEnd: z.number().int().min(1).nullable().optional(),
  pointsDelta: z.number().int().optional(),
  description: z.string().min(2).optional(),
});

/**
 * PATCH /api/admin/rules/[id]
 * Edit an existing point rule
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id: ruleId } = params;
    const db = await getDb();

    // Fetch existing rule
    const existing = await db
      .select()
      .from(schema.pointRules)
      .where(eq(schema.pointRules.id, ruleId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "قاعدة النقاط غير موجودة" }, { status: 404 });
    }

    const rule = existing[0];

    // Check quarter status
    const quarterRes = await db
      .select()
      .from(schema.quarters)
      .where(eq(schema.quarters.id, rule.quarterId))
      .limit(1);

    if (quarterRes.length > 0 && quarterRes[0].status === "CLOSED") {
      return NextResponse.json(
        { error: "لا يمكن تعديل قواعد ربع سنوي مغلق ومجمد تاريخياً" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const updateData: Partial<typeof schema.pointRules.$inferInsert> = {};
    if (parsed.data.occurrenceStart !== undefined) {
      updateData.occurrenceStart = parsed.data.occurrenceStart;
    }
    if (parsed.data.occurrenceEnd !== undefined) {
      updateData.occurrenceEnd = parsed.data.occurrenceEnd;
    }
    if (parsed.data.pointsDelta !== undefined) {
      updateData.pointsDelta = parsed.data.pointsDelta;
    }
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description.trim();
    }

    // Validate occurrence range logic
    const effStart = updateData.occurrenceStart ?? rule.occurrenceStart;
    const effEnd = updateData.occurrenceEnd !== undefined ? updateData.occurrenceEnd : rule.occurrenceEnd;

    if (effEnd !== null && effEnd < effStart) {
      return NextResponse.json(
        { error: "نهاية التكرار يجب أن تكون أكبر من أو تساوي بداية التكرار" },
        { status: 400 }
      );
    }

    await db.update(schema.pointRules).set(updateData).where(eq(schema.pointRules.id, ruleId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "POINT_RULE_UPDATED",
      entity: "point_rules",
      entityId: ruleId,
      oldValue: JSON.stringify(rule),
      newValue: JSON.stringify(updateData),
      reason: `تعديل قاعدة النقاط: ${rule.ruleType}`,
    });

    return NextResponse.json({
      success: true,
      message: "تم تعديل قاعدة النقاط بنجاح",
    });
  } catch (err: unknown) {
    console.error("Update rule error:", err);
    return NextResponse.json({ error: "فشل تعديل قاعدة النقاط" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/rules/[id]
 * Remove an existing point rule
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id: ruleId } = params;
    const db = await getDb();

    const existing = await db
      .select()
      .from(schema.pointRules)
      .where(eq(schema.pointRules.id, ruleId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "قاعدة النقاط غير موجودة" }, { status: 404 });
    }

    const rule = existing[0];

    // Check quarter status
    const quarterRes = await db
      .select()
      .from(schema.quarters)
      .where(eq(schema.quarters.id, rule.quarterId))
      .limit(1);

    if (quarterRes.length > 0 && quarterRes[0].status === "CLOSED") {
      return NextResponse.json(
        { error: "لا يمكن حذف قواعد ربع سنوي مغلق ومجمد تاريخياً" },
        { status: 400 }
      );
    }

    await db.delete(schema.pointRules).where(eq(schema.pointRules.id, ruleId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "POINT_RULE_DELETED",
      entity: "point_rules",
      entityId: ruleId,
      oldValue: JSON.stringify(rule),
      newValue: null,
      reason: `حذف قاعدة النقاط: ${rule.ruleType}`,
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف قاعدة النقاط بنجاح",
    });
  } catch (err: unknown) {
    console.error("Delete rule error:", err);
    return NextResponse.json({ error: "فشل حذف قاعدة النقاط" }, { status: 500 });
  }
}

