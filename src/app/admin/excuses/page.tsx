"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Inbox,
  UserX,
  Timer,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Home,
  Check,
  X,
  Phone,
  Music,
  Building2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronDown,
  MessageSquare,
  Edit3,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";

interface AdminExcuseItem {
  id: string;
  rehearsalId: string;
  userId: string;
  memberName: string;
  memberPhone: string;
  memberVoicePart: string;
  memberTier: string;
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

interface ExcuseStats {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const VOICE_PART_LABELS: Record<string, string> = {
  SOPRANO: "سوبرانو",
  ALTO: "ألتو",
  TENOR: "تينور",
  BASS: "باص",
};

export default function AdminExcusesPage() {
  const router = useRouter();
  const [excuses, setExcuses] = useState<AdminExcuseItem[]>([]);
  const [stats, setStats] = useState<ExcuseStats>({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reviewerNotesInput, setReviewerNotesInput] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [voicePartFilter, setVoicePartFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExcuses = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (voicePartFilter !== "ALL") params.append("voicePart", voicePartFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`/api/admin/excuses?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");

      const data: any = await res.json();
      setExcuses(data.excuses || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Fetch admin excuses error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExcuses();
  }, [statusFilter, typeFilter, voicePartFilter]);

  const handleReview = async (
    id: string,
    newStatus: "APPROVED" | "REJECTED",
    customNotes?: string
  ) => {
    setProcessingId(id);
    setFeedback(null);

    try {
      const notesToSend =
        customNotes !== undefined ? customNotes : reviewerNotesInput[id] || undefined;

      const res = await fetch(`/api/admin/excuses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: notesToSend,
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل معالجة العذر");
      }

      setFeedback({
        type: "success",
        text:
          newStatus === "APPROVED"
            ? "تم اعتماد العذر بنجاح وتحديث سجل الحضور تلقائياً"
            : "تم رفض طلب العذر",
      });

      // Clear note editing state
      setEditingNoteId(null);
      setReviewerNotesInput((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      // Refresh list
      fetchExcuses(true);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "حدث خطأ أثناء المراجعة" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col selection:bg-gold-200">
      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* Banner with Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-5 sm:p-7 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-2">
                <Inbox className="w-3.5 h-3.5" />
                <span>إدارة المشرفين وقائد الكورال</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                صندوق مراجعة طلبات الاستئذان والغياب
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                مراجعة واعتماد أعذار المرنمين مسبقاً. قبول عذر الغياب يقوم تلقائياً بتحديث سجل الحضور إلى "غياب بعذر مقبول".
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center">
                <div className="text-xl sm:text-2xl font-display font-bold text-amber-300">
                  {stats.pendingCount}
                </div>
                <div className="text-[11px] text-white/80 font-medium">بانتظار القرار</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center">
                <div className="text-xl sm:text-2xl font-display font-bold text-emerald-300">
                  {stats.approvedCount}
                </div>
                <div className="text-[11px] text-white/80 font-medium">أعذار معتمدة</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center">
                <div className="text-xl sm:text-2xl font-display font-bold text-red-300">
                  {stats.rejectedCount}
                </div>
                <div className="text-[11px] text-white/80 font-medium">مرفوضة</div>
              </div>
            </div>
          </div>

          <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-gold/10 blur-2xl pointer-events-none" />
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-charcoal-muted hover:text-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-muted absolute right-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchExcuses()}
                placeholder="ابحث بالاسم، الموبايل، أو السبب..."
                className="w-full pr-10 pl-3 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-bold text-charcoal focus:border-gold outline-none"
              >
                <option value="ALL">جميع الحالات ({stats.totalCount})</option>
                <option value="PENDING">قيد المراجعة فقط ({stats.pendingCount})</option>
                <option value="APPROVED">الأعذار المقبولة ({stats.approvedCount})</option>
                <option value="REJECTED">الأعذار المرفوضة ({stats.rejectedCount})</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-bold text-charcoal focus:border-gold outline-none"
              >
                <option value="ALL">جميع أنواع الأعذار</option>
                <option value="ABSENCE">اعتذار عن الحضور (غياب)</option>
                <option value="DELAY">إشعار تأخير مسبق</option>
              </select>
            </div>

            {/* Voice Part Filter */}
            <div>
              <select
                value={voicePartFilter}
                onChange={(e) => setVoicePartFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-bold text-charcoal focus:border-gold outline-none"
              >
                <option value="ALL">كل طبقات الصوت</option>
                <option value="SOPRANO">سوبرانو (Soprano)</option>
                <option value="ALTO">ألتو (Alto)</option>
                <option value="TENOR">تينور (Tenor)</option>
                <option value="BASS">باص (Bass)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Excuses Cards List */}
        {loading ? (
          <div className="py-20 text-center text-charcoal-muted space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-burgundy" />
            <p className="text-xs">جاري تحميل طلبات الأعذار...</p>
          </div>
        ) : excuses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-surface-border space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-canvas text-charcoal-muted flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-charcoal text-base">لا توجد طلبات أعذار مطابقة</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              {statusFilter === "PENDING"
                ? "رائع! صندوق المراجعة خالٍ حالياً ولا توجد أي طلبات بانتظار القرار."
                : "لا توجد طلبات تطابق الفلاتر المحددة حالياً."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {excuses.map((excuse) => (
              <div
                key={excuse.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-3.5 ${
                  excuse.status === "PENDING"
                    ? "border-amber-200 bg-amber-50/20"
                    : excuse.status === "APPROVED"
                    ? "border-emerald-200"
                    : "border-red-200"
                }`}
              >
                {/* Header Row: Member Info & Type Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-burgundy/10 text-burgundy flex items-center justify-center font-display font-bold text-sm shrink-0">
                      {excuse.memberName.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-charcoal">
                          {excuse.memberName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-canvas border text-charcoal-muted">
                          {VOICE_PART_LABELS[excuse.memberVoicePart] || excuse.memberVoicePart}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-muted mt-0.5">
                        <a
                          href={`tel:${excuse.memberPhone}`}
                          className="flex items-center gap-1 hover:text-burgundy"
                        >
                          <Phone className="w-3 h-3 text-gold" />
                          <span>{excuse.memberPhone}</span>
                        </a>
                        <span>•</span>
                        <span>
                          قُدم بتاريخ {new Date(excuse.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Type Badge & Status */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        excuse.type === "ABSENCE"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {excuse.type === "ABSENCE"
                        ? "اعتذار عن الحضور (غياب)"
                        : `إشعار تأخير (${excuse.expectedDelayMinutes || 30} دقيقة)`}
                    </span>

                    {excuse.status === "PENDING" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        قيد المراجعة
                      </span>
                    )}
                    {excuse.status === "APPROVED" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        معتمد ✓
                      </span>
                    )}
                    {excuse.status === "REJECTED" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        مرفوض ✗
                      </span>
                    )}
                  </div>
                </div>

                {/* Rehearsal Context Strip */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal-muted bg-surface-canvas p-3 rounded-2xl border border-surface-border/60">
                  <div className="font-bold text-burgundy flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>{excuse.rehearsalTitle}</span>
                  </div>
                  <div>•</div>
                  <div>{excuse.rehearsalDate}</div>
                  <div>•</div>
                  <div>{formatTime12h(excuse.rehearsalStartTime)}</div>
                  <div>•</div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-gold" />
                    <span>{excuse.locationName}</span>
                  </div>
                </div>

                {/* Member's Submitted Reason */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-charcoal leading-relaxed">
                  <span className="font-bold text-burgundy block mb-1">سبب الاستئذان:</span>
                  <p className="text-charcoal font-medium">{excuse.reason}</p>
                </div>

                {/* Admin Note Input for Pending Excuses */}
                {excuse.status === "PENDING" && (
                  <div className="bg-surface-canvas border border-surface-border/70 rounded-2xl p-3 space-y-1.5">
                    <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-gold" />
                        <span>إضافة تعليق أو توجيه للمرنم (اختياري):</span>
                      </span>
                      <span className="text-[11px] font-normal text-charcoal-muted">يظهر للمرنم في صفحته</span>
                    </label>
                    <input
                      type="text"
                      value={reviewerNotesInput[excuse.id] ?? ""}
                      onChange={(e) =>
                        setReviewerNotesInput((prev) => ({
                          ...prev,
                          [excuse.id]: e.target.value,
                        }))
                      }
                      placeholder="مثال: تم قبول العذر مع مراعاة التعويض في بروفة الجمعة القادمة..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-border text-xs text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold outline-none shadow-2xs transition-all"
                    />
                  </div>
                )}

                {/* Display Reviewer Note if already recorded */}
                {excuse.reviewerNotes && editingNoteId !== excuse.id && (
                  <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-3.5 text-xs text-charcoal space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-burgundy">
                        <MessageSquare className="w-3.5 h-3.5 text-gold" />
                        <span>تعليق المشرف المسجل:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(excuse.id);
                          setReviewerNotesInput((prev) => ({
                            ...prev,
                            [excuse.id]: excuse.reviewerNotes || "",
                          }));
                        }}
                        className="text-[11px] font-bold text-burgundy hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-gold" />
                        <span>تعديل التعليق</span>
                      </button>
                    </div>
                    <p className="text-charcoal font-medium pr-5 leading-relaxed">{excuse.reviewerNotes}</p>
                  </div>
                )}

                {/* Edit Reviewer Note form for reviewed excuses */}
                {editingNoteId === excuse.id && (
                  <div className="bg-surface-canvas border border-surface-border rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-gold" />
                        <span>تعديل تعليق المشرف:</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="text-xs text-charcoal-muted hover:text-charcoal cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                    <input
                      type="text"
                      value={reviewerNotesInput[excuse.id] ?? excuse.reviewerNotes ?? ""}
                      onChange={(e) =>
                        setReviewerNotesInput((prev) => ({
                          ...prev,
                          [excuse.id]: e.target.value,
                        }))
                      }
                      placeholder="اكتب التعليق المحدث هنا..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-border text-xs text-charcoal focus:border-gold outline-none shadow-2xs"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        disabled={processingId === excuse.id}
                        onClick={() =>
                          handleReview(
                            excuse.id,
                            excuse.status === "APPROVED" ? "APPROVED" : "REJECTED",
                            reviewerNotesInput[excuse.id] ?? ""
                          )
                        }
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-burgundy text-white hover:bg-burgundy-dark transition-colors cursor-pointer"
                      >
                        {processingId === excuse.id ? "جاري الحفظ..." : "حفظ التعليق"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Comment button for already reviewed excuses without note */}
                {excuse.status !== "PENDING" && !excuse.reviewerNotes && editingNoteId !== excuse.id && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(excuse.id);
                        setReviewerNotesInput((prev) => ({ ...prev, [excuse.id]: "" }));
                      }}
                      className="text-xs text-charcoal-muted hover:text-burgundy flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <MessageSquare className="w-3 h-3 text-gold" />
                      <span>+ إضافة تعليق للمرنم</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons for Pending Excuses */}
                {excuse.status === "PENDING" ? (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                    <button
                      type="button"
                      disabled={processingId === excuse.id}
                      onClick={() => handleReview(excuse.id, "REJECTED")}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>رفض الطلب</span>
                    </button>

                    <button
                      type="button"
                      disabled={processingId === excuse.id}
                      onClick={() => handleReview(excuse.id, "APPROVED")}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {processingId === excuse.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>قبول واعتماد العذر</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs text-charcoal-muted">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                      <span>
                        تمت المراجعة بواسطة: <strong>{excuse.reviewerName || "مشرف النظام"}</strong>
                        {excuse.reviewedAt && ` • ${new Date(excuse.reviewedAt).toLocaleDateString("ar-EG")}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={processingId === excuse.id}
                      onClick={() =>
                        handleReview(
                          excuse.id,
                          excuse.status === "APPROVED" ? "REJECTED" : "APPROVED"
                        )
                      }
                      className="text-xs text-charcoal-muted hover:text-burgundy underline cursor-pointer"
                    >
                      تغيير القرار إلى {excuse.status === "APPROVED" ? "مرفوض" : "مقبول"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
