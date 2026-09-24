import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { deriveWindowStatus } from "@/lib/attendance/time";
import { calculateHaversineDistance } from "@/lib/attendance/haversine";
import { classifyArrival } from "@/lib/attendance/classification";
import { evaluateAttendancePoints } from "@/lib/points/engine";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/attendance/check-in
 * Server-authoritative GPS check-in endpoint
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json(
        { error: "حسابك قيد المراجعة ولا يمكنك تسجيل الحضور بعد" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      rehearsalId?: string;
    };

    const { latitude, longitude, rehearsalId } = body;

    // Validate coordinates
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "إحداثيات الموقع (GPS) غير صحيحة أو غير متاحة" },
        { status: 400 }
      );
    }

    const db = await getDb();
    let targetRehearsal;

    if (rehearsalId) {
      const found = await db
        .select()
        .from(schema.rehearsals)
        .where(eq(schema.rehearsals.id, rehearsalId))
        .limit(1);
      if (found.length > 0) {
        targetRehearsal = found[0];
      }
    } else {
      // Resolve active rehearsal automatically: find rehearsal with OPEN window in active quarter
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

        targetRehearsal = rehearsals.find(
          (r) => deriveWindowStatus(r.date, r.startTime, r.endTime) === "OPEN"
        );
      }
    }

    if (!targetRehearsal) {
      return NextResponse.json(
        { error: "لا توجد بروفة مفتوحة لتسجيل الحضور حالياً" },
        { status: 404 }
      );
    }

    // 1. Time window validation
    const windowStatus = deriveWindowStatus(
      targetRehearsal.date,
      targetRehearsal.startTime,
      targetRehearsal.endTime
    );

    if (windowStatus === "NOT_STARTED") {
      return NextResponse.json(
        {
          error: `لم يبدأ موعد تسجيل الحضور بعد. موعد البروفة يبدأ في الساعة ${targetRehearsal.startTime}`,
        },
        { status: 400 }
      );
    }

    if (windowStatus === "CLOSED") {
      return NextResponse.json(
        { error: "انتهت فترة تسجيل الحضور الرسمية لهذه البروفة" },
        { status: 400 }
      );
    }

    // 2. Check for duplicate check-in
    const existing = await db
      .select()
      .from(schema.attendance)
      .where(
        and(
          eq(schema.attendance.rehearsalId, targetRehearsal.id),
          eq(schema.attendance.userId, user.userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: `لقد قمت بتسجيل حضورك لهذه البروفة بالفعل في ميعاد (${new Date(existing[0].checkInTime || "").toLocaleTimeString("ar-EG")})`,
          attendance: existing[0],
          isDuplicate: true,
        },
        { status: 409 }
      );
    }

    // 3. Server-Authoritative Haversine Distance Calculation
    const distanceMeters = calculateHaversineDistance(
      latitude,
      longitude,
      targetRehearsal.latitude,
      targetRehearsal.longitude
    );

    if (distanceMeters > targetRehearsal.radiusMeters) {
      return NextResponse.json(
        {
          error: `أنت خارج النطاق الجغرافي للبروفة. المسافة الحالية (${distanceMeters} متر)، والحد الأقصى المسموح به (${targetRehearsal.radiusMeters} متر) داخل ${targetRehearsal.locationName}.`,
          distanceMeters,
          allowedRadiusMeters: targetRehearsal.radiusMeters,
          targetLocation: targetRehearsal.locationName,
        },
        { status: 400 }
      );
    }

    // 4. Arrival Classification
    const now = new Date();
    const classification = classifyArrival(
      now,
      targetRehearsal.date,
      targetRehearsal.startTime
    );

    const attendanceId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const checkInIso = now.toISOString();

    // 5. Store attendance record with server evidence
    await db.insert(schema.attendance).values({
      id: attendanceId,
      rehearsalId: targetRehearsal.id,
      userId: user.userId,
      checkInTime: checkInIso,
      checkOutTime: null,
      distanceMeters,
      status: classification.status,
      isManualAdjustment: false,
      notes: `حضور آلي عبر GPS (المسافة: ${distanceMeters}م - تأخير: ${classification.delayMinutes} دقيقة)`,
    });

    // 6. Points Engine evaluation (Real-time points calculation)
    let pointsAwarded = null;
    try {
      const pResult = await evaluateAttendancePoints({
        userId: user.userId,
        rehearsalId: targetRehearsal.id,
        quarterId: targetRehearsal.quarterId,
        status: classification.status,
        actorId: user.userId,
      });
      pointsAwarded = {
        pointsDelta: pResult.pointsDelta,
        reason: pResult.transaction.reason,
        occurrenceCount: pResult.occurrenceCount,
      };
    } catch (pointsErr) {
      console.error("Points evaluation error during check-in:", pointsErr);
    }

    // 7. Audit Trail
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: user.userId,
      action: "ATTENDANCE_CHECK_IN",
      entity: "attendance",
      entityId: attendanceId,
      oldValue: null,
      newValue: JSON.stringify({
        status: classification.status,
        distanceMeters,
        checkInTime: checkInIso,
        rehearsalId: targetRehearsal.id,
        pointsAwarded,
      }),
      reason: `تسجيل حضور آلي (${classification.meta.labelAr}) للعضو ${user.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: `تم تسجيل حضورك بنجاح: ${classification.meta.labelAr}`,
      attendance: {
        id: attendanceId,
        rehearsalId: targetRehearsal.id,
        rehearsalTitle: targetRehearsal.title,
        status: classification.status,
        checkInTime: checkInIso,
        distanceMeters,
        meta: classification.meta,
        delayMinutes: classification.delayMinutes,
      },
      points: pointsAwarded,
    });
  } catch (err: unknown) {
    console.error("Attendance check-in error:", err);
    return NextResponse.json({ error: "فشل تسجيل الحضور، يرجى المحاولة لاحقاً" }, { status: 500 });
  }
}

