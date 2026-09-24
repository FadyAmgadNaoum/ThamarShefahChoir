import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/attendance/check-out
 * Allows a member to record their checkout time from a rehearsal
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const body = (await request.json()) as { rehearsalId?: string };
    const { rehearsalId } = body;

    const db = await getDb();

    // Query open rehearsal if rehearsalId not specified
    let targetRehearsalId = rehearsalId;
    if (!targetRehearsalId) {
      const activeQuarters = await db
        .select()
        .from(schema.quarters)
        .where(eq(schema.quarters.status, "ACTIVE"))
        .limit(1);

      if (activeQuarters.length > 0) {
        const rehearsals = await db
          .select()
          .from(schema.rehearsals)
          .where(eq(schema.rehearsals.quarterId, activeQuarters[0].id));

        const activeRehearsal = rehearsals[0];
        if (activeRehearsal) {
          targetRehearsalId = activeRehearsal.id;
        }
      }
    }

    if (!targetRehearsalId) {
      return NextResponse.json({ error: "يرجى تحديد البروفة المراد تسجيل الانصراف منها" }, { status: 400 });
    }

    // Find attendance record
    const records = await db
      .select()
      .from(schema.attendance)
      .where(
        and(
          eq(schema.attendance.rehearsalId, targetRehearsalId),
          eq(schema.attendance.userId, user.userId)
        )
      )
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تسجيل حضورك لهذه البروفة حتى تتمكن من تسجيل الانصراف" },
        { status: 400 }
      );
    }

    const currentRecord = records[0];
    if (currentRecord.checkOutTime) {
      return NextResponse.json(
        {
          error: `تم تسجيل انصرافك مسبقاً في (${new Date(currentRecord.checkOutTime).toLocaleTimeString("ar-EG")})`,
          attendance: currentRecord,
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const checkOutIso = now.toISOString();

    await db
      .update(schema.attendance)
      .set({ checkOutTime: checkOutIso })
      .where(eq(schema.attendance.id, currentRecord.id));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: user.userId,
      action: "ATTENDANCE_CHECK_OUT",
      entity: "attendance",
      entityId: currentRecord.id,
      oldValue: null,
      newValue: checkOutIso,
      reason: `تسجيل انصراف العضو ${user.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل انصرافك بنجاح. بركة صلواتكم!",
      checkOutTime: checkOutIso,
    });
  } catch (err: unknown) {
    console.error("Attendance check-out error:", err);
    return NextResponse.json({ error: "فشل تسجيل الانصراف" }, { status: 500 });
  }
}

