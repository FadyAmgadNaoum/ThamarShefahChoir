import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/crypto";
import { getAuditLogs } from "@/lib/audit/service";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || !session.roles.includes("SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "هذا القسم مخصص للمشرف العام فقط (Super Admin)" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const action = searchParams.get("action") || undefined;
    const entity = searchParams.get("entity") || undefined;
    const actorId = searchParams.get("actorId") || undefined;
    const query = searchParams.get("query") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const result = await getAuditLogs({
      page,
      limit,
      action,
      entity,
      actorId,
      query,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[SuperAdmin Audit API Error]:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل سجل التدقيق الأمني" },
      { status: 500 }
    );
  }
}

