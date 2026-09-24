import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { deriveWindowStatus } from "@/lib/attendance/time";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/rehearsals/active
 * Returns the currently open rehearsal or next upcoming rehearsal
 */
export async function GET() {
  try {
    const db = await getDb();

    // 1. Find active quarter
    const activeQuarters = await db
      .select()
      .from(schema.quarters)
      .where(eq(schema.quarters.status, "ACTIVE"))
      .limit(1);

    if (activeQuarters.length === 0) {
      return NextResponse.json({
        rehearsal: null,
        activeQuarter: null,
        message: "لا يوجد فصل سنوي نشط حالياً",
      });
    }

    const quarter = activeQuarters[0];

    // 2. Find rehearsals for this quarter
    const rehearsals = await db
      .select()
      .from(schema.rehearsals)
      .where(eq(schema.rehearsals.quarterId, quarter.id))
      .orderBy(desc(schema.rehearsals.date));

    // Calculate window status for all rehearsals
    const evaluated = rehearsals.map((r) => ({
      ...r,
      windowStatus: deriveWindowStatus(r.date, r.startTime, r.endTime),
    }));

    // Find currently OPEN rehearsal
    const openRehearsal = evaluated.find((r) => r.windowStatus === "OPEN");
    if (openRehearsal) {
      return NextResponse.json({
        rehearsal: openRehearsal,
        activeQuarter: quarter,
        isOpenForCheckIn: true,
      });
    }

    // Otherwise find closest upcoming rehearsal
    const upcomingRehearsals = evaluated
      .filter((r) => r.windowStatus === "NOT_STARTED")
      .reverse(); // Earliest date first

    const nextUpcoming = upcomingRehearsals[0] || evaluated[0] || null;

    return NextResponse.json({
      rehearsal: nextUpcoming,
      activeQuarter: quarter,
      isOpenForCheckIn: false,
    });
  } catch (err: unknown) {
    console.error("Active rehearsal error:", err);
    return NextResponse.json({ error: "فشل استرجاع بيانات البروفة النشطة" }, { status: 500 });
  }
}

