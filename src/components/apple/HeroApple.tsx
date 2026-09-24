"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Radio,
  FileText,
  ShieldCheck,
  Music,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";

interface HeroAppleProps {
  isArabic: boolean;
  currentUser: {
    userId: string;
    fullName: string;
    roles: string[];
    voicePart?: string;
    status: string;
  } | null;
  activeRehearsal: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    locationName: string;
    windowStatus: string;
  } | null;
  onOpenExcuseModal: () => void;
}

export default function HeroApple({
  isArabic,
  currentUser,
  activeRehearsal,
  onOpenExcuseModal,
}: HeroAppleProps) {
  // 3D Card Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Live Simulated Check-in State
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTimestamp, setCheckInTimestamp] = useState<string>("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Dampened tilt values (-8 to 8 deg)
    setRotateX(-y / 20);
    setRotateY(x / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleSimulatedCheckIn = () => {
    if (isCheckedIn) {
      setIsCheckedIn(false);
      return;
    }
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckingIn(false);
      setIsCheckedIn(true);
      const now = new Date();
      setCheckInTimestamp(
        `${now.toLocaleDateString("ar-EG")} • ${now.toLocaleTimeString("ar-EG", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`
      );
    }, 1200);
  };

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden">
      {/* Apple Ambient Gradient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-burgundy-100/40 via-gold-200/30 to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold-100/40 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        {/* Sacred Heritage Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass shadow-xs border border-surface-border/80"
        >
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-xs font-bold text-burgundy tracking-wide">
            {isArabic
              ? "ذبيحة تسبيح • منذ عام 2000 • إيبارشية سوهاج"
              : "Sacrifice of Praise • Since 2000 • Sohag Diocese"}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-gold" />
        </motion.div>

        {/* Apple Cinematic Masked Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="space-y-4 max-w-4xl mx-auto"
        >
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.12]">
            <span className="apple-headline block">
              {isArabic ? "ذبيحة تسبيح متوارثة." : "Sacred Choral Harmony."}
            </span>
            <span className="gold-gradient-text block mt-1.5 sm:mt-2">
              {isArabic ? "نظام خدمة فائق الدقة." : "Engineered with Uncompromising Precision."}
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-charcoal-muted max-w-2xl mx-auto font-medium leading-relaxed">
            {isArabic
              ? "المنظومة الرقمية الشاملة لكورال ثمر شفاه — حضور ذكي عبر الـ GPS، إدارة الأعذار والاستئذان، بنك الترانيم السحابي، ودفتر نقاط شفاف بروح الخدمة والنظام الكنسي."
              : "The unified operational platform for Thamar Shefah Choir — server-authoritative GPS attendance, smart excuse workflows, cloud audio library, and transparent fellowship management."}
          </p>
        </motion.div>

        {/* Call to Actions (Apple Style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4"
        >
          <Link
            href="/attendance"
            className="relative group overflow-hidden px-8 py-3.5 rounded-full text-sm font-bold bg-burgundy text-white shadow-burgundy hover:shadow-card-hover transition-all duration-300 flex items-center gap-2"
          >
            {/* Continuous Specular Shimmer */}
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            <span>{isArabic ? "دخول بوابة الحضور والمتابعة" : "Open Attendance Portal"}</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={onOpenExcuseModal}
            className="px-6 py-3.5 rounded-full text-sm font-bold text-charcoal apple-glass hover:bg-white hover:border-gold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-gold" />
            <span>{isArabic ? "تقديم عذر (غياب أو تأخير)" : "Submit an Excuse"}</span>
          </button>
        </motion.div>

        {/* Centerpiece: Interactive 3D Perspective Member Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="perspective-1000 max-w-2xl mx-auto pt-6"
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
              rotateX,
              rotateY,
            }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="preserve-3d relative rounded-3xl bg-white/90 backdrop-blur-2xl border border-surface-border/90 p-6 sm:p-8 shadow-glass-elevated hairline-highlight text-start space-y-6"
          >
            {/* Top Bar: Badge & Live Status */}
            <div className="flex items-center justify-between gap-3 border-b border-surface-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-gold/40 shadow-xs shrink-0">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-charcoal flex items-center gap-1.5">
                    <span>
                      {currentUser ? currentUser.fullName : isArabic ? "بطاقة المرنم التفاعلية" : "Interactive Member Card"}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </h3>
                  <span className="text-[11px] text-charcoal-muted">
                    {currentUser?.voicePart
                      ? `${isArabic ? "طبقة الصوت:" : "Voice Part:"} ${currentUser.voicePart}`
                      : isArabic
                      ? "محاكاة حية للـ GPS والبروفات"
                      : "Live GPS & Rehearsal Simulation"}
                  </span>
                </div>
              </div>

              {/* Status Pill with Pulsing Radar Ring */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
                <span>
                  {activeRehearsal
                    ? isArabic
                      ? "بروفة مجدولة"
                      : "Scheduled Rehearsal"
                    : isArabic
                    ? "بروفة أسبوعية نشطة"
                    : "Active Rehearsal"}
                </span>
              </div>
            </div>

            {/* Rehearsal Metadata Container */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider block">
                    {isArabic ? "البروفة المجدولة القادمة" : "Next Scheduled Rehearsal"}
                  </span>
                  <h4 className="font-display font-extrabold text-base sm:text-lg text-charcoal mt-0.5">
                    {activeRehearsal ? activeRehearsal.title : "بروفة ترانيم تسبحة نصف الليل والأعياد"}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-canvas border border-surface-border/50 text-charcoal">
                  <Calendar className="w-4 h-4 text-gold shrink-0" />
                  <span className="font-bold">
                    {activeRehearsal ? activeRehearsal.date : "الجمعة القادمة"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-canvas border border-surface-border/50 text-charcoal">
                  <Clock className="w-4 h-4 text-gold shrink-0" />
                  <span className="font-bold">
                    {activeRehearsal
                      ? formatTime12h(activeRehearsal.startTime)
                      : "7:00 م - 9:30 م"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-canvas border border-surface-border/50 text-charcoal truncate">
                  <Building2 className="w-4 h-4 text-gold shrink-0" />
                  <span className="font-bold truncate">
                    {activeRehearsal ? activeRehearsal.locationName : "مطرانية سوهاج - كنيسة مارجرجس"}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Live Check-In Action Area */}
            <div className="pt-2 border-t border-surface-border/60">
              {isCheckedIn ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl p-4 bg-emerald-50/90 border border-emerald-300 text-emerald-950 space-y-2 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>{isArabic ? "تم تسجيل حضورك بنجاح! ✓" : "Check-In Verified! ✓"}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                      {isArabic ? "حاضر في ميعادك (أخضر 🟢)" : "PRESENT (Green 🟢)"}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    {isArabic
                      ? `تم التأكيد بالـ GPS (${checkInTimestamp}) • المسافة: 24 متر من قاعة الكورال`
                      : `Confirmed via GPS (${checkInTimestamp}) • Distance: 24m inside geofence`}
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulatedCheckIn}
                    className="text-[11px] text-emerald-700 underline hover:text-emerald-900 cursor-pointer pt-1"
                  >
                    {isArabic ? "إعادة التجربة مجدداً" : "Reset Test Simulator"}
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={isCheckingIn}
                    onClick={handleSimulatedCheckIn}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-burgundy hover:bg-burgundy-dark active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-burgundy cursor-pointer disabled:opacity-75"
                  >
                    {isCheckingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isArabic ? "جاري قراءة إحداثيات GPS بدقة..." : "Acquiring GPS Fix..."}</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4 text-gold animate-pulse" />
                        <span>{isArabic ? "سجل حضورك دلوقتي عبر GPS" : "Live GPS Check-In Simulator"}</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-between text-[11px] text-charcoal-muted px-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gold" />
                      <span>{isArabic ? "نطاق جغرافي صارم 100م" : "Strict 100m Geofence"}</span>
                    </span>
                    <span>{isArabic ? "حساب وقت الخادم قاطع ودقيق" : "Server-Authoritative Clock"}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

