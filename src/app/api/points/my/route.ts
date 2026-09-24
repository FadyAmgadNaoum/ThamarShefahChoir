import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { calculateMemberQuarterPoints } from "@/lib/points/engine";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/points/my?quarterId=...
 * Member points wallet: returns total points, breakdown, tier badge, and ledger
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let quarterId = searchParams.get("quarterId");

    const db = await getDb();

    // If no quarterId provided, get current ACTIVE quarter or latest
    if (!quarterId) {
      const activeQuarter = await db
        .select()
        .from(schema.quarters)
        .where(eq(schema.quarters.status, "ACTIVE"))
        .limit(1);

      if (activeQuarter.length > 0) {
        quarterId = activeQuarter[0].id;
      } else {
        const latest = await db
          .select()
          .from(schema.quarters)
          .orderBy(desc(schema.quarters.startDate))
          .limit(1);
        if (latest.length > 0) {
          quarterId = latest[0].id;
        }
      }
    }

    if (!quarterId) {
      return NextResponse.json({
        totalPoints: 0,
        automaticPoints: 0,
        manualBonusPoints: 0,
        manualDeductionPoints: 0,
        tierBadge: "لا يوجد ربع سنوي متاح",
        tierLabel: "غير محدد",
        transactions: [],
        quarter: null,
      });
    }

    const [quarterRes, memberPoints, rehearsals] = await Promise.all([
      db.select().from(schema.quarters).where(eq(schema.quarters.id, quarterId)).limit(1),
      calculateMemberQuarterPoints(user.userId, quarterId),
      db.select().from(schema.rehearsals).where(eq(schema.rehearsals.quarterId, quarterId)),
    ]);

    const quarter = quarterRes.length > 0 ? quarterRes[0] : null;
    const rehearsalMap = new Map(rehearsals.map((r) => [r.id, r]));

    // Enrich transactions with rehearsal titles & dates
    const enrichedTransactions = memberPoints.transactions.map((tx) => {
      const reh = tx.rehearsalId ? rehearsalMap.get(tx.rehearsalId) : null;
      return {
        ...tx,
        rehearsalTitle: reh?.title || null,
        rehearsalDate: reh?.date || null,
        locationName: reh?.locationName || null,
      };
    });

    // Also fetch all quarters list for the quarter switcher
    const quartersRaw = await db
      .select()
      .from(schema.quarters)
      .orderBy(desc(schema.quarters.startDate));
    const allQuarters = quartersRaw.map((q) => ({ id: q.id, name: q.name, status: q.status }));

    return NextResponse.json({
      quarter,
      allQuarters,
      totalPoints: memberPoints.totalPoints,
      automaticPoints: memberPoints.automaticPoints,
      manualBonusPoints: memberPoints.manualBonusPoints,
      manualDeductionPoints: memberPoints.manualDeductionPoints,
      tierBadge: memberPoints.tierBadge,
      tierLabel: memberPoints.tierLabel,
      tierColor: memberPoints.tierColor,
      transactionCount: memberPoints.transactionCount,
      transactions: enrichedTransactions,
    });
  } catch (err: unknown) {
    console.error("Fetch member points error:", err);
    return NextResponse.json({ error: "فشل استرجاع بيانات النقاط" }, { status: 500 });
  }
}
