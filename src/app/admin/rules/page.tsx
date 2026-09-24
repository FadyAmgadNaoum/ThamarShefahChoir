"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  Home,
  RefreshCw,
  AlertCircle,
  X,
  ShieldCheck,
  Check,
  Layers,
  Award,
} from "lucide-react";

interface PointRuleItem {
  id: string;
  quarterId: string;
  ruleType: string;
  occurrenceStart: number;
  occurrenceEnd: number | null;
  pointsDelta: number;
  description: string;
  createdAt: string;
}

interface QuarterItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED";
}

const RULE_TYPE_LABELS: Record<string, { label: string; group: string; color: string }> = {
  PRESENT: { label: "حضور في الميعاد", group: "حضور", color: "emerald" },
  LATE: { label: "تأخير خفيف", group: "تأخير", color: "amber" },
  VERY_LATE: { label: "تأخير كبير", group: "تأخير", color: "orange" },
  EXTREME_LATE: { label: "تأخير حرج", group: "تأخير", color: "rose" },
  EXCUSED_ABSENCE: { label: "غياب بعذر معتمد", group: "غياب", color: "blue" },
  ABSENT: { label: "غياب بدون عذر", group: "غياب", color: "red" },
  EARLY_LEAVE: { label: "انصراف مبكر", group: "أخرى", color: "purple" },
};

