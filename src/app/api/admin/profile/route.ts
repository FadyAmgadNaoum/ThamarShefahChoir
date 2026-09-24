import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { siteSettings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/cookies";
import { defaultChoirProfile, ChoirProfileData } from "@/data/choir-profile";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (!session.roles.includes("ADMIN") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "غير مصرح (Unauthorized)" }, { status: 403 });
    }

    const db = await getDb();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "choir_profile"))
      .limit(1);

    if (rows.length > 0 && rows[0].value) {
      try {
        const customData = JSON.parse(rows[0].value);
        return NextResponse.json({
          profile: {
            general: { ...defaultChoirProfile.general, ...(customData.general || {}) },
            stats: { ...defaultChoirProfile.stats, ...(customData.stats || {}) },
            history: customData.history || defaultChoirProfile.history,
            gallery: customData.gallery || defaultChoirProfile.gallery,
            vocalSections: customData.vocalSections || defaultChoirProfile.vocalSections,
            featuredHymns: customData.featuredHymns || defaultChoirProfile.featuredHymns,
            contact: { ...defaultChoirProfile.contact, ...(customData.contact || {}) },
          },
          updatedAt: rows[0].updatedAt,
          updatedBy: rows[0].updatedBy,
        });
      } catch {
        return NextResponse.json({ profile: defaultChoirProfile });
      }
    }

    return NextResponse.json({ profile: defaultChoirProfile });
  } catch (error) {
    console.error("Admin profile GET error:", error);
    return NextResponse.json({ error: "خطأ في قراءة بيانات الملف التعريفي" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (!session.roles.includes("ADMIN") && !session.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "غير مصرح بالوصول (Unauthorized)" }, { status: 403 });
    }

    const body = (await req.json()) as Partial<ChoirProfileData>;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بيانات غير صالحة (Invalid Payload)" }, { status: 400 });
    }

    const db = await getDb();

    // Fetch existing for audit log
    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "choir_profile"))
      .limit(1);

    const oldValue = existing.length > 0 ? existing[0].value : null;
    const jsonValue = JSON.stringify(body);

    const now = new Date().toISOString();

    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({
          value: jsonValue,
          updatedAt: now,
          updatedBy: session.userId,
        })
        .where(eq(siteSettings.key, "choir_profile"));
    } else {
      await db.insert(siteSettings).values({
        key: "choir_profile",
        value: jsonValue,
        updatedAt: now,
        updatedBy: session.userId,
      });
    }

    // Record audit log
    try {
      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actorId: session.userId,
        action: "UPDATE_CHOIR_PROFILE",
        entity: "site_settings",
        entityId: "choir_profile",
        oldValue: oldValue || "INITIAL_DEFAULTS",
        newValue: jsonValue,
        reason: "تحديث المحتوى التعريفي وتاريخ وصور الكورال من لوحة الإدارة",
        timestamp: now,
      });
    } catch (auditErr) {
      console.warn("Audit logging failed silently:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث ملف الكورال بنجاح (Profile Updated)",
      profile: body,
    });
  } catch (error) {
    console.error("Admin profile update error:", error);
    return NextResponse.json({ error: "فشل حفظ التعديلات على ملف الكورال" }, { status: 500 });
  }
}
