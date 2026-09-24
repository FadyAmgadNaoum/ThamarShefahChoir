import * as XLSX from "xlsx";

export interface CollectiveKPIs {
  attendanceRate: number;
  punctualityIndex: number;
  voiceParityScore: number;
  financialComplianceRate: number;
  excuseRatio: number;
  pointsMean: number;
  choirHealthScore: number;
  totalMembers: number;
  totalRehearsals: number;
  quarterName: string;
}

export interface MemberPerformanceRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  voicePart: string;
  tier: string;
  attendanceRate: number;
  punctualityScore: number;
  streak: number;
  statusCounts: {
    present: number;
    late: number;
    veryLate: number;
    extremeLate: number;
    excused: number;
    absent: number;
  };
  pointsBalance: number;
  attendancePoints: number;
  bonusPoints: number;
  deductionPoints: number;
  financialStatus: {
    totalDue: number;
    totalPaid: number;
    outstandingDebt: number;
    unpaidMonthsCount: number;
  };
  voiceRank: {
    rank: number;
    totalInPart: number;
  };
  overallPercentile: number;
  tierEvaluation: "ELITE" | "VERY_GOOD" | "GOOD" | "NEEDS_IMPROVEMENT" | "CRITICAL";
  tierEvaluationAr: string;
}

export interface RehearsalSummaryRow {
  id: string;
  title: string;
  date: string;
  locationName: string;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  totalEligible: number;
  attendanceRate: number;
}

export interface FullReportData {
  quarterName: string;
  kpis: CollectiveKPIs;
  members: MemberPerformanceRow[];
  rehearsals: RehearsalSummaryRow[];
  voicePartsBreakdown: {
    part: string;
    partAr: string;
    count: number;
    attendanceRate: number;
    punctualityScore: number;
  }[];
}

/**
 * Export report as a formatted Excel (.xlsx) workbook with multiple sheets
 */
export function exportToExcel(data: FullReportData, filename = "تقرير-أداء-كورال-ثمر-شفاه.xlsx") {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Collective KPIs
  const kpiData = [
    ["تقرير أداء وإحصائيات كورال ثمر شفاه", ""],
    ["الفصل / الربع السنوي", data.quarterName],
    ["تاريخ التصدير", new Date().toLocaleDateString("ar-EG")],
    ["", ""],
    ["المؤشر الجماعي (KPI)", "القيمة"],
    ["معدل صحة الكورال الكلي (من 100)", `${data.kpis.choirHealthScore}%`],
    ["معدل الحضور العام", `${data.kpis.attendanceRate}%`],
    ["مؤشر الانضباط الزمني (الحضور في الميعاد)", `${data.kpis.punctualityIndex}%`],
    ["مؤشر تكافؤ وتوازن الأصوات", `${data.kpis.voiceParityScore}%`],
    ["نسبة الالتزام بالاشتراكات الشهرية", `${data.kpis.financialComplianceRate}%`],
    ["متوسط نقاط المرنم", data.kpis.pointsMean],
    ["إجمالي المرنمين النشطين", data.kpis.totalMembers],
    ["إجمالي البروفات المقررة", data.kpis.totalRehearsals],
  ];
  const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKpi, "المؤشرات الجماعية");

  // Sheet 2: Members Performance Evaluation
  const membersData = [
    [
      "اسم المرنم",
      "القسم الصوتي",
      "الفئة",
      "التقييم الشامل",
      "نسبة الحضور",
      "نسبة الانضباط",
      "أطول سلسلة التزام (Streak)",
      "رصيد النقاط",
      "بونص إضافي",
      "خصومات",
      "حاضر في الميعاد",
      "متأخر",
      "اعتذار مقبول",
      "غياب بدون عذر",
      "المستحق المالي",
      "المسدد",
      "المتأخرات",
      "الترتيب بالقسم",
      "رقم التليفون",
    ],
    ...data.members.map((m) => [
      m.fullName,
      m.voicePart,
      m.tier === "STUDENT" ? "طالب" : m.tier === "WORKING" ? "خريج / عامل" : "أخرى",
      m.tierEvaluationAr,
      `${m.attendanceRate}%`,
      `${m.punctualityScore}%`,
      m.streak,
      m.pointsBalance,
      m.bonusPoints,
      m.deductionPoints,
      m.statusCounts.present,
      m.statusCounts.late + m.statusCounts.veryLate + m.statusCounts.extremeLate,
      m.statusCounts.excused,
      m.statusCounts.absent,
      m.financialStatus.totalDue,
      m.financialStatus.totalPaid,
      m.financialStatus.outstandingDebt,
      `${m.voiceRank.rank} من ${m.voiceRank.totalInPart}`,
      m.phone,
    ]),
  ];
  const wsMembers = XLSX.utils.aoa_to_sheet(membersData);
  XLSX.utils.book_append_sheet(wb, wsMembers, "تقييم الأعضاء الفردي");

  // Sheet 3: Voice Parts Analysis
  const voiceData = [
    ["القسم الصوتي", "عدد المرنمين", "معدل الحضور", "نسبة الانضباط الزمني"],
    ...data.voicePartsBreakdown.map((v) => [v.partAr, v.count, `${v.attendanceRate}%`, `${v.punctualityScore}%`]),
  ];
  const wsVoice = XLSX.utils.aoa_to_sheet(voiceData);
  XLSX.utils.book_append_sheet(wb, wsVoice, "تحليل الأقسام الصوتية");

  // Write and download
  XLSX.writeFile(wb, filename);
}

