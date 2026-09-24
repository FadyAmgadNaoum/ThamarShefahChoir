import { getDb, schema } from "@/db";
import { eq, and, asc, desc, sql, ne } from "drizzle-orm";

export type TierType = "STUDENT" | "WORKING" | "OTHER";

export type PaymentMethod = "CASH" | "VODAFONE_CASH" | "INSTAPAY" | "BANK_TRANSFER";

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقدي (كاش)",
  VODAFONE_CASH: "فودافون كاش",
  INSTAPAY: "انستاباي (InstaPay)",
  BANK_TRANSFER: "تحويل بنكي",
};

/**
 * Standard default monthly rates per member tier in EGP
 */
export const DEFAULT_TIER_RATES: Record<TierType, number> = {
  STUDENT: 50,
  WORKING: 100,
  OTHER: 75,
};

export interface ChargeBreakdownItem {
  id: string;
  monthYear: string;
  amountDue: number;
  amountPaid: number;
  remainingDue: number;
  isWaived: boolean;
  waivedReason: string | null;
  status: "PAID" | "PARTIAL" | "UNPAID" | "WAIVED";
  createdAt: string;
}

export interface PaymentReceiptItem {
  id: string;
  chargeId: string | null;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  notes: string | null;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface MemberFinancialStatement {
  userId: string;
  fullName: string;
  phone: string;
  voicePart: string | null;
  tier: string | null;
  totalBilled: number;
  totalPaid: number;
  totalWaived: number;
  outstandingDebt: number;
  overpaymentCredit: number;
  charges: ChargeBreakdownItem[];
  payments: PaymentReceiptItem[];
}

/**
 * Format YYYY-MM to Egyptian Arabic month string (e.g. "2026-09" -> "سبتمبر 2026")
 */
export function formatMonthYearAr(monthYear: string): string {
  const [year, month] = monthYear.split("-");
  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const mIndex = parseInt(month, 10) - 1;
  const monthName = monthNames[mIndex] || month;
  return `${monthName} ${year}`;
}

/**
 * Generate monthly charges for all approved members based on their classification
 * Idempotent: will not create duplicate charges if a member already has one for this month
 */
export async function generateMonthlyCharges(params: {
  monthYear: string;
  rates?: Partial<Record<TierType, number>>;
  actorId: string;
}) {
  const { monthYear, rates = {}, actorId } = params;

  // Validate format YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(monthYear)) {
    throw new Error("صيغة الشهر غير صحيحة، يجب أن تكون بتنسيق YYYY-MM (مثال: 2026-10)");
  }

  const db = await getDb();

