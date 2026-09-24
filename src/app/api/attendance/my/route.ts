import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { ATTENDANCE_STATUS_META } from "@/lib/attendance/classification";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/attendance/my
 * Returns the current logged-in member's attendance history and statistics
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const db = await getDb();

    // Fetch all rehearsals to join titles and dates
    const allRehearsals = await db.select().from(schema.rehearsals);
    const rehearsalMap = new Map(allRehearsals.map((r) => [r.id, r]));

    // Fetch user's attendance records
    const records = await db
      .select()
      .from(schema.attendance)
      .where(eq(schema.attendance.userId, user.userId))
      .orderBy(desc(schema.attendance.checkInTime));

    const enrichedRecords = records.map((rec) => {
      const reh = rehearsalMap.get(rec.rehearsalId);
      const meta = ATTENDANCE_STATUS_META[rec.status as keyof typeof ATTENDANCE_STATUS_META] || {
        labelAr: rec.status,
        badgeClass: "bg-gray-50 text-gray-700",
        textClass: "text-gray-700",
      };

      return {
        ...rec,
        rehearsalTitle: reh?.title || "بروفة",
        rehearsalDate: reh?.date || "",
        rehearsalStartTime: reh?.startTime || "",
        rehearsalEndTime: reh?.endTime || "",
        locationName: reh?.locationName || "",
        meta,
      };
    });

    const total = enrichedRecords.length;
    const present = enrichedRecords.filter((r) => r.status === "PRESENT").length;
    const late = enrichedRecords.filter((r) => r.status === "LATE").length;
    const attendancePercentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return NextResponse.json({
      records: enrichedRecords,
      stats: {
        totalAttended: total,
        presentCount: present,
        lateCount: late,
        attendancePercentage,
      },
    });
  } catch (err: unknown) {
    console.error("Fetch my attendance error:", err);
    return NextResponse.json({ error: "فشل استرجاع سجل حضورك" }, { status: 500 });
  }
}

