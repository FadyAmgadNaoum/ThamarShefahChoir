"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Home,
  RefreshCw,
  AlertCircle,
  X,
  ShieldCheck,
  Check,
  Layers,
  ChevronDown,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatMonthYearAr, PAYMENT_METHOD_LABELS } from "@/lib/subscriptions/service";

interface RosterMember {
  userId: string;
  fullName: string;
  phone: string;
  voicePart: string | null;
  tier: string | null;
  totalBilled: number;
  totalPaid: number;
  outstandingDebt: number;
  hasOutstandingDebt: boolean;
  isFullyPaid: boolean;
  noChargesYet: boolean;
  lastPaymentDate: string | null;
  chargesCount: number;
  paymentsCount: number;
}

interface FinancialStats {
  totalMembers: number;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRatePercent: number;
}

interface MemberStatementData {
  userId: string;
  fullName: string;
  phone: string;
  voicePart: string | null;
  tier: string | null;
  totalBilled: number;
  totalPaid: number;
  totalWaived: number;
  outstandingDebt: number;
  overpaymentCredit: number;
  charges: {
    id: string;
    monthYear: string;
    amountDue: number;
    amountPaid: number;
    remainingDue: number;
    isWaived: boolean;
    waivedReason: string | null;
    status: "PAID" | "PARTIAL" | "UNPAID" | "WAIVED";
    createdAt: string;
  }[];
  payments: {
    id: string;
    chargeId: string | null;
    amountPaid: number;
    paymentMethod: string;
    paymentDate: string;
    notes: string | null;
    recordedBy: string;
    recordedByName: string;
    createdAt: string;
  }[];
}

