"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  RefreshCw,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
} from "lucide-react";
import { formatMonthYearAr, PAYMENT_METHOD_LABELS } from "@/lib/subscriptions/service";

interface StatementData {
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

export default function MemberSubscriptionsPage() {
  const router = useRouter();
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CHARGES" | "RECEIPTS">("CHARGES");

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscriptions/my");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error();
      }
      const data = (await res.json()) as { statement?: StatementData };
      setStatement(data.statement || null);
    } catch {
      console.error("Failed to load subscription statement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, []);

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col font-sans">
      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold shadow-2xs">
            <CreditCard className="w-3.5 h-3.5 text-gold" />
            <span>كشف حساب الاشتراكات والمدفوعات</span>
          </div>

          <button
            onClick={fetchStatement}
            disabled={loading}
            className="p-2 rounded-xl text-charcoal-muted hover:text-burgundy bg-surface-card hover:bg-gold-50 transition-colors cursor-pointer border border-surface-border shadow-2xs flex items-center gap-1.5 text-xs font-bold"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-burgundy" : "text-gold"}`} />
            <span>تحديث</span>
          </button>
        </div>
        {/* Balance Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-6 sm:p-8 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حساب اشتراكات الكورال</span>
              </div>

              {statement && (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {statement.outstandingDebt}
                    </span>
                    <span className="text-sm font-bold text-gold">جنيه متبقي</span>
                  </div>

                  <p className="text-xs text-white/80 mt-2 max-w-sm leading-relaxed">
                    {statement.outstandingDebt === 0
                      ? "رائع! حسابك مسدد بالكامل ولا توجد أي مديونيات متأخرة."
                      : `عليك متأخرات بقيمة ${statement.outstandingDebt} ج، يرجى السداد لأمين الصندوق في أقرب بروفة.`}
                  </p>
                </div>
              )}
            </div>

            {/* Status Breakdown Box */}
            {statement && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center w-full sm:w-auto min-w-[200px] space-y-2">
                <div className="flex items-center justify-between text-xs gap-4">
                  <span className="text-white/70">إجمالي المطلوب:</span>
                  <span className="font-mono font-bold">{statement.totalBilled} ج</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-4">
                  <span className="text-emerald-300">المسدد بالفعل:</span>
                  <span className="font-mono font-bold text-emerald-300">{statement.totalPaid} ج</span>
                </div>
                {statement.overpaymentCredit > 0 && (
                  <div className="flex items-center justify-between text-xs gap-4 pt-1 border-t border-white/10">
                    <span className="text-gold font-bold">رصيد فائض:</span>
                    <span className="font-mono font-bold text-gold">+{statement.overpaymentCredit} ج</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1 border border-surface-border text-xs">
            <button
              onClick={() => setActiveTab("CHARGES")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === "CHARGES"
                  ? "bg-burgundy text-white shadow-sm"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              📅 الشهور والمطالبات
            </button>
            <button
              onClick={() => setActiveTab("RECEIPTS")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === "RECEIPTS"
                  ? "bg-burgundy text-white shadow-sm"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              🧾 إيصالات السداد ({statement?.payments.length || 0})
            </button>
          </div>
        </div>

        {/* Content based on Tab */}
        {loading ? (
          <div className="p-12 text-center text-charcoal-muted text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
            <span>جاري تحميل كشف الحساب...</span>
          </div>
        ) : !statement ? (
          <div className="p-10 rounded-3xl bg-white border border-surface-border text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-xs text-charcoal-muted">تعذر استرجاع كشف الحساب، يرجى المحاولة لاحقاً.</p>
          </div>
        ) : activeTab === "CHARGES" ? (
          <div className="space-y-3">
            {statement.charges.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-surface-border text-center">
                <CreditCard className="w-8 h-8 text-gold mx-auto mb-2" />
                <h4 className="font-bold text-sm text-charcoal">لا توجد مطالبات شهرية مسجلة بعد</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  سيتم إدراج اشتراكات الشهور تلقائياً عند قيام أمين الصندوق بإصدارها.
                </p>
              </div>
            ) : (
              statement.charges.map((charge) => (
                <div
                  key={charge.id}
                  className="rounded-2xl bg-white p-4 border border-surface-border shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        charge.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : charge.status === "PARTIAL"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : charge.status === "WAIVED"
                          ? "bg-gray-100 text-gray-700 border border-gray-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {charge.status === "PAID" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : charge.status === "PARTIAL" ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">
                          اشتراك شهر {formatMonthYearAr(charge.monthYear)}
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

                      <div className="text-[11px] text-charcoal-muted font-mono mt-1">
                        المطلوب: <strong>{charge.amountDue} ج</strong> • المسدد:{" "}
                        <strong className="text-emerald-700">{charge.amountPaid} ج</strong>
                      </div>

                      {charge.waivedReason && (
                        <span className="text-[10px] text-purple-700 block mt-0.5">
                          سبب الإعفاء: {charge.waivedReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-xs font-black font-mono ${
                        charge.remainingDue === 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {charge.remainingDue === 0 ? "0 ج متبقي" : `متبقي ${charge.remainingDue} ج`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {statement.payments.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-surface-border text-center">
                <FileText className="w-8 h-8 text-gold mx-auto mb-2" />
                <h4 className="font-bold text-sm text-charcoal">لا توجد إيصالات سداد مسجلة بعد</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  عند سداد أي اشتراك لأمين الصندوق سيظهر إيصال السداد هنا مباشرة.
                </p>
              </div>
            ) : (
              statement.payments.map((pmt) => (
                <div
                  key={pmt.id}
                  className="rounded-2xl bg-white p-4 border border-surface-border shadow-sm flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-emerald-700 font-mono">
                        +{pmt.amountPaid} ج
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-surface-canvas border border-surface-border text-charcoal">
                        {PAYMENT_METHOD_LABELS[pmt.paymentMethod] || pmt.paymentMethod}
                      </span>
                    </div>

                    {pmt.notes && (
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">{pmt.notes}</p>
                    )}

                    <div className="text-[10px] text-charcoal-muted font-mono mt-1 flex items-center gap-2">
                      <span>📅 {pmt.paymentDate}</span>
                      <span>•</span>
                      <span>المستلم: {pmt.recordedByName}</span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>معتمد</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