  // Fetch all approved members
  const approvedMembers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.status, "APPROVED"));

  if (approvedMembers.length === 0) {
    return { generatedCount: 0, totalBilled: 0, monthYear };
  }

  // Fetch existing charges for this month
  const existingCharges = await db
    .select()
    .from(schema.subscriptionCharges)
    .where(eq(schema.subscriptionCharges.monthYear, monthYear));

  const existingUserIds = new Set(existingCharges.map((c) => c.userId));

  const activeRates = {
    STUDENT: rates.STUDENT ?? DEFAULT_TIER_RATES.STUDENT,
    WORKING: rates.WORKING ?? DEFAULT_TIER_RATES.WORKING,
    OTHER: rates.OTHER ?? DEFAULT_TIER_RATES.OTHER,
  };

  const createdCharges = [];
  const nowIso = new Date().toISOString();

  for (const member of approvedMembers) {
    if (existingUserIds.has(member.id)) {
      continue; // Skip if already generated
    }

    const memberTier = (member.tier as TierType) || "WORKING";
    const amountDue = activeRates[memberTier] ?? DEFAULT_TIER_RATES.WORKING;
    const chargeId = `chg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newCharge = {
      id: chargeId,
      userId: member.id,
      monthYear,
      amountDue,
      isWaived: false,
      waivedReason: null,
      createdAt: nowIso,
    };

    await db.insert(schema.subscriptionCharges).values(newCharge);
    createdCharges.push(newCharge);
  }

  const totalBilled = createdCharges.reduce((acc, c) => acc + c.amountDue, 0);

  // Write to audit logs
  if (createdCharges.length > 0) {
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      action: "SUBSCRIPTION_CHARGES_GENERATED",
      entity: "subscription_charges",
      entityId: monthYear,
      oldValue: null,
      newValue: JSON.stringify({
        monthYear,
        generatedCount: createdCharges.length,
        totalBilled,
        rates: activeRates,
      }),
      reason: `إصدار اشتراكات شهر (${formatMonthYearAr(monthYear)}) لعدد (${createdCharges.length}) مرنم بإجمالي ${totalBilled} ج`,
    });
  }

  return {
    generatedCount: createdCharges.length,
    totalBilled,
    monthYear,
    monthYearAr: formatMonthYearAr(monthYear),
  };
}

/**
 * Record a payment with deterministic FIFO allocation or explicit charge override
 * Settles oldest unpaid/partial charges first
 */
export async function recordPaymentWithFIFO(params: {
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string | null;
  explicitChargeId?: string | null;
  actorId: string;
}) {
  const {
    userId,
    amount,
    paymentMethod = "CASH",
    paymentDate,
    notes = null,
    explicitChargeId = null,
    actorId,
  } = params;

  if (amount <= 0) {
    throw new Error("قيمة الدفعة يجب أن تكون أكبر من صفر");
  }

  const db = await getDb();

  // Verify member exists
  const memberRes = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (memberRes.length === 0) {
    throw new Error("المرنم غير موجود في النظام");
  }
  const member = memberRes[0];

  const nowIso = new Date().toISOString();
  const createdPayments = [];

  // MODE A: Explicit Charge Override
  if (explicitChargeId) {
    const chargeRes = await db
      .select()
      .from(schema.subscriptionCharges)
      .where(
        and(
          eq(schema.subscriptionCharges.id, explicitChargeId),
          eq(schema.subscriptionCharges.userId, userId)
        )
      )
      .limit(1);

    if (chargeRes.length === 0) {
      throw new Error("المطالبة الشهرية المحددة غير موجودة أو لا تخص هذا المرنم");
    }

    const pmtId = `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newPayment = {
      id: pmtId,
      userId,
      chargeId: explicitChargeId,
      amountPaid: amount,
      paymentMethod,
      paymentDate: paymentDate || nowIso.split("T")[0],
      notes: notes ? notes.trim() : null,
      recordedBy: actorId,
      createdAt: nowIso,
    };

    await db.insert(schema.subscriptionPayments).values(newPayment);
    createdPayments.push(newPayment);
  } else {
    // MODE B: Deterministic FIFO Allocation (Oldest Unpaid First)
    // 1. Fetch all non-waived charges for this member ordered by monthYear ASC
    const charges = await db
      .select()
      .from(schema.subscriptionCharges)
      .where(
        and(
          eq(schema.subscriptionCharges.userId, userId),
          eq(schema.subscriptionCharges.isWaived, false)
        )
      )
      .orderBy(asc(schema.subscriptionCharges.monthYear));

    // 2. Fetch all existing payments for this user to calculate current paid per charge
    const userPayments = await db
      .select()
      .from(schema.subscriptionPayments)
      .where(eq(schema.subscriptionPayments.userId, userId));

    const chargePaidMap = new Map<string, number>();
    for (const p of userPayments) {
      if (p.chargeId) {
        chargePaidMap.set(p.chargeId, (chargePaidMap.get(p.chargeId) || 0) + p.amountPaid);
      }
    }

    let remainingPaymentToAllocate = amount;

    for (const charge of charges) {
      if (remainingPaymentToAllocate <= 0) break;

      const alreadyPaid = chargePaidMap.get(charge.id) || 0;
      const chargeDueRemaining = Math.max(0, charge.amountDue - alreadyPaid);

      if (chargeDueRemaining > 0) {
        const alloc = Math.min(remainingPaymentToAllocate, chargeDueRemaining);
        const pmtId = `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const allocPayment = {
          id: pmtId,
          userId,
          chargeId: charge.id,
          amountPaid: alloc,
          paymentMethod,
          paymentDate: paymentDate || nowIso.split("T")[0],
          notes: notes
            ? `${notes.trim()} (سداد أقدمية شهر ${formatMonthYearAr(charge.monthYear)})`
            : `سداد بنظام الأقدمية لشهر ${formatMonthYearAr(charge.monthYear)}`,
          recordedBy: actorId,
          createdAt: nowIso,
        };

        await db.insert(schema.subscriptionPayments).values(allocPayment);
        createdPayments.push(allocPayment);

        remainingPaymentToAllocate -= alloc;
      }
    }

    // 3. Surplus / Overpayment handling (Credit for future charges)
    if (remainingPaymentToAllocate > 0) {
      const pmtId = `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const surplusPayment = {
        id: pmtId,
        userId,
        chargeId: null, // Null chargeId designates unallocated advance credit
        amountPaid: remainingPaymentToAllocate,
        paymentMethod,
        paymentDate: paymentDate || nowIso.split("T")[0],
        notes: notes
          ? `${notes.trim()} (رصيد مدفوع مقدماً / فائض)`
          : "رصيد اشتراك مدفوع مقدماً (فائض)",
        recordedBy: actorId,
        createdAt: nowIso,
      };

      await db.insert(schema.subscriptionPayments).values(surplusPayment);
      createdPayments.push(surplusPayment);
    }
  }

  // Audit trail
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    action: "SUBSCRIPTION_PAYMENT_RECORDED",
    entity: "subscription_payments",
    entityId: createdPayments[0]?.id || userId,
    oldValue: null,
    newValue: JSON.stringify({
      userId,
      amount,
      paymentMethod,
      allocationsCount: createdPayments.length,
      explicitChargeId,
    }),
    reason: `تسجيل دفعة اشتراك (${amount} ج) للمرنم ${member.fullName} بواسطة ${PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}`,
  });

  return {
    success: true,
    totalPaid: amount,
    allocations: createdPayments,
  };
}

