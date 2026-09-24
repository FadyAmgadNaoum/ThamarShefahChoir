import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { calculateMemberFinancialStatement } from "@/lib/subscriptions/service";

async function requireFinanceAccess() {
  const user = await getCurrentUser();
  if (
    !user ||
    (!user.roles.includes("SUBSCRIPTION_MANAGER") &&
      !user.roles.includes("ADMIN") &&
      !user.roles.includes("SUPER_ADMIN"))
  ) {
    return null;
  }
  return user;
}

/**
 * GET /api/admin/subscriptions/member/[id]
 * View full statement and payment receipts for any member
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const manager = await requireFinanceAccess();
    if (!manager) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id: memberId } = params;
    if (!memberId) {
      return NextResponse.json({ error: "معرف المرنم مفقود" }, { status: 400 });
    }

    const statement = await calculateMemberFinancialStatement(memberId);

    return NextResponse.json({
      statement,
    });
  } catch (err: unknown) {
    console.error("Fetch member statement error:", err);
    return NextResponse.json({ error: "فشل استرجاع كشف الحساب" }, { status: 500 });
  }
}

