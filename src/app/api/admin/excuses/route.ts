import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { desc } from "drizzle-orm";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return null;
  }
  return user;
}

/**
 * GET /api/admin/excuses
 * List excuses across all members with filters and counters
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "ALL";
    const typeParam = searchParams.get("type") || "ALL";
    const voicePartParam = searchParams.get("voicePart") || "ALL";
    const rehearsalIdParam = searchParams.get("rehearsalId") || "ALL";
    const searchParam = (searchParams.get("q") || "").trim().toLowerCase();

    const db = await getDb();

    // Fetch all users, rehearsals, and excuses
    const [allUsers, allRehearsals, allExcuses] = await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.rehearsals),
      db.select().from(schema.excuseRequests).orderBy(desc(schema.excuseRequests.createdAt)),
    ]);

    const userMap = new Map(allUsers.map((u) => [u.id, u]));
    const rehearsalMap = new Map(allRehearsals.map((r) => [r.id, r]));

    // Compute global metrics
    const pendingCount = allExcuses.filter((e) => e.status === "PENDING").length;
    const approvedCount = allExcuses.filter((e) => e.status === "APPROVED").length;
    const rejectedCount = allExcuses.filter((e) => e.status === "REJECTED").length;

    // Filter and enrich
    let enriched = allExcuses.map((excuse) => {
      const member = userMap.get(excuse.userId);
      const rehearsal = rehearsalMap.get(excuse.rehearsalId);
      const reviewer = excuse.reviewedBy ? userMap.get(excuse.reviewedBy) : null;

      return {
        ...excuse,
        memberName: member?.fullName || "مرنم غير معروف",
        memberPhone: member?.phone || "",
        memberVoicePart: member?.voicePart || "غير محدد",
        memberTier: member?.tier || "",
        rehearsalTitle: rehearsal?.title || "بروفة",
        rehearsalDate: rehearsal?.date || "",
        rehearsalStartTime: rehearsal?.startTime || "",
        rehearsalEndTime: rehearsal?.endTime || "",
        locationName: rehearsal?.locationName || "",
        reviewerName: reviewer?.fullName || null,
      };
    });

    // Apply filters
    if (statusParam !== "ALL") {
      enriched = enriched.filter((e) => e.status === statusParam);
    }
    if (typeParam !== "ALL") {
      enriched = enriched.filter((e) => e.type === typeParam);
    }
    if (voicePartParam !== "ALL") {
      enriched = enriched.filter((e) => e.memberVoicePart === voicePartParam);
    }
    if (rehearsalIdParam !== "ALL") {
      enriched = enriched.filter((e) => e.rehearsalId === rehearsalIdParam);
    }
    if (searchParam) {
      enriched = enriched.filter(
        (e) =>
          e.memberName.toLowerCase().includes(searchParam) ||
          e.memberPhone.includes(searchParam) ||
          e.reason.toLowerCase().includes(searchParam) ||
          e.rehearsalTitle.toLowerCase().includes(searchParam)
      );
    }

    return NextResponse.json({
      excuses: enriched,
      stats: {
        totalCount: allExcuses.length,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
    });
  } catch (err: unknown) {
    console.error("Admin fetch excuses error:", err);
    return NextResponse.json({ error: "فشل استرجاع صندوق الأعذار" }, { status: 500 });
  }
}

