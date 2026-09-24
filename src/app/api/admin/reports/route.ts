import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import { eq, desc, and, inArray, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN") && !user.roles.includes("SUBSCRIPTION_MANAGER"))) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const requestedQuarterId = searchParams.get("quarterId");

    // 1. Fetch quarters
    const allQuarters = await db.select().from(schema.quarters).orderBy(desc(schema.quarters.startDate));
    const activeQuarter = allQuarters.find((q) => q.status === "ACTIVE") || allQuarters[0];

    const selectedQuarterId = requestedQuarterId && requestedQuarterId !== "ALL"
      ? requestedQuarterId
      : activeQuarter?.id;

    const selectedQuarter = allQuarters.find((q) => q.id === selectedQuarterId);
    const quarterName = requestedQuarterId === "ALL"
      ? "جميع الأوقات والأرباع السنوية"
      : selectedQuarter?.name || "الربع الحالي";

    // 2. Fetch all approved members
    const membersList = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.status, "APPROVED"));

    // 3. Fetch rehearsals for selected quarter
    let rehearsalsQuery = db.select().from(schema.rehearsals).orderBy(desc(schema.rehearsals.date));
    let rehearsalsList = await rehearsalsQuery;
    if (requestedQuarterId !== "ALL" && selectedQuarterId) {
      rehearsalsList = rehearsalsList.filter((r) => r.quarterId === selectedQuarterId);
    }

    const rehearsalIds = rehearsalsList.map((r) => r.id);

    // 4. Fetch attendance records
    let attendanceList: (typeof schema.attendance.$inferSelect)[] = [];
    if (rehearsalIds.length > 0) {
      attendanceList = await db
        .select()
        .from(schema.attendance)
        .where(inArray(schema.attendance.rehearsalId, rehearsalIds));
    }

    // 5. Fetch point transactions
    let pointsQuery = db.select().from(schema.pointTransactions);
    let pointsList = await pointsQuery;
    if (requestedQuarterId !== "ALL" && selectedQuarterId) {
      pointsList = pointsList.filter((p) => p.quarterId === selectedQuarterId);
    }

    // 6. Fetch subscription charges & payments
    const chargesList = await db.select().from(schema.subscriptionCharges);
    const paymentsList = await db.select().from(schema.subscriptionPayments);

    // 7. Fetch excuses
    let excusesList: (typeof schema.excuseRequests.$inferSelect)[] = [];
    if (rehearsalIds.length > 0) {
      excusesList = await db
        .select()
        .from(schema.excuseRequests)
        .where(inArray(schema.excuseRequests.rehearsalId, rehearsalIds));
    }

    // --- Compute Collective KPIs ---
    const totalMembers = membersList.length;
    const totalRehearsals = rehearsalsList.length;
    const totalScheduled = totalMembers * totalRehearsals;

    let totalAttended = 0;
    let totalPresentOnTime = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalAbsent = 0;

    for (const att of attendanceList) {
      if (att.status === "PRESENT") {
        totalAttended++;
        totalPresentOnTime++;
      } else if (["LATE", "VERY_LATE", "EXTREME_LATE"].includes(att.status)) {
        totalAttended++;
        totalLate++;
      } else if (att.status === "EXCUSED_ABSENCE") {
        totalExcused++;
      } else if (att.status === "ABSENT") {
        totalAbsent++;
      }
    }

    const attendanceRate = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : 0;
    const punctualityIndex = totalAttended > 0 ? Math.round((totalPresentOnTime / totalAttended) * 100) : 100;

    // Financial KPIs
    const totalDue = chargesList
      .filter((c) => !c.isWaived)
      .reduce((sum, c) => sum + (c.amountDue || 0), 0);
    const totalPaid = paymentsList.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const financialComplianceRate = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 100;

    // Voice Sections Breakdown
    const voiceParts = [
      { part: "SOPRANO", partAr: "سوبرانو" },
      { part: "ALTO", partAr: "ألتو" },
      { part: "TENOR", partAr: "تينور" },
      { part: "BASS", partAr: "باص" },
    ];

    const voicePartsBreakdown = voiceParts.map((vp) => {
      const partMembers = membersList.filter((m) => m.voicePart === vp.part);
      const partMemberIds = new Set(partMembers.map((m) => m.id));
      const partAttendance = attendanceList.filter((a) => partMemberIds.has(a.userId));
      const partExpected = partMembers.length * totalRehearsals;

      const partAttended = partAttendance.filter((a) =>
        ["PRESENT", "LATE", "VERY_LATE", "EXTREME_LATE"].includes(a.status)
      ).length;
      const partOnTime = partAttendance.filter((a) => a.status === "PRESENT").length;

      return {
        part: vp.part,
        partAr: vp.partAr,
        count: partMembers.length,
        attendanceRate: partExpected > 0 ? Math.round((partAttended / partExpected) * 100) : 0,
        punctualityScore: partAttended > 0 ? Math.round((partOnTime / partAttended) * 100) : 100,
      };
    });

    // Voice parity score: calculate standard deviation of attendance rates
    const partRates = voicePartsBreakdown.map((v) => v.attendanceRate);
    const maxPartRate = Math.max(...partRates, 0);
    const minPartRate = Math.min(...partRates, 0);
    const voiceParityScore = Math.max(0, 100 - (maxPartRate - minPartRate));

    // Excuses KPI
    const totalExcuses = excusesList.length;
    const approvedExcuses = excusesList.filter((e) => e.status === "APPROVED").length;
    const excuseRatio = totalExcuses > 0 ? Math.round((approvedExcuses / totalExcuses) * 100) : 100;

    // Points Mean
    const totalPointsDelta = pointsList.reduce((sum, p) => sum + (p.pointsDelta || 0), 0);
    const pointsMean = totalMembers > 0 ? Math.round(totalPointsDelta / totalMembers) : 0;

    // Choir Health Score (Weighted 0-100)
    const choirHealthScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          attendanceRate * 0.4 +
            punctualityIndex * 0.2 +
            financialComplianceRate * 0.2 +
            voiceParityScore * 0.2
        )
      )
    );

    // --- Compute Individual Member Performance Rows ---
    // Sort rehearsals chronologically for streak calculation
    const sortedRehearsals = [...rehearsalsList].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const memberRows = membersList.map((m) => {
      const userAtt = attendanceList.filter((a) => a.userId === m.id);
      const userPts = pointsList.filter((p) => p.userId === m.id);
      const userCharges = chargesList.filter((c) => c.userId === m.id && !c.isWaived);
      const userPayments = paymentsList.filter((p) => p.userId === m.id);

      const present = userAtt.filter((a) => a.status === "PRESENT").length;
      const late = userAtt.filter((a) => a.status === "LATE").length;
      const veryLate = userAtt.filter((a) => a.status === "VERY_LATE").length;
      const extremeLate = userAtt.filter((a) => a.status === "EXTREME_LATE").length;
      const excused = userAtt.filter((a) => a.status === "EXCUSED_ABSENCE").length;
      const absent = userAtt.filter((a) => a.status === "ABSENT").length;

      const attended = present + late + veryLate + extremeLate;
      const memberAttRate = totalRehearsals > 0 ? Math.round((attended / totalRehearsals) * 100) : 0;
      const memberPunctScore = attended > 0 ? Math.round((present / attended) * 100) : 100;

      // Calculate consecutive on-time streak
      let streak = 0;
      for (let i = sortedRehearsals.length - 1; i >= 0; i--) {
        const reh = sortedRehearsals[i];
        const att = userAtt.find((a) => a.rehearsalId === reh.id);
        if (att && att.status === "PRESENT") {
          streak++;
        } else if (att && ["LATE", "VERY_LATE", "EXTREME_LATE", "ABSENT"].includes(att.status)) {
          break;
        }
      }

      // Points breakdown
      let pointsBalance = 0;
      let attendancePoints = 0;
      let bonusPoints = 0;
      let deductionPoints = 0;

      for (const p of userPts) {
        pointsBalance += p.pointsDelta;
        if (p.transactionType === "AUTOMATIC") {
          attendancePoints += p.pointsDelta;
        } else if (p.pointsDelta > 0) {
          bonusPoints += p.pointsDelta;
        } else {
          deductionPoints += Math.abs(p.pointsDelta);
        }
      }

      // Financial breakdown
      const userDue = userCharges.reduce((sum, c) => sum + (c.amountDue || 0), 0);
      const userPaid = userPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      const outstandingDebt = Math.max(0, userDue - userPaid);

      // Composite Evaluation Tier
      const evalScore = Math.round(
        memberAttRate * 0.5 + memberPunctScore * 0.3 + Math.min(100, Math.max(0, pointsBalance + 50)) * 0.2
      );

      let tierEvaluation: "ELITE" | "VERY_GOOD" | "GOOD" | "NEEDS_IMPROVEMENT" | "CRITICAL" = "GOOD";
      let tierEvaluationAr = "مستقر / جيد 🟡";

      if (evalScore >= 90) {
        tierEvaluation = "ELITE";
        tierEvaluationAr = "نخبوي / ممتاز بمرتبة الشرف 🌟";
      } else if (evalScore >= 80) {
        tierEvaluation = "VERY_GOOD";
        tierEvaluationAr = "ملتزم جداً 🟢";
      } else if (evalScore >= 68) {
        tierEvaluation = "GOOD";
        tierEvaluationAr = "مستقر / جيد 🟡";
      } else if (evalScore >= 50) {
        tierEvaluation = "NEEDS_IMPROVEMENT";
        tierEvaluationAr = "يحتاج متابعة وتنبيه 🟠";
      } else {
        tierEvaluation = "CRITICAL";
        tierEvaluationAr = "حرج / متابعة رعوية عاجلة 🔴";
      }

      return {
        id: m.id,
        fullName: m.fullName,
        email: m.email,
        phone: m.phone,
        voicePart: m.voicePart || "TENOR",
        tier: m.tier || "WORKING",
        attendanceRate: memberAttRate,
        punctualityScore: memberPunctScore,
        streak,
        statusCounts: {
          present,
          late,
          veryLate,
          extremeLate,
          excused,
          absent,
        },
        pointsBalance,
        attendancePoints,
        bonusPoints,
        deductionPoints,
        financialStatus: {
          totalDue: userDue,
          totalPaid: userPaid,
          outstandingDebt,
          unpaidMonthsCount: userCharges.length,
        },
        voiceRank: { rank: 1, totalInPart: 1 },
        overallPercentile: 100,
        tierEvaluation,
        tierEvaluationAr,
        evalScore,
      };
    });

    // Rank members within their voice parts
    for (const vp of voiceParts) {
      const partMembers = memberRows.filter((m) => m.voicePart === vp.part);
      partMembers.sort((a, b) => b.evalScore - a.evalScore || b.attendanceRate - a.attendanceRate);
      partMembers.forEach((m, idx) => {
        m.voiceRank = { rank: idx + 1, totalInPart: partMembers.length };
      });
    }

    // Sort all members by overall score
    memberRows.sort((a, b) => b.evalScore - a.evalScore);
    memberRows.forEach((m, idx) => {
      m.overallPercentile = Math.round(((totalMembers - idx) / totalMembers) * 100);
    });

    // Rehearsal summaries
    const rehearsalSummaries = rehearsalsList.map((reh) => {
      const rehAtt = attendanceList.filter((a) => a.rehearsalId === reh.id);
      const present = rehAtt.filter((a) => a.status === "PRESENT").length;
      const late = rehAtt.filter((a) => ["LATE", "VERY_LATE", "EXTREME_LATE"].includes(a.status)).length;
      const excused = rehAtt.filter((a) => a.status === "EXCUSED_ABSENCE").length;
      const absent = rehAtt.filter((a) => a.status === "ABSENT").length;
      const totalEligible = totalMembers;
      const rate = totalEligible > 0 ? Math.round(((present + late) / totalEligible) * 100) : 0;

      return {
        id: reh.id,
        title: reh.title,
        date: reh.date,
        locationName: reh.locationName,
        presentCount: present,
        lateCount: late,
        excusedCount: excused,
        absentCount: absent,
        totalEligible,
        attendanceRate: rate,
      };
    });

    return NextResponse.json({
      success: true,
      quarterName,
      quarters: allQuarters,
      selectedQuarterId,
      kpis: {
        attendanceRate,
        punctualityIndex,
        voiceParityScore,
        financialComplianceRate,
        excuseRatio,
        pointsMean,
        choirHealthScore,
        totalMembers,
        totalRehearsals,
        quarterName,
      },
      voicePartsBreakdown,
      members: memberRows,
      rehearsals: rehearsalSummaries,
    });
  } catch (error) {
    console.error("[Reports API Error]:", error);
    return NextResponse.json({ error: "فشل في إنشاء تقرير التحليلات الشامل" }, { status: 500 });
  }
}