/**
 * Calculate full financial statement for a member
 */
export async function calculateMemberFinancialStatement(
  userId: string
): Promise<MemberFinancialStatement> {
  const db = await getDb();

  const [userRes, charges, payments, allUsers] = await Promise.all([
    db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1),
    db
      .select()
      .from(schema.subscriptionCharges)
      .where(eq(schema.subscriptionCharges.userId, userId))
      .orderBy(desc(schema.subscriptionCharges.monthYear)),
    db
      .select()
      .from(schema.subscriptionPayments)
      .where(eq(schema.subscriptionPayments.userId, userId))
      .orderBy(desc(schema.subscriptionPayments.paymentDate), desc(schema.subscriptionPayments.createdAt)),
    db.select().from(schema.users),
  ]);

  if (userRes.length === 0) {
    throw new Error("المرنم غير موجود");
  }

  const member = userRes[0];
  const userMap = new Map(allUsers.map((u) => [u.id, u.fullName]));

  // Calculate payments per charge
  const chargePaidMap = new Map<string, number>();
  let totalPaidAll = 0;

  for (const p of payments) {
    totalPaidAll += p.amountPaid;
    if (p.chargeId) {
      chargePaidMap.set(p.chargeId, (chargePaidMap.get(p.chargeId) || 0) + p.amountPaid);
    }
  }

  let totalBilled = 0;
  let totalWaived = 0;

  const chargesBreakdown: ChargeBreakdownItem[] = charges.map((c) => {
    if (c.isWaived) {
      totalWaived += c.amountDue;
      return {
        id: c.id,
        monthYear: c.monthYear,
        amountDue: c.amountDue,
        amountPaid: 0,
        remainingDue: 0,
        isWaived: true,
        waivedReason: c.waivedReason,
        status: "WAIVED",
        createdAt: c.createdAt,
      };
    }

    totalBilled += c.amountDue;
    const paid = chargePaidMap.get(c.id) || 0;
    const remaining = Math.max(0, c.amountDue - paid);

    let status: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";
    if (paid >= c.amountDue) {
      status = "PAID";
    } else if (paid > 0) {
      status = "PARTIAL";
    }

    return {
      id: c.id,
      monthYear: c.monthYear,
      amountDue: c.amountDue,
      amountPaid: paid,
      remainingDue: remaining,
      isWaived: false,
      waivedReason: null,
      status,
      createdAt: c.createdAt,
    };
  });

  const outstandingDebt = Math.max(0, totalBilled - totalPaidAll);
  const overpaymentCredit = Math.max(0, totalPaidAll - totalBilled);

  const paymentsHistory: PaymentReceiptItem[] = payments.map((p) => ({
    id: p.id,
    chargeId: p.chargeId,
    amountPaid: p.amountPaid,
    paymentMethod: p.paymentMethod || "CASH",
    paymentDate: p.paymentDate,
    notes: p.notes,
    recordedBy: p.recordedBy,
    recordedByName: userMap.get(p.recordedBy) || "أمين الصندوق",
    createdAt: p.createdAt,
  }));

  return {
    userId: member.id,
    fullName: member.fullName,
    phone: member.phone,
    voicePart: member.voicePart,
    tier: member.tier,
    totalBilled,
    totalPaid: totalPaidAll,
    totalWaived,
    outstandingDebt,
    overpaymentCredit,
    charges: chargesBreakdown,
    payments: paymentsHistory,
  };
}

