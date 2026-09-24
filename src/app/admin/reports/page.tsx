"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Flame,
  ChevronDown,
  Sparkles,
  DollarSign,
  HeartHandshake,
  Layers,
  Music,
} from "lucide-react";
import {
  exportToExcel,
  exportToWord,
  exportIndividualCardToWord,
  FullReportData,
  MemberPerformanceRow,
} from "@/lib/reports/export";

export default function AdminReportsPage() {
  const [data, setData] = useState<FullReportData | null>(null);
  const [quarters, setQuarters] = useState<{ id: string; name: string; status: string }[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Table filters
  const [memberSearch, setMemberSearch] = useState("");
  const [voiceFilter, setVoiceFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");

  // Individual Report Card modal
  const [selectedMember, setSelectedMember] = useState<MemberPerformanceRow | null>(null);

  const fetchReports = async (quarterId?: string) => {
    try {
      setLoading(true);
      const url = quarterId
        ? `/api/admin/reports?quarterId=${encodeURIComponent(quarterId)}`
        : "/api/admin/reports";
      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل تحميل بيانات التقارير");
      const json: any = await res.json();

      setData(json);
      setQuarters(json.quarters || []);
      if (!selectedQuarterId && json.selectedQuarterId) {
        setSelectedQuarterId(json.selectedQuarterId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedQuarterId);
  }, [selectedQuarterId]);

  const handlePrint = () => {
    window.print();
  };

  // Filter members
  const filteredMembers = (data?.members || []).filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesVoice = voiceFilter === "ALL" || m.voicePart === voiceFilter;
    const matchesTier = tierFilter === "ALL" || m.tierEvaluation === tierFilter;
    return matchesSearch && matchesVoice && matchesTier;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pt-24 pb-16 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Export Action Hub (Hidden on Print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[#EADBB6] shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#640810]/10 flex items-center justify-center text-[#640810] border border-[#640810]/20">
              <BarChart3 className="w-6 h-6 text-[#640810]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#640810]">لوحة التحليلات ومؤشرات الأداء (KPIs)</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#DCA40C]/20 text-[#640810] border border-[#DCA40C]/40">
                  تقارير شاملة
                </span>
              </div>
              <p className="text-sm text-[#78716C] mt-0.5">
                متابعة دقيقة لمعدلات الحضور، الانضباط الزمني، توازن الأصوات، التحصيل المالي، وتقييم الأعضاء
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quarter Selector */}
            <div className="relative">
              <select
                value={selectedQuarterId}
                onChange={(e) => setSelectedQuarterId(e.target.value)}
                className="appearance-none pr-9 pl-4 py-2.5 text-sm font-semibold rounded-xl bg-[#FAF7F2] border border-[#EADBB6] text-[#640810] focus:outline-none focus:ring-2 focus:ring-[#DCA40C]"
              >
                <option value="ALL">جميع الأوقات والأرباع السنوية</option>
                {quarters.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} {q.status === "ACTIVE" ? "🟢 (النشط)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#640810] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Export Dropdown / Actions */}
            <button
              onClick={() => data && exportToExcel(data, `تقرير-كورال-ثمر-شفاه-${data.quarterName}.xlsx`)}
              disabled={!data || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-[#EADBB6] text-emerald-800 hover:bg-emerald-50 transition shadow-xs disabled:opacity-50"
              title="تصدير شيت إكسيل"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel
            </button>

            <button
              onClick={() => data && exportToWord(data, `تقرير-كورال-ثمر-شفاه-${data.quarterName}.doc`)}
              disabled={!data || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-[#EADBB6] text-blue-800 hover:bg-blue-50 transition shadow-xs disabled:opacity-50"
              title="تصدير مستند وورد رسمي"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Word
            </button>

            <button
              onClick={handlePrint}
              disabled={!data || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-[#EADBB6] text-stone-800 hover:bg-[#FAF7F2] transition shadow-xs disabled:opacity-50"
              title="طباعة التقرير / حفظ PDF"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              PDF / طباعة
            </button>

            <button
              onClick={() => fetchReports(selectedQuarterId)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#640810] text-white hover:bg-[#4A070D] transition disabled:opacity-50 shadow-xs"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block text-center border-b-2 border-[#640810] pb-4 mb-6">
          <h1 className="text-2xl font-bold text-[#640810]">كورال ثمر شفاه — مطرانية سوهاج</h1>
          <p className="text-sm font-semibold text-[#DCA40C]">ذبيحة تسبيح • منذ عام 2000</p>
          <p className="text-xs text-stone-600 mt-1">
            التقرير التنفيذي الشامل لتقييم الأداء — <strong>{data?.quarterName}</strong> — تاريخ التقرير:{" "}
            {new Date().toLocaleDateString("ar-EG")}
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#78716C] bg-white rounded-3xl border border-[#EADBB6]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#640810] mb-3" />
            جاري احتساب وتحليل مؤشرات الأداء الجماعية والفردية...
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-[#78716C] bg-white rounded-3xl border border-[#EADBB6]">
            لا توجد بيانات متاحة لهذا الربع السنوي.
          </div>
        ) : (
          <>
            {/* Top 4 Collective KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Health Score */}
              <div className="bg-white p-5 rounded-3xl border border-[#EADBB6] shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#78716C]">مؤشر صحة الكورال الكلي</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#640810]">{data.kpis.choirHealthScore}</span>
                  <span className="text-sm font-bold text-[#DCA40C]">/ 100</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-[#FAF0CC] rounded-full h-2">
                    <div
                      className="bg-[#640810] h-2 rounded-full transition-all"
                      style={{ width: `${data.kpis.choirHealthScore}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#78716C] mt-1.5 block">
                    مؤشر مركب (حضور 40% + انضباط 20% + مالية 20% + توازن 20%)
                  </span>
                </div>
              </div>

              {/* Attendance Rate */}
              <div className="bg-white p-5 rounded-3xl border border-[#EADBB6] shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#78716C]">معدل الحضور العام</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-700">{data.kpis.attendanceRate}%</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-[#FAF0CC] rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${data.kpis.attendanceRate}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#78716C] mt-1.5 block">
                    إجمالي {data.kpis.totalMembers} مرنم عبر {data.kpis.totalRehearsals} بروفة
                  </span>
                </div>
              </div>

              {/* Punctuality Index */}
              <div className="bg-white p-5 rounded-3xl border border-[#EADBB6] shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#78716C]">مؤشر الانضباط الزمني</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-700">{data.kpis.punctualityIndex}%</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-[#FAF0CC] rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${data.kpis.punctualityIndex}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#78716C] mt-1.5 block">
                    نسبة الحضور في الميعاد بالضبط دون أي تأخير
                  </span>
                </div>
              </div>

              {/* Financial Compliance */}
              <div className="bg-white p-5 rounded-3xl border border-[#EADBB6] shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#78716C]">نسبة التحصيل المالي</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-800">{data.kpis.financialComplianceRate}%</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-[#FAF0CC] rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all"
                      style={{ width: `${data.kpis.financialComplianceRate}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#78716C] mt-1.5 block">
                    الالتزام بسداد الاشتراكات الشهرية المقررة
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Sections Breakdown & Voice Parity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EADBB6] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#FAF0CC] pb-3">
                  <h3 className="font-bold text-[#640810] text-base flex items-center gap-2">
                    <Music className="w-5 h-5 text-[#DCA40C]" />
                    تحليل الأقسام الصوتية وتكافؤ الحضور (Voice Balance)
                  </h3>
                  <span className="text-xs text-[#78716C]">
                    مؤشر التكافؤ: <strong className="text-[#640810]">{data.kpis.voiceParityScore}%</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.voicePartsBreakdown.map((vp) => (
                    <div key={vp.part} className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBB6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#640810]">{vp.partAr} ({vp.part})</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-[#EADBB6] text-[#78716C]">
                          {vp.count} مرنم
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#78716C]">
                          <span>معدل الحضور</span>
                          <strong className="text-stone-900">{vp.attendanceRate}%</strong>
                        </div>
                        <div className="w-full bg-[#FAF0CC] rounded-full h-1.5">
                          <div
                            className="bg-[#640810] h-1.5 rounded-full"
                            style={{ width: `${vp.attendanceRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs text-[#78716C]">
                          <span>الانضباط الزمني</span>
                          <strong className="text-blue-700">{vp.punctualityScore}%</strong>
                        </div>
                        <div className="w-full bg-[#FAF0CC] rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${vp.punctualityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Summary Strip: Points & Excuses */}
              <div className="bg-white p-6 rounded-3xl border border-[#EADBB6] shadow-sm flex flex-col justify-between space-y-4">
                <h3 className="font-bold text-[#640810] text-base flex items-center gap-2 border-b border-[#FAF0CC] pb-3">
                  <Award className="w-5 h-5 text-[#DCA40C]" />
                  النقاط والاعتذارات
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBB6]">
                    <div className="text-xs text-[#78716C]">متوسط نقاط المرنم</div>
                    <div className="text-2xl font-black text-[#640810] mt-1">{data.kpis.pointsMean} نقطة</div>
                    <div className="text-[11px] text-[#78716C] mt-1">تراكمي الأنشطة، الحضور، والبونص</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBB6]">
                    <div className="text-xs text-[#78716C]">نسبة قبول طلبات الاعتذار</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">{data.kpis.excuseRatio}%</div>
                    <div className="text-[11px] text-[#78716C] mt-1">المراجعة والاعتماد من قبل الإدارة</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                  💡 تتيح هذه اللوحة تصدير كارت تقييم فردي لكل مرنم لمشاركته معه لتحفيز الالتزام الروحي والفني.
                </div>
              </div>
            </div>

            {/* Individual Members Performance Table */}
            <div className="bg-white rounded-3xl border border-[#EADBB6] shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FAF0CC] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#640810] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#DCA40C]" />
                    جدول تقييم الأداء الفردي للمرنمين ({filteredMembers.length})
                  </h3>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    انقر على أي مرنم لعرض بطاقة تقييمه الكاملة أو تصديرها كملف Word/PDF
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="بحث بالاسم أو التليفون..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pr-8 pl-3 py-1.5 text-xs rounded-xl border border-[#EADBB6] bg-[#FDFBF7] focus:outline-none"
                    />
                  </div>

                  <select
                    value={voiceFilter}
                    onChange={(e) => setVoiceFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-[#EADBB6] bg-[#FDFBF7]"
                  >
                    <option value="ALL">جميع الأقسام الصوتية</option>
                    <option value="SOPRANO">سوبرانو</option>
                    <option value="ALTO">ألتو</option>
                    <option value="TENOR">تينور</option>
                    <option value="BASS">باص</option>
                  </select>

                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-[#EADBB6] bg-[#FDFBF7]"
                  >
                    <option value="ALL">جميع مستويات التقييم</option>
                    <option value="ELITE">نخبوي 🌟</option>
                    <option value="VERY_GOOD">ملتزم جداً 🟢</option>
                    <option value="GOOD">مستقر 🟡</option>
                    <option value="NEEDS_IMPROVEMENT">يحتاج متابعة 🟠</option>
                    <option value="CRITICAL">حرج 🔴</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#78716C] font-semibold border-b border-[#EADBB6]">
                      <th className="py-3 px-3">المرنم</th>
                      <th className="py-3 px-3">القسم الصوتي</th>
                      <th className="py-3 px-3 text-center">التقييم الشامل</th>
                      <th className="py-3 px-3 text-center">الحضور</th>
                      <th className="py-3 px-3 text-center">الانضباط</th>
                      <th className="py-3 px-3 text-center">أطول سلسلة</th>
                      <th className="py-3 px-3 text-center">رصيد النقاط</th>
                      <th className="py-3 px-3 text-center">الترتيب بالقسم</th>
                      <th className="py-3 px-3 text-center">الموقف المالي</th>
                      <th className="py-3 px-3 text-center print:hidden">كارت التقييم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF0CC]">
                    {filteredMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-[#FDFBF7] transition cursor-pointer"
                        onClick={() => setSelectedMember(m)}
                      >
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-stone-900">{m.fullName}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{m.phone}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-stone-700">
                          {m.voicePart}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              m.tierEvaluation === "ELITE"
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : m.tierEvaluation === "VERY_GOOD"
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                : m.tierEvaluation === "GOOD"
                                ? "bg-sky-50 text-sky-900 border-sky-300"
                                : m.tierEvaluation === "NEEDS_IMPROVEMENT"
                                ? "bg-orange-50 text-orange-900 border-orange-300"
                                : "bg-rose-50 text-rose-900 border-rose-300"
                            }`}
                          >
                            {m.tierEvaluationAr}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-stone-900 whitespace-nowrap">
                          {m.attendanceRate}%
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-blue-800 whitespace-nowrap">
                          {m.punctualityScore}%
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {m.streak > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              <Flame className="w-3 h-3 fill-orange-500" />
                              {m.streak}
                            </span>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-[#640810] whitespace-nowrap">
                          {m.pointsBalance}
                        </td>
                        <td className="py-3 px-3 text-center text-stone-700 whitespace-nowrap">
                          <span className="font-semibold text-[#640810]">#{m.voiceRank.rank}</span>{" "}
                          <span className="text-stone-400">/ {m.voiceRank.totalInPart}</span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {m.financialStatus.outstandingDebt > 0 ? (
                            <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              {m.financialStatus.outstandingDebt} ج
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              خالص 🟢
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap print:hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(m);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#EADBB6] text-[#640810] hover:bg-[#FAF7F2] transition"
                          >
                            عرض الكارت
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal: Individual Member Report Card */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#EADBB6] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-[#EADBB6] bg-[#FAF7F2] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#640810]/10 flex items-center justify-center text-[#640810]">
                    <Award className="w-5 h-5 text-[#640810]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#640810] text-base">{selectedMember.fullName}</h3>
                    <p className="text-xs text-[#78716C]">
                      بطاقة تقييم الأداء الفردية — {data?.quarterName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm overflow-y-auto max-h-[75vh]">
                {/* Status Tier Badge */}
                <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBB6] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#78716C] block">التقييم الشامل للمرنم</span>
                    <strong className="text-base text-[#640810] font-bold">
                      {selectedMember.tierEvaluationAr}
                    </strong>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-[#78716C] block">الترتيب بالقسم</span>
                    <strong className="text-sm text-stone-900">
                      المركز {selectedMember.voiceRank.rank} من {selectedMember.voiceRank.totalInPart}
                    </strong>
                  </div>
                </div>

                {/* 4 Quick Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBB6]">
                    <div className="text-xl font-black text-[#640810]">{selectedMember.attendanceRate}%</div>
                    <div className="text-[11px] text-[#78716C] mt-0.5">معدل الحضور</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBB6]">
                    <div className="text-xl font-black text-blue-700">{selectedMember.punctualityScore}%</div>
                    <div className="text-[11px] text-[#78716C] mt-0.5">الانضباط الزمني</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBB6]">
                    <div className="text-xl font-black text-[#DCA40C]">{selectedMember.pointsBalance}</div>
                    <div className="text-[11px] text-[#78716C] mt-0.5">رصيد النقاط</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBB6]">
                    <div className="text-xl font-black text-orange-600 flex items-center justify-center gap-0.5">
                      <Flame className="w-4 h-4 fill-orange-500" />
                      {selectedMember.streak}
                    </div>
                    <div className="text-[11px] text-[#78716C] mt-0.5">سلسلة الالتزام</div>
                  </div>
                </div>

                {/* Detailed Attendance breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#640810] border-b border-[#FAF0CC] pb-1">
                    سجل الحضور بالبروفات
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between">
                      <span>حاضر في الميعاد بالضبط:</span>
                      <strong className="text-emerald-800">{selectedMember.statusCounts.present}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex justify-between">
                      <span>تأخيرات مسجلة:</span>
                      <strong className="text-amber-800">
                        {selectedMember.statusCounts.late +
                          selectedMember.statusCounts.veryLate +
                          selectedMember.statusCounts.extremeLate}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 flex justify-between">
                      <span>اعتذارات مقبولة:</span>
                      <strong className="text-indigo-800">{selectedMember.statusCounts.excused}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex justify-between">
                      <span>غياب بدون عذر:</span>
                      <strong className="text-rose-800">{selectedMember.statusCounts.absent}</strong>
                    </div>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#640810] border-b border-[#FAF0CC] pb-1">
                    الموقف المالي والاشتراكات
                  </h4>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBB6] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#78716C] block">المسدد / المستحق:</span>
                      <strong>
                        {selectedMember.financialStatus.totalPaid} ج.م من {selectedMember.financialStatus.totalDue} ج.م
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#78716C] block">المتبقي كمتأخرات:</span>
                      <strong
                        className={
                          selectedMember.financialStatus.outstandingDebt > 0
                            ? "text-rose-700"
                            : "text-emerald-700"
                        }
                      >
                        {selectedMember.financialStatus.outstandingDebt > 0
                          ? `${selectedMember.financialStatus.outstandingDebt} ج.م`
                          : "خالص تماماً 🟢"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-[#EADBB6] bg-[#FAF7F2] flex items-center justify-between">
                <button
                  onClick={() =>
                    exportIndividualCardToWord(selectedMember, data?.quarterName || "الربع الحالي")
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  تصدير الكارت Word
                </button>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EADBB6] text-stone-700 hover:bg-[#FAF7F2]"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
