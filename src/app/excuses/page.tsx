"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserX,
  Timer,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Home,
  Radio,
  RefreshCw,
  LogOut,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Building2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";
import ExcuseSubmissionModal from "@/components/excuses/ExcuseSubmissionModal";

interface ExcuseItem {
  id: string;
  rehearsalId: string;
  rehearsalTitle: string;
  rehearsalDate: string;
  rehearsalStartTime: string;
  rehearsalEndTime: string;
  locationName: string;
  type: "ABSENCE" | "DELAY";
  reason: string;
  expectedDelayMinutes: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewerName?: string | null;
  createdAt: string;
}

export default function MemberExcusesPage() {
  const router = useRouter();
  const [excuses, setExcuses] = useState<ExcuseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExcuses = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/excuses");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data: any = await res.json();
      setExcuses(data.excuses || []);
    } catch (err) {
      console.error("Fetch excuses error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExcuses();
  }, []);

  const pendingCount = excuses.filter((e) => e.status === "PENDING").length;
  const approvedCount = excuses.filter((e) => e.status === "APPROVED").length;
  const rejectedCount = excuses.filter((e) => e.status === "REJECTED").length;

  const filtered = excuses.filter((e) => {
    if (activeTab === "ALL") return true;
    return e.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col selection:bg-gold-200">
      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* Banner with Action Button */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-5 sm:p-7 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-2">
                <UserX className="w-3.5 h-3.5" />
                <span>إدارة استئذان المرنمين</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                أعذاري للبروفات القادمة
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                يمكنك تقديم طلب اعتذار عن الحضور أو إشعار تأخير مسبق للمشرفين، ومتابعة حالة اعتماد الأعذار أولاً بأول.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gold hover:bg-gold-400 text-burgundy-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>تقديم عذر جديد</span>
            </button>
          </div>

          <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-gold/10 blur-2xl pointer-events-none" />
        </div>

        {/* Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-surface-border shadow-xs text-center">
            <div className="text-2xl font-display font-bold text-burgundy">{excuses.length}</div>
            <div className="text-xs text-charcoal-muted font-medium mt-0.5">إجمالي الطلبات</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-surface-border shadow-xs text-center">
            <div className="text-2xl font-display font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-amber-800 font-medium mt-0.5">قيد المراجعة</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-surface-border shadow-xs text-center">
            <div className="text-2xl font-display font-bold text-emerald-600">{approvedCount}</div>
            <div className="text-xs text-emerald-800 font-medium mt-0.5">أعذار مقبولة</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-surface-border shadow-xs text-center">
            <div className="text-2xl font-display font-bold text-red-600">{rejectedCount}</div>
            <div className="text-xs text-red-800 font-medium mt-0.5">أعذار مرفوضة</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-surface-border shadow-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "ALL"
                ? "bg-burgundy text-white shadow-2xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            الكل ({excuses.length})
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "PENDING"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            قيد المراجعة ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab("APPROVED")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "APPROVED"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            المقبولة ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab("REJECTED")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "REJECTED"
                ? "bg-red-600 text-white shadow-2xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            المرفوضة ({rejectedCount})
          </button>
        </div>

        {/* Excuses List */}
        {loading ? (
          <div className="py-16 text-center text-charcoal-muted space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-burgundy" />
            <p className="text-xs">جاري تحميل سجل الأعذار...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-surface-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-canvas text-charcoal-muted flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-charcoal text-sm">لا توجد طلبات في هذا التبويب</h3>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              {activeTab === "ALL"
                ? "لم تقم بتقديم أي أعذار مسبقة. يمكنك تقديم طلب اعتذار عن الحضور أو إشعار تأخير متى احتجت."
                : "لا توجد طلبات تطابق هذا التصنيف حالياً."}
            </p>
            {activeTab === "ALL" && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تقديم أول عذر</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((excuse) => (
              <div
                key={excuse.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-surface-border shadow-xs hover:border-gold/50 transition-all space-y-3"
              >
                {/* Card Header: Rehearsal & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          excuse.type === "ABSENCE"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {excuse.type === "ABSENCE" ? "اعتذار عن الحضور (غياب)" : `إشعار تأخير (${excuse.expectedDelayMinutes || 30} دقيقة)`}
                      </span>

                      <span className="text-[11px] text-charcoal-muted">
                        • {new Date(excuse.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-charcoal">
                      {excuse.rehearsalTitle}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {excuse.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>قيد المراجعة</span>
                      </span>
                    )}
                    {excuse.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم القبول والاعتماد</span>
                      </span>
                    )}
                    {excuse.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>مرفوض</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Rehearsal Metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal-muted bg-surface-canvas p-2.5 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>{excuse.rehearsalDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>{formatTime12h(excuse.rehearsalStartTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-gold" />
                    <span>{excuse.locationName}</span>
                  </div>
                </div>

                {/* Reason Text */}
                <div className="text-xs text-charcoal bg-amber-50/40 border border-amber-100 rounded-2xl p-3 leading-relaxed">
                  <span className="font-bold text-burgundy block mb-0.5">سبب الاستئذان:</span>
                  {excuse.reason}
                </div>

                {/* Reviewer Note / Admin Feedback */}
                {excuse.reviewerNotes && (
                  <div className="text-xs bg-surface-canvas border border-surface-border rounded-2xl p-3.5 text-charcoal space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-burgundy">
                      <MessageSquare className="w-3.5 h-3.5 text-gold" />
                      <span>
                        تعليق المشرف{excuse.reviewerName ? ` (${excuse.reviewerName})` : ""}:
                      </span>
                    </div>
                    <p className="text-charcoal font-medium pr-5 leading-relaxed">{excuse.reviewerNotes}</p>
                  </div>
                )}

                {/* Footer Info if Approved / Attendance Note */}
                {excuse.status === "APPROVED" && excuse.type === "ABSENCE" && (
                  <div className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>تم تحديث سجل حضورك لهذه البروفة تلقائياً إلى "غياب بعذر مقبول" (العلامة الزرقاء 🔵).</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reusable Excuse Submission Modal */}
      <ExcuseSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchExcuses(true)}
      />
    </div>
  );
}