/**
 * Waive a subscription charge (Strictly Admin / Super Admin)
 */
export async function waiveSubscriptionCharge(params: {
  chargeId: string;
  reason: string;
  actorId: string;
}) {
  const { chargeId, reason, actorId } = params;
  const db = await getDb();

  const chargeRes = await db
    .select()
    .from(schema.subscriptionCharges)
    .where(eq(schema.subscriptionCharges.id, chargeId))
    .limit(1);

  if (chargeRes.length === 0) {
    throw new Error("المطالبة الشهرية غير موجودة");
  }

  const charge = chargeRes[0];
  const trimmedReason = reason.trim();
  if (trimmedReason.length < 3) {
    throw new Error("سبب الإعفاء إلزامي للرقابة والتدقيق (3 أحرف على الأقل)");
  }

  await db
    .update(schema.subscriptionCharges)
    .set({
      isWaived: true,
      waivedReason: trimmedReason,
    })
    .where(eq(schema.subscriptionCharges.id, chargeId));

  // Audit log
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    action: "SUBSCRIPTION_CHARGE_WAIVED",
    entity: "subscription_charges",
    entityId: chargeId,
    oldValue: JSON.stringify({ isWaived: charge.isWaived, amountDue: charge.amountDue }),
    newValue: JSON.stringify({ isWaived: true, waivedReason: trimmedReason }),
    reason: `إعفاء اشتراك شهر (${formatMonthYearAr(charge.monthYear)}) بقيمة ${charge.amountDue} ج. السبب: ${trimmedReason}`,
  });

  return { success: true, message: "تم إعفاء المطالبة الشهرية بنجاح" };
}

/**
 * Get comprehensive collection roster across all approved members
 */
export async function getSubscriptionRoster() {
  const db = await getDb();

  const [approvedUsers, allCharges, allPayments] = await Promise.all([
    db.select().from(schema.users).where(eq(schema.users.status, "APPROVED")),
    db.select().from(schema.subscriptionCharges),
    db.select().from(schema.subscriptionPayments),
  ]);

  // Map charges by user
  const userChargesMap = new Map<string, typeof allCharges>();
  for (const c of allCharges) {
    const list = userChargesMap.get(c.userId) || [];
    list.push(c);
    userChargesMap.set(c.userId, list);
  }

  // Map payments by user
  const userPaymentsMap = new Map<string, typeof allPayments>();
  for (const p of allPayments) {
    const list = userPaymentsMap.get(p.userId) || [];
    list.push(p);
    userPaymentsMap.set(p.userId, list);
  }

  let globalBilled = 0;
  let globalCollected = 0;
  let globalOutstanding = 0;

  const roster = approvedUsers.map((user) => {
    const charges = userChargesMap.get(user.id) || [];
    const payments = userPaymentsMap.get(user.id) || [];

    const totalBilled = charges
      .filter((c) => !c.isWaived)
      .reduce((sum, c) => sum + c.amountDue, 0);

    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const outstandingDebt = Math.max(0, totalBilled - totalPaid);

    globalBilled += totalBilled;
    globalCollected += totalPaid;
    globalOutstanding += outstandingDebt;

    // Get latest payment date
    let lastPaymentDate: string | null = null;
    if (payments.length > 0) {
      const sorted = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
      lastPaymentDate = sorted[0].paymentDate;
    }

    return {
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      voicePart: user.voicePart,
      tier: user.tier,
      totalBilled,
      totalPaid,
      outstandingDebt,
      hasOutstandingDebt: outstandingDebt > 0,
      isFullyPaid: totalBilled > 0 && outstandingDebt === 0,
      noChargesYet: totalBilled === 0,
      lastPaymentDate,
      chargesCount: charges.length,
      paymentsCount: payments.length,
    };
  });

  // Sort: members with outstanding debt first, then by debt descending
  roster.sort((a, b) => b.outstandingDebt - a.outstandingDebt);

  const collectionRate =
    globalBilled > 0 ? Math.round((globalCollected / globalBilled) * 100) : 100;

  return {
    roster,
    stats: {
      totalMembers: approvedUsers.length,
      totalBilled: globalBilled,
      totalCollected: globalCollected,
      totalOutstanding: globalOutstanding,
      collectionRatePercent: Math.min(100, collectionRate),
    },
  };
}

