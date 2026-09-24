"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Home,
  RefreshCw,
  AlertCircle,
  X,
  PlayCircle,
  Archive,
  Users,
  Layers,
} from "lucide-react";

interface QuarterItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED";
  rehearsalsCount: number;
  createdAt: string;
}

export default function AdminQuartersPage() {
  const router = useRouter();
  const [quarters, setQuarters] = useState<QuarterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "UPCOMING" as "UPCOMING" | "ACTIVE",
  });

  const fetchQuarters = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/quarters");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load");
      }
      const data = (await res.json()) as { quarters?: QuarterItem[] };
      setQuarters(data.quarters || []);
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل بيانات الفصول السنوية" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuarters();
  }, []);

  const handleCreateQuarter = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("create");
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/quarters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل إنشاء الفصل" });
        return;
      }

      setFeedback({ type: "success", text: "تم إنشاء الفصل بنجاح" });
      setIsModalOpen(false);
      setFormData({ name: "", startDate: "", endDate: "", status: "UPCOMING" });
      await fetchQuarters();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ غير متوقع" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransitionStatus = async (quarterId: string, newStatus: "ACTIVE" | "CLOSED") => {
    setActionLoading(quarterId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/quarters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quarterId,
          status: newStatus,
          reason:
            newStatus === "ACTIVE"
              ? "تفعيل الفصل كفصل تشغيلي حالي"
              : "إنهاء الفصل وتجميد سجلاته التاريخية",
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل تحديث حالة الفصل" });
        return;
      }

      setFeedback({
        type: "success",
        text:
          newStatus === "ACTIVE"
            ? "تم تفعيل الفصل بنجاح وأرشفة أي فصول سابقة"
            : "تم إغلاق وتجميد بيانات الفصل التاريخية بنجاح",
      });
      await fetchQuarters();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ أثناء تحديث حالة الفصل" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Page Title Strip */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold mb-2 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-gold" />
              <span>دورات وربعيات الخدمة</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
              إدارة الفصول السنوية (Quarters)
            </h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              تنظيم دورات الخدمة الربع سنوية، تعيين التواريخ، وتجميد السجلات التاريخية.
            </p>
          </div>
        </div>
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-charcoal-muted hover:text-charcoal cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Rule Banner: Historical Immutability */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-3 shadow-sm">
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">مبدأ حماية السجلات التاريخية:</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              وفقاً لقواعد المنظومة، عند إغلاق الفصل السنوي يتم **تجميد كافة نقاط الحضور والغياب وقواعد التقييم الخاصة به بشكل دائم** لضمان عدم التلاعب بالنتائج التاريخية للمرنمين بأثر رجعي.
            </p>
          </div>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-charcoal">
              قائمة الفصول السنوية
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              يعمل الكورال في دورات منتظمة مدة كل دورة حوالي 4 أشهر
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-burgundy hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فصل سنوي جديد</span>
          </button>
        </div>

        {/* Quarters Grid */}
        {loading ? (
          <div className="py-20 text-center text-charcoal-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-600 mb-2" />
            <p className="text-xs">جاري تحميل الفصول السنوية...</p>
          </div>
        ) : quarters.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-sm">
            <Layers className="w-12 h-12 text-gold-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-charcoal mb-1">
              لم تتم إضافة أي فصول سنوية بعد
            </h3>
            <p className="text-xs text-charcoal-muted mb-4">
              ابدأ بإضافة الفصل السنوي الحالي لتتمكن من جدولة البروفات وتسجيل الحضور
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-sm"
            >
              إضافة أول فصل الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quarters.map((q) => {
              const isActive = q.status === "ACTIVE";
              const isUpcoming = q.status === "UPCOMING";
              const isClosed = q.status === "CLOSED";
              const isProcessing = actionLoading === q.id;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-card ${
                    isActive
                      ? "border-2 border-emerald-500 ring-2 ring-emerald-100"
                      : "border-surface-border hover:border-gold"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Status Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          isActive
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold"
                            : isUpcoming
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-surface-muted text-charcoal-muted border border-surface-border"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            <span>فصل نشط حالياً (ACTIVE)</span>
                          </>
                        ) : isUpcoming ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>فصل قادم (UPCOMING)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-charcoal-muted" />
                            <span>منتهي ومغلق (CLOSED)</span>
                          </>
                        )}
                      </span>

                      <span className="text-[11px] text-charcoal-muted font-bold bg-surface-canvas px-2.5 py-1 rounded-lg border border-surface-border">
                        {q.rehearsalsCount} بروفة
                      </span>
                    </div>

                    {/* Quarter Name */}
                    <div>
                      <h3 className="font-bold text-xl text-burgundy font-display">
                        {q.name}
                      </h3>
                      <div className="mt-2 text-xs text-charcoal-muted space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          <span>تاريخ البدء: {q.startDate}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          <span>تاريخ الانتهاء: {q.endDate}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-6 border-t border-surface-border flex items-center gap-2">
                    {isUpcoming && (
                      <button
                        onClick={() => handleTransitionStatus(q.id, "ACTIVE")}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>تفعيل الفصل الآن</span>
                      </button>
                    )}

                    {isActive && (
                      <button
                        onClick={() => handleTransitionStatus(q.id, "CLOSED")}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-charcoal hover:text-red-700 hover:bg-red-50 border border-surface-border transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Archive className="w-4 h-4" />
                        <span>إنهاء وإغلاق الفصل</span>
                      </button>
                    )}

                    {isClosed && (
                      <div className="w-full text-center text-[11px] font-semibold text-charcoal-muted py-1 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-gold-700" />
                        <span>السجلات التاريخية مجمدة ومحفوظة</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Quarter Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-border animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-5">
                <div>
                  <h3 className="font-bold text-lg text-burgundy font-display">
                    إضافة فصل سنوي جديد
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    تحديد فترة الدورة التشغيلية للكورال
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-charcoal-muted hover:text-charcoal p-1 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateQuarter} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1.5">
                    اسم الفصل السنوي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الفصل الثالث 2026 (سبتمبر - ديسمبر)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-surface-canvas/50 text-xs text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5">
                      تاريخ البدء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-surface-canvas/50 text-xs text-charcoal focus:bg-white focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1.5">
                      تاريخ الانتهاء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-surface-canvas/50 text-xs text-charcoal focus:bg-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1.5">
                    حالة الفصل الأولية
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "UPCOMING" | "ACTIVE",
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-surface-canvas/50 text-xs text-charcoal focus:bg-white focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="UPCOMING">فصل قادم (UPCOMING)</option>
                    <option value="ACTIVE">تفعيل مباشرة كفصل حالي (ACTIVE)</option>
                  </select>
                  <span className="text-[10px] text-charcoal-muted block mt-1">
                    * في حال التفعيل مباشرة، سيتم إغلاق أي فصل آخر نشط حالياً تلقائياً.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal hover:bg-surface-canvas cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "create"}
                    className="px-5 py-2 rounded-full text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    إنشاء الفصل
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

