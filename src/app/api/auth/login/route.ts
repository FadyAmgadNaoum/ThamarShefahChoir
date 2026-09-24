import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { verifyPassword, createSessionToken, SessionPayload } from "@/lib/auth/crypto";
import { setSessionCookie } from "@/lib/auth/cookies";
import { eq, or } from "drizzle-orm";

const loginSchema = z.object({
  identifier: z.string().min(1, "يرجى كتابة البريد الإلكتروني أو رقم الموبايل"),
  password: z.string().min(1, "يرجى كتابة كلمة المرور"),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string; password?: string };
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "يرجى كتابة اسم المستخدم (البريد أو الموبايل) وكلمة المرور" },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const cleanIdentifier = identifier.trim();

    const db = await getDb();

    // Query user by email or phone
    const usersList = await db
      .select()
      .from(schema.users)
      .where(
        or(
          eq(schema.users.email, cleanIdentifier.toLowerCase()),
          eq(schema.users.phone, cleanIdentifier)
        )
      )
      .limit(1);

    if (usersList.length === 0) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة، يرجى التأكد من البريد أو الموبايل وكلمة المرور" },
        { status: 401 }
      );
    }

    const user = usersList[0];

    // Verify password hash
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة، يرجى التأكد من البريد أو الموبايل وكلمة المرور" },
        { status: 401 }
      );
    }

    // Check if account is rejected
    if (user.status === "REJECTED") {
      return NextResponse.json(
        { error: "عذراً، تم رفض طلب العضوية من قبل إدارة الكورال." },
        { status: 403 }
      );
    }

    // Fetch assigned roles
    const userRoleRows = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, user.id));

    const allRoles = await db.select().from(schema.roles);
    const roleIdMap = new Map(allRoles.map((r) => [r.id, r.name]));

    const rolesList = (
      userRoleRows.length > 0
        ? userRoleRows.map((ur) => roleIdMap.get(ur.roleId) || "MEMBER")
        : ["MEMBER"]
    ) as SessionPayload["roles"];

    // Build session payload
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status as SessionPayload["status"],
      roles: rolesList,
      voicePart: user.voicePart || undefined,
      tier: user.tier || undefined,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    };

    const token = await createSessionToken(sessionPayload);
    await setSessionCookie(token);

    // Determine redirect
    let redirectUrl = "/";
    if (user.status === "PENDING") {
      redirectUrl = "/pending-approval";
    } else if (rolesList.includes("ADMIN") || rolesList.includes("SUPER_ADMIN")) {
      redirectUrl = "/admin/members";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        roles: rolesList,
      },
      redirectUrl,
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
