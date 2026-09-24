import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { evaluateAttendancePoints } from "@/lib/points/engine";
import { eq, and } from "drizzle-orm";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

/**
 * PATCH /api/admin/excuses/[id]
 * Approve or reject an excuse submission with attendance auto-sync
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بمراجعة الأعذار" }, { status: 403 });
    }

    const { id: excuseId } = params;
    if (!excuseId) {
      return NextResponse.json({ error: "معرف العذر مفقود" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات المراجعة غير صحيحة" },
        { status: 400 }
      );
    }

    const { status: newStatus, notes } = parsed.data;
    const db = await getDb();

    // Fetch existing excuse
    const existing = await db
      .select()
      .from(schema.excuseRequests)
      .where(eq(schema.excuseRequests.id, excuseId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "طلب العذر غير موجود" }, { status: 404 });
    }

    const excuse = existing[0];
    const reviewedAt = new Date().toISOString();

    // 1. Update the excuse request record
    await db
      .update(schema.excuseRequests)
      .set({
        status: newStatus,
        reviewerNotes: notes !== undefined ? (notes ? notes.trim() : null) : excuse.reviewerNotes,
        reviewedBy: admin.userId,
        reviewedAt,
      })
      .where(eq(schema.excuseRequests.id, excuseId));

    // 2. Attendance Auto-Sync for ABSENCE
    // "Automatically update unattended rehearsals with approved absence excuses to EXCUSED_ABSENCE"
    if (excuse.type === "ABSENCE") {
      const existingAttendance = await db
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.rehearsalId, excuse.rehearsalId),
            eq(schema.attendance.userId, excuse.userId)
          )
        )
        .limit(1);

      if (newStatus === "APPROVED") {
        if (existingAttendance.length === 0) {
          // Create attendance record with EXCUSED_ABSENCE
          await db.insert(schema.attendance).values({
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            rehearsalId: excuse.rehearsalId,
            userId: excuse.userId,
            checkInTime: null,
            checkOutTime: null,
            distanceMeters: null,
            status: "EXCUSED_ABSENCE",
            isManualAdjustment: true,
            notes: notes ? `غياب بعذر معتمد: ${notes}` : `غياب بعذر معتمد: ${excuse.reason}`,
            createdAt: reviewedAt,
          });
        } else if (!existingAttendance[0].checkInTime) {
          // Unattended rehearsal, update status to EXCUSED_ABSENCE
          await db
            .update(schema.attendance)
            .set({
              status: "EXCUSED_ABSENCE",
              isManualAdjustment: true,
              notes: notes ? `غياب بعذر معتمد: ${notes}` : `غياب بعذر معتمد: ${excuse.reason}`,
            })
            .where(eq(schema.attendance.id, existingAttendance[0].id));
        }
      } else if (newStatus === "REJECTED") {
        // If it was previously marked as EXCUSED_ABSENCE without check-in, revert to ABSENT
        if (existingAttendance.length > 0 && !existingAttendance[0].checkInTime) {
          await db
            .update(schema.attendance)
            .set({
              status: "ABSENT",
              notes: notes ? `تم رفض طلب العذر: ${notes}` : "تم رفض طلب العذر",
            })
            .where(eq(schema.attendance.id, existingAttendance[0].id));
        }
      }

      // Synchronize points engine with excuse attendance outcome
      try {
        await evaluateAttendancePoints({
          userId: excuse.userId,
          rehearsalId: excuse.rehearsalId,
          status: newStatus === "APPROVED" ? "EXCUSED_ABSENCE" : "ABSENT",
          actorId: admin.userId,
        });
      } catch (pointsErr) {
        console.error("Points evaluation error during excuse review:", pointsErr);
      }
    }

    // 3. Write to audit logs
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: newStatus === "APPROVED" ? "EXCUSE_APPROVED" : "EXCUSE_REJECTED",
      entity: "excuse_requests",
      entityId: excuseId,
      oldValue: excuse.status,
      newValue: newStatus,
      reason: notes || `مراجعة العذر: ${newStatus}`,
    });

    return NextResponse.json({
      message:
        newStatus === "APPROVED"
          ? "تم اعتماد العذر بنجاح وتحديث سجل الحضور"
          : "تم رفض طلب العذر بنجاح",
      status: newStatus,
    });
  } catch (err: unknown) {
    console.error("Review excuse error:", err);
    return NextResponse.json({ error: "فشل تحديث حالة العذر" }, { status: 500 });
  }
}
