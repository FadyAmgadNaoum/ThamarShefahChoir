import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { deriveWindowStatus } from "@/lib/attendance/time";
import { ATTENDANCE_STATUS_META } from "@/lib/attendance/classification";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/rehearsals/list
 * Returns all rehearsals for the active quarter with the member's personal attendance status
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const db = await getDb();

    // 1. Fetch active quarter
    const activeQuarters = await db
      .select()
      .from(schema.quarters)
      .where(eq(schema.quarters.status, "ACTIVE"))
      .limit(1);

    const quarter = activeQuarters.length > 0 ? activeQuarters[0] : null;

    // 2. Fetch rehearsals for active quarter (or all if none active)
    const rehearsals = quarter
      ? await db
          .select()
          .from(schema.rehearsals)
          .where(eq(schema.rehearsals.quarterId, quarter.id))
          .orderBy(desc(schema.rehearsals.date))
      : await db
          .select()
          .from(schema.rehearsals)
          .orderBy(desc(schema.rehearsals.date));

    // 3. Fetch member's attendance records
    const memberAttendance = await db
      .select()
      .from(schema.attendance)
      .where(eq(schema.attendance.userId, user.userId));

    const attMap = new Map(memberAttendance.map((a) => [a.rehearsalId, a]));

    const calendarItems = rehearsals.map((r) => {
      const windowStatus = deriveWindowStatus(r.date, r.startTime, r.endTime);
      const userAtt = attMap.get(r.id);

      let colorIndicator: "GREEN" | "YELLOW" | "RED" | "BLUE" | "GRAY" = "GRAY";
      let statusLabel = "قادمة";

      if (userAtt) {
        if (userAtt.status === "PRESENT") {
          colorIndicator = "GREEN";
          statusLabel = "حاضر في ميعادك";
        } else if (userAtt.status === "LATE") {
          colorIndicator = "YELLOW";
          statusLabel = "متأخر";
        } else if (userAtt.status === "VERY_LATE" || userAtt.status === "EXTREME_LATE") {
          colorIndicator = "RED";
          statusLabel = userAtt.status === "VERY_LATE" ? "تأخير كبير" : "تأخير حرج";
        } else if (userAtt.status === "EXCUSED_ABSENCE") {
          colorIndicator = "BLUE";
          statusLabel = "غياب بعذر مقبول";
        } else if (userAtt.status === "ABSENT") {
          colorIndicator = "RED";
          statusLabel = "غياب بدون إذن";
        }
      } else {
        if (windowStatus === "CLOSED") {
          colorIndicator = "RED";
          statusLabel = "لم يتم الحضور (غياب)";
        } else if (windowStatus === "OPEN") {
          colorIndicator = "YELLOW";
          statusLabel = "مفتوحة للتسجيل الآن";
        } else {
          colorIndicator = "GRAY";
          statusLabel = "بروفة قادمة";
        }
      }

      return {
        ...r,
        windowStatus,
        userAttendance: userAtt || null,
        colorIndicator,
        statusLabel,
      };
    });

    return NextResponse.json({
      quarter,
      rehearsals: calendarItems,
    });
  } catch (err: unknown) {
    console.error("Rehearsal list error:", err);
    return NextResponse.json({ error: "فشل استرجاع جدول البروفات" }, { status: 500 });
  }
}
