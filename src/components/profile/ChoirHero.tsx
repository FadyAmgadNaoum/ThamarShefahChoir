"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Music, Calendar, Image as ImageIcon, LogIn, Edit3, ArrowDown, Sparkles } from "lucide-react";
import { ChoirProfileData } from "@/data/choir-profile";

interface ChoirHeroProps {
  profile: ChoirProfileData;
  isArabic: boolean;
  isAdmin: boolean;
}

export default function ChoirHero({ profile, isArabic, isAdmin }: ChoirHeroProps) {
  const { general, stats } = profile;

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-gradient-to-b from-stone-900 via-burgundy-950 to-surface-canvas text-white">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-gold-500/30 via-burgundy-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Admin Quick Edit Floating Banner */}
        {isAdmin && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold-200 text-xs font-medium mb-6 backdrop-blur-md animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>{isArabic ? "أنت مسجل كمشرف على النظام" : "You are logged in as Admin"}</span>
            <Link
              href="/admin/profile"
              className="ml-2 px-2.5 py-0.5 rounded-md bg-gold text-burgundy-950 font-bold hover:bg-gold-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isArabic ? "تعديل صفحة الكورال" : "Edit Profile"}</span>
            </Link>
          </div>
        )}

        {/* Church & Foundation Year Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs sm:text-sm font-semibold tracking-wide">
            <span>⛪</span>
            <span>{isArabic ? general.churchAr : general.churchEn}</span>
          </span>
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-burgundy/60 backdrop-blur-md border border-gold/30 text-gold-200 text-xs font-bold">
            {isArabic ? general.mottoAr : general.mottoEn}
          </span>
        </div>

        {/* Official Choir Logo */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gold shadow-2xl shadow-gold/20 bg-white group hover:scale-105 transition-transform duration-300">
          <Image
            src={general.logoUrl || "/images/logo.jpg"}
            alt={isArabic ? general.nameAr : general.nameEn}
            fill
            className="object-contain p-2"
            priority
          />
        </div>

        {/* Main Title & Slogan */}
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white mb-4">
          <span className="block drop-shadow-sm">{isArabic ? general.nameAr : general.nameEn}</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-stone-200/90 font-light leading-relaxed mb-6">
          {isArabic ? general.shortBioAr : general.shortBioEn}
        </p>

        {/* Bible Verse Banner */}
        <div className="max-w-xl mx-auto mb-10 p-4 rounded-2xl bg-white/5 border border-gold/20 backdrop-blur-md text-gold-200/90 text-sm sm:text-base italic font-serif">
          {isArabic ? general.verseAr : general.verseEn}
        </div>

        {/* Quick CTA Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
          <a
            href="#hymns"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-burgundy-950 font-bold text-sm sm:text-base shadow-lg shadow-gold/25 hover:bg-gold-300 hover:scale-102 transition-all"
          >
            <Music className="w-4 h-4" />
            <span>{isArabic ? "استمع للترانيم والكنتاتات" : "Listen to Hymns"}</span>
          </a>

          <a
            href="#history"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base border border-white/20 backdrop-blur-md hover:scale-102 transition-all"
          >
            <Calendar className="w-4 h-4 text-gold-300" />
            <span>{isArabic ? "تاريخ ومحطات الكورال" : "Choir History"}</span>
          </a>

          <a
            href="#gallery"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base border border-white/20 backdrop-blur-md hover:scale-102 transition-all"
          >
            <ImageIcon className="w-4 h-4 text-gold-300" />
            <span>{isArabic ? "معرض الصور" : "Photo Gallery"}</span>
          </a>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-burgundy/80 hover:bg-burgundy text-gold font-bold text-sm sm:text-base border border-gold/40 shadow-md hover:scale-102 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{isArabic ? "بوابة المرنمين والإدارة" : "Member Portal"}</span>
          </Link>
        </div>

        {/* 4 Key Numerical Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-gold font-mono">{stats.years}</div>
            <div className="text-xs sm:text-sm text-stone-300 mt-1">
              {isArabic ? "سنة تسبيح وعطاء" : "Years of Praise"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-gold font-mono">{stats.members}</div>
            <div className="text-xs sm:text-sm text-stone-300 mt-1">
              {isArabic ? "مرنم ومرنمة وخادم" : "Choir Members"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-gold font-mono">{stats.hymns}</div>
            <div className="text-xs sm:text-sm text-stone-300 mt-1">
              {isArabic ? "ترنيمة وكنتاتا مسجلة" : "Hymns & Cantatas"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl font-extrabold text-gold font-mono">{stats.concerts}</div>
            <div className="text-xs sm:text-sm text-stone-300 mt-1">
              {isArabic ? "احتفالية ومهرجان روحي" : "Concerts & Festivals"}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 flex justify-center">
          <a
            href="#about"
            aria-label="Scroll to About section"
            className="p-2 rounded-full text-gold-300/60 hover:text-gold transition-colors animate-bounce"
          >
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
