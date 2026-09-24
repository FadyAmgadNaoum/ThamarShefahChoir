import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { deriveWindowStatus } from "@/lib/attendance/time";
import { ATTENDANCE_STATUS_META } from "@/lib/attendance/classification";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/rehearsals/[rehearsalId]
 * Returns rehearsal details along with the logged-in member's attendance evidence
 */
export async function GET(
  request: Request,
  { params }: { params: { rehearsalId: string } }
) {
  try {
    const { rehearsalId } = params;
    if (!rehearsalId) {
      return NextResponse.json({ error: "معرف البروفة مطلوب" }, { status: 400 });
    }

    const db = await getDb();
    const found = await db
      .select()
      .from(schema.rehearsals)
      .where(eq(schema.rehearsals.id, rehearsalId))
      .limit(1);

    if (found.length === 0) {
      return NextResponse.json({ error: "البروفة غير موجودة" }, { status: 404 });
    }

    const rehearsal = found[0];
    const windowStatus = deriveWindowStatus(
      rehearsal.date,
      rehearsal.startTime,
      rehearsal.endTime
    );

    // Fetch user-specific attendance if authenticated
    const user = await getCurrentUser();
    let userAttendance = null;

    if (user) {
      const att = await db
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.rehearsalId, rehearsal.id),
            eq(schema.attendance.userId, user.userId)
          )
        )
        .limit(1);

      if (att.length > 0) {
        const meta =
          ATTENDANCE_STATUS_META[
            att[0].status as keyof typeof ATTENDANCE_STATUS_META
          ] || {
            labelAr: att[0].status,
            badgeClass: "bg-gray-100 text-gray-700",
            textClass: "text-gray-700",
          };
        userAttendance = {
          ...att[0],
          meta,
        };
      }
    }

    return NextResponse.json({
      rehearsal: {
        ...rehearsal,
        windowStatus,
      },
      userAttendance,
    });
  } catch (err: unknown) {
    console.error("Rehearsal detail error:", err);
    return NextResponse.json(
      { error: "فشل استرجاع تفاصيل البروفة" },
      { status: 500 }
    );
  }
}

