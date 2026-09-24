"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Radio,
  User,
  Shield,
  FileText,
  Calendar,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Award,
  Sliders,
  CreditCard,
  Receipt,
  Music,
  LogOut,
  Upload,
  CheckCircle2,
  Users,
  Layers,
  Settings,
  FolderPlus,
  BarChart3,
  ShieldAlert,
} from "lucide-react";

interface NavbarAppleProps {
  lang?: "ar" | "en";
  toggleLanguage?: () => void;
  currentUser?: {
    userId: string;
    fullName: string;
    roles: string[];
    voicePart?: string;
    status: string;
  } | null;
  activeRehearsal?: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    locationName: string;
    windowStatus: string;
  } | null;
  onOpenExcuseModal?: () => void;
  backUrl?: string;
  backLabelAr?: string;
  backLabelEn?: string;
}

export default function NavbarApple({
  lang,
  toggleLanguage,
  currentUser: propUser,
  activeRehearsal: propRehearsal,
  onOpenExcuseModal,
  backUrl,
  backLabelAr,
  backLabelEn,
}: NavbarAppleProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [internalUser, setInternalUser] = useState(propUser || null);
  const [internalRehearsal, setInternalRehearsal] = useState(propRehearsal || null);
  const [internalLang, setInternalLang] = useState<"ar" | "en">(lang || "ar");

  useEffect(() => {
    if (propUser !== undefined) setInternalUser(propUser);
  }, [propUser]);

  useEffect(() => {
    if (propRehearsal !== undefined) setInternalRehearsal(propRehearsal);
  }, [propRehearsal]);

  useEffect(() => {
    if (lang !== undefined) setInternalLang(lang);
  }, [lang]);

  useEffect(() => {
    if (propUser === undefined) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: any) => {
          if (data?.user) setInternalUser(data.user);
        })
        .catch(() => {});
    }

    if (propRehearsal === undefined) {
      fetch("/api/rehearsals/active")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: any) => {
          if (data?.rehearsal) setInternalRehearsal(data.rehearsal);
        })
        .catch(() => {});
    }
  }, [propUser, propRehearsal]);

  const pathname = usePathname();

  // Hide Navbar completely on auth/onboarding full-page flows
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/pending-approval";

  // Dynamic Back navigation calculation if not explicitly provided as a prop
  let computedBackUrl = backUrl;
  let computedBackLabelAr = backLabelAr;
  let computedBackLabelEn = backLabelEn;

  if (!computedBackUrl) {
    if (pathname === "/admin/songs") {
      computedBackUrl = "/songs";
      computedBackLabelAr = "مكتبة الترانيم";
      computedBackLabelEn = "Hymns Library";
    } else if (pathname === "/admin/super/audit") {
      computedBackUrl = "/admin/reports";
      computedBackLabelAr = "لوحة التقارير";
      computedBackLabelEn = "Reports Hub";
    } else if (pathname?.startsWith("/admin")) {
      computedBackUrl = "/";
      computedBackLabelAr = "الرئيسية";
      computedBackLabelEn = "Home";
    } else if (pathname && pathname !== "/") {
      computedBackUrl = "/";
      computedBackLabelAr = "الرئيسية";
      computedBackLabelEn = "Home";
    }
  }

  const currentUser = propUser !== undefined ? propUser : internalUser;
  const activeRehearsal = propRehearsal !== undefined ? propRehearsal : internalRehearsal;
  const effectiveLang = lang || internalLang;
  const isArabic = effectiveLang === "ar";
  const BackArrowIcon = isArabic ? ArrowRight : ArrowLeft;
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const isAdmin =
    currentUser?.roles.includes("ADMIN") || currentUser?.roles.includes("SUPER_ADMIN");
  const isSuperAdmin = currentUser?.roles.includes("SUPER_ADMIN");
  const isFinance =
    currentUser?.roles.includes("SUBSCRIPTION_MANAGER") || isAdmin;

  const handleToggleLang = () => {
    if (toggleLanguage) {
      toggleLanguage();
    } else {
      const next = internalLang === "ar" ? "en" : "ar";
      setInternalLang(next);
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = next === "ar" ? "ar-EG" : "en";
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  if (isAuthPage) {
    return null;
  }

  const navLinks = [
    { href: "/attendance", labelAr: "البروفات والتقويم", labelEn: "Rehearsals", icon: Calendar },
    { href: "/songs", labelAr: "مكتبة الترانيم", labelEn: "Hymns Library", icon: Music },
  ];

  return (
    <>
      {/* Floating Dynamic Island Capsule */}
      <header className="fixed top-4 inset-x-0 mx-auto max-w-5xl z-50 px-3 sm:px-4 pointer-events-none">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="pointer-events-auto apple-glass rounded-full px-3.5 sm:px-5 py-2 shadow-glass-elevated flex items-center justify-between gap-3 border border-surface-border/80"
        >
          {/* Left Group: Back Button + Logo & Identity */}
          <div className="flex items-center gap-2">
            {computedBackUrl && (
              <Link
                href={computedBackUrl}
                className="px-2.5 py-1 rounded-full bg-gold-100/90 hover:bg-gold-200 text-burgundy text-xs font-bold flex items-center gap-1.5 transition-colors border border-gold-300 shadow-2xs group shrink-0"
                title={isArabic ? (computedBackLabelAr || "رجوع") : (computedBackLabelEn || "Back")}
              >
                <BackArrowIcon className="w-3.5 h-3.5 text-burgundy group-hover:-translate-x-0.5 transition-transform" />
                <span className="inline font-bold">
                  {isArabic ? (computedBackLabelAr || "رجوع") : (computedBackLabelEn || "Back")}
                </span>
              </Link>
            )}

            {/* Logo & Identity */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold shadow-xs group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/logo.jpg"
                  alt="Thamar Shefah Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block text-start">
                <span className="font-display font-extrabold text-sm text-burgundy tracking-tight block leading-tight">
                  {isArabic ? "كورال ثمر شفاه" : "Thamar Shefah"}
                </span>
                <span className="text-[10px] text-charcoal-muted tracking-wide block font-medium">
                  {isArabic ? "سوهاج • منذ 2000" : "Sohag • Since 2000"}
                </span>
              </div>
            </Link>
          </div>

          {/* Active Rehearsal Radar Island (Center Feature) */}
          {activeRehearsal ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-bold text-emerald-900 shadow-2xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="truncate max-w-[200px]">
                {activeRehearsal.title} • {activeRehearsal.locationName}
              </span>
            </motion.div>
          ) : (
            /* Primary Navigation Pills */
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-charcoal-muted">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-full hover:text-burgundy hover:bg-surface-canvas transition-colors flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-gold" />
                    <span>{isArabic ? link.labelAr : link.labelEn}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Hub: Language Switcher & Unified Profile Hub */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={handleToggleLang}
              title={isArabic ? "Switch to English" : "التحويل للعربية"}
              className="p-2 rounded-full hover:bg-surface-canvas text-charcoal-muted hover:text-burgundy transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-gold" />
              <span className="uppercase text-[11px]">{effectiveLang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Authenticated Hub or Guest Sign In */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {/* Unified Profile Pill Button */}
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="apple-glass rounded-full ps-2 pe-3 py-1 flex items-center gap-2 border border-gold-300/80 hover:border-gold transition-all duration-200 cursor-pointer shadow-2xs group hover:bg-surface-canvas/80"
                >
                  <div className="w-6 h-6 rounded-full bg-burgundy text-white flex items-center justify-center text-[11px] font-extrabold border border-gold shadow-2xs">
                    {currentUser.fullName.trim().charAt(0)}
                  </div>
                  <span className="text-xs font-extrabold text-charcoal group-hover:text-burgundy transition-colors hidden sm:inline">
                    {currentUser.fullName.split(" ")[0]}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold-100 text-burgundy border border-gold-300 hidden sm:inline">
                      {isArabic ? "إدارة" : "Admin"}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gold transition-transform duration-300 ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Apple Glass Unified Command Hub Dropdown */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full end-0 mt-2.5 w-80 sm:w-88 rounded-3xl apple-glass shadow-glass-elevated border border-gold-300/80 bg-surface-canvas/98 backdrop-blur-2xl p-4 text-start z-50 overflow-hidden"
                    >
                      {/* Member Info Card Header */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-50/80 to-surface-card border border-gold-200/80 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-burgundy text-white flex items-center justify-center font-extrabold text-sm border border-gold shadow-xs shrink-0">
                            {currentUser.fullName.trim().charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display font-extrabold text-xs text-charcoal truncate">
                              {currentUser.fullName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {currentUser.voicePart && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-burgundy border border-gold-300">
                                  {currentUser.voicePart}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                                <span>{isArabic ? "مرنم معتمد" : "Approved"}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 1: Member Portals */}
                      <div className="mb-3">
                        <div className="text-[10px] font-extrabold text-charcoal-muted uppercase px-2 mb-1.5 tracking-wider">
                          {isArabic ? "خدمات وبوابات المرنم" : "Member Portals"}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Link
                            href="/attendance"
                            onClick={() => setProfileMenuOpen(false)}
                            className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy border border-transparent hover:border-surface-border"
                          >
                            <Calendar className="w-4 h-4 text-gold shrink-0" />
                            <span className="truncate">{isArabic ? "حضور البروفات" : "Attendance"}</span>
                          </Link>

                          <Link
                            href="/songs"
                            onClick={() => setProfileMenuOpen(false)}
                            className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy border border-transparent hover:border-surface-border"
                          >
                            <Music className="w-4 h-4 text-gold shrink-0" />
                            <span className="truncate">{isArabic ? "أرشيف الترانيم" : "Hymns Library"}</span>
                          </Link>

                          <Link
                            href="/points"
                            onClick={() => setProfileMenuOpen(false)}
                            className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy border border-transparent hover:border-surface-border"
                          >
                            <Award className="w-4 h-4 text-gold shrink-0" />
                            <span className="truncate">{isArabic ? "محفظة النقاط" : "Points"}</span>
                          </Link>

                          <Link
                            href="/excuses"
                            onClick={() => setProfileMenuOpen(false)}
                            className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy border border-transparent hover:border-surface-border"
                          >
                            <FileText className="w-4 h-4 text-gold shrink-0" />
                            <span className="truncate">{isArabic ? "تقديم الأعذار" : "Excuses"}</span>
                          </Link>

                          <Link
                            href="/subscriptions"
                            onClick={() => setProfileMenuOpen(false)}
                            className="col-span-2 p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy border border-transparent hover:border-surface-border"
                          >
                            <CreditCard className="w-4 h-4 text-gold shrink-0" />
                            <span className="truncate">{isArabic ? "كشف حساب الاشتراكات والمدفوعات" : "Subscriptions"}</span>
                          </Link>
                        </div>
                      </div>

                      {/* Section 2: Choir Administration Hub (For Admins & Managers) */}
                      {(isAdmin || isFinance) && (
                        <div className="pt-2.5 border-t border-surface-border mb-3">
                          <div className="text-[10px] font-extrabold text-burgundy uppercase px-2 mb-1.5 tracking-wider flex items-center justify-between">
                            <span>{isArabic ? "لوحة إدارة الكورال" : "Administration"}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-100 text-burgundy font-bold border border-gold-300">
                              {isArabic ? "صلاحيات خاصة" : "Staff"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {/* Prominent Song & Media Upload Desk */}
                            {isAdmin && (
                              <Link
                                href="/admin/songs"
                                onClick={() => setProfileMenuOpen(false)}
                                className="p-2 rounded-xl bg-gold-100/60 hover:bg-gold-100 transition-all flex items-center justify-between text-xs font-extrabold text-burgundy border border-gold-300/80 shadow-2xs group"
                              >
                                <div className="flex items-center gap-2">
                                  <Music className="w-4 h-4 text-burgundy shrink-0 group-hover:scale-110 transition-transform" />
                                  <span>{isArabic ? "رفع وإدارة الترانيم والنوت" : "Upload & Manage Hymns"}</span>
                                </div>
                                <span className="text-[10px] bg-burgundy text-white px-2 py-0.5 rounded-full">
                                  {isArabic ? "جديد 🎵" : "New"}
                                </span>
                              </Link>
                            )}

                            {/* Choir Profile CMS Editor */}
                            {isAdmin && (
                              <Link
                                href="/admin/profile"
                                onClick={() => setProfileMenuOpen(false)}
                                className="p-2 rounded-xl bg-gold-50/80 hover:bg-gold-100 transition-all flex items-center justify-between text-xs font-extrabold text-burgundy border border-gold-200"
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-burgundy shrink-0" />
                                  <span>{isArabic ? "تعديل صفحة الكورال (CMS)" : "Edit Choir Profile"}</span>
                                </div>
                                <span className="text-[9px] bg-gold text-burgundy-950 font-bold px-1.5 py-0.5 rounded-full">
                                  CMS
                                </span>
                              </Link>
                            )}

                            {/* Analytics & Reports Hub */}
                            {isAdmin && (
                              <Link
                                href="/admin/reports"
                                onClick={() => setProfileMenuOpen(false)}
                                className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center justify-between text-xs font-bold text-charcoal hover:text-burgundy"
                              >
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "لوحة التقارير ومؤشرات الأداء" : "Analytics & KPIs"}</span>
                                </div>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                                  KPIs
                                </span>
                              </Link>
                            )}

                            {/* Smart AI Ingestion & Scheduling Hub */}
                            {isAdmin && (
                              <Link
                                href="/admin/import"
                                onClick={() => setProfileMenuOpen(false)}
                                className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center justify-between text-xs font-bold text-charcoal hover:text-burgundy"
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-[#DCA40C] shrink-0" />
                                  <span>{isArabic ? "المعالجة والجدولة الذكية (AI)" : "AI Smart Ingestion"}</span>
                                </div>
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-bold">
                                  AI ✨
                                </span>
                              </Link>
                            )}

                            {/* Super Admin Audit Trail */}
                            {isSuperAdmin && (
                              <Link
                                href="/admin/super/audit"
                                onClick={() => setProfileMenuOpen(false)}
                                className="p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 transition-all flex items-center justify-between text-xs font-bold text-rose-900 border border-rose-200 shadow-2xs"
                              >
                                <div className="flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                                  <span>{isArabic ? "سجل التدقيق الأمني (Audit)" : "Security Audit Trail"}</span>
                                </div>
                                <span className="text-[9px] bg-rose-700 text-white px-1.5 py-0.5 rounded-full font-extrabold">
                                  SUPER
                                </span>
                              </Link>
                            )}

                            {/* Finance Desk */}
                            {isFinance && (
                              <Link
                                href="/finance"
                                onClick={() => setProfileMenuOpen(false)}
                                className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                              >
                                <Receipt className="w-4 h-4 text-gold shrink-0" />
                                <span>{isArabic ? "دفتر الاشتراكات والتحصيل المالي" : "Finance & Collections"}</span>
                              </Link>
                            )}

                            {/* Rehearsal Scheduling */}
                            {isAdmin && (
                              <>
                                <Link
                                  href="/admin/rehearsals"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                                >
                                  <Shield className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "جدولة البروفات والحضور" : "Rehearsals Scheduling"}</span>
                                </Link>

                                <Link
                                  href="/admin/excuses"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                                >
                                  <FileText className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "صندوق مراجعة الأعذار" : "Excuses Review"}</span>
                                </Link>

                                <Link
                                  href="/admin/rules"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                                >
                                  <Settings className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "قواعد ولائحة النقاط" : "Point Rules"}</span>
                                </Link>

                                <Link
                                  href="/admin/adjustments"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                                >
                                  <Award className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "التسويات اليدوية والمكافآت" : "Manual Adjustments"}</span>
                                </Link>

                                <Link
                                  href="/admin/members"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                                >
                                  <Users className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "شؤون ورتب المرنمين" : "Member Roster"}</span>
                                </Link>

                                <Link
                                  href="/admin/quarters"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="p-2 rounded-xl hover:bg-surface-card transition-all flex items-center gap-2 text-xs font-bold text-charcoal hover:text-burgundy"
                                >
                                  <Layers className="w-4 h-4 text-gold shrink-0" />
                                  <span>{isArabic ? "دورات وربعيات الخدمة" : "Quarters"}</span>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer: Logout Button */}
                      <div className="pt-2 border-t border-surface-border">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full p-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{isArabic ? "تسجيل الخروج" : "Sign Out"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="relative group overflow-hidden px-4 py-1.5 rounded-full text-xs font-bold bg-burgundy text-white shadow-xs hover:shadow-burgundy transition-all duration-300 flex items-center gap-1.5"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                <span>{isArabic ? "تسجيل الدخول" : "Sign In"}</span>
                <ArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-surface-canvas text-charcoal cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-burgundy" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </header>

      {/* Apple-Style Mobile Full-Screen Glass Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40 bg-surface-canvas/95 md:hidden flex flex-col justify-start px-6 pt-24 pb-12 overflow-y-auto"
          >
            <div className="space-y-4 max-w-sm mx-auto w-full text-center">
              {/* Member Brief in Mobile Drawer */}
              {currentUser && (
                <div className="p-4 rounded-3xl bg-surface-card border border-gold-300/80 shadow-xs mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-burgundy text-white flex items-center justify-center font-extrabold text-base mx-auto mb-2 border border-gold shadow-xs">
                    {currentUser.fullName.trim().charAt(0)}
                  </div>
                  <h3 className="font-display font-extrabold text-sm text-charcoal">
                    {currentUser.fullName}
                  </h3>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">
                    {currentUser.voicePart || (isAdmin ? "إدارة الكورال" : "مرنم بالكورال")}
                  </p>
                </div>
              )}

              {/* Mobile Back Button if provided */}
              {computedBackUrl && (
                <Link
                  href={computedBackUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-2xl bg-gold-100/90 border border-gold-300 font-extrabold text-xs text-burgundy flex items-center gap-2.5 shadow-2xs"
                >
                  <BackArrowIcon className="w-4 h-4 text-burgundy shrink-0" />
                  <span>
                    {isArabic
                      ? `العودة: ${computedBackLabelAr || "الصفحة السابقة"}`
                      : `Back: ${computedBackLabelEn || "Previous Page"}`}
                  </span>
                </Link>
              )}

              {/* Main Links */}
              <div className="space-y-2 text-start">
                <div className="text-[10px] font-extrabold text-charcoal-muted uppercase px-2">
                  {isArabic ? "خدمات المرنم" : "My Portals"}
                </div>
                <Link
                  href="/attendance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal hover:text-burgundy flex items-center gap-2.5"
                >
                  <Calendar className="w-4 h-4 text-gold" />
                  <span>{isArabic ? "📅 تقويم وحضور البروفات" : "📅 Rehearsals Calendar"}</span>
                </Link>

                <Link
                  href="/songs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal hover:text-burgundy flex items-center gap-2.5"
                >
                  <Music className="w-4 h-4 text-gold" />
                  <span>{isArabic ? "🎵 أرشيف الترانيم والنوت الموسيقية" : "🎵 Hymns & Sheet Music"}</span>
                </Link>

                <Link
                  href="/points"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal hover:text-burgundy flex items-center gap-2.5"
                >
                  <Award className="w-4 h-4 text-gold" />
                  <span>{isArabic ? "🏆 محفظة وكشف حساب النقاط" : "🏆 Points Wallet"}</span>
                </Link>

                <Link
                  href="/excuses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal hover:text-burgundy flex items-center gap-2.5"
                >
                  <FileText className="w-4 h-4 text-gold" />
                  <span>{isArabic ? "🕊️ تقديم ومتابعة الأعذار" : "🕊️ Excuses Portal"}</span>
                </Link>

                <Link
                  href="/subscriptions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal hover:text-burgundy flex items-center gap-2.5"
                >
                  <CreditCard className="w-4 h-4 text-gold" />
                  <span>{isArabic ? "💳 كشف حساب الاشتراكات" : "💳 Subscriptions"}</span>
                </Link>
              </div>

              {/* Admin & Management Section */}
              {(isAdmin || isFinance) && (
                <div className="pt-3 border-t border-surface-border space-y-2 text-start">
                  <div className="text-[10px] font-extrabold text-burgundy uppercase px-2 flex items-center justify-between">
                    <span>{isArabic ? "لوحة إدارة الكورال" : "Administration"}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-100 text-burgundy font-bold border border-gold-300">
                      {isArabic ? "صلاحيات المشرف" : "Admin"}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin/songs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 px-4 rounded-2xl bg-gold-100 border border-gold-300 font-extrabold text-xs text-burgundy flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Music className="w-4 h-4 text-burgundy" />
                        <span>{isArabic ? "🎼 رفع وإدارة الترانيم والنوت" : "🎼 Upload Songs & Sheets"}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-burgundy text-white font-bold">
                        {isArabic ? "رفع جديد" : "Upload"}
                      </span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <BarChart3 className="w-4 h-4 text-gold" />
                        <span>{isArabic ? "📊 لوحة التقارير ومؤشرات الأداء" : "📊 Analytics & KPIs"}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        KPIs
                      </span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin/import"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#DCA40C]" />
                        <span>{isArabic ? "✨ المعالجة والجدولة الذكية (AI)" : "✨ AI Smart Ingestion"}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        AI
                      </span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      href="/admin/super/audit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 px-4 rounded-2xl bg-rose-50 border border-rose-200 font-bold text-xs text-rose-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-rose-700" />
                        <span>{isArabic ? "🛡️ سجل التدقيق الأمني" : "🛡️ Security Audit"}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-700 text-white font-bold">
                        SUPER
                      </span>
                    </Link>
                  )}

                  {isFinance && (
                    <Link
                      href="/finance"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-burgundy flex items-center gap-2.5"
                    >
                      <Receipt className="w-4 h-4 text-burgundy" />
                      <span>{isArabic ? "💰 دفتر تحصيل الاشتراكات" : "💰 Finance & Collections"}</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/rehearsals"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center gap-2.5"
                      >
                        <Shield className="w-4 h-4 text-gold" />
                        <span>{isArabic ? "📅 جدولة البروفات ومراجعة الحضور" : "📅 Rehearsals Admin"}</span>
                      </Link>

                      <Link
                        href="/admin/excuses"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center gap-2.5"
                      >
                        <FileText className="w-4 h-4 text-gold" />
                        <span>{isArabic ? "📥 مراجعة طلبات الأعذار" : "📥 Excuses Inbox"}</span>
                      </Link>

                      <Link
                        href="/admin/rules"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center gap-2.5"
                      >
                        <Settings className="w-4 h-4 text-gold" />
                        <span>{isArabic ? "⚙️ قواعد ولائحة النقاط" : "⚙️ Point Rules"}</span>
                      </Link>

                      <Link
                        href="/admin/adjustments"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center gap-2.5"
                      >
                        <Award className="w-4 h-4 text-gold" />
                        <span>{isArabic ? "⚖️ التسويات والمكافآت اليدوية" : "⚖️ Adjustments"}</span>
                      </Link>

                      <Link
                        href="/admin/members"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 rounded-2xl bg-surface-card border border-surface-border font-bold text-xs text-charcoal flex items-center gap-2.5"
                      >
                        <Users className="w-4 h-4 text-gold" />
                        <span>{isArabic ? "👥 شؤون ورتب المرنمين" : "👥 Member Roster"}</span>
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Login or Logout Action */}
              <div className="pt-4">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full py-3.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-center font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {isArabic ? "تسجيل الخروج" : "Sign Out"}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3.5 rounded-2xl bg-burgundy text-white text-center font-bold text-xs shadow-md"
                  >
                    {isArabic ? "تسجيل الدخول" : "Sign In"}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