export default function AdminRulesPage() {
  const router = useRouter();
  const [quarters, setQuarters] = useState<QuarterItem[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>("");
  const [currentQuarter, setCurrentQuarter] = useState<QuarterItem | null>(null);
  const [rules, setRules] = useState<PointRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ruleType: "PRESENT",
    occurrenceStart: 1,
    occurrenceEnd: "" as string | number,
    pointsDelta: 10,
    description: "",
  });

  // Fetch quarters list
  const fetchQuarters = async () => {
    try {
      const res = await fetch("/api/admin/quarters");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error();
      }
      const data = (await res.json()) as { quarters?: QuarterItem[] };
      const qList = data.quarters || [];
      setQuarters(qList);

      if (!selectedQuarterId && qList.length > 0) {
        const active = qList.find((q) => q.status === "ACTIVE") || qList[0];
        setSelectedQuarterId(active.id);
      }
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل قائمة الفصول السنوية" });
    }
  };

  // Fetch rules for selected quarter
  const fetchRules = async (qId: string) => {
    if (!qId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/rules?quarterId=${qId}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { rules?: PointRuleItem[]; quarter?: QuarterItem };
      setRules(data.rules || []);
      setCurrentQuarter(data.quarter || null);
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل قواعد النقاط لهذا الربع" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuarters();
  }, []);

  useEffect(() => {
    if (selectedQuarterId) {
      fetchRules(selectedQuarterId);
    }
  }, [selectedQuarterId]);

  const handleSeedDefaults = async () => {
    if (!selectedQuarterId) return;
    if (currentQuarter?.status === "CLOSED") {
      setFeedback({ type: "error", text: "لا يمكن تعديل قواعد ربع سنوي مغلق ومجمد تاريخياً" });
      return;
    }

    if (!confirm("هل أنت متأكد من تطبيق القواعد القياسية التلقائية؟ سيتم استبدال القواعد الحالية لهذا الربع بقواعد التكرار المعيارية.")) {
      return;
    }

    try {
      setActionLoading("seed");
      const res = await fetch("/api/admin/rules/seed-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quarterId: selectedQuarterId }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", text: data.message || "تم تطبيق القواعد المعيارية" });
      fetchRules(selectedQuarterId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تطبيق القواعد التلقائية";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (currentQuarter?.status === "CLOSED") {
      setFeedback({ type: "error", text: "لا يمكن حذف قواعد ربع سنوي مغلق" });
      return;
    }

    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه القاعدة؟")) return;

    try {
      setActionLoading(ruleId);
      const res = await fetch(`/api/admin/rules/${ruleId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", text: data.message || "تم حذف قاعدة النقاط بنجاح" });
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل حذف القاعدة";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRuleId(null);
    setFormData({
      ruleType: "PRESENT",
      occurrenceStart: 1,
      occurrenceEnd: "",
      pointsDelta: 10,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: PointRuleItem) => {
    setEditingRuleId(rule.id);
    setFormData({
      ruleType: rule.ruleType,
      occurrenceStart: rule.occurrenceStart,
      occurrenceEnd: rule.occurrenceEnd !== null ? rule.occurrenceEnd : "",
      pointsDelta: rule.pointsDelta,
      description: rule.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuarterId) return;

    const occEnd = formData.occurrenceEnd === "" ? null : Number(formData.occurrenceEnd);

    if (occEnd !== null && occEnd < Number(formData.occurrenceStart)) {
      setFeedback({ type: "error", text: "نهاية التكرار يجب أن تكون أكبر من أو تساوي بداية التكرار" });
      return;
    }

    try {
      setActionLoading("save");
      if (editingRuleId) {
        // Edit existing
        const res = await fetch(`/api/admin/rules/${editingRuleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            occurrenceStart: Number(formData.occurrenceStart),
            occurrenceEnd: occEnd,
            pointsDelta: Number(formData.pointsDelta),
            description: formData.description,
          }),
        });
        const data = (await res.json()) as { error?: string; message?: string };
        if (!res.ok) throw new Error(data.error);

        setFeedback({ type: "success", text: "تم تعديل قاعدة النقاط بنجاح" });
      } else {
        // Create new
        const res = await fetch("/api/admin/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quarterId: selectedQuarterId,
            ruleType: formData.ruleType,
            occurrenceStart: Number(formData.occurrenceStart),
            occurrenceEnd: occEnd,
            pointsDelta: Number(formData.pointsDelta),
            description: formData.description,
          }),
        });
        const data = (await res.json()) as { error?: string; message?: string };
        if (!res.ok) throw new Error(data.error);

        setFeedback({ type: "success", text: "تمت إضافة قاعدة النقاط بنجاح" });
      }

      setIsModalOpen(false);
      fetchRules(selectedQuarterId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل حفظ القاعدة";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const isClosed = currentQuarter?.status === "CLOSED";

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* Banner with Quarter Selector */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-5 sm:p-7 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>محرك القواعد والتكرارات — Phase 6</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                قواعد النقاط والتكرارات لكل ربع سنوي
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                تحديد نقاط الحضور والتأخير والغياب ديناميكياً بحسب عدد مرات التكرار، مع تجميد تاريخي كامل للفصول المغلقة.
              </p>
            </div>

            {/* Quarter Selector Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 w-full md:w-auto min-w-[240px]">
              <label className="text-[11px] text-white/80 block mb-1 font-semibold">
                الربع السنوي المستهدف:
              </label>
              <select
                value={selectedQuarterId}
                onChange={(e) => setSelectedQuarterId(e.target.value)}
                className="w-full bg-burgundy-950/80 text-white border border-gold/40 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {quarters.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.status === "ACTIVE" ? "🟢 نشط" : q.status === "CLOSED" ? "🔒 مغلق ومجمد" : "🟡 قادم"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
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
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Closed Quarter Warning */}
        {isClosed && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs sm:text-sm">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">هذا الربع السنوي مغلق ومجمد تاريخياً</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                حمايةً للنزاهة التاريخية، لا يمكن إضافة أو تعديل أو حذف قواعد النقاط الخاصة بفصل مغلق انتهت بروفاته.
              </p>
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-charcoal">
              قواعد النقاط المعتمدة ({rules.length} قواعد)
            </h3>
            <button
              onClick={() => fetchRules(selectedQuarterId)}
              disabled={loading}
              className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-gray-100 transition-colors"
              title="تحديث"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {!isClosed && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedDefaults}
                disabled={actionLoading === "seed"}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-burgundy bg-gold-50 border border-gold/40 hover:bg-gold-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>تطبيق القواعد المعيارية التلقائية</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-gold" />
                <span>إضافة قاعدة تكرار</span>
              </button>
            </div>
          )}
        </div>

        {/* Rules Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-charcoal-muted text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
            <span>جاري تحميل قواعد النقاط...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-surface-border text-center space-y-3">
            <Sliders className="w-8 h-8 text-gold mx-auto" />
            <h4 className="font-bold text-sm text-charcoal">لم يتم إعداد قواعد نقاط لهذا الربع بعد</h4>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              يمكنك بضغطة زر تطبيق القواعد المعيارية التلقائية (9 قواعد تكرار للحضور والتأخير والغياب) أو إضافة قواعد مخصصة يدوياً.
            </p>
            {!isClosed && (
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span>تطبيق القواعد القياسية التلقائية الآن</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => {
              const meta = RULE_TYPE_LABELS[rule.ruleType] || {
                label: rule.ruleType,
                color: "gray",
              };
              const isPositive = rule.pointsDelta > 0;
              const isZero = rule.pointsDelta === 0;

              return (
                <div
                  key={rule.id}
                  className="rounded-2xl bg-white p-4 border border-surface-border shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Rule Type & Occurrence Pill */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-charcoal">
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-canvas border border-surface-border text-charcoal-muted">
                        التكرار: {rule.occurrenceStart} {rule.occurrenceEnd ? `– ${rule.occurrenceEnd}` : "فما بعد (+)"}
                      </span>
                    </div>

                    {/* Points Delta Badge */}
                    <div className="my-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isZero
                            ? "bg-gray-100 text-gray-700 border border-gray-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isPositive ? `+${rule.pointsDelta}` : rule.pointsDelta} نقطة
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-charcoal-muted mt-2 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>

                  {/* Actions (if quarter is not closed) */}
                  {!isClosed && (
                    <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-burgundy hover:bg-gold-50 transition-colors"
                        title="تعديل القاعدة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        disabled={actionLoading === rule.id}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف القاعدة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold" />
                <span>{editingRuleId ? "تعديل قاعدة نقاط" : "إضافة قاعدة تكرار جديدة"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  نوع الحالة (Trigger Status):
                </label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  disabled={Boolean(editingRuleId)}
                  className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold bg-white disabled:bg-gray-100"
                >
                  <option value="PRESENT">حاضر في الميعاد (PRESENT)</option>
                  <option value="LATE">تأخير خفيف (LATE)</option>
                  <option value="VERY_LATE">تأخير كبير (VERY_LATE)</option>
                  <option value="EXTREME_LATE">تأخير حرج (EXTREME_LATE)</option>
                  <option value="EXCUSED_ABSENCE">غياب بعذر مقبول (EXCUSED_ABSENCE)</option>
                  <option value="ABSENT">غياب بدون عذر (ABSENT)</option>
                  <option value="EARLY_LEAVE">انصراف مبكر (EARLY_LEAVE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    من التكرار رقم:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.occurrenceStart}
                    onChange={(e) =>
                      setFormData({ ...formData, occurrenceStart: Number(e.target.value) })
                    }
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    إلى التكرار (فارغ للمفتوح +):
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="مفتوح (+)"
                    value={formData.occurrenceEnd}
                    onChange={(e) => setFormData({ ...formData, occurrenceEnd: e.target.value })}
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  النقاط المستحقة (Points Delta):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={formData.pointsDelta}
                    onChange={(e) =>
                      setFormData({ ...formData, pointsDelta: Number(e.target.value) })
                    }
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <span className="text-xs text-charcoal-muted shrink-0">
                    {Number(formData.pointsDelta) > 0
                      ? "إضافة (+)"
                      : Number(formData.pointsDelta) < 0
                      ? "خصم (-)"
                      : "محايد (0)"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  الوصف التوضيحي:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أول 3 غيابات بدون خصم (سماح)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-muted hover:text-charcoal hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "save"}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {actionLoading === "save" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-gold" />
                  )}
                  <span>حفظ القاعدة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
