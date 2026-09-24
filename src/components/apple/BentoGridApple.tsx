"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Radio,
  FileText,
  Clock,
  CheckCircle2,
  Server,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Coins,
} from "lucide-react";
import SoundwaveVisualizer from "./SoundwaveVisualizer";

interface BentoGridAppleProps {
  isArabic: boolean;
  onOpenExcuseModal?: () => void;
}

export default function BentoGridApple({ isArabic, onOpenExcuseModal }: BentoGridAppleProps) {
  // Mini Excuse Interactive Tab
  const [excuseTypePreview, setExcuseTypePreview] = useState<"absence" | "delay">("delay");
  const [delayMinutesPreview, setDelayMinutesPreview] = useState(30);

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-burgundy-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-gold-100 text-burgundy border border-gold-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{isArabic ? "دقة وبراعة معمارية" : "Engineering Precision"}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal tracking-tight"
          >
            <span className="apple-headline block">
              {isArabic ? "منظومة مصممة لراحة الخدمة." : "Built for Sacred Order."}
            </span>
            <span className="gold-gradient-text block mt-1">
              {isArabic ? "بأعلى معايير الحداثة والاتزان." : "Crafted with Every Micro-Detail."}
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
              ? "مزيج فريد يجمع بين التناغم الصوتي الكنسي والأدوات الرقمية الصارمة لحفظ مواعيد البروفات والالتزام الروحي."
              : "A bespoke convergence of choral acoustical harmony and strict server-authoritative ministry tools."}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Card 1: 4 Vocal Stems Visualizer (Spans full 12 cols or 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 flex flex-col"
          >
            <SoundwaveVisualizer isArabic={isArabic} />
          </motion.div>

          {/* Card 2: Server-Authoritative GPS Radar (Spans 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-surface-border p-6 sm:p-7 shadow-card flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-burgundy/10 text-burgundy border border-burgundy/20">
                  {isArabic ? "رادار GPS وقيد جغرافي" : "GPS Geofence Radar"}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isArabic ? "دقة قاطعة 100م" : "Strict 100m Fence"}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal">
                {isArabic ? "مطرانية سوهاج — كنيسة مارجرجس" : "Sohag Diocese — St. George"}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {isArabic
                  ? "حساب المسافة بمعادلة Haversine الرياضية المباشرة من خادم Edge، مع منع أي محاولة لتزييف الموقع."
                  : "Server-side Haversine geodesic evaluation prevents spoofing and guarantees uncompromised attendance records."}
              </p>
            </div>

            {/* Radar Animation Graphic */}
            <div className="relative my-6 flex items-center justify-center h-48 w-full">
              {/* Concentric Sonar Rings */}
              <div className="absolute w-44 h-44 rounded-full border border-gold/30" />
              <div className="absolute w-32 h-32 rounded-full border border-gold/40" />
              <div className="absolute w-20 h-20 rounded-full border border-burgundy/30 animate-pulse-slow" />

              {/* Pulsing Sonar Ring */}
              <div className="absolute w-20 h-20 rounded-full bg-gold/15 animate-sonar-ping" />

              {/* Radar Rotating Beam */}
              <div className="absolute w-44 h-44 rounded-full overflow-hidden animate-radar-sweep pointer-events-none">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-gold/30 to-transparent origin-bottom-right" />
              </div>

              {/* Church Center Pin */}
              <div className="relative z-10 w-11 h-11 rounded-2xl bg-burgundy text-white flex items-center justify-center shadow-burgundy border-2 border-gold">
                <MapPin className="w-5 h-5 text-gold" />
              </div>

              {/* Member Simulated Ping */}
              <div className="absolute top-10 right-14 flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs border border-surface-border">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{isArabic ? "أنت هنا (24م)" : "You (24m)"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs text-charcoal-muted z-10">
              <span>{isArabic ? "الإحداثيات: 26.5565° N, 31.6958° E" : "26.5565° N, 31.6958° E"}</span>
              <span className="font-bold text-burgundy">{isArabic ? "سوهاج" : "Sohag"}</span>
            </div>
          </motion.div>

          {/* Card 3: Zero EGP Cloud Architecture (Spans 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-surface-border p-6 sm:p-7 shadow-card flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gold-100 text-burgundy border border-gold-300">
                  {isArabic ? "سحابة مجانية 100%" : "Zero Cloud Cost"}
                </span>
                <span className="text-[11px] font-extrabold text-charcoal bg-surface-canvas px-2.5 py-0.5 rounded-full border border-surface-border">
                  0 EGP
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal">
                {isArabic ? "بنية سحابية عالمية على Cloudflare Edge" : "Global Edge Infrastructure"}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {isArabic
                  ? "قاعدة بيانات D1 SQLite موزعة طرفياً وسعة تخزين R2 للترانيم والملفات الصوتية بلا أي اشتراكات مدفوعة."
                  : "Built on Cloudflare Workers D1 edge database and R2 object storage with zero recurring API costs."}
              </p>
            </div>

            <div className="my-6 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-surface-canvas border border-surface-border/60">
                <span className="font-display font-extrabold text-lg text-burgundy block">&lt; 1ms</span>
                <span className="text-[10px] text-charcoal-muted font-bold block">{isArabic ? "زمن استجابة D1" : "D1 Latency"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-canvas border border-surface-border/60">
                <span className="font-display font-extrabold text-lg text-gold block">100%</span>
                <span className="text-[10px] text-charcoal-muted font-bold block">{isArabic ? "تشفير PBKDF2" : "Web Crypto"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-canvas border border-surface-border/60">
                <span className="font-display font-extrabold text-lg text-emerald-700 block">10GB</span>
                <span className="text-[10px] text-charcoal-muted font-bold block">{isArabic ? "تخزين R2 حر" : "Free R2 Audio"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs text-charcoal-muted">
              <span>{isArabic ? "استجابة فائقة السرعة للأعضاء" : "Edge-Optimized Performance"}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </motion.div>

          {/* Card 4: Smart Excuse Subsystem Interactive Mini Simulator (Spans 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-surface-border p-6 sm:p-7 shadow-card flex flex-col justify-between"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  {isArabic ? "المرحلة 5: إدارة الأعذار" : "Phase 5: Excuse Subsystem"}
                </span>
                <h3 className="font-display font-bold text-lg text-charcoal mt-1">
                  {isArabic ? "نظام الأعذار الذكي والمزامنة التلقائية" : "Smart Excuse Pipeline"}
                </h3>
              </div>

              {/* Mini Pill Toggle */}
              <div className="flex p-1 rounded-xl bg-surface-canvas border border-surface-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setExcuseTypePreview("delay")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    excuseTypePreview === "delay"
                      ? "bg-amber-100 text-amber-900 font-extrabold shadow-2xs"
                      : "text-charcoal-muted"
                  }`}
                >
                  {isArabic ? "تأخير" : "Delay"}
                </button>
                <button
                  type="button"
                  onClick={() => setExcuseTypePreview("absence")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    excuseTypePreview === "absence"
                      ? "bg-rose-100 text-rose-900 font-extrabold shadow-2xs"
                      : "text-charcoal-muted"
                  }`}
                >
                  {isArabic ? "اعتذار غياب" : "Absence"}
                </button>
              </div>
            </div>

            {/* Interactive Preview Body */}
            <div className="bg-surface-canvas rounded-2xl p-4 border border-surface-border/70 space-y-3 my-2">
              {excuseTypePreview === "delay" ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-charcoal">
                    <span>{isArabic ? "مدة التأخير المتوقعة:" : "Expected Delay:"}</span>
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {delayMinutesPreview} {isArabic ? "دقيقة" : "mins"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDelayMinutesPreview(m)}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                          delayMinutesPreview === m
                            ? "bg-amber-600 text-white border-amber-700 shadow-2xs"
                            : "bg-white border-surface-border text-charcoal hover:border-gold"
                        }`}
                      >
                        {m}د
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    {isArabic
                      ? "📌 قاعدة الأسبقية: إشعار التأخير استئذاني، ويتم تقييم حالة الحضور بناءً على توقيت GPS الفعلي."
                      : "📌 Precedence Rule: Delay notices are informational; arrival tier strictly evaluated upon GPS fix."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-900 bg-blue-50 p-2.5 rounded-xl border border-blue-200 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>
                      {isArabic
                        ? "المزامنة التلقائية: عند قبول عذر الغياب يتحول السجل إلى 'غياب بعذر مقبول' (🔵 زرقاء)."
                        : "Auto-Sync: Approved absence turns calendar indicator automatically to Blue (🔵 EXCUSED_ABSENCE)."}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    {isArabic
                      ? "إمكانية إضافة تعليق وتوجيه من المشرف يظهر للعضو مباشرة."
                      : "Supports optional admin guidance comments visible directly on member cards."}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
              <span className="text-charcoal-muted font-medium">
                {isArabic ? "صندوق وارد كامل للمشرفين" : "Dedicated Admin Inbox (/admin/excuses)"}
              </span>
              <button
                type="button"
                onClick={onOpenExcuseModal}
                className="text-burgundy font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isArabic ? "تجربة تقديم عذر الآن" : "Try Submitting"}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