export default function FinanceDashboardPage() {
  const router = useRouter();
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalMembers: 0,
    totalBilled: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    collectionRatePercent: 100,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL, DEBT, PAID_UP, NO_CHARGES
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [voicePartFilter, setVoicePartFilter] = useState<string>("ALL");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<RosterMember | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 100,
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
    allocationMode: "FIFO" as "FIFO" | "EXPLICIT",
    explicitChargeId: "",
  });

  // Generate Charges Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    monthYear: new Date().toISOString().substring(0, 7), // e.g. "2026-10"
    rateStudent: 50,
    rateWorking: 100,
    rateOther: 75,
  });

  // Member Statement Drawer State
  const [isStatementDrawerOpen, setIsStatementDrawerOpen] = useState(false);
  const [statementData, setStatementData] = useState<MemberStatementData | null>(null);
  const [loadingStatement, setLoadingStatement] = useState(false);

  // Waive Modal inside statement
  const [waiveModalCharge, setWaiveModalCharge] = useState<{ id: string; monthYear: string; amount: number } | null>(null);
  const [waiveReason, setWaiveReason] = useState("");

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/subscriptions/roster", window.location.origin);
      if (searchQuery) url.searchParams.set("q", searchQuery);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (tierFilter !== "ALL") url.searchParams.set("tier", tierFilter);
      if (voicePartFilter !== "ALL") url.searchParams.set("voicePart", voicePartFilter);

      const res = await fetch(url.toString());
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error();
      }

      const data = (await res.json()) as {
        roster?: RosterMember[];
        stats?: FinancialStats;
      };
      setRoster(data.roster || []);
      if (data.stats) setStats(data.stats);
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل كشف الاشتراكات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [searchQuery, statusFilter, tierFilter, voicePartFilter]);

  // Open Payment Modal for a Member
  const handleOpenPaymentModal = async (member: RosterMember) => {
    setSelectedMember(member);
    setPaymentForm({
      amount: member.outstandingDebt > 0 ? member.outstandingDebt : 100,
      paymentMethod: "CASH",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
      allocationMode: "FIFO",
      explicitChargeId: "",
    });
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (paymentForm.amount <= 0) {
      setFeedback({ type: "error", text: "قيمة الدفعة يجب أن تكون أكبر من صفر" });
      return;
    }

    try {
      setActionLoading("pay");
      const res = await fetch("/api/admin/subscriptions/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedMember.userId,
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          paymentDate: paymentForm.paymentDate,
          notes: paymentForm.notes.trim() || null,
          explicitChargeId:
            paymentForm.allocationMode === "EXPLICIT" ? paymentForm.explicitChargeId || null : null,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", text: data.message || "تم تسجيل السداد بنجاح" });
      setIsPaymentModalOpen(false);
      fetchRoster();
      if (isStatementDrawerOpen && statementData?.userId === selectedMember.userId) {
        handleOpenStatement(selectedMember.userId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدفعة";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Generate Charges
  const handleSubmitGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading("generate");
      const res = await fetch("/api/admin/subscriptions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthYear: generateForm.monthYear,
          rates: {
            STUDENT: Number(generateForm.rateStudent),
            WORKING: Number(generateForm.rateWorking),
            OTHER: Number(generateForm.rateOther),
          },
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", text: data.message || "تم إصدار المطالبات بنجاح" });
      setIsGenerateModalOpen(false);
      fetchRoster();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إصدار المطالبات";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  // Open Statement Drawer
  const handleOpenStatement = async (userId: string) => {
    try {
      setLoadingStatement(true);
      setIsStatementDrawerOpen(true);
      const res = await fetch(`/api/admin/subscriptions/member/${userId}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { statement?: MemberStatementData };
      setStatementData(data.statement || null);
    } catch {
      setFeedback({ type: "error", text: "فشل استرجاع كشف الحساب" });
    } finally {
      setLoadingStatement(false);
    }
  };

  // Submit Waive Charge
  const handleSubmitWaive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiveModalCharge) return;

    if (waiveReason.trim().length < 3) {
      setFeedback({ type: "error", text: "سبب الإعفاء إلزامي للرقابة والتدقيق (3 أحرف على الأقل)" });
      return;
    }

    try {
      setActionLoading("waive");
      const res = await fetch("/api/admin/subscriptions/waive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargeId: waiveModalCharge.id,
          reason: waiveReason.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", text: data.message || "تم إعفاء المطالبة بنجاح" });
      setWaiveModalCharge(null);
      setWaiveReason("");
      if (statementData) {
        handleOpenStatement(statementData.userId);
      }
      fetchRoster();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إعفاء المطالبة";
      setFeedback({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col font-sans">
      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* KPI Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-5 sm:p-7 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-2">
                <Wallet className="w-3.5 h-3.5" />
                <span>إدارة الصندوق والاشتراكات — Phase 7</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                كشف تحصيل الاشتراكات وتسوية المديونيات (FIFO)
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                متابعة المطالبات الشهرية، التحصيل المباشر بنظام الأقدمية التلقائي، والاطلاع على رصيد ديون كل مرنم بدقة.
              </p>
            </div>

            {/* Quick KPI Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 text-center border border-white/10">
                <span className="text-[10px] text-white/70 block">إجمالي المطلوب</span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  {stats.totalBilled} ج
                </span>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 backdrop-blur-md p-3 text-center border border-emerald-400/30">
                <span className="text-[10px] text-emerald-200 block">المحصل الفعلي</span>
                <span className="text-base sm:text-lg font-black text-emerald-300 font-mono">
                  {stats.totalCollected} ج
                </span>
              </div>
              <div className="rounded-2xl bg-rose-500/20 backdrop-blur-md p-3 text-center border border-rose-400/30">
                <span className="text-[10px] text-rose-200 block">المديونيات المتأخرة</span>
                <span className="text-base sm:text-lg font-black text-rose-300 font-mono">
                  {stats.totalOutstanding} ج
                </span>
              </div>
              <div className="rounded-2xl bg-gold/20 backdrop-blur-md p-3 text-center border border-gold/40">
                <span className="text-[10px] text-gold block">نسبة التحصيل</span>
                <span className="text-base sm:text-lg font-black text-gold font-mono">
                  {stats.collectionRatePercent}%
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

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-3xl p-4 border border-surface-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-surface-canvas rounded-2xl px-3 py-1.5 border border-surface-border">
              <Filter className="w-3.5 h-3.5 text-burgundy" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-charcoal focus:outline-none"
              >
                <option value="ALL">جميع المرنمين</option>
                <option value="DEBT">عليهم مديونيات متأخرة 🔴</option>
                <option value="PAID_UP">مسددين بالكامل 🟢</option>
                <option value="NO_CHARGES">لم تصدر لهم مطالبات</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div className="flex items-center gap-1.5 bg-surface-canvas rounded-2xl px-3 py-1.5 border border-surface-border">
              <Users className="w-3.5 h-3.5 text-gold" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
              >
                <option value="ALL">جميع الفئات</option>
                <option value="STUDENT">طالب (50 ج)</option>
                <option value="WORKING">عامل / خريج (100 ج)</option>
                <option value="OTHER">أخرى (75 ج)</option>
              </select>
            </div>

            {/* Voice Part Filter */}
            <div className="flex items-center gap-1.5 bg-surface-canvas rounded-2xl px-3 py-1.5 border border-surface-border">
              <select
                value={voicePartFilter}
                onChange={(e) => setVoicePartFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
              >
                <option value="ALL">جميع الأصوات</option>
                <option value="SOPRANO">سوبرانو</option>
                <option value="ALTO">ألتو</option>
                <option value="TENOR">تينور</option>
                <option value="BASS">باص</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث باسم المرنم أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 rounded-2xl bg-surface-canvas border border-surface-border text-xs focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchRoster}
              disabled={loading}
              className="p-2 rounded-2xl text-charcoal-muted hover:text-charcoal hover:bg-gray-100 transition-colors"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>إصدار اشتراكات شهر</span>
            </button>
          </div>
        </div>

        {/* Members Collection Roster Table */}
        {loading ? (
          <div className="p-12 text-center text-charcoal-muted text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
            <span>جاري تحميل كشف الاشتراكات...</span>
          </div>
        ) : roster.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-surface-border text-center space-y-3">
            <CreditCard className="w-8 h-8 text-gold mx-auto" />
            <h4 className="font-bold text-sm text-charcoal">لا يوجد مرنمين يطابقون خيارات البحث الحالية</h4>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-canvas border-b border-surface-border text-charcoal-muted font-bold">
                    <th className="py-3 px-4">المرنم</th>
                    <th className="py-3 px-3">الفئة والصوت</th>
                    <th className="py-3 px-3 text-center">إجمالي المطلوب</th>
                    <th className="py-3 px-3 text-center">المسدد</th>
                    <th className="py-3 px-3 text-center">حالة المديونية</th>
                    <th className="py-3 px-3">آخر سداد</th>
                    <th className="py-3 px-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {roster.map((member) => (
                    <tr key={member.userId} className="hover:bg-gold-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-charcoal">{member.fullName}</div>
                        <div className="text-[10px] text-charcoal-muted font-mono mt-0.5">
                          {member.phone}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-canvas border border-surface-border text-charcoal">
                            {member.tier === "STUDENT"
                              ? "طالب"
                              : member.tier === "WORKING"
                              ? "خريج / عامل"
                              : "أخرى"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-burgundy/10 text-burgundy">
                            {member.voicePart || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-charcoal">
                        {member.totalBilled} ج
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                        {member.totalPaid} ج
                      </td>

                      <td className="py-3 px-3 text-center">
                        {member.hasOutstandingDebt ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                            متأخر: {member.outstandingDebt} ج
                          </span>
                        ) : member.isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مسدد بالكامل</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-charcoal-muted">لا توجد مطالبات</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-charcoal-muted text-[11px] font-mono">
                        {member.lastPaymentDate || "—"}
                      </td>

                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPaymentModal(member)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>سداد</span>
                          </button>

                          <button
                            onClick={() => handleOpenStatement(member.userId)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal bg-surface-canvas hover:bg-gray-200 border border-surface-border transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-gold" />
                            <span>كشف الحساب</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>تسجيل دفعة اشتراك جديدة</span>
                </h3>
                <span className="text-xs text-charcoal-muted mt-0.5 block">
                  المرنم: <strong>{selectedMember.fullName}</strong> ({selectedMember.phone})
                </span>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs sm:text-sm">
              {/* Outstanding Debt Info Pill */}
              <div className="p-3 rounded-2xl bg-surface-canvas border border-surface-border flex items-center justify-between">
                <span className="text-xs text-charcoal-muted font-bold">المديونية المتأخرة الحالية:</span>
                <span className="font-mono font-black text-rose-600 text-sm">
                  {selectedMember.outstandingDebt} ج
                </span>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  المبلغ المسدد (ج.م):
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">طريقة الدفع:</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                  >
                    <option value="CASH">نقدي (كاش)</option>
                    <option value="VODAFONE_CASH">فودافون كاش</option>
                    <option value="INSTAPAY">انستاباي (InstaPay)</option>
                    <option value="BANK_TRANSFER">تحويل بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">تاريخ السداد:</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              {/* Allocation Mode (FIFO vs Override) */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  نظام تخصيص السداد:
                </label>
                <div className="p-2.5 rounded-2xl bg-gold-50/50 border border-gold/40 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span className="font-bold text-burgundy">
                      تلقائي بنظام الأقدمية (FIFO - موصى به)
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted leading-relaxed">
                    يسدد تلقائياً أقدم الشهور المتأخرة أولاً بالترتيب، وإذا تبقت مبالغ إضافية تُحسب كرصيد مدفوع مقدماً.
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  ملاحظات أو رقم الإيصال (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: تم الاستلام في بروفة الجمعة، تحويل انستاباي..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-muted hover:text-charcoal hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "pay"}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {actionLoading === "pay" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>تأكيد السداد وحفظ الإيصال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Monthly Charges Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold" />
                <span>إصدار اشتراكات شهر جديد لجميع المرنمين</span>
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-gray-400 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGenerate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  الشهر المستهدف:
                </label>
                <input
                  type="month"
                  required
                  value={generateForm.monthYear}
                  onChange={(e) => setGenerateForm({ ...generateForm, monthYear: e.target.value })}
                  className="w-full border border-surface-border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <span className="text-[11px] text-charcoal-muted mt-1 block">
                  الشهر بالعربية: <strong>{formatMonthYearAr(generateForm.monthYear)}</strong>
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-surface-border">
                <label className="block text-xs font-bold text-charcoal">
                  تعريفة الاشتراك بحسب الفئة (ج.م):
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-charcoal-muted block mb-0.5">طالب:</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={generateForm.rateStudent}
                      onChange={(e) =>
                        setGenerateForm({ ...generateForm, rateStudent: Number(e.target.value) })
                      }
                      className="w-full border border-surface-border rounded-xl px-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-charcoal-muted block mb-0.5">خريج / عامل:</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={generateForm.rateWorking}
                      onChange={(e) =>
                        setGenerateForm({ ...generateForm, rateWorking: Number(e.target.value) })
                      }
                      className="w-full border border-surface-border rounded-xl px-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-charcoal-muted block mb-0.5">أخرى:</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={generateForm.rateOther}
                      onChange={(e) =>
                        setGenerateForm({ ...generateForm, rateOther: Number(e.target.value) })
                      }
                      className="w-full border border-surface-border rounded-xl px-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  سيتم توليد المطالبات لجميع المرنمين المعتمدين غير الصادر لهم مطالبة مسبقاً لهذا الشهر. المطالبات المكررة يتم تخطيها تلقائياً.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-muted hover:text-charcoal hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "generate"}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {actionLoading === "generate" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-gold" />
                  )}
                  <span>إصدار المطالبات الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Statement Drawer */}
      {isStatementDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white h-full max-w-xl w-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold" />
                    <span>كشف حساب الاشتراكات المفصل</span>
                  </h3>
                  {statementData && (
                    <span className="text-xs text-charcoal-muted mt-0.5 block">
                      المرنم: <strong>{statementData.fullName}</strong> ({statementData.phone})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsStatementDrawerOpen(false)}
                  className="text-gray-400 hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingStatement ? (
                <div className="p-12 text-center text-charcoal-muted text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
                  <span>جاري تحميل كشف الحساب...</span>
                </div>
              ) : statementData ? (
                <div className="space-y-5 py-4">
                  {/* Financial Balance Summary Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-burgundy to-burgundy-950 text-white p-4 shadow-md border border-gold/30">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-white/70 block">إجمالي المطلوب</span>
                        <span className="text-base font-bold font-mono">
                          {statementData.totalBilled} ج
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-300 block">المسدد</span>
                        <span className="text-base font-bold font-mono text-emerald-300">
                          {statementData.totalPaid} ج
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-300 block">المتبقي (المديونية)</span>
                        <span className="text-base font-bold font-mono text-rose-300">
                          {statementData.outstandingDebt} ج
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Charges Timeline */}
                  <div>
                    <h4 className="font-bold text-xs text-charcoal mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      <span>المطالبات الشهرية ({statementData.charges.length} شهور)</span>
                    </h4>

                    {statementData.charges.length === 0 ? (
                      <p className="text-xs text-charcoal-muted text-center py-4 bg-surface-canvas rounded-xl">
                        لم يتم إصدار مطالبات شهرية لهذا المرنم بعد.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {statementData.charges.map((charge) => (
                          <div
                            key={charge.id}
                            className="rounded-xl p-3 bg-surface-canvas border border-surface-border flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-charcoal">
                                  شهر {formatMonthYearAr(charge.monthYear)}
                                </span>
                                <span
                                  className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                    charge.status === "PAID"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : charge.status === "PARTIAL"
                                      ? "bg-amber-100 text-amber-800"
                                      : charge.status === "WAIVED"
                                      ? "bg-gray-200 text-gray-700"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {charge.status === "PAID"
                                    ? "مسدد بالكامل"
                                    : charge.status === "PARTIAL"
                                    ? `مسدد جزئياً (متبقي ${charge.remainingDue} ج)`
                                    : charge.status === "WAIVED"
                                    ? "معفى إدارياً"
                                    : "غير مسدد"}
                                </span>
                              </div>
                              <span className="text-[10px] text-charcoal-muted font-mono mt-0.5 block">
                                المطلوب: {charge.amountDue} ج • المسدد: {charge.amountPaid} ج
                              </span>
                              {charge.waivedReason && (
                                <span className="text-[10px] text-purple-700 block mt-0.5 font-medium">
                                  سبب الإعفاء: {charge.waivedReason}
                                </span>
                              )}
                            </div>

                            {/* Waive Button for Admin */}
                            {!charge.isWaived && charge.status !== "PAID" && (
                              <button
                                onClick={() =>
                                  setWaiveModalCharge({
                                    id: charge.id,
                                    monthYear: charge.monthYear,
                                    amount: charge.remainingDue,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                              >
                                إعفاء إداري
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Receipts History */}
                  <div>
                    <h4 className="font-bold text-xs text-charcoal mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>إيصالات السداد المسجلة ({statementData.payments.length} دفعات)</span>
                    </h4>

                    {statementData.payments.length === 0 ? (
                      <p className="text-xs text-charcoal-muted text-center py-4 bg-surface-canvas rounded-xl">
                        لا توجد دفعات مسجلة بعد.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {statementData.payments.map((pmt) => (
                          <div
                            key={pmt.id}
                            className="rounded-xl p-3 bg-white border border-surface-border flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-emerald-700 font-mono">
                                  +{pmt.amountPaid} ج
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-surface-canvas border border-surface-border text-charcoal">
                                  {PAYMENT_METHOD_LABELS[pmt.paymentMethod] || pmt.paymentMethod}
                                </span>
                              </div>
                              {pmt.notes && (
                                <p className="text-[11px] text-charcoal-muted mt-0.5">{pmt.notes}</p>
                              )}
                              <span className="text-[10px] text-charcoal-muted font-mono block mt-0.5">
                                📅 {pmt.paymentDate} • المستلم: {pmt.recordedByName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-end">
              <button
                onClick={() => setIsStatementDrawerOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-charcoal bg-surface-canvas hover:bg-gray-200 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {waiveModalCharge && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-surface-border space-y-3">
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <h4 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <span>إعفاء مطالبة اشتراك</span>
              </h4>
              <button
                onClick={() => setWaiveModalCharge(null)}
                className="text-gray-400 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted">
              هل أنت متأكد من إعفاء شهر (
              <strong>{formatMonthYearAr(waiveModalCharge.monthYear)}</strong>) بقيمة{" "}
              <strong>{waiveModalCharge.amount} ج</strong>؟
            </p>

            <form onSubmit={handleSubmitWaive} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  سبب الإعفاء الإداري (إلزامي للتدقيق):
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="مثال: ظروف خاصة، إعفاء بتوجيه أمين الخدمة..."
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  className="w-full border border-surface-border rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWaiveModalCharge(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "waive"}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading === "waive" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>تأكيد الإعفاء</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

