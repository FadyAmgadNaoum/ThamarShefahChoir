"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface RoadmapAppleProps {
  isArabic: boolean;
}

interface PhaseInfo {
  number: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
}

const PHASES: PhaseInfo[] = [
  {
    number: 1,
    titleAr: "البنية التحتية والهوية القبطية",
    titleEn: "Foundation & Sacred Identity",
    descAr: "قاعدة بيانات Cloudflare D1، استخراج ألوان اللوجو الأصلية، ونظام التصميم.",
    descEn: "Cloudflare D1 SQLite, official brand colors extraction, and design system.",
    status: "COMPLETED",
  },
  {
    number: 2,
    titleAr: "التوثيق الأمني ودورة حياة العضو",
    titleEn: "Security & Member Lifecycle",
    descAr: "تشفير PBKDF2، جلسات HMAC-SHA256، نظام اعتماد الأعضاء، وتوزيع طبقات الصوت.",
    descEn: "Edge-safe PBKDF2 hashing, HMAC sessions, member approvals, and vocal parts.",
    status: "COMPLETED",
  },
  {
    number: 3,
    titleAr: "جدولة البروفات والدورات التشغيلية",
    titleEn: "Rehearsal Scheduling & Quarters",
    descAr: "جدولة البروفات، مواعيد 12 ساعة، فترات الربع السنوي، ونطاق كنائس سوهاج.",
    descEn: "Rehearsal scheduler, 12-hour format, operational quarters, and Sohag diocese registry.",
    status: "COMPLETED",
  },
  {
    number: 4,
    titleAr: "محرك حضور GPS الصارم بالخادم",
    titleEn: "Server-Authoritative GPS Attendance",
    descAr: "معادلة Haversine، قيد 100م كنسي، تصنيف التوقيت (أخضر، أصفر، أحمر)، وتقويم البروفات.",
    descEn: "Haversine geodesic geofence, arrival tiers (Present, Late, Extreme Late), and calendar.",
    status: "COMPLETED",
  },
  {
    number: 5,
    titleAr: "نظام إدارة الأعذار والاستئذان",
    titleEn: "Excuse Management Subsystem",
    descAr: "نافذة الأعذار (تأخير أو غياب)، صندوق وارد المشرف مع التعليقات، ومزامنة العلامة الزرقاء 🔵.",
    descEn: "Delay/absence modal, admin inbox with comments, and automatic blue indicator sync.",
    status: "COMPLETED",
  },
  {
    number: 6,
    titleAr: "محرك قواعد النقاط والتعديلات اليدوية",
    titleEn: "Points Rule Engine & Manual Overrides",
    descAr: "حساب النقاط تلقائياً لكل دورة تشغيلية، والتعديلات اليدوية الموثقة للمشرفين.",
    descEn: "Configurable quarter rules, point transactions ledger, and manual audit overrides.",
    status: "CURRENT",
  },
  {
    number: 7,
    titleAr: "محرك الاشتراكات وتوزيع ديون FIFO",
    titleEn: "Subscriptions & FIFO Allocation",
    descAr: "توليد الاشتراكات الشهرية، تسديد الدين الأقدم أولاً، وسندات القبض المالية.",
    descEn: "Monthly membership dues, deterministic FIFO debt clearing, and cash receipts.",
    status: "UPCOMING",
  },
  {
    number: 8,
    titleAr: "بنك الترانيم والمكتبة الصوتية R2",
    titleEn: "Choir Audio Library (Cloudflare R2)",
    descAr: "تخزين الملفات الصوتية والنوت الموسيقية PDF، وروابط تنزيل واستماع آمنة ومؤقتة.",
    descEn: "Audio tracks and sheet music storage on Cloudflare R2 with streaming controls.",
    status: "UPCOMING",
  },
  {
    number: 9,
    titleAr: "التقارير التحليلية والتدقيق الجنائي",
    titleEn: "Reporting & Forensic Audit",
    descAr: "مؤشرات الحضور ونسب الالتزام ربع السنوية، وسجل الرقابة الإدارية الشامل.",
    descEn: "Quarter-over-quarter analytics, punctuality distributions, and super admin audit.",
    status: "UPCOMING",
  },
  {
    number: 10,
    titleAr: "الإطلاق الإنتاجي والتوثيق والتدريب",
    titleEn: "Production Launch & Commissioning",
    descAr: "ترحيل بيانات الإنتاج، ربط الدومين المخصص، وتدريب خدام الكورال ومسؤولي الترانيم.",
    descEn: "Production D1 migration, custom domain DNS, and servant onboarding.",
    status: "UPCOMING",
  },
];

