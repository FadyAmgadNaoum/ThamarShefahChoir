import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { ATTENDANCE_STATUS_META } from "@/lib/attendance/classification";
import { eq, desc } from "drizzle-orm";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

/**
 * GET /api/attendance/roster?rehearsalId=...
 * Admin endpoint returning the live attendance roster with evidence for a rehearsal
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rehearsalId = searchParams.get("rehearsalId");

    const db = await getDb();

    // Find rehearsal
    let targetRehearsal;
    if (rehearsalId) {
      const found = await db
        .select()
        .from(schema.rehearsals)
        .where(eq(schema.rehearsals.id, rehearsalId))
        .limit(1);
      if (found.length > 0) targetRehearsal = found[0];
    } else {
      const allRehearsals = await db
        .select()
        .from(schema.rehearsals)
        .orderBy(desc(schema.rehearsals.date))
        .limit(1);
      if (allRehearsals.length > 0) targetRehearsal = allRehearsals[0];
    }

    if (!targetRehearsal) {
      return NextResponse.json({
        rehearsal: null,
        attendees: [],
        stats: { total: 0, present: 0, late: 0, veryLate: 0, extremeLate: 0 },
      });
    }

    // Fetch attendance records for this rehearsal
    const attendanceRecords = await db
      .select()
      .from(schema.attendance)
      .where(eq(schema.attendance.rehearsalId, targetRehearsal.id))
      .orderBy(desc(schema.attendance.checkInTime));

    // Fetch all users to join details
    const allUsers = await db.select().from(schema.users);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const attendees = attendanceRecords.map((att) => {
      const u = userMap.get(att.userId);
      const meta = ATTENDANCE_STATUS_META[att.status as keyof typeof ATTENDANCE_STATUS_META] || {
        labelAr: att.status,
        badgeClass: "bg-gray-50 text-gray-700",
        textClass: "text-gray-700",
      };

      return {
        id: att.id,
        userId: att.userId,
        fullName: u?.fullName || "عضو غير معروف",
        email: u?.email || "",
        phone: u?.phone || "",
        voicePart: u?.voicePart || "UNASSIGNED",
        tier: u?.tier || "WORKING",
        photoUrl: u?.profilePhotoUrl,
        checkInTime: att.checkInTime,
        checkOutTime: att.checkOutTime,
        distanceMeters: att.distanceMeters,
        status: att.status,
        meta,
        notes: att.notes,
        isManualAdjustment: att.isManualAdjustment,
      };
    });

    // Statistics breakdown
    const stats = {
      total: attendees.length,
      present: attendees.filter((a) => a.status === "PRESENT").length,
      late: attendees.filter((a) => a.status === "LATE").length,
      veryLate: attendees.filter((a) => a.status === "VERY_LATE").length,
      extremeLate: attendees.filter((a) => a.status === "EXTREME_LATE").length,
    };

    return NextResponse.json({
      rehearsal: targetRehearsal,
      attendees,
      stats,
    });
  } catch (err: unknown) {
    console.error("Fetch attendance roster error:", err);
    return NextResponse.json({ error: "فشل تحميل سجل حضور البروفة" }, { status: 500 });
  }
}
