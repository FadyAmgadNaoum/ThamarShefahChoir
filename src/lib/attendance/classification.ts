export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "VERY_LATE"
  | "EXTREME_LATE"
  | "ABSENT"
  | "EXCUSED_ABSENCE"
  | "EARLY_LEAVE";

export interface StatusMeta {
  code: AttendanceStatus;
  labelAr: string;
  descriptionAr: string;
  badgeClass: string;
  textClass: string;
}

export const ATTENDANCE_STATUS_META: Record<AttendanceStatus, StatusMeta> = {
  PRESENT: {
    code: "PRESENT",
    labelAr: "حاضر في ميعادك",
    descriptionAr: "حضور منضبط في الوقت المحدد للبروفة",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    textClass: "text-emerald-700",
  },
  LATE: {
    code: "LATE",
    labelAr: "متأخر",
    descriptionAr: "تأخير طفيف (أقل من نصف ساعة)",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    textClass: "text-amber-700",
  },
  VERY_LATE: {
    code: "VERY_LATE",
    labelAr: "تأخير كبير",
    descriptionAr: "تأخير يتراوح بين 30 إلى 60 دقيقة",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    textClass: "text-orange-700",
  },
  EXTREME_LATE: {
    code: "EXTREME_LATE",
    labelAr: "تأخير حرج",
    descriptionAr: "تأخير يتجاوز ساعة كاملة من موعد البدء",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    textClass: "text-red-700",
  },
  ABSENT: {
    code: "ABSENT",
    labelAr: "غياب بدون إذن",
    descriptionAr: "عدم الحضور طوال فترة البروفة",
    badgeClass: "bg-charcoal-100 text-charcoal-muted border-charcoal-200",
    textClass: "text-charcoal-muted",
  },
  EXCUSED_ABSENCE: {
    code: "EXCUSED_ABSENCE",
    labelAr: "غياب بعذر مقبول",
    descriptionAr: "غياب مسجل بإذن معتمد مسبقاً من المشرفين",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    textClass: "text-blue-700",
  },
  EARLY_LEAVE: {
    code: "EARLY_LEAVE",
    labelAr: "انصراف مبكر",
    descriptionAr: "مغادرة البروفة قبل موعد الانتهاء الرسمي",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    textClass: "text-purple-700",
  },
};

/**
 * Classifies an arrival based on check-in time compared to the scheduled start time.
 *
 * Rules:
 * - Δt <= 15 minutes: PRESENT (حاضر في ميعادك)
 * - 15 < Δt <= 30 minutes: LATE (متأخر)
 * - 30 < Δt <= 60 minutes: VERY_LATE (تأخير كبير)
 * - Δt > 60 minutes: EXTREME_LATE (تأخير حرج)
 *
 * @param checkInDate The actual timestamp of check-in
 * @param rehearsalDateStr Date of rehearsal in 'YYYY-MM-DD'
 * @param rehearsalStartTimeStr Scheduled start time in 'HH:MM'
 * @returns { status: AttendanceStatus, delayMinutes: number }
 */
export function classifyArrival(
  checkInDate: Date,
  rehearsalDateStr: string,
  rehearsalStartTimeStr: string
): {
  status: AttendanceStatus;
  delayMinutes: number;
  meta: StatusMeta;
} {
  const [year, month, day] = rehearsalDateStr.split("-").map((n) => parseInt(n, 10));
  const [startH, startM] = rehearsalStartTimeStr.split(":").map((n) => parseInt(n, 10));

  const scheduledStart = new Date(year, month - 1, day, startH, startM, 0);

  // Difference in milliseconds
  const diffMs = checkInDate.getTime() - scheduledStart.getTime();
  const delayMinutes = Math.floor(diffMs / (60 * 1000));

  let status: AttendanceStatus = "PRESENT";

  if (delayMinutes <= 15) {
    status = "PRESENT";
  } else if (delayMinutes <= 30) {
    status = "LATE";
  } else if (delayMinutes <= 60) {
    status = "VERY_LATE";
  } else {
    status = "EXTREME_LATE";
  }

  return {
    status,
    delayMinutes: Math.max(0, delayMinutes),
    meta: ATTENDANCE_STATUS_META[status],
  };
}

