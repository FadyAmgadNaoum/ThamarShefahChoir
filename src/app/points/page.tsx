"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface TransactionItem {
  id: string;
  quarterId: string;
  rehearsalId: string | null;
  pointsDelta: number;
  transactionType: "AUTOMATIC" | "MANUAL_BONUS" | "MANUAL_DEDUCTION" | "ADJUSTMENT";
  reason: string;
  createdBy: string | null;
  createdAt: string;
  rehearsalTitle: string | null;
  rehearsalDate: string | null;
  locationName: string | null;
}

interface QuarterItem {
  id: string;
  name: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED";
}

export default function MemberPointsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [automaticPoints, setAutomaticPoints] = useState<number>(0);
  const [manualBonusPoints, setManualBonusPoints] = useState<number>(0);
  const [manualDeductionPoints, setManualDeductionPoints] = useState<number>(0);
  const [tierBadge, setTierBadge] = useState<string>("جاري التحميل...");
  const [tierColor, setTierColor] = useState<string>("emerald");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [quarters, setQuarters] = useState<QuarterItem[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ATTENDANCE" | "MANUAL">("ALL");

  const fetchPoints = async (qId?: string) => {
    try {
      setLoading(true);
      const url = new URL("/api/points/my", window.location.origin);
      if (qId) url.searchParams.set("quarterId", qId);

      const res = await fetch(url.toString());
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error();
      }

      const data = (await res.json()) as {
        totalPoints?: number;
        automaticPoints?: number;
        manualBonusPoints?: number;
        manualDeductionPoints?: number;
        tierBadge?: string;
        tierColor?: string;
        transactions?: TransactionItem[];
        allQuarters?: QuarterItem[];
        quarter?: QuarterItem;
      };
      setTotalPoints(data.totalPoints || 0);
      setAutomaticPoints(data.automaticPoints || 0);
      setManualBonusPoints(data.manualBonusPoints || 0);
      setManualDeductionPoints(data.manualDeductionPoints || 0);
      setTierBadge(data.tierBadge || "ممتاز 🌟");
      setTierColor(data.tierColor || "emerald");
      setTransactions(data.transactions || []);
      setQuarters(data.allQuarters || []);

      if (!selectedQuarterId && data.quarter) {
        setSelectedQuarterId(data.quarter.id);
      }
    } catch (err) {
      console.error("Failed to load points:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleQuarterChange = (qId: string) => {
    setSelectedQuarterId(qId);
    fetchPoints(qId);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "ATTENDANCE") {
      return tx.transactionType === "AUTOMATIC";
    }
    if (activeTab === "MANUAL") {
      return tx.transactionType !== "AUTOMATIC";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal flex flex-col font-sans">
      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        {/* Quarter Selector & Refresh Strip */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-2.5 px-4 border border-surface-border shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-charcoal-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>عرض نقاط الربع:</span>
            </span>
            {quarters.length > 0 && (
              <select
                value={selectedQuarterId}
                onChange={(e) => handleQuarterChange(e.target.value)}
                className="bg-surface-canvas text-xs font-bold text-burgundy border border-surface-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
              >
                {quarters.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.status === "ACTIVE" ? "🟢 نشط" : q.status === "CLOSED" ? "🔒 مغلق" : "🟡"})
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={() => fetchPoints(selectedQuarterId)}
            disabled={loading}
            className="p-1.5 rounded-xl text-charcoal-muted hover:text-burgundy hover:bg-surface-canvas transition-colors cursor-pointer"
            title="تحديث النقاط"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-burgundy" : ""}`} />
          </button>
        </div>

        {/* Hero Card: Points Balance & Tier */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white p-6 sm:p-8 shadow-xl border border-gold/40">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>رصيدك التراكمي في الربع الحالي</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  {totalPoints}
                </span>
                <span className="text-sm font-bold text-gold">نقطة تميز</span>
              </div>
              <p className="text-xs text-white/80 mt-2 max-w-sm leading-relaxed">
                يتم احتساب النقاط تلقائياً بناءً على موعد الحضور بالـ GPS مع مكافآت الخدمة وتسويات الأعذار المعتمدة.
              </p>
            </div>

            {/* Classification Badge Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center w-full sm:w-auto min-w-[180px]">
              <span className="text-[11px] text-white/70 block mb-1 font-semibold">
                التصنيف المستحق
              </span>
              <div className="inline-block px-3 py-1.5 rounded-xl bg-gold/20 border border-gold/40 text-gold font-bold text-sm sm:text-base">
                {tierBadge}
              </div>
              <span className="text-[10px] text-white/60 block mt-2">
                {totalPoints >= 90
                  ? "أداء استثنائي ومثالي"
                  : totalPoints >= 75
                  ? "مواظبة ممتازة جداً"
                  : totalPoints >= 60
                  ? "مقبول مع الحاجة للالتزام"
                  : "يرجى مراجعة أمين الخدمة"}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-sm text-center">
            <span className="text-[11px] text-charcoal-muted block mb-1">
              نقاط الحضور الآلي
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-charcoal block">
              {automaticPoints > 0 ? `+${automaticPoints}` : automaticPoints}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">عبر الـ GPS التلقائي</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-sm text-center">
            <span className="text-[11px] text-charcoal-muted block mb-1">
              مكافآت وتسويات المشرفين
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 block">
              +{manualBonusPoints}
            </span>
            <span className="text-[10px] text-charcoal-muted block mt-0.5">تميز خدمة وألحان</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-surface-border shadow-sm text-center">
            <span className="text-[11px] text-charcoal-muted block mb-1">
              خصومات الغياب والتأخير
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-rose-600 block">
              -{manualDeductionPoints}
            </span>
            <span className="text-[10px] text-charcoal-muted block mt-0.5">بحسب قواعد التكرار</span>
          </div>
        </div>

        {/* Activity Ledger Header & Tabs */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              <span>كشف حركات النقاط بالتفصيل ({filteredTransactions.length} حركة)</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1 border border-surface-border text-xs">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  activeTab === "ALL"
                    ? "bg-burgundy text-white shadow-sm"
                    : "text-charcoal-muted hover:text-charcoal"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveTab("ATTENDANCE")}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  activeTab === "ATTENDANCE"
                    ? "bg-burgundy text-white shadow-sm"
                    : "text-charcoal-muted hover:text-charcoal"
                }`}
              >
                حضور البروفات
              </button>
              <button
                onClick={() => setActiveTab("MANUAL")}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  activeTab === "MANUAL"
                    ? "bg-burgundy text-white shadow-sm"
                    : "text-charcoal-muted hover:text-charcoal"
                }`}
              >
                المكافآت واليدوية
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="p-12 text-center text-charcoal-muted text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold mb-2" />
              <span>جاري تحميل كشف الحساب...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white border border-surface-border text-center space-y-2">
              <Award className="w-8 h-8 text-gold mx-auto" />
              <h4 className="font-bold text-sm text-charcoal">لا توجد حركات نقاط مسجلة في هذا التصنيف</h4>
              <p className="text-xs text-charcoal-muted">
                ستظهر هنا كل النقاط المحسوبة عند تسجيل حضورك في البروفات القادمة أو عند إضافة مكافآت الخدمة.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.pointsDelta > 0;
                const isZero = tx.pointsDelta === 0;

                return (
                  <div
                    key={tx.id}
                    className="rounded-2xl bg-white p-4 border border-surface-border shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isZero
                            ? "bg-gray-100 text-gray-700 border border-gray-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : isZero ? (
                          <Award className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-charcoal">
                            {tx.rehearsalTitle || "تعديل إداري عام"}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-surface-canvas border border-surface-border text-charcoal-muted">
                            {tx.transactionType === "AUTOMATIC"
                              ? "آلي عبر البروفة"
                              : tx.transactionType === "MANUAL_BONUS"
                              ? "مكافأة يدوية"
                              : tx.transactionType === "MANUAL_DEDUCTION"
                              ? "خصم يدوي"
                              : "تسوية"}
                          </span>
                        </div>

                        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                          {tx.reason}
                        </p>

                        <div className="text-[10px] text-charcoal-muted font-mono mt-1 flex items-center gap-2">
                          {tx.rehearsalDate && <span>📅 {tx.rehearsalDate}</span>}
                          {tx.locationName && <span>📍 {tx.locationName}</span>}
                          <span>
                            🕒{" "}
                            {new Date(tx.createdAt).toLocaleDateString("ar-EG", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-black font-mono ${
                          isPositive
                            ? "bg-emerald-100 text-emerald-800"
                            : isZero
                            ? "bg-gray-100 text-gray-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isPositive ? `+${tx.pointsDelta}` : tx.pointsDelta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
