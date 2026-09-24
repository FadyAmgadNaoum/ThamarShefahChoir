"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  FileText,
  Award,
  Coins,
  Music,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface FeatureGridAppleProps {
  isArabic: boolean;
  onOpenExcuseModal?: () => void;
}

export default function FeatureGridApple({ isArabic, onOpenExcuseModal }: FeatureGridAppleProps) {
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const features = [
    {
      id: "gps",
      icon: MapPin,
      titleAr: "حضور ذكي بالـ GPS معتمد بالخادم",
      titleEn: "Server-Authoritative GPS Attendance",
      descAr: "قيد جغرافي صارم 100م حول الكنيسة وتصنيف لحظي للوصول: في الميعاد (أخضر)، تأخير (أصفر)، أو غياب (أحمر).",
      descEn: "100m geofence evaluation via Haversine formula with automated color tiers: Present, Late, or Extreme Late.",
      href: "/attendance",
      tagAr: "مرحلة 4 • مكتملة",
      tagEn: "Phase 4 • Live",
      color: "#640810",
    },
    {
      id: "excuses",
      icon: FileText,
      titleAr: "نظام إدارة الأعذار والاستئذان مع توجيه المشرف",
      titleEn: "Smart Excuse Subsystem & Admin Guidance",
      descAr: "تقديم أعذار الغياب أو التأخير المسبق، وصندوق مراجعة المشرفين مع إمكانية كتابة تعليقات ومزامنة العلامة الزرقاء 🔵.",
      descEn: "Advance delay & absence requests with admin inbox, bespoke guidance notes, and blue indicator auto-sync.",
      href: "/excuses",
      tagAr: "مرحلة 5 • مكتملة",
      tagEn: "Phase 5 • Live",
      color: "#DCA40C",
    },
    {
      id: "scheduling",
      icon: Calendar,
      titleAr: "جدولة البروفات وخريطة كنائس سوهاج",
      titleEn: "Rehearsal Scheduler & Sohag Diocese Map",
      descAr: "مواعيد واضحة بتنسيق 12 ساعة (صباحاً/مساءً)، وخريطة تفاعلية لكنائس وأديرة إيبارشية سوهاج مع إمكانية تعديل البروفات.",
      descEn: "Friendly 12-hour AM/PM scheduler, interactive Sohag diocese church picker, and editing workflows.",
      href: "/admin/rehearsals",
      tagAr: "مرحلة 3 • مكتملة",
      tagEn: "Phase 3 • Live",
      color: "#4A070D",
    },
    {
      id: "points",
      icon: Award,
      titleAr: "محرك النقاط التراكمي الشفاف",
      titleEn: "Quarterly Point Engine & Ledger",
      descAr: "حساب النقاط تلقائياً بناءً على الحضور والالتزام الفعلي لكل ربع سنوي، مع دفتر حركات محاسبي لا يقبل التعديل العشوائي.",
      descEn: "Quarterly occurrence-based point rules with immutable transaction ledger and authorized manual adjustments.",
      href: "/attendance",
      tagAr: "مرحلة 6 • قيد التطوير",
      tagEn: "Phase 6 • Next",
      color: "#B88008",
    },
    {
      id: "finance",
      icon: Coins,
      titleAr: "إدارة الاشتراكات الشهرية بنظام FIFO",
      titleEn: "Subscription Dues & FIFO Debt Allocation",
      descAr: "تسجيل اشتراكات الخدمة المتدرجة (طلبة/عاملين)، وتخصيص الدفعات تلقائياً لتسديد الشهر الأقدم أولاً مع سندات إلكترونية.",
      descEn: "Tiered dues by member classification with deterministic FIFO debt clearing and transparent statement balance.",
      href: "/login",
      tagAr: "مرحلة 7 • مجدولة",
      tagEn: "Phase 7 • Upcoming",
      color: "#640810",
    },
    {
      id: "songs",
      icon: Music,
      titleAr: "بنك الترانيم والمكتبة الصوتية R2",
      titleEn: "Sacred Hymn Vault & Audio Cloud",
      descAr: "مكتبة رقمية شاملة لتسجيلات البروفات والنوت الموسيقية موزعة حسب طبقات الصوت الأربعة مع تشغيل مباشر عبر السحابة.",
      descEn: "Choral recordings repository and PDF sheet music on Cloudflare R2 with 4-stem audio playback.",
      href: "/attendance",
      tagAr: "مرحلة 8 • مجدولة",
      tagEn: "Phase 8 • Upcoming",
      color: "#DCA40C",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-gold-100 text-burgundy border border-gold-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{isArabic ? "ركائز الخدمة الأساسية" : "Core Capabilities"}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal tracking-tight"
          >
            <span className="apple-headline block">
              {isArabic ? "كل ما يحتاجه الكورال في منظومة واحدة." : "Everything the Choir Needs. Unified."}
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
              ? "تصميم بديهي فائق البساطة يخفي خلفه محركات حسابية معقدة لضمان الشفافية والانضباط."
              : "Intuitive minimalism on the surface, backed by rigorous server-authoritative integrity underneath."}
          </motion.p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group relative rounded-3xl bg-white/85 backdrop-blur-xl border border-surface-border p-6 sm:p-7 shadow-xs hover:shadow-card-hover hover:border-gold/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      style={{ backgroundColor: `${feat.color}15`, color: feat.color }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300"
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-canvas border border-surface-border text-charcoal-muted">
                      {isArabic ? feat.tagAr : feat.tagEn}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-charcoal group-hover:text-burgundy transition-colors leading-snug">
                    {isArabic ? feat.titleAr : feat.titleEn}
                  </h3>

                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {isArabic ? feat.descAr : feat.descEn}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-surface-border/50">
                  <Link
                    href={feat.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy group-hover:text-gold transition-colors"
                  >
                    <span>{isArabic ? "فتح الواجهة" : "Explore"}</span>
                    <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

