import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { deriveWindowStatus } from "@/lib/attendance/time";
import { eq, desc } from "drizzle-orm";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

/**
 * GET /api/admin/rehearsals
 * List rehearsals with derived attendance window status
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const quarterId = searchParams.get("quarterId");

    const db = await getDb();
    let rehearsalsList = await db.select().from(schema.rehearsals).orderBy(desc(schema.rehearsals.date));

    if (quarterId) {
      rehearsalsList = rehearsalsList.filter((r) => r.quarterId === quarterId);
    }

    // Attach derived window status
    const result = rehearsalsList.map((r) => ({
      ...r,
      windowStatus: deriveWindowStatus(r.date, r.startTime, r.endTime),
    }));

    return NextResponse.json({ rehearsals: result });
  } catch (err: unknown) {
    console.error("Fetch rehearsals error:", err);
    return NextResponse.json({ error: "فشل تحميل قائمة البروفات" }, { status: 500 });
  }
}

/**
 * POST /api/admin/rehearsals
 * Schedule a new rehearsal
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = (await request.json()) as {
      quarterId?: string;
      title?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      locationName?: string;
      latitude?: number;
      longitude?: number;
      radiusMeters?: number;
    };

    const {
      quarterId,
      title,
      date,
      startTime,
      endTime,
      locationName = "مطرانية السيدة العذراء مريم بسوهاج — قاعة الكورال",
      latitude = 26.5565,
      longitude = 31.6958,
      radiusMeters = 100,
    } = body;

    if (!quarterId || !title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "يرجى تحديد الفصل السنوي، العنوان، التاريخ، وميعاد البدء والانتهاء" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const rehearsalId = `reh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await db.insert(schema.rehearsals).values({
      id: rehearsalId,
      quarterId,
      title: title.trim(),
      date,
      startTime,
      endTime,
      locationName,
      latitude,
      longitude,
      radiusMeters,
    });

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "REHEARSAL_SCHEDULED",
      entity: "rehearsals",
      entityId: rehearsalId,
      oldValue: null,
      newValue: JSON.stringify({ title, date, startTime, endTime, locationName, radiusMeters }),
      reason: `جدولة بروفة جديدة (${title}) بواسطة ${admin.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: "تمت جدولة البروفة بنجاح",
      rehearsalId,
      windowStatus: deriveWindowStatus(date, startTime, endTime),
    });
  } catch (err: unknown) {
    console.error("Create rehearsal error:", err);
    return NextResponse.json({ error: "فشل جدولة البروفة" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/rehearsals
 * Update an existing scheduled rehearsal
 */
export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = (await request.json()) as {
      rehearsalId?: string;
      quarterId?: string;
      title?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      locationName?: string;
      latitude?: number;
      longitude?: number;
      radiusMeters?: number;
    };

    const {
      rehearsalId,
      quarterId,
      title,
      date,
      startTime,
      endTime,
      locationName,
      latitude,
      longitude,
      radiusMeters,
    } = body;

    if (!rehearsalId) {
      return NextResponse.json({ error: "معرف البروفة مطلوب" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db
      .select()
      .from(schema.rehearsals)
      .where(eq(schema.rehearsals.id, rehearsalId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "البروفة غير موجودة" }, { status: 404 });
    }

    const current = existing[0];

    const updatedData = {
      quarterId: quarterId || current.quarterId,
      title: title !== undefined ? title.trim() : current.title,
      date: date || current.date,
      startTime: startTime || current.startTime,
      endTime: endTime || current.endTime,
      locationName: locationName !== undefined ? locationName.trim() : current.locationName,
      latitude: latitude !== undefined ? latitude : current.latitude,
      longitude: longitude !== undefined ? longitude : current.longitude,
      radiusMeters: radiusMeters !== undefined ? radiusMeters : current.radiusMeters,
    };

    await db
      .update(schema.rehearsals)
      .set(updatedData)
      .where(eq(schema.rehearsals.id, rehearsalId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "REHEARSAL_UPDATED",
      entity: "rehearsals",
      entityId: rehearsalId,
      oldValue: JSON.stringify(current),
      newValue: JSON.stringify(updatedData),
      reason: `تعديل بيانات البروفة (${updatedData.title}) بواسطة ${admin.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات البروفة بنجاح",
      windowStatus: deriveWindowStatus(
        updatedData.date,
        updatedData.startTime,
        updatedData.endTime
      ),
    });
  } catch (err: unknown) {
    console.error("Update rehearsal error:", err);
    return NextResponse.json({ error: "فشل تحديث بيانات البروفة" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/rehearsals
 * Delete / cancel a rehearsal
 */
export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rehearsalId = searchParams.get("rehearsalId");

    if (!rehearsalId) {
      return NextResponse.json({ error: "معرف البروفة مطلوب" }, { status: 400 });
    }

    const db = await getDb();
    await db.delete(schema.rehearsals).where(eq(schema.rehearsals.id, rehearsalId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: admin.userId,
      action: "REHEARSAL_DELETED",
      entity: "rehearsals",
      entityId: rehearsalId,
      oldValue: rehearsalId,
      newValue: null,
      reason: `إلغاء البروفة بواسطة ${admin.fullName}`,
    });

    return NextResponse.json({ success: true, message: "تم إلغاء البروفة بنجاح" });
  } catch (err: unknown) {
    console.error("Delete rehearsal error:", err);
    return NextResponse.json({ error: "فشل إلغاء البروفة" }, { status: 500 });
  }
}



