import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { hashPassword, createSessionToken, SessionPayload } from "@/lib/auth/crypto";
import { setSessionCookie } from "@/lib/auth/cookies";
import { eq, or } from "drizzle-orm";

const registerSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب ألا يقل عن 3 أحرف"),
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
  phone: z.string().min(10, "رقم الموبايل يجب أن يتكون من 10 أو 11 رقماً"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
  voicePart: z.enum(["SOPRANO", "ALTO", "TENOR", "BASS"]),
  tier: z.enum(["STUDENT", "WORKING", "OTHER"]),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorObj = parsed.error as unknown as { issues?: { message: string }[]; errors?: { message: string }[] };
      const firstError =
        errorObj.issues?.[0]?.message || errorObj.errors?.[0]?.message || "بيانات غير صالحة";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { fullName, email, phone, password, voicePart, tier } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const db = await getDb();

    // Check duplicate email or phone
    const existing = await db
      .select()
      .from(schema.users)
      .where(
        or(
          eq(schema.users.email, normalizedEmail),
          eq(schema.users.phone, normalizedPhone)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const isEmailMatch = existing[0].email === normalizedEmail;
      return NextResponse.json(
        {
          error: isEmailMatch
            ? "البريد الإلكتروني مسجل بالفعل لمستخدم آخر"
            : "رقم الموبايل مسجل بالفعل لمستخدم آخر",
        },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await hashPassword(password);

    // Insert user with status PENDING
    await db.insert(schema.users).values({
      id: userId,
      email: normalizedEmail,
      phone: normalizedPhone,
      fullName: fullName.trim(),
      passwordHash,
      status: "PENDING",
      voicePart,
      tier,
    });

    // Assign default MEMBER role
    await db.insert(schema.userRoles).values({
      userId,
      roleId: "role_member",
      assignedBy: "SELF_REGISTRATION",
    });

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: userId,
      action: "MEMBER_REGISTERED",
      entity: "users",
      entityId: userId,
      oldValue: null,
      newValue: JSON.stringify({ status: "PENDING", voicePart, tier }),
      reason: "تسجيل حساب جديد من خلال المنظومة",
    });

    // Create session token with PENDING status
    const sessionPayload: SessionPayload = {
      userId,
      email: normalizedEmail,
      fullName: fullName.trim(),
      status: "PENDING",
      roles: ["MEMBER"],
      voicePart,
      tier,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    };

    const token = await createSessionToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "تم تسجيل حسابك بنجاح، بانتظار اعتماد خُدام الكورال",
      status: "PENDING",
      redirectUrl: "/pending-approval",
    });
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}
