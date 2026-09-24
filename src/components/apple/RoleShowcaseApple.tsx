"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Coins,
  Crown,
  CheckCircle2,
  Calendar,
  Radio,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";

interface RoleShowcaseAppleProps {
  isArabic: boolean;
}

interface RoleData {
  id: string;
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  color: string;
  icon: React.ElementType;
  directRoute: string;
  privilegesAr: string[];
  privilegesEn: string[];
  quoteAr: string;
}

const ROLES: RoleData[] = [
  {
    id: "MEMBER",
    badgeAr: "المرنم / الخادم",
    badgeEn: "Choir Member",
    titleAr: "بوابة المرنم المتكاملة",
    titleEn: "Member Mobile Hub",
    taglineAr: "تسجيل حضورك بالـ GPS، تقديم الأعذار، رصيد النقاط، وبنك الترانيم.",
    taglineEn: "Live GPS attendance, excuse tracking, points balance, and hymn library.",
    color: "#DCA40C",
    icon: User,
    directRoute: "/attendance",
    privilegesAr: [
      "تسجيل حضور فوري بالـ GPS داخل نطاق 100م كنسي",
      "تقديم ومتابعة طلبات الأعذار (غياب أو تأخير) مع توجيهات المشرف",
      "تقويم شهري بألوان الحضور الأربعة (أخضر، أصفر، أحمر، أزرق)",
      "سجل الاشتراكات الشهرية ودفعات الصندوق",
    ],
    privilegesEn: [
      "Instant GPS check-in inside 100m church geofence",
      "Submit and track delay/absence excuses with admin notes",
      "Interactive 4-color calendar (Green, Yellow, Red, Blue)",
      "Monthly subscription dues and payment receipts",
    ],
    quoteAr: "«أُسَبِّحُ الرَّبَّ فِي حَيَاتِي، وَأُرَنِّمُ لإِلهِي مَا دُمْتُ مَوْجُودًا»",
  },
  {
    id: "ADMIN",
    badgeAr: "أمين الخدمة / الأدمن",
    badgeEn: "Conductor / Admin",
    titleAr: "إدارة البروفات والالتزام الكنسي",
    titleEn: "Operations & Attendance",
    taglineAr: "جدولة البروفات، خريطة سوهاج، صندوق وارد الأعذار، وسجل التدقيق.",
    taglineEn: "Rehearsal scheduler, Sohag diocese map, excuse review, and audit trail.",
    color: "#640810",
    icon: Shield,
    directRoute: "/admin/rehearsals",
    privilegesAr: [
      "جدولة وتعديل البروفات بمواعيد 12 ساعة وخريطة كنائس سوهاج",
      "صندوق وارد الأعذار مع إمكانية كتابة تعليقات للمرنمين والقبول الفوري",
      "إدارة الدورات التشغيلية (الربع السنوي) وسياسات الالتزام",
      "سجل تدقيق كامل للعمليات والتعديلات اليدوية",
    ],
    privilegesEn: [
      "Schedule & edit rehearsals with 12h time and Sohag church registry",
      "Dedicated Excuse Inbox with admin commenting & 1-click approvals",
      "Operational quarters management & single-active quarter policy",
      "Comprehensive audit trail of manual adjustments",
    ],
    quoteAr: "«كُلُّ شَيْءٍ فَلْيَكُنْ بِلِيَاقَةٍ وَبِحَسَبِ تَرْتِيبٍ»",
  },
  {
    id: "SUBSCRIPTION_MANAGER",
    badgeAr: "أمين الصندوق والماليات",
    badgeEn: "Subscription Manager",
    titleAr: "إدارة الاشتراكات ودفتر FIFO",
    titleEn: "Treasury & FIFO Debt Ledger",
    taglineAr: "اشتراكات شهرية متدرجة، تسديد بنظام الأقدم أولاً، وسندات قبض.",
    taglineEn: "Tiered dues, deterministic FIFO debt clearing, and receipts.",
    color: "#B88008",
    icon: Coins,
    directRoute: "/login",
    privilegesAr: [
      "توليد مستحقات شهرية حسب تصنيف المرنم (طالب / موظف)",
      "تخصيص الدفعات تلقائياً لتسديد الشهر الأقدم أولاً (FIFO)",
      "كشف حساب مالي شفاف لكل مرنم مع رصيد الديون المتراكمة",
      "صلاحيات مالية دقيقة وموثقة في سجل الرقابة",
    ],
    privilegesEn: [
      "Automatic monthly charges based on classification (Student / Working)",
      "Deterministic FIFO payment allocation clearing oldest debt first",
      "Clear member financial statement & outstanding dues badge",
      "Strict financial separation with audit accountability",
    ],
    quoteAr: "«أَمِينٌ فِي الْقَلِيلِ، أُقِيمُكَ عَلَى الْكَثِيرِ»",
  },
  {
    id: "SUPER_ADMIN",
    badgeAr: "المشرف العام التقني",
    badgeEn: "Super Administrator",
    titleAr: "السيادة والتحكم المؤسسي الشامل",
    titleEn: "Governance & Security",
    taglineAr: "تفويض الصلاحيات، الرقابة الجنائية الرقمية، وضبط بيئة Edge.",
    taglineEn: "Role delegation, immutable security audit, and Cloudflare Edge management.",
    color: "#DCA40C",
    icon: Crown,
    directRoute: "/admin/members",
    privilegesAr: [
      "تفويض وتعديل صلاحيات المشرفين وأمناء الصندوق بنقرة واحدة",
      "اعتماد الأعضاء الجدد وفرز طبقات الصوت وتعيين الفئات",
      "سجل تدقيق أمني جنائي لا يمكن حذفه لجميع العمليات",
      "التحكم في قواعد النقاط التراكمية وحدود العقوبات والجوائز",
    ],
    privilegesEn: [
      "Delegate & modify admin and treasury privileges with 1-click RBAC",
      "Approve new registrations, assign vocal parts, and tier levels",
      "Immutable forensic audit log capturing all system mutations",
      "Configure quarterly point rules and manual override bounds",
    ],
    quoteAr: "«وَأَنْتُمْ جَمِيعاً إِخْوَةٌ»",
  },
];

