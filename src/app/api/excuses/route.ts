import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";

const excuseSubmissionSchema = z.object({
  rehearsalId: z.string().min(1, "يرجى اختيار البروفة"),
  type: z.enum(["ABSENCE", "DELAY"]),
  reason: z.string().min(5, "يرجى توضيح سبب العذر بالتفصيل (5 أحرف على الأقل)"),
  expectedDelayMinutes: z.number().int().positive().optional().nullable(),
});

/**
 * GET /api/excuses
 * Returns current logged-in member's submitted excuses
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const db = await getDb();

    // Fetch all rehearsals and users for joining
    const [allRehearsals, allUsers] = await Promise.all([
      db.select().from(schema.rehearsals),
      db.select().from(schema.users),
    ]);
    const rehearsalMap = new Map(allRehearsals.map((r) => [r.id, r]));
    const reviewerMap = new Map(allUsers.map((u) => [u.id, u.fullName]));

    // Fetch member's excuse requests
    const excusesList = await db
      .select()
      .from(schema.excuseRequests)
      .where(eq(schema.excuseRequests.userId, user.userId))
      .orderBy(desc(schema.excuseRequests.createdAt));

    // Enrich with rehearsal data and reviewer info
    const enriched = excusesList.map((excuse) => {
      const reh = rehearsalMap.get(excuse.rehearsalId);
      return {
        ...excuse,
        rehearsalTitle: reh?.title || "بروفة",
        rehearsalDate: reh?.date || "",
        rehearsalStartTime: reh?.startTime || "",
        rehearsalEndTime: reh?.endTime || "",
        locationName: reh?.locationName || "",
        reviewerName: excuse.reviewedBy ? reviewerMap.get(excuse.reviewedBy) || "مشرف الخدمة" : null,
      };
    });

    return NextResponse.json({ excuses: enriched });
  } catch (err: unknown) {
    console.error("Fetch excuses error:", err);
    return NextResponse.json({ error: "فشل استرجاع قائمة الأعذار" }, { status: 500 });
  }
}

/**
 * POST /api/excuses
 * Member submits a new excuse (Absence or Delay)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json(
        { error: "حسابك لا يزال قيد المراجعة، لا يمكنك تقديم أعذار حالياً" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = excuseSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "بيانات العذر غير صحيحة";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { rehearsalId, type, reason, expectedDelayMinutes } = parsed.data;

    // Validate expectedDelayMinutes when type is DELAY
    if (type === "DELAY" && (!expectedDelayMinutes || expectedDelayMinutes <= 0)) {
      return NextResponse.json(
        { error: "يرجى تحديد مدة التأخير المتوقعة بالدقائق عند اختيار عذر تأخير" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify rehearsal exists and hasn't finished
    const rehearsalRecords = await db
      .select()
      .from(schema.rehearsals)
      .where(eq(schema.rehearsals.id, rehearsalId))
      .limit(1);

    if (rehearsalRecords.length === 0) {
      return NextResponse.json({ error: "البروفة المحددة غير موجودة" }, { status: 404 });
    }

    const rehearsal = rehearsalRecords[0];

    // Check if rehearsal already concluded
    const rehearsalEnd = new Date(`${rehearsal.date}T${rehearsal.endTime}:00`);
    const now = new Date();
    if (now > rehearsalEnd) {
      return NextResponse.json(
        { error: "لا يمكن تقديم عذر لبروفة انتهت بالفعل" },
        { status: 400 }
      );
    }

    // Check if user already has a PENDING or APPROVED excuse for this rehearsal
    const existingExcuses = await db
      .select()
      .from(schema.excuseRequests)
      .where(
        and(
          eq(schema.excuseRequests.userId, user.userId),
          eq(schema.excuseRequests.rehearsalId, rehearsalId)
        )
      );

    const activeExcuse = existingExcuses.find(
      (e) => e.status === "PENDING" || e.status === "APPROVED"
    );

    if (activeExcuse) {
      const statusText = activeExcuse.status === "APPROVED" ? "معتمد بالفعل" : "قيد المراجعة حالياً";
      return NextResponse.json(
        { error: `لديك طلب عذر مسجل لهذه البروفة وهو ${statusText}` },
        { status: 409 }
      );
    }

    const excuseId = `excuse_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(schema.excuseRequests).values({
      id: excuseId,
      rehearsalId,
      userId: user.userId,
      type,
      reason: reason.trim(),
      expectedDelayMinutes: type === "DELAY" ? expectedDelayMinutes : null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    // Write to audit logs
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: user.userId,
      action: "EXCUSE_SUBMITTED",
      entity: "excuse_requests",
      entityId: excuseId,
      oldValue: null,
      newValue: JSON.stringify({
        rehearsalId,
        rehearsalTitle: rehearsal.title,
        type,
        expectedDelayMinutes,
        reason: reason.trim(),
      }),
      reason: `تقديم عذر (${type === "ABSENCE" ? "غياب" : "تأخير"}) لبروفة ${rehearsal.title}`,
    });

    return NextResponse.json(
      {
        message:
          type === "ABSENCE"
            ? "تم تسجيل طلب الاعتذار عن الحضور بنجاح وجاري مراجعته من المشرفين"
            : "تم تسجيل إشعار التأخير بنجاح لإحاطة المشرفين علماً",
        excuseId,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Submit excuse error:", err);
    return NextResponse.json({ error: "فشل تقديم طلب العذر" }, { status: 500 });
  }
}
