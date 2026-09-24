import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { eq, desc, ne } from "drizzle-orm";

/**
 * Helper to check Admin/Super Admin authorization
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

/**
 * GET /api/admin/quarters
 * List all quarters with rehearsal statistics
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const db = await getDb();
    const quartersList = await db.select().from(schema.quarters).orderBy(desc(schema.quarters.startDate));
    const rehearsalsList = await db.select().from(schema.rehearsals);

    // Count rehearsals per quarter
    const rehearsalCountMap = new Map<string, number>();
    for (const r of rehearsalsList) {
      rehearsalCountMap.set(r.quarterId, (rehearsalCountMap.get(r.quarterId) || 0) + 1);
    }

    const result = quartersList.map((q) => ({
      ...q,
      rehearsalsCount: rehearsalCountMap.get(q.id) || 0,
    }));

    return NextResponse.json({ quarters: result });
  } catch (err: unknown) {
    console.error("Fetch quarters error:", err);
    return NextResponse.json({ error: "فشل تحميل بيانات الفصول السنوية" }, { status: 500 });
  }
}

/**
 * POST /api/admin/quarters
 * Create a new quarter (defaults to UPCOMING or ACTIVE)
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = (await request.json()) as {
      name?: string;
      startDate?: string;
      endDate?: string;
      status?: "UPCOMING" | "ACTIVE" | "CLOSED";
    };

    const { name, startDate, endDate, status = "UPCOMING" } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "اسم الفصل وتاريخ البدء وتاريخ الانتهاء حقول مطلوبة" }, { status: 400 });
    }

    const db = await getDb();
    const quarterId = `qtr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // If new quarter is created as ACTIVE, close any other currently active quarter
    if (status === "ACTIVE") {
      await db
        .update(schema.quarters)
        .set({ status: "CLOSED" })
        .where(eq(schema.quarters.status, "ACTIVE"));
    }

    await db.insert(schema.quarters).values({
      id: quarterId,
      name: name.trim(),
      startDate,
      endDate,
      status,
    });

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "QUARTER_CREATED",
      entity: "quarters",
      entityId: quarterId,
      oldValue: null,
      newValue: JSON.stringify({ name, startDate, endDate, status }),
      reason: `إنشاء فصل سنوي جديد (${name}) بواسطة ${admin.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الفصل بنجاح",
      quarterId,
    });
  } catch (err: unknown) {
    console.error("Create quarter error:", err);
    return NextResponse.json({ error: "فشل إنشاء الفصل السنوي" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/quarters
 * Status transition: UPCOMING -> ACTIVE -> CLOSED
 */
export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = (await request.json()) as {
      quarterId?: string;
      status?: "UPCOMING" | "ACTIVE" | "CLOSED";
      reason?: string;
    };

    const { quarterId, status, reason } = body;

    if (!quarterId || !status) {
      return NextResponse.json({ error: "معرف الفصل والحالة الجديدة مطلوبان" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db
      .select()
      .from(schema.quarters)
      .where(eq(schema.quarters.id, quarterId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "الفصل غير موجود" }, { status: 404 });
    }

    const oldStatus = existing[0].status;

    // When activating a quarter, automatically close previous active quarters
    if (status === "ACTIVE") {
      await db
        .update(schema.quarters)
        .set({ status: "CLOSED" })
        .where(eq(schema.quarters.status, "ACTIVE"));
    }

    await db
      .update(schema.quarters)
      .set({ status })
      .where(eq(schema.quarters.id, quarterId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: `QUARTER_STATUS_TRANSITION_${oldStatus}_TO_${status}`,
      entity: "quarters",
      entityId: quarterId,
      oldValue: oldStatus,
      newValue: status,
      reason: reason || `تغيير حالة الفصل بواسطة ${admin.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة الفصل بنجاح إلى (${status})`,
    });
  } catch (err: unknown) {
    console.error("Update quarter status error:", err);
    return NextResponse.json({ error: "فشل تحديث حالة الفصل" }, { status: 500 });
  }
}