export default function RoleShowcaseApple({ isArabic }: RoleShowcaseAppleProps) {
  const [activeRoleId, setActiveRoleId] = useState<string>("MEMBER");
  const activeRole = ROLES.find((r) => r.id === activeRoleId) || ROLES[0];
  const IconComponent = activeRole.icon;
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section id="roles" className="py-24 bg-[#0B0B0C] text-white relative overflow-hidden">
      {/* Radiant Glow Lights (Keynote Pro Feel) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-burgundy-900/40 via-gold-600/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-gold-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-gold border border-white/15"
          >
            <Crown className="w-3.5 h-3.5 text-gold" />
            <span>{isArabic ? "هيكل الصلاحيات الرباعي" : "Role-Based Access Control"}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight"
          >
            <span className="apple-headline-dark block">
              {isArabic ? "نظام متكامل لكل دور ورتبة." : "Tailored for Every Sacred Calling."}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed"
          >
            {isArabic
              ? "فصل دقيق للمسؤوليات يمنح كل خادم الأدوات الملائمة لدوره الكنسي دون تداخل أو تعقيد."
              : "Strict role separation providing dedicated interfaces for singers, conductors, treasurers, and bishops."}
          </motion.p>
        </div>

        {/* macOS / iOS Style Segmented Control */}
        <div className="max-w-2xl mx-auto p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {ROLES.map((role) => {
            const isSelected = role.id === activeRoleId;
            const RIcon = role.icon;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRoleId(role.id)}
                className={`relative py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none flex items-center justify-center gap-2 ${
                  isSelected ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeRoleSegment"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-burgundy rounded-xl shadow-md border border-gold/40"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <RIcon className={`w-3.5 h-3.5 ${isSelected ? "text-gold" : ""}`} />
                  <span>{isArabic ? role.badgeAr.split(" ")[0] : role.badgeEn.split(" ")[0]}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Content Showcase Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Role Details */}
              <div className="lg:col-span-7 space-y-6 text-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gold border border-white/20">
                      {isArabic ? activeRole.badgeAr : activeRole.badgeEn}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {isArabic ? activeRole.quoteAr : ""}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {isArabic ? activeRole.titleAr : activeRole.titleEn}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {isArabic ? activeRole.taglineAr : activeRole.taglineEn}
                  </p>
                </div>

                {/* Privileges Checklist */}
                <div className="space-y-3 pt-2">
                  {(isArabic ? activeRole.privilegesAr : activeRole.privilegesEn).map(
                    (item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    )
                  )}
                </div>

                {/* Direct Action Link */}
                <div className="pt-4">
                  <Link
                    href={activeRole.directRoute}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white text-charcoal-900 hover:bg-gold-100 hover:text-burgundy transition-all duration-300 shadow-md group"
                  >
                    <span>{isArabic ? "فتح الواجهة الخاصة بهذه الرتبة" : "Enter Role Workspace"}</span>
                    <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Showcase Device Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-neutral-950 border border-white/15 p-6 shadow-2xl space-y-4 text-start">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-burgundy/30 border border-gold/40 flex items-center justify-center text-gold">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">
                          {isArabic ? activeRole.badgeAr : activeRole.badgeEn}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          ID: {activeRole.id}
                        </span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-neutral-400 block">{isArabic ? "مستوى الأمان" : "Security Clearance"}</span>
                      <span className="font-bold text-gold text-xs block mt-0.5">
                        {isArabic ? "تشفير HMAC-SHA256 كامل" : "Full HMAC-SHA256 Token"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-neutral-400 block">{isArabic ? "واجهة التحكم" : "Control Surface"}</span>
                      <span className="font-bold text-white text-xs block mt-0.5">
                        {activeRole.directRoute}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