/**
 * Export report as a formatted Microsoft Word document (.doc) with RTL Arabic styles,
 * church choir header, tables, and signature boxes
 */
export function exportToWord(data: FullReportData, filename = "تقرير-أداء-كورال-ثمر-شفاه.doc") {
  const content = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>تقرير أداء كورال ثمر شفاه</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
        direction: rtl;
        text-align: right;
        color: #1C1917;
        margin: 20px;
      }
      .header-box {
        border-bottom: 3px solid #640810;
        padding-bottom: 12px;
        margin-bottom: 24px;
        text-align: center;
      }
      .title {
        color: #640810;
        font-size: 24pt;
        font-weight: bold;
        margin: 0;
      }
      .subtitle {
        color: #DCA40C;
        font-size: 13pt;
        font-weight: bold;
        margin-top: 4px;
      }
      .kpi-table, .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      .kpi-table th, .kpi-table td, .data-table th, .data-table td {
        border: 1px solid #EADBB6;
        padding: 8px 12px;
        text-align: right;
        font-size: 10pt;
      }
      .kpi-table th, .data-table th {
        background-color: #FAF7F2;
        color: #640810;
        font-weight: bold;
      }
      .badge-elite { color: #047857; font-weight: bold; }
      .badge-good { color: #0369a1; }
      .badge-warning { color: #b45309; }
      .badge-critical { color: #b91c1c; font-weight: bold; }
      .signatures {
        margin-top: 50px;
        width: 100%;
        border-top: 2px dashed #EADBB6;
        padding-top: 20px;
      }
      .signatures td {
        width: 33%;
        text-align: center;
        border: none;
        padding-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="header-box">
      <div class="title">كورال ثمر شفاه — مطرانية سوهاج</div>
      <div class="subtitle">ذبيحة تسبيح • منذ عام 2000</div>
      <p style="font-size: 11pt; color: #78716C; margin-top: 6px;">
        التقرير التنفيذي الشامل لتقييم الأداء والحضور والاشتراكات — <strong>${data.quarterName}</strong>
      </p>
    </div>

    <h3 style="color: #640810; border-right: 4px solid #DCA40C; padding-right: 8px;">أولاً: ملخص المؤشرات العامة (KPIs)</h3>
    <table class="kpi-table">
      <tr>
        <th>مؤشر صحة ونشاط الكورال</th>
        <th>معدل الحضور العام</th>
        <th>مؤشر الانضباط الزمني</th>
        <th>نسبة التحصيل المالي</th>
      </tr>
      <tr>
        <td style="font-size: 14pt; font-weight: bold; color: #640810;">${data.kpis.choirHealthScore}%</td>
        <td style="font-size: 14pt; font-weight: bold; color: #047857;">${data.kpis.attendanceRate}%</td>
        <td style="font-size: 14pt; font-weight: bold; color: #0369a1;">${data.kpis.punctualityIndex}%</td>
        <td style="font-size: 14pt; font-weight: bold; color: #b45309;">${data.kpis.financialComplianceRate}%</td>
      </tr>
    </table>

    <h3 style="color: #640810; border-right: 4px solid #DCA40C; padding-right: 8px;">ثانياً: تحليل الأقسام الصوتية</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>القسم الصوتي</th>
          <th>عدد المرنمين</th>
          <th>معدل الحضور</th>
          <th>مؤشر الانضباط الزمني</th>
        </tr>
      </thead>
      <tbody>
        ${data.voicePartsBreakdown
          .map(
            (v) => `
          <tr>
            <td><strong>${v.partAr}</strong></td>
            <td>${v.count}</td>
            <td>${v.attendanceRate}%</td>
            <td>${v.punctualityScore}%</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <h3 style="color: #640810; border-right: 4px solid #DCA40C; padding-right: 8px;">ثالثاً: جدول تقييم الأداء الفردي للمرنمين</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>م</th>
          <th>اسم المرنم</th>
          <th>القسم</th>
          <th>الحضور</th>
          <th>الانضباط</th>
          <th>الرصيد</th>
          <th>الترتيب</th>
          <th>المتأخرات</th>
          <th>التقييم الشامل</th>
        </tr>
      </thead>
      <tbody>
        ${data.members
          .map(
            (m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${m.fullName}</strong></td>
            <td>${m.voicePart}</td>
            <td>${m.attendanceRate}%</td>
            <td>${m.punctualityScore}%</td>
            <td>${m.pointsBalance}</td>
            <td>${m.voiceRank.rank}/${m.voiceRank.totalInPart}</td>
            <td>${m.financialStatus.outstandingDebt > 0 ? `${m.financialStatus.outstandingDebt} ج.م` : "خالص 🟢"}</td>
            <td><strong>${m.tierEvaluationAr}</strong></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <table class="signatures">
      <tr>
        <td>
          <strong>أمين خدمة الكورال</strong><br/><br/>
          ..........................................
        </td>
        <td>
          <strong>المايسترو والمدرب الفني</strong><br/><br/>
          ..........................................
        </td>
        <td>
          <strong>بركة وتوقيع الأب الكاهن المسؤول</strong><br/><br/>
          ..........................................
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(["\uFEFF" + content], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export Individual Member Report Card as a Word document
 */
export function exportIndividualCardToWord(m: MemberPerformanceRow, quarterName: string) {
  const content = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>بطاقة تقييم أداء مرنم — ${m.fullName}</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
        direction: rtl;
        text-align: right;
        margin: 30px;
        color: #1C1917;
      }
      .card {
        border: 2px solid #EADBB6;
        padding: 24px;
        border-radius: 12px;
      }
      .header {
        border-bottom: 2px solid #640810;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .title { color: #640810; font-size: 20pt; font-weight: bold; margin: 0; }
      .field { margin-bottom: 12px; font-size: 11pt; }
      .field strong { color: #640810; }
      .stat-grid { width: 100%; border-collapse: collapse; margin-top: 15px; }
      .stat-grid td { border: 1px solid #EADBB6; padding: 10px; text-align: center; }
      .stat-val { font-size: 16pt; font-weight: bold; color: #640810; }
      .stat-lbl { font-size: 9pt; color: #78716C; margin-top: 4px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="title">كورال ثمر شفاه — بطاقة الأداء الفردية</div>
        <div style="color: #DCA40C; font-weight: bold; margin-top: 4px;">فترة التقييم: ${quarterName}</div>
      </div>

      <div class="field"><strong>اسم المرنم:</strong> ${m.fullName}</div>
      <div class="field"><strong>القسم الصوتي:</strong> ${m.voicePart} (الترتيب: المركز ${m.voiceRank.rank} من ${m.voiceRank.totalInPart})</div>
      <div class="field"><strong>التصنيف العام:</strong> <span style="font-weight: bold; color: #047857;">${m.tierEvaluationAr}</span></div>
      <div class="field"><strong>أطول سلسلة حضور متتالي:</strong> ${m.streak} بروفة</div>

      <table class="stat-grid">
        <tr>
          <td>
            <div class="stat-val">${m.attendanceRate}%</div>
            <div class="stat-lbl">معدل الحضور</div>
          </td>
          <td>
            <div class="stat-val">${m.punctualityScore}%</div>
            <div class="stat-lbl">الانضباط الزمني</div>
          </td>
          <td>
            <div class="stat-val">${m.pointsBalance}</div>
            <div class="stat-lbl">رصيد النقاط</div>
          </td>
          <td>
            <div class="stat-val">${m.financialStatus.outstandingDebt > 0 ? `${m.financialStatus.outstandingDebt} ج` : "خالص 🟢"}</div>
            <div class="stat-lbl">حالة الاشتراكات</div>
          </td>
        </tr>
      </table>

      <h4 style="color: #640810; margin-top: 24px; margin-bottom: 8px;">سجل الحضور بالبروفات:</h4>
      <p style="font-size: 10pt; color: #57534E;">
        حاضر في الميعاد: <strong>${m.statusCounts.present}</strong> |
        متأخر: <strong>${m.statusCounts.late + m.statusCounts.veryLate + m.statusCounts.extremeLate}</strong> |
        اعتذار مقبول: <strong>${m.statusCounts.excused}</strong> |
        غياب بدون عذر: <strong>${m.statusCounts.absent}</strong>
      </p>

      <div style="margin-top: 40px; border-top: 1px dashed #EADBB6; padding-top: 20px; text-align: left; font-size: 10pt; color: #78716C;">
        توقيع المايسترو / خادم الكورال: ........................................
      </div>
    </div>
  </body>
  </html>
  `;

  const blob = new Blob(["\uFEFF" + content], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `تقييم-${m.fullName.replace(/\s+/g, "_")}.doc`;
  link.click();
  URL.revokeObjectURL(url);
}

