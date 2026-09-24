import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/admin/members
 * Retrieve list of choir members with assigned roles
 */
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (
      !currentUser ||
      (!currentUser.roles.includes("ADMIN") && !currentUser.roles.includes("SUPER_ADMIN"))
    ) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // PENDING | APPROVED | REJECTED | ALL
    const search = searchParams.get("search")?.toLowerCase().trim();

    const db = await getDb();

    // Fetch all users
    const allUsers = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));

    // Fetch all user roles and roles lookup
    const allUserRoles = await db.select().from(schema.userRoles);
    const allRoles = await db.select().from(schema.roles);
    const roleNameMap = new Map(allRoles.map((r) => [r.id, r.name]));

    // Map roles to users
    const userRoleMap = new Map<string, string[]>();
    for (const ur of allUserRoles) {
      const current = userRoleMap.get(ur.userId) || [];
      const rName = roleNameMap.get(ur.roleId);
      if (rName) current.push(rName);
      userRoleMap.set(ur.userId, current);
    }

    let filtered = allUsers.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.status,
      voicePart: u.voicePart,
      tier: u.tier,
      createdAt: u.createdAt,
      roles: userRoleMap.get(u.id) || ["MEMBER"],
    }));

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search) ||
          u.phone.includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ members: filtered });
  } catch (err: unknown) {
    console.error("Fetch members error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات الأعضاء" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/members
 * Update member status (APPROVE / REJECT) and assign/revoke roles with audit logging
 */
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (
      !currentUser ||
      (!currentUser.roles.includes("ADMIN") && !currentUser.roles.includes("SUPER_ADMIN"))
    ) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = (await request.json()) as {
      userId?: string;
      status?: "PENDING" | "APPROVED" | "REJECTED";
      roles?: string[];
      reason?: string;
    };
    const { userId, status, roles: newRoles, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: "معرف العضو مطلوب" }, { status: 400 });
    }

    const db = await getDb();

    // Get current user details for audit
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
    }

    const targetUser = existing[0];
    const oldStatus = targetUser.status;

    // Update status if provided
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      await db
        .update(schema.users)
        .set({ status, updatedAt: new Date().toISOString() })
        .where(eq(schema.users.id, userId));

      // Audit status change
      await db.insert(schema.auditLogs).values({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actorId: currentUser.userId,
        action: `MEMBER_STATUS_CHANGED_TO_${status}`,
        entity: "users",
        entityId: userId,
        oldValue: oldStatus,
        newValue: status,
        reason: reason || `تغيير حالة العضو بواسطة ${currentUser.fullName}`,
      });
    }

    // Update roles if provided (Super Admin only can assign/remove Admin roles)
    if (Array.isArray(newRoles) && newRoles.length > 0) {
      // Check if trying to modify Admin/Super Admin roles
      const isModifyingAdmin = newRoles.includes("ADMIN") || newRoles.includes("SUPER_ADMIN");
      if (isModifyingAdmin && !currentUser.roles.includes("SUPER_ADMIN")) {
        return NextResponse.json(
          { error: "المشرف العام (SUPER_ADMIN) فقط يملك صلاحية منح وإلغاء رتبة أدمن" },
          { status: 403 }
        );
      }

      // Fetch all roles to get IDs
      const dbRoles = await db.select().from(schema.roles);
      const roleMap = new Map(dbRoles.map((r) => [r.name, r.id]));

      // Clear existing roles
      await db.delete(schema.userRoles).where(eq(schema.userRoles.userId, userId));

      // Insert new roles
      for (const roleName of newRoles) {
        const roleId = roleMap.get(roleName);
        if (roleId) {
          await db.insert(schema.userRoles).values({
            userId,
            roleId,
            assignedBy: currentUser.userId,
          });
        }
      }

      // Audit role change
      await db.insert(schema.auditLogs).values({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actorId: currentUser.userId,
        action: "MEMBER_ROLES_UPDATED",
        entity: "user_roles",
        entityId: userId,
        oldValue: null,
        newValue: JSON.stringify(newRoles),
        reason: reason || `تحديث رتب العضو بواسطة ${currentUser.fullName}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات العضو بنجاح وتوثيق التغيير في سجل التدقيق",
    });
  } catch (err: unknown) {
    console.error("Update member error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث بيانات العضو" },
      { status: 500 }
    );
  }
}
