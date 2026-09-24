import { getDb, schema } from "@/db";
import { eq, and, asc, desc, sql } from "drizzle-orm";

export type RuleType =
  | "PRESENT"
  | "LATE"
  | "VERY_LATE"
  | "EXTREME_LATE"
  | "ABSENT"
  | "EXCUSED_ABSENCE"
  | "EARLY_LEAVE";

export type TransactionType =
  | "AUTOMATIC"
  | "MANUAL_BONUS"
  | "MANUAL_DEDUCTION"
  | "ADJUSTMENT";

export interface DefaultRuleDef {
  ruleType: RuleType;
  occurrenceStart: number;
  occurrenceEnd: number | null;
  pointsDelta: number;
  description: string;
}

/**
 * Standard occurrence-based default rule set for a quarter
 * As mandated by Master Prompt Section 12 & Phase 6
 */
export const DEFAULT_QUARTER_RULES: DefaultRuleDef[] = [
  {
    ruleType: "PRESENT",
    occurrenceStart: 1,
    occurrenceEnd: null,
    pointsDelta: 10,
    description: "حضور في الميعاد المحدد (+10 نقاط)",
  },
  {
    ruleType: "LATE",
    occurrenceStart: 1,
    occurrenceEnd: 2,
    pointsDelta: 5,
    description: "تأخير خفيف (أول مرتين في الربع) (+5 نقاط)",
  },
  {
    ruleType: "LATE",
    occurrenceStart: 3,
    occurrenceEnd: null,
    pointsDelta: 0,
    description: "تأخير خفيف متكرر (من المرة الثالثة فما بعد) (0 نقطة)",
  },
  {
    ruleType: "VERY_LATE",
    occurrenceStart: 1,
    occurrenceEnd: null,
    pointsDelta: 2,
    description: "تأخير كبير (نقطتان رمزيتان +2)",
  },
  {
    ruleType: "EXTREME_LATE",
    occurrenceStart: 1,
    occurrenceEnd: null,
    pointsDelta: 0,
    description: "تأخير حرج (0 نقطة)",
  },
  {
    ruleType: "EXCUSED_ABSENCE",
    occurrenceStart: 1,
    occurrenceEnd: 3,
    pointsDelta: 0,
    description: "غياب بعذر معتمد (سماح حتى 3 مرات بالربع) (0 نقطة)",
  },
  {
    ruleType: "EXCUSED_ABSENCE",
    occurrenceStart: 4,
    occurrenceEnd: null,
    pointsDelta: -5,
    description: "تكرار الغياب بعذر (من المرة الرابعة فما بعد) (-5 نقاط)",
  },
  {
    ruleType: "ABSENT",
    occurrenceStart: 1,
    occurrenceEnd: 2,
    pointsDelta: -5,
    description: "غياب بدون عذر (المرتان الأولى والثانية) (-5 نقاط)",
  },
  {
    ruleType: "ABSENT",
    occurrenceStart: 3,
    occurrenceEnd: null,
    pointsDelta: -10,
    description: "غياب بدون عذر متكرر (من المرة الثالثة فما بعد) (-10 نقاط)",
  },
];

/**
 * Fallback point deltas in case no rules exist in the database for a quarter
 */
export function getFallbackPointsDelta(ruleType: string): number {
  switch (ruleType) {
    case "PRESENT":
      return 10;
    case "LATE":
      return 5;
    case "VERY_LATE":
      return 2;
    case "EXTREME_LATE":
      return 0;
    case "EXCUSED_ABSENCE":
      return 0;
    case "ABSENT":
      return -10;
    case "EARLY_LEAVE":
      return -5;
    default:
      return 0;
  }
}

/**
 * Seed standard default occurrence-based rules for a quarter
 */
