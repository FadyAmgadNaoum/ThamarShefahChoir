import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getSubscriptionRoster } from "@/lib/subscriptions/service";

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
 * GET /api/admin/subscriptions/roster
 * Collection roster and debt tracking for Subscription Managers
 */
export async function GET(request: Request) {
  try {
    const manager = await requireFinanceAccess();
    if (!manager) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول للإدارة المالية" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const searchParam = (searchParams.get("q") || "").trim().toLowerCase();
    const statusParam = searchParams.get("status") || "ALL"; // ALL, DEBT, PAID_UP, NO_CHARGES
    const tierParam = searchParams.get("tier") || "ALL"; // ALL, STUDENT, WORKING, OTHER
    const voicePartParam = searchParams.get("voicePart") || "ALL";

    const { roster, stats } = await getSubscriptionRoster();

    let filtered = roster;

    if (statusParam === "DEBT") {
      filtered = filtered.filter((m) => m.hasOutstandingDebt);
    } else if (statusParam === "PAID_UP") {
      filtered = filtered.filter((m) => m.isFullyPaid);
    } else if (statusParam === "NO_CHARGES") {
      filtered = filtered.filter((m) => m.noChargesYet);
    }

    if (tierParam !== "ALL") {
      filtered = filtered.filter((m) => m.tier === tierParam);
    }

    if (voicePartParam !== "ALL") {
      filtered = filtered.filter((m) => m.voicePart === voicePartParam);
    }

    if (searchParam) {
      filtered = filtered.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchParam) ||
          m.phone.includes(searchParam)
      );
    }

    return NextResponse.json({
      roster: filtered,
      stats,
    });
  } catch (err: unknown) {
    console.error("Fetch subscription roster error:", err);
    return NextResponse.json({ error: "فشل استرجاع كشف الاشتراكات" }, { status: 500 });
  }
}

