"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowRight,
  Clock,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  FileCode,
} from "lucide-react";

interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  USER_APPROVED: { label: "اعتماد عضوية مرنم", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  USER_REJECTED: { label: "رفض طلب انضمام", color: "bg-rose-50 text-rose-700 border-rose-200" },
  ROLE_ASSIGNED: { label: "تعديل رتبة / صلاحيات", color: "bg-amber-50 text-amber-700 border-amber-200" },
  REHEARSAL_CREATED: { label: "جدولة بروفة جديدة", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REHEARSAL_SCHEDULED: { label: "جدولة بروفة جديدة", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REHEARSAL_UPDATED: { label: "تعديل موعد بروفة", color: "bg-sky-50 text-sky-700 border-sky-200" },
  REHEARSAL_DELETED: { label: "حذف بروفة", color: "bg-red-50 text-red-700 border-red-200" },
  MEMBER_STATUS_CHANGED_TO_APPROVED: { label: "اعتماد عضوية مرنم", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MEMBER_STATUS_CHANGED_TO_REJECTED: { label: "رفض طلب انضمام", color: "bg-rose-50 text-rose-700 border-rose-200" },
  MEMBER_ROLES_UPDATED: { label: "تعديل رتبة / صلاحيات", color: "bg-amber-50 text-amber-700 border-amber-200" },
  CHECK_IN_RECORDED: { label: "تسجيل حضور بالـ GPS", color: "bg-teal-50 text-teal-700 border-teal-200" },
  ATTENDANCE_OVERRIDE: { label: "تعديل حضور يدوي", color: "bg-purple-50 text-purple-700 border-purple-200" },
  EXCUSE_SUBMITTED: { label: "تقديم طلب اعتذار", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  EXCUSE_APPROVED: { label: "قبول عذر غياب/تأخير", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EXCUSE_REJECTED: { label: "رفض عذر مرنم", color: "bg-rose-50 text-rose-700 border-rose-200" },
  POINTS_RULE_CREATED: { label: "إضافة قاعدة نقاط", color: "bg-orange-50 text-orange-700 border-orange-200" },
  POINTS_ADJUSTED: { label: "تعديل رصيد نقاط يدوي", color: "bg-amber-50 text-amber-700 border-amber-200" },
  SUBSCRIPTIONS_GENERATED: { label: "توليد اشتراكات شهرية", color: "bg-blue-50 text-blue-700 border-blue-200" },
  PAYMENT_RECORDED: { label: "تسجيل دفعة اشتراك", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CHARGE_WAIVED: { label: "إعفاء اشتراك مرنم", color: "bg-violet-50 text-violet-700 border-violet-200" },
  SONG_CREATED: { label: "رفع ترنيمة جديدة", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  SONG_UPDATED: { label: "تعديل ترنيمة / نوتة", color: "bg-sky-50 text-sky-700 border-sky-200" },
  SONG_DELETED: { label: "حذف ترنيمة من الأرشيف", color: "bg-rose-50 text-rose-700 border-rose-200" },
  AI_IMPORT_EXECUTED: { label: "استيراد ذكي بالـ AI", color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
};

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inspection modal
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (selectedAction !== "ALL") params.set("action", selectedAction);
      if (selectedEntity !== "ALL") params.set("entity", selectedEntity);
      if (searchQuery.trim()) params.set("query", searchQuery.trim());
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/admin/super/audit?${params.toString()}`);
      if (!res.ok) {
        throw new Error("فشل في تحميل سجل التدقيق");
      }
      const data: any = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, selectedAction, selectedEntity, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["المعرف", "التاريخ والوقت", "المنفذ", "الإيميل", "العملية", "الكيان", "معرف الكيان", "السبب / الملاحظات"];
    const rows = logs.map((log) => [
      log.id,
      log.timestamp,
      `"${log.actorName.replace(/"/g, '""')}"`,
      log.actorEmail,
      log.action,
      log.entity,
      log.entityId,
      `"${(log.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatPayload = (val: string | null) => {
    if (!val) return "لا توجد بيانات سابقة";
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return val;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[#EADBB6] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#640810]/10 flex items-center justify-center text-[#640810] border border-[#640810]/20">
              <ShieldAlert className="w-6 h-6 text-[#640810]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#640810]">سجل التدقيق الأمني (Audit Trail)</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#DCA40C]/20 text-[#640810] border border-[#DCA40C]/40">
                  المشرف العام (Super Admin)
                </span>
              </div>
              <p className="text-sm text-[#78716C] mt-0.5">
                توثيق كامل وغير قابل للتعديل لجميع العمليات الإدارية، الحركات المالية، وحضور المرنمين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-[#EADBB6] text-[#640810] hover:bg-[#FAF7F2] transition disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#DCA40C]" />
              تصدير CSV
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#640810] text-white hover:bg-[#4A070D] transition disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="bg-white p-5 rounded-3xl border border-[#EADBB6] shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الإيميل، معرف الكيان، أو سبب التعديل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl border border-[#EADBB6] bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#DCA40C]/50 focus:border-[#DCA40C]"
              />
            </div>

            {/* Action Filter */}
            <div>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#EADBB6] bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#DCA40C]/50 text-[#1C1917]"
              >
                <option value="ALL">جميع العمليات الإدارية</option>
                <option value="USER_APPROVED">اعتماد عضوية مرنم</option>
                <option value="USER_REJECTED">رفض طلب انضمام</option>
                <option value="ROLE_ASSIGNED">تعديل صلاحيات ورتب</option>
                <option value="REHEARSAL_CREATED">جدولة بروفة جديدة</option>
                <option value="ATTENDANCE_OVERRIDE">تعديل حضور يدوي</option>
                <option value="EXCUSE_APPROVED">قبول عذر غياب</option>
                <option value="POINTS_ADJUSTED">تعديل نقاط يدوي</option>
                <option value="PAYMENT_RECORDED">تسجيل دفعة اشتراك</option>
                <option value="CHARGE_WAIVED">إعفاء اشتراك</option>
                <option value="SONG_CREATED">رفع ترنيمة جديدة</option>
                <option value="AI_IMPORT_EXECUTED">استيراد بالذكاء الاصطناعي</option>
              </select>
            </div>

            {/* Entity Filter */}
            <div>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#EADBB6] bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#DCA40C]/50 text-[#1C1917]"
              >
                <option value="ALL">جميع الكيانات المستهدفة</option>
                <option value="USER">الأعضاء والمستخدمين (USER)</option>
                <option value="REHEARSAL">البروفات (REHEARSAL)</option>
                <option value="ATTENDANCE">سجلات الحضور (ATTENDANCE)</option>
                <option value="EXCUSE">الاعتذارات (EXCUSE)</option>
                <option value="POINT_TRANSACTION">النقاط (POINTS)</option>
                <option value="SUBSCRIPTION_PAYMENT">الاشتراكات (FINANCE)</option>
                <option value="SONG">الترانيم (SONG)</option>
              </select>
            </div>
          </form>

          {/* Date range strip */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#FAF0CC]">
            <span className="text-xs font-medium text-[#78716C] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#DCA40C]" />
              الفترة الزمنية:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#EADBB6] bg-[#FDFBF7]"
            />
            <span className="text-xs text-[#78716C]">إلى</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#EADBB6] bg-[#FDFBF7]"
            />
            {(startDate || endDate || selectedAction !== "ALL" || selectedEntity !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedAction("ALL");
                  setSelectedEntity("ALL");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-xs text-[#640810] hover:underline font-medium pr-2"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
            <div className="mr-auto text-xs text-[#78716C]">
              إجمالي السجلات: <strong className="text-[#640810]">{total}</strong> عملية
            </div>
          </div>
        </div>

        {/* Table of Logs */}
        <div className="bg-white rounded-3xl border border-[#EADBB6] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#78716C]">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#640810] mb-3" />
              جاري فحص وتحديث سجل التدقيق الأمني...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-[#78716C]">
              <ShieldAlert className="w-12 h-12 mx-auto text-[#DCA40C] mb-3 opacity-60" />
              <p className="font-medium text-base text-[#1C1917]">لا توجد عمليات تدقيق مطابقة للبحث</p>
              <p className="text-sm mt-1">جرب تغيير الفلاتر أو مسح كلمات البحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EADBB6] text-[#78716C] font-semibold text-xs">
                    <th className="py-3.5 px-4">التاريخ والوقت</th>
                    <th className="py-3.5 px-4">المنفذ (Actor)</th>
                    <th className="py-3.5 px-4">نوع العملية</th>
                    <th className="py-3.5 px-4">الكيان المستهدف</th>
                    <th className="py-3.5 px-4">السبب / الملاحظات</th>
                    <th className="py-3.5 px-4 text-center">التفاصيل والفروقات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF0CC]">
                  {logs.map((log) => {
                    const actionInfo = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: "bg-stone-50 text-stone-700 border-stone-200",
                    };
                    return (
                      <tr key={log.id} className="hover:bg-[#FDFBF7] transition">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#78716C]">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5 text-[#DCA40C]" />
                            {log.timestamp}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#640810]/10 text-[#640810] flex items-center justify-center font-bold text-xs">
                              {log.actorName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-xs text-[#1C1917]">{log.actorName}</div>
                              <div className="text-[11px] text-[#78716C] font-mono">{log.actorEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${actionInfo.color}`}
                          >
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-xs font-mono font-medium text-stone-800">{log.entity}</div>
                          <div className="text-[11px] text-[#78716C] font-mono truncate max-w-[120px]" title={log.entityId}>
                            {log.entityId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-stone-700 max-w-xs truncate" title={log.reason || "-"}>
                          {log.reason || <span className="text-stone-400 italic">بدون ملاحظات</span>}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => setInspectedLog(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-[#EADBB6] text-[#640810] hover:bg-[#FAF7F2] transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#DCA40C]" />
                            فحص
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 bg-[#FAF7F2] border-t border-[#EADBB6] flex items-center justify-between">
              <div className="text-xs text-[#78716C]">
                صفحة <strong className="text-[#640810]">{page}</strong> من <strong>{totalPages}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-[#EADBB6] bg-white text-stone-700 hover:bg-[#FAF7F2] disabled:opacity-40 transition"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-[#EADBB6] bg-white text-stone-700 hover:bg-[#FAF7F2] disabled:opacity-40 transition"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Event Diff & Payload Inspector */}
        {inspectedLog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#EADBB6] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-[#EADBB6] bg-[#FAF7F2] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#640810]/10 flex items-center justify-center text-[#640810]">
                    <FileCode className="w-5 h-5 text-[#640810]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#640810] text-base">فحص تفاصيل العملية الأمنية</h3>
                    <p className="text-xs text-[#78716C] font-mono">{inspectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedLog(null)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBB6]">
                  <div>
                    <span className="text-xs text-[#78716C] block">العملية</span>
                    <strong className="text-xs font-semibold text-[#640810]">{inspectedLog.action}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716C] block">الكيان</span>
                    <strong className="text-xs font-semibold text-stone-900">{inspectedLog.entity}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716C] block">المنفذ</span>
                    <strong className="text-xs font-semibold text-stone-900">{inspectedLog.actorName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716C] block">التاريخ</span>
                    <strong className="text-xs font-semibold font-mono text-stone-800">{inspectedLog.timestamp}</strong>
                  </div>
                </div>

                {inspectedLog.reason && (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs">
                    <span className="font-semibold block mb-0.5">سبب الإجراء / توضيح المنفذ:</span>
                    {inspectedLog.reason}
                  </div>
                )}

                {/* Diff Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-rose-700 mb-2 block flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      البيانات السابقة (Old Value)
                    </span>
                    <pre className="p-4 rounded-xl bg-stone-900 text-rose-300 font-mono text-xs overflow-x-auto max-h-60 border border-stone-800">
                      {formatPayload(inspectedLog.oldValue)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 mb-2 block flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      البيانات الجديدة بعد التعديل (New Value)
                    </span>
                    <pre className="p-4 rounded-xl bg-stone-900 text-emerald-300 font-mono text-xs overflow-x-auto max-h-60 border border-stone-800">
                      {formatPayload(inspectedLog.newValue)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#EADBB6] bg-[#FAF7F2] flex justify-end">
                <button
                  onClick={() => setInspectedLog(null)}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-white border border-[#EADBB6] text-stone-700 hover:bg-[#FAF7F2]"
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