export default function RoadmapApple({ isArabic }: RoadmapAppleProps) {
  const [selectedPhase, setSelectedPhase] = useState<number>(5);
  const activePhaseData = PHASES.find((p) => p.number === selectedPhase) || PHASES[4];

  return (
    <section id="roadmap" className="py-24 relative overflow-hidden bg-surface-canvas/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-gold-100 text-burgundy border border-gold-300"
          >
            <Layers className="w-3.5 h-3.5 text-gold" />
            <span>{isArabic ? "خارطة الطريق المؤسسية" : "Engineering Roadmap"}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal tracking-tight"
          >
            <span className="apple-headline block">
              {isArabic ? "10 مراحل للبناء المتقن." : "10 Phases of Unbroken Craft."}
            </span>
            <span className="gold-gradient-text block mt-1">
              {isArabic ? "من التأسيس حتى الإطلاق الكنسي." : "From Inception to Production Release."}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-charcoal-muted max-w-xl mx-auto leading-relaxed"
          >
            {isArabic
              ? "خطة تنفيذ معمارية صارمة ترتقي بمنظومة الخدمة مرحلة تلو الأخرى باختبارات آلية كاملة."
              : "Rigorous sequential milestone execution with 100% automated integration verification."}
          </motion.p>
        </div>

        {/* Apple Milestone Pills Bar */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {PHASES.map((p) => {
            const isSelected = p.number === selectedPhase;
            const isCompleted = p.status === "COMPLETED";
            const isCurrent = p.status === "CURRENT";

            return (
              <button
                key={p.number}
                type="button"
                onClick={() => setSelectedPhase(p.number)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 border select-none ${
                  isSelected
                    ? "bg-burgundy text-white border-burgundy shadow-burgundy scale-105"
                    : isCompleted
                    ? "bg-white text-charcoal border-emerald-300 hover:border-emerald-500 shadow-2xs"
                    : isCurrent
                    ? "bg-amber-50 text-amber-900 border-amber-300 animate-pulse-slow"
                    : "bg-white/80 text-charcoal-muted border-surface-border hover:border-gold/60"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-gold" : "text-emerald-600"}`} />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                ) : (
                  <span className="text-[11px] font-mono opacity-60">#{p.number}</span>
                )}
                <span>
                  {isArabic ? `مرحلة ${p.number}` : `Phase ${p.number}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Phase Detail Showcase Card */}
        <motion.div
          key={activePhaseData.number}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto rounded-3xl bg-white/90 backdrop-blur-2xl border border-surface-border p-6 sm:p-8 shadow-card space-y-4 text-start"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-mono font-extrabold bg-surface-canvas border border-surface-border text-burgundy">
                  PHASE {activePhaseData.number} / 10
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    activePhaseData.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : activePhaseData.status === "CURRENT"
                      ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                      : "bg-surface-canvas text-charcoal-muted border border-surface-border"
                  }`}
                >
                  {activePhaseData.status === "COMPLETED"
                    ? isArabic
                      ? "مكتملة ومؤكدة بنسبة 100% ✓"
                      : "Completed & Verified 100% ✓"
                    : activePhaseData.status === "CURRENT"
                    ? isArabic
                      ? "المرحلة الحالية القادمة ⏳"
                      : "In Active Development ⏳"
                    : isArabic
                    ? "مرحلة قادمة"
                    : "Scheduled"}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-charcoal mt-2">
                {isArabic ? activePhaseData.titleAr : activePhaseData.titleEn}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            {isArabic ? activePhaseData.descAr : activePhaseData.descEn}
          </p>
        </motion.div>

        {/* Apple Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto text-center">
          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-surface-border shadow-xs">
            <span className="font-display font-extrabold text-3xl sm:text-4xl gold-gradient-text block">
              24+
            </span>
            <span className="text-xs text-charcoal font-bold mt-1 block">
              {isArabic ? "عاماً من التسبيح" : "Years of Ministry"}
            </span>
            <span className="text-[10px] text-charcoal-muted block">
              {isArabic ? "منذ عام 2000 بسوهاج" : "Since 2000 in Sohag"}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-surface-border shadow-xs">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-burgundy block">
              4
            </span>
            <span className="text-xs text-charcoal font-bold mt-1 block">
              {isArabic ? "طبقات صوتية" : "Vocal Stem Parts"}
            </span>
            <span className="text-[10px] text-charcoal-muted block">
              {isArabic ? "سوبرانو، ألتو، تينور، باص" : "Soprano, Alto, Tenor, Bass"}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-surface-border shadow-xs">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-emerald-700 block">
              100%
            </span>
            <span className="text-xs text-charcoal font-bold mt-1 block">
              {isArabic ? "دقة إثبات الحضور" : "Server Authority"}
            </span>
            <span className="text-[10px] text-charcoal-muted block">
              {isArabic ? "قيد GPS 100م مانع للتزييف" : "100m Geofence Anti-Spoof"}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-surface-border shadow-xs">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-charcoal block">
              0 EGP
            </span>
            <span className="text-xs text-charcoal font-bold mt-1 block">
              {isArabic ? "تكلفة استضافة شهرية" : "Monthly Cloud Cost"}
            </span>
            <span className="text-[10px] text-charcoal-muted block">
              {isArabic ? "مجاني 100% على Cloudflare" : "100% Free on Cloudflare"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