export async function seedDefaultQuarterRules(quarterId: string, adminId: string = "SYSTEM") {
  const db = await getDb();

  // Check if quarter is CLOSED
  const targetQuarter = await db
    .select()
    .from(schema.quarters)
    .where(eq(schema.quarters.id, quarterId))
    .limit(1);

  if (targetQuarter.length === 0) {
    throw new Error("الربع السنوي المطلوب غير موجود");
  }

  if (targetQuarter[0].status === "CLOSED") {
    throw new Error("لا يمكن تعديل أو تهيئة قواعد ربع سنوي مغلق ومجمد تاريخياً");
  }

  // Delete existing rules for this quarter to re-seed cleanly
  await db.delete(schema.pointRules).where(eq(schema.pointRules.quarterId, quarterId));

  const nowIso = new Date().toISOString();
  const createdRules = [];

  for (const rule of DEFAULT_QUARTER_RULES) {
    const ruleId = `prule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRule = {
      id: ruleId,
      quarterId,
      ruleType: rule.ruleType,
      occurrenceStart: rule.occurrenceStart,
      occurrenceEnd: rule.occurrenceEnd,
      pointsDelta: rule.pointsDelta,
      description: rule.description,
      createdAt: nowIso,
    };
    await db.insert(schema.pointRules).values(newRule);
    createdRules.push(newRule);
  }

  // Log to audit trail
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId: adminId,
    action: "POINT_RULES_SEEDED",
    entity: "point_rules",
    entityId: quarterId,
    oldValue: null,
    newValue: JSON.stringify({ seededCount: createdRules.length }),
    reason: `تهيئة القواعد القياسية للنقاط للربع السنوي: ${targetQuarter[0].name}`,
  });

  return createdRules;
}

/**
 * Fetch all rules configured for a quarter
 */
export async function getQuarterRules(quarterId: string) {
  const db = await getDb();
  return db
    .select()
    .from(schema.pointRules)
    .where(eq(schema.pointRules.quarterId, quarterId))
    .orderBy(asc(schema.pointRules.ruleType), asc(schema.pointRules.occurrenceStart));
}

/**
 * Find matching rule by ruleType and 1-indexed occurrence count
 */
export function matchRule(
  rules: (typeof schema.pointRules.$inferSelect)[],
  ruleType: string,
  occurrenceIndex: number
) {
  const matching = rules.filter(
    (r) =>
      r.ruleType === ruleType &&
      occurrenceIndex >= r.occurrenceStart &&
      (r.occurrenceEnd === null || occurrenceIndex <= r.occurrenceEnd)
  );

  if (matching.length > 0) {
    return matching[0];
  }

  return null;
}

/**
 * Evaluate and persist attendance points transactionally (AUTOMATIC)
 * Idempotent: safe to run multiple times without duplicating points
 */
export async function evaluateAttendancePoints(params: {
  userId: string;
  rehearsalId: string;
  quarterId?: string;
  status: string;
  actorId?: string;
}) {
  const db = await getDb();
  const { userId, rehearsalId, status, actorId = "SYSTEM" } = params;

  // Resolve rehearsal and quarter
  const rehearsalRes = await db
    .select()
    .from(schema.rehearsals)
    .where(eq(schema.rehearsals.id, rehearsalId))
    .limit(1);

  if (rehearsalRes.length === 0) {
    throw new Error("البروفة المطلوبة غير موجودة");
  }

  const rehearsal = rehearsalRes[0];
  const quarterId = params.quarterId || rehearsal.quarterId;

  // 1. Fetch all rehearsals in this quarter ordered by date and start_time
  const quarterRehearsals = await db
    .select()
    .from(schema.rehearsals)
    .where(eq(schema.rehearsals.quarterId, quarterId))
    .orderBy(asc(schema.rehearsals.date), asc(schema.rehearsals.startTime));

  const targetIndex = quarterRehearsals.findIndex((r) => r.id === rehearsalId);

  // 2. Fetch existing attendance records and existing automatic transactions for this user
  const [userAttendances, userTransactions] = await Promise.all([
    db.select().from(schema.attendance).where(eq(schema.attendance.userId, userId)),
    db
      .select()
      .from(schema.pointTransactions)
      .where(
        and(
          eq(schema.pointTransactions.userId, userId),
          eq(schema.pointTransactions.quarterId, quarterId),
          eq(schema.pointTransactions.transactionType, "AUTOMATIC")
        )
      ),
  ]);

  const attendanceMap = new Map(userAttendances.map((a) => [a.rehearsalId, a.status]));
  const txMap = new Map(
    userTransactions.filter((t) => t.rehearsalId).map((t) => [t.rehearsalId as string, t])
  );

  const STATUS_KEYWORDS: Record<string, string> = {
    PRESENT: "حضور في الميعاد",
    LATE: "تأخير خفيف",
    VERY_LATE: "تأخير كبير",
    EXTREME_LATE: "تأخير حرج",
    EXCUSED_ABSENCE: "غياب بعذر معتمد",
    ABSENT: "غياب بدون عذر",
    EARLY_LEAVE: "انصراف مبكر",
  };

  const keyword = STATUS_KEYWORDS[status] || status;

  // 3. Count prior occurrences of this status strictly before target rehearsal
  let priorOccurrences = 0;
  const loopLimit = targetIndex >= 0 ? targetIndex : quarterRehearsals.length;

  for (let i = 0; i < loopLimit; i++) {
    const priorReh = quarterRehearsals[i];
    const attStatus = attendanceMap.get(priorReh.id);
    const tx = txMap.get(priorReh.id);

    if (attStatus === status) {
      priorOccurrences++;
    } else if (tx && tx.reason.includes(keyword)) {
      priorOccurrences++;
    }
  }

  const occurrenceCount = priorOccurrences + 1;

  // 4. Fetch quarter rules or fallback
  const rules = await getQuarterRules(quarterId);
  const matched = matchRule(rules, status, occurrenceCount);

  const pointsDelta = matched ? matched.pointsDelta : getFallbackPointsDelta(status);

  // Generate Egyptian Arabic reason description
  let statusLabelAr = "حضور";
  switch (status) {
    case "PRESENT":
      statusLabelAr = "حضور في الميعاد";
      break;
    case "LATE":
      statusLabelAr = "تأخير خفيف";
      break;
    case "VERY_LATE":
      statusLabelAr = "تأخير كبير";
      break;
    case "EXTREME_LATE":
      statusLabelAr = "تأخير حرج";
      break;
    case "EXCUSED_ABSENCE":
      statusLabelAr = "غياب بعذر معتمد";
      break;
    case "ABSENT":
      statusLabelAr = "غياب بدون عذر";
      break;
    case "EARLY_LEAVE":
      statusLabelAr = "انصراف مبكر";
      break;
  }

  const reason = matched?.description
    ? `${statusLabelAr} (${matched.description}) — التكرار رقم (${occurrenceCount})`
    : `${statusLabelAr} (${pointsDelta >= 0 ? `+${pointsDelta}` : pointsDelta} نقطة) — التكرار رقم (${occurrenceCount})`;

  // 5. Idempotent check: does an AUTOMATIC transaction already exist for this (userId, rehearsalId)?
  const existingTx = await db
    .select()
    .from(schema.pointTransactions)
    .where(
      and(
        eq(schema.pointTransactions.userId, userId),
        eq(schema.pointTransactions.rehearsalId, rehearsalId),
        eq(schema.pointTransactions.transactionType, "AUTOMATIC")
      )
    )
    .limit(1);

  let finalTx;

  if (existingTx.length > 0) {
    // Update existing automatic transaction
    const txId = existingTx[0].id;
    await db
      .update(schema.pointTransactions)
      .set({
        pointsDelta,
        reason,
        createdBy: actorId,
      })
      .where(eq(schema.pointTransactions.id, txId));

    finalTx = {
      ...existingTx[0],
      pointsDelta,
      reason,
      createdBy: actorId,
    };
  } else {
    // Insert new automatic transaction
    const txId = `ptxn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTx = {
      id: txId,
      userId,
      quarterId,
      rehearsalId,
      pointsDelta,
      transactionType: "AUTOMATIC" as const,
      reason,
      createdBy: actorId,
      createdAt: new Date().toISOString(),
    };
    await db.insert(schema.pointTransactions).values(newTx);
    finalTx = newTx;
  }

  return {
    transaction: finalTx,
    occurrenceCount,
    pointsDelta,
    ruleUsed: matched,
  };
}

