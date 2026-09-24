import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { calculateMemberQuarterPoints } from "@/lib/points/engine";
import { eq, desc } from "drizzle-orm";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

/**
 * GET /api/admin/points/summary?quarterId=...
 * Admin points roster: points leaderboard and stats for all approved members
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
      const activeQuarter = await db
        .select()
        .from(schema.quarters)
        .where(eq(schema.quarters.status, "ACTIVE"))
        .limit(1);

      if (activeQuarter.length > 0) {
        quarterId = activeQuarter[0].id;
      } else {
        const latest = await db.select().from(schema.quarters).limit(1);
        if (latest.length > 0) {
          quarterId = latest[0].id;
        }
      }
    }

    if (!quarterId) {
      return NextResponse.json({ members: [], quarter: null });
    }

    const [quarterRes, approvedUsers] = await Promise.all([
      db.select().from(schema.quarters).where(eq(schema.quarters.id, quarterId)).limit(1),
      db.select().from(schema.users).where(eq(schema.users.status, "APPROVED")),
    ]);

    const quarter = quarterRes.length > 0 ? quarterRes[0] : null;

    // Calculate points for each approved member
    const memberPointsList = await Promise.all(
      approvedUsers.map(async (u) => {
        const points = await calculateMemberQuarterPoints(u.id, quarterId as string);
        return {
          userId: u.id,
          fullName: u.fullName,
          phone: u.phone,
          voicePart: u.voicePart,
          tier: u.tier,
          totalPoints: points.totalPoints,
          automaticPoints: points.automaticPoints,
          manualBonusPoints: points.manualBonusPoints,
          manualDeductionPoints: points.manualDeductionPoints,
          tierBadge: points.tierBadge,
          tierLabel: points.tierLabel,
          tierColor: points.tierColor,
          transactionCount: points.transactionCount,
        };
      })
    );

    // Sort by totalPoints descending (leaderboard)
    memberPointsList.sort((a, b) => b.totalPoints - a.totalPoints);

    // Also fetch all quarters list
    const quartersRaw = await db
      .select()
      .from(schema.quarters)
      .orderBy(desc(schema.quarters.startDate));
    const allQuarters = quartersRaw.map((q) => ({ id: q.id, name: q.name, status: q.status }));

    return NextResponse.json({
      quarter,
      allQuarters,
      members: memberPointsList,
    });
  } catch (err: unknown) {
    console.error("Fetch points summary error:", err);
    return NextResponse.json({ error: "فشل استرجاع ملخص النقاط" }, { status: 500 });
  }
}
