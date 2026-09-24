"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Sliders,
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Home,
  RefreshCw,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  User,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
} from "lucide-react";

interface AdjustmentItem {
  id: string;
  userId: string;
  quarterId: string;
  rehearsalId: string | null;
  pointsDelta: number;
  transactionType: "MANUAL_BONUS" | "MANUAL_DEDUCTION" | "ADJUSTMENT";
  reason: string;
  createdBy: string | null;
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  recipientVoicePart: string;
  actorName: string;
  rehearsalTitle: string | null;
  rehearsalDate: string | null;
  quarterName: string;
}

interface MemberOption {
  id: string;
  fullName: string;
  phone: string;
  voicePart: string;
}

interface QuarterOption {
  id: string;
  name: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED";
}

interface RehearsalOption {
  id: string;
  title: string;
  date: string;
  quarterId: string;
}

export default function AdminAdjustmentsPage() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [quarters, setQuarters] = useState<QuarterOption[]>([]);
  const [rehearsals, setRehearsals] = useState<RehearsalOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalCount: 0,
    totalPositivePoints: 0,
    totalNegativePoints: 0,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: "",
    quarterId: "",
    rehearsalId: "",
    type: "MANUAL_BONUS" as "MANUAL_BONUS" | "MANUAL_DEDUCTION" | "ADJUSTMENT",
    delta: 10,
    reason: "",
  });

  // Fetch reference data (members, quarters, rehearsals)
  const fetchReferences = async () => {
    try {
      const [membersRes, quartersRes] = await Promise.all([
        fetch("/api/admin/members"),
        fetch("/api/admin/quarters"),
      ]);

      if (membersRes.status === 401 || quartersRes.status === 401) {
        router.push("/login");
        return;
      }

      if (membersRes.ok) {
        const mData = (await membersRes.json()) as { members?: { id: string; fullName: string; phone: string; voicePart: string; status: string }[] };
        const approved = (mData.members || []).filter(
          (m) => m.status === "APPROVED"
        );
        setMembers(approved);
      }

      if (quartersRes.ok) {
        const qData = (await quartersRes.json()) as { quarters?: QuarterOption[] };
        const qList = qData.quarters || [];
        setQuarters(qList);
        if (qList.length > 0) {
          const active = qList.find((q) => q.status === "ACTIVE") || qList[0];
          setSelectedQuarterId(active.id);
          setFormData((prev) => ({ ...prev, quarterId: active.id }));
        }
      }
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل البيانات المرجعية" });
    }
  };

  // Fetch adjustments
  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/adjustments", window.location.origin);
      if (selectedQuarterId) url.searchParams.set("quarterId", selectedQuarterId);
      if (typeFilter !== "ALL") url.searchParams.set("type", typeFilter);
      if (searchQuery) url.searchParams.set("q", searchQuery);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        adjustments?: AdjustmentItem[];
        stats?: { totalCount: number; totalPositivePoints: number; totalNegativePoints: number };
      };
      setAdjustments(data.adjustments || []);
      setStats(data.stats || { totalCount: 0, totalPositivePoints: 0, totalNegativePoints: 0 });
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل سجل التعديلات اليدوية" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [selectedQuarterId, typeFilter, searchQuery]);

  const handleOpenModal = () => {
    const defaultQuarterId = selectedQuarterId || (quarters[0]?.id ?? "");
    setFormData({
      recipientId: members[0]?.id || "",
      quarterId: defaultQuarterId,
      rehearsalId: "",
      type: "MANUAL_BONUS",
      delta: 10,
      reason: "",
    });
    setIsModalOpen(true);
  };

  const handleFormTypeChange = (newType: "MANUAL_BONUS" | "MANUAL_DEDUCTION" | "ADJUSTMENT") => {
    let nextDelta = formData.delta;
    if (newType === "MANUAL_BONUS" && nextDelta < 0) {
      nextDelta = Math.abs(nextDelta) || 10;
    } else if (newType === "MANUAL_DEDUCTION" && nextDelta > 0) {
      nextDelta = -Math.abs(nextDelta) || -5;
    }
    setFormData({ ...formData, type: newType, delta: nextDelta });
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientId || !formData.quarterId) {
      setFeedback({ type: "error", text: "يرجى تحديد المرنم والربع السنوي" });
      return;
    }

    if (formData.type === "MANUAL_BONUS" && formData.delta <= 0) {
      setFeedback({ type: "error", text: "المكافأة اليدوية يجب أن تكون قيمة موجبة أكبر من صفر" });
      return;
    }

    if (formData.type === "MANUAL_DEDUCTION" && formData.delta >= 0) {
      setFeedback({ type: "error", text: "الخصم اليدوي يجب أن يكون قيمة سالبة أقل من صفر" });
      return;
    }

    if (formData.reason.trim().length < 3) {
      setFeedback({ type: "error", text: "يرجى كتابة سبب التعديل بوضوح لغايات التدقيق الإداري" });
      return;
    }

    try {
      setActionLoading("save");
      const res = await fetch("/api/admin/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: formData.recipientId,
          quarterId: formData.quarterId,
          rehearsalId: formData.rehearsalId || null,
          delta: Number(formData.delta),
          type: formData.type,
          reason: formData.reason.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", text: data.message || "تم تسجيل التعديل بنجاح" });
      setIsModalOpen(false);
      fetchAdjustments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل التعديل اليدوي";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const selectedQuarterObj = quarters.find((q) => q.id === selectedQuarterId);
  const isSelectedClosed = selectedQuarterObj?.status === "CLOSED";

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col font-sans">
      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* Banner with Metrics */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-5 sm:p-7 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>إدارة التعديلات والاستثناءات — Phase 6</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                سجل التعديلات اليدوية ومكافآت الخدمة
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                تسجيل مكافآت التميز في الألحان، تسوية الأعذار الشفهية، وتصحيح أعطال الـ GPS مع توثيق رقابي إلزامي كامل.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 text-center border border-white/10">
                <span className="text-[10px] text-white/70 block">إجمالي التعديلات</span>
                <span className="text-lg sm:text-xl font-black text-white font-mono">
                  {stats.totalCount}
                </span>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 backdrop-blur-md p-3 text-center border border-emerald-400/30">
                <span className="text-[10px] text-emerald-200 block">نقاط المكافآت (+)</span>
                <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
                  +{stats.totalPositivePoints}
                </span>
              </div>
              <div className="rounded-2xl bg-rose-500/20 backdrop-blur-md p-3 text-center border border-rose-400/30">
                <span className="text-[10px] text-rose-200 block">نقاط الخصومات (-)</span>
                <span className="text-lg sm:text-xl font-black text-rose-300 font-mono">
                  -{stats.totalNegativePoints}
                </span>
              </div>
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

        {/* Filter and Action Toolbar */}
        <div className="bg-white rounded-3xl p-4 border border-surface-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Quarter Filter */}
            <div className="flex items-center gap-1.5 bg-surface-canvas rounded-2xl px-3 py-1.5 border border-surface-border">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <select
                value={selectedQuarterId}
                onChange={(e) => setSelectedQuarterId(e.target.value)}
                className="bg-transparent text-xs font-bold text-charcoal focus:outline-none"
              >
                {quarters.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.status === "ACTIVE" ? "🟢 نشط" : q.status === "CLOSED" ? "🔒 مغلق" : "🟡"})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-surface-canvas rounded-2xl px-3 py-1.5 border border-surface-border">
              <Filter className="w-3.5 h-3.5 text-burgundy" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
              >
                <option value="ALL">جميع أنواع التعديلات</option>
                <option value="MANUAL_BONUS">مكافأة يدوية (+)</option>
                <option value="MANUAL_DEDUCTION">خصم يدوي (-)</option>
                <option value="ADJUSTMENT">تسوية استثنائية (±)</option>
              </select>
            </div>

            {/* Text Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث باسم المرنم، الهاتف، أو سبب التعديل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 rounded-2xl bg-surface-canvas border border-surface-border text-xs focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAdjustments}
              disabled={loading}
              className="p-2 rounded-2xl text-charcoal-muted hover:text-charcoal hover:bg-gray-100 transition-colors"
              title="تحديث القائمة"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {!isSelectedClosed && (
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>إضافة تعديل يدوي</span>
              </button>
            )}
          </div>
        </div>

        {/* Adjustments Ledger */}
        {loading ? (
          <div className="p-12 text-center text-charcoal-muted text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
            <span>جاري تحميل سجل التعديلات...</span>
          </div>
        ) : adjustments.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-surface-border text-center space-y-3">
            <Award className="w-8 h-8 text-gold mx-auto" />
            <h4 className="font-bold text-sm text-charcoal">لا توجد تعديلات يدوية مسجلة في هذا الربع</h4>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              تستخدم شاشة التعديلات اليدوية لمنح مكافآت الخدمة، أو تسجيل الأعذار الشفهية التي لم تقدم عبر التطبيق، أو حل استثناءات الـ GPS.
            </p>
            {!isSelectedClosed && (
              <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>إضافة أول تعديل يدوي</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-canvas border-b border-surface-border text-charcoal-muted font-bold">
                    <th className="py-3 px-4">المرنم</th>
                    <th className="py-3 px-3">نوع التعديل</th>
                    <th className="py-3 px-3 text-center">النقاط</th>
                    <th className="py-3 px-4">السبب والتوثيق</th>
                    <th className="py-3 px-3">البروفة المرتبطة</th>
                    <th className="py-3 px-3">المشرف المسجل</th>
                    <th className="py-3 px-4 text-left">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {adjustments.map((tx) => {
                    const isPositive = tx.pointsDelta > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-gold-50/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal">{tx.recipientName}</div>
                          <div className="text-[10px] text-charcoal-muted font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{tx.recipientPhone}</span>
                            <span>•</span>
                            <span className="font-sans px-1.5 py-0.2 rounded bg-surface-canvas border border-surface-border text-burgundy font-semibold">
                              {tx.recipientVoicePart}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              tx.transactionType === "MANUAL_BONUS"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : tx.transactionType === "MANUAL_DEDUCTION"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-purple-50 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {tx.transactionType === "MANUAL_BONUS"
                              ? "مكافأة يدوية"
                              : tx.transactionType === "MANUAL_DEDUCTION"
                              ? "خصم يدوي"
                              : "تسوية استثنائية"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black font-mono ${
                              isPositive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isPositive ? `+${tx.pointsDelta}` : tx.pointsDelta}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-xs text-charcoal font-medium leading-relaxed">
                            {tx.reason}
                          </p>
                        </td>

                        <td className="py-3 px-3 text-charcoal-muted">
                          {tx.rehearsalTitle ? (
                            <div>
                              <span className="font-semibold text-charcoal block">
                                {tx.rehearsalTitle}
                              </span>
                              <span className="text-[10px] block">{tx.rehearsalDate}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">— عامة —</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-charcoal-muted">
                          <span className="font-semibold text-charcoal block">
                            {tx.actorName}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-left font-mono text-[11px] text-charcoal-muted" dir="ltr">
                          {new Date(tx.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* New Manual Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                <Award className="w-4 h-4 text-gold" />
                <span>إضافة تعديل نقاط يدوي جديد</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs sm:text-sm">
              {/* Member Picker */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  المرنم المستفيد:
                </label>
                <select
                  required
                  value={formData.recipientId}
                  onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                  className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                >
                  <option value="">-- اختر المرنم --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.phone}) — {m.voicePart}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quarter & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    الربع السنوي:
                  </label>
                  <select
                    required
                    value={formData.quarterId}
                    onChange={(e) => setFormData({ ...formData, quarterId: e.target.value })}
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                  >
                    {quarters.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    نوع التعديل:
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      handleFormTypeChange(
                        e.target.value as "MANUAL_BONUS" | "MANUAL_DEDUCTION" | "ADJUSTMENT"
                      )
                    }
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                  >
                    <option value="MANUAL_BONUS">مكافأة يدوية (+)</option>
                    <option value="MANUAL_DEDUCTION">خصم يدوي (-)</option>
                    <option value="ADJUSTMENT">تسوية استثنائية (±)</option>
                  </select>
                </div>
              </div>

              {/* Points Delta Input */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  قيمة النقاط (Delta):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={formData.delta}
                    onChange={(e) => setFormData({ ...formData, delta: Number(e.target.value) })}
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <span
                    className={`text-xs font-bold px-3 py-2 rounded-xl shrink-0 ${
                      formData.delta > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : formData.delta < 0
                        ? "bg-rose-50 text-rose-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {formData.delta > 0 ? `+${formData.delta}` : formData.delta} نقطة
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  سبب التعديل والتوثيق (إلزامي للرقابة والتدقيق):
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="مثال: عذر شفهي معتمد من خادم الكورال لظروف سفر طارئة، أو مكافأة حفظ ألحان أسبوع الآلام..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-surface-border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-gold resize-none"
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
                  <span>تسجيل التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