/**
 * Record a manual point adjustment (bonus, deduction, or exception)
 * Maintains invariant: does NOT overwrite automatic transactions
 */
export async function recordManualAdjustment(params: {
  actorId: string;
  recipientId: string;
  quarterId: string;
  rehearsalId?: string | null;
  delta: number;
  type: "MANUAL_BONUS" | "MANUAL_DEDUCTION" | "ADJUSTMENT";
  reason: string;
  notes?: string | null;
}) {
  const db = await getDb();
  const { actorId, recipientId, quarterId, rehearsalId, delta, type, reason } = params;

  if (delta === 0) {
    throw new Error("قيمة التعديل لا يمكن أن تكون صفراً");
  }

  if (type === "MANUAL_BONUS" && delta < 0) {
    throw new Error("المكافأة اليدوية يجب أن تكون قيمة موجبة (+) ");
  }

  if (type === "MANUAL_DEDUCTION" && delta > 0) {
    throw new Error("الخصم اليدوي يجب أن يكون قيمة سالبة (-) ");
  }

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 3) {
    throw new Error("يرجى كتابة سبب التعديل بوضوح لغايات التدقيق الإداري (3 أحرف على الأقل)");
  }

  // Check quarter status
  const quarterRes = await db
    .select()
    .from(schema.quarters)
    .where(eq(schema.quarters.id, quarterId))
    .limit(1);

  if (quarterRes.length === 0) {
    throw new Error("الربع السنوي غير موجود");
  }

  if (quarterRes[0].status === "CLOSED") {
    throw new Error("لا يمكن إضافة تعديل يدوي في ربع سنوي مغلق ومجمد تاريخياً");
  }

  const txId = `ptxn_man_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const newTx = {
    id: txId,
    userId: recipientId,
    quarterId,
    rehearsalId: rehearsalId || null,
    pointsDelta: delta,
    transactionType: type,
    reason: trimmedReason,
    createdBy: actorId,
    createdAt: nowIso,
  };

  await db.insert(schema.pointTransactions).values(newTx);

  // Write to audit trail
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    action: "POINT_ADJUSTMENT_CREATED",
    entity: "point_transactions",
    entityId: txId,
    oldValue: null,
    newValue: JSON.stringify({
      recipientId,
      quarterId,
      delta,
      type,
      reason: trimmedReason,
    }),
    reason: `تسجيل تعديل نقاط يدوي (${delta >= 0 ? `+${delta}` : delta}): ${trimmedReason}`,
  });

  return newTx;
}

/**
 * Calculate member's total points and tier breakdown for a quarter
 */
export async function calculateMemberQuarterPoints(userId: string, quarterId: string) {
  const db = await getDb();

  // Fetch all transactions for this user in this quarter
  const txList = await db
    .select()
    .from(schema.pointTransactions)
    .where(
      and(
        eq(schema.pointTransactions.userId, userId),
        eq(schema.pointTransactions.quarterId, quarterId)
      )
    )
    .orderBy(desc(schema.pointTransactions.createdAt));

  let totalPoints = 0;
  let automaticPoints = 0;
  let manualBonusPoints = 0;
  let manualDeductionPoints = 0;

  for (const tx of txList) {
    totalPoints += tx.pointsDelta;
    if (tx.transactionType === "AUTOMATIC") {
      automaticPoints += tx.pointsDelta;
    } else if (tx.transactionType === "MANUAL_BONUS") {
      manualBonusPoints += tx.pointsDelta;
    } else if (tx.transactionType === "MANUAL_DEDUCTION") {
      manualDeductionPoints += tx.pointsDelta;
    } else if (tx.transactionType === "ADJUSTMENT") {
      if (tx.pointsDelta > 0) manualBonusPoints += tx.pointsDelta;
      else manualDeductionPoints += tx.pointsDelta;
    }
  }

  // Calculate Standing / Tier Classification
  let tierBadge = "ممتاز 🌟";
  let tierLabel = "ممتاز";
  let tierColor = "emerald";

  if (totalPoints >= 90) {
    tierBadge = "ممتاز 🌟";
    tierLabel = "ممتاز";
    tierColor = "emerald";
  } else if (totalPoints >= 75) {
    tierBadge = "ملتزم ومميز 👍";
    tierLabel = "ملتزم";
    tierColor = "gold";
  } else if (totalPoints >= 60) {
    tierBadge = "يحتاج متابعة ⚠️";
    tierLabel = "يحتاج متابعة";
    tierColor = "amber";
  } else {
    tierBadge = "إنذار غياب وتأخير 🚨";
    tierLabel = "إنذار";
    tierColor = "rose";
  }

  return {
    totalPoints,
    automaticPoints,
    manualBonusPoints,
    manualDeductionPoints,
    tierBadge,
    tierLabel,
    tierColor,
    transactionCount: txList.length,
    transactions: txList,
  };
}
