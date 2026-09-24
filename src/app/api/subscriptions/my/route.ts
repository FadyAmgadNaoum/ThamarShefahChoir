import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { calculateMemberFinancialStatement } from "@/lib/subscriptions/service";

/**
 * GET /api/subscriptions/my
 * Member subscription statement: monthly charges, payments receipts, and debt balance
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json({ error: "حسابك قيد المراجعة" }, { status: 403 });
    }

    const statement = await calculateMemberFinancialStatement(user.userId);

    return NextResponse.json({
      statement,
    });
  } catch (err: unknown) {
    console.error("Fetch member subscription statement error:", err);
    return NextResponse.json({ error: "فشل استرجاع كشف حساب الاشتراكات" }, { status: 500 });
  }
}

