"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles, MapPin } from "lucide-react";

interface FooterAppleProps {
  isArabic: boolean;
}

export default function FooterApple({ isArabic }: FooterAppleProps) {
  return (
    <footer className="border-t border-surface-border/80 bg-surface-canvas/90 py-16 text-charcoal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Logo & Spiritual Motto */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-start">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-gold/40 shadow-xs shrink-0">
              <Image
                src="/images/logo.jpg"
                alt="Thamar Shefah Logo"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-burgundy">
                {isArabic ? "كورال ثمر شفاه" : "Thamar Shefah Choir"}
              </h4>
              <p className="text-xs text-charcoal-muted">
                {isArabic
                  ? "ذبيحة تسبيح • إيبارشية سوهاج وأخميم • منذ عام 2000"
                  : "Sacrifice of Praise • Sohag Diocese • Established 2000"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-charcoal-muted">
            <Link href="/attendance" className="px-3 py-1.5 rounded-full hover:text-burgundy transition-colors">
              {isArabic ? "سجل الحضور" : "Attendance"}
            </Link>
            <Link href="/excuses" className="px-3 py-1.5 rounded-full hover:text-burgundy transition-colors">
              {isArabic ? "بوابة الأعذار" : "Excuses"}
            </Link>
            <Link href="/admin/rehearsals" className="px-3 py-1.5 rounded-full hover:text-burgundy transition-colors">
              {isArabic ? "جدولة البروفات" : "Scheduler"}
            </Link>
            <Link href="/admin/excuses" className="px-3 py-1.5 rounded-full hover:text-burgundy transition-colors">
              {isArabic ? "صندوق المشرف" : "Admin Inbox"}
            </Link>
            <Link href="/login" className="px-3 py-1.5 rounded-full hover:text-burgundy transition-colors">
              {isArabic ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>
        </div>

        {/* Verse / Spiritual Anchor Callout */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-surface-border/60 text-center space-y-1 shadow-2xs">
          <p className="font-display font-bold text-sm text-burgundy">
            {isArabic
              ? "«فَلْنُقَدِّمْ بِهِ فِي كُلِّ حِينٍ للهِ ذَبِيحَةَ التَّسْبِيحِ، أَيْ ثَمَرَ شِفَاهٍ مُعْتَرِفَةٍ بِاسْمِهِ»"
              : "“By him therefore let us offer the sacrifice of praise to God continually, that is, the fruit of our lips giving thanks to his name.”"}
          </p>
          <span className="text-[11px] text-charcoal-muted block font-serif">
            {isArabic ? "(عبرانيين 13: 15)" : "(Hebrews 13:15)"}
          </span>
        </div>

        {/* Bottom Bar: Copyright & Cloudflare Badge */}
        <div className="pt-6 border-t border-surface-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted text-center sm:text-start">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>
              {isArabic
                ? "مقر الخدمة: مطرانية السيدة العذراء مريم — محافظة سوهاج"
                : "Ministry Center: St. Mary Cathedral — Sohag Governorate"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloudflare Workers D1 Edge (0 EGP)</span>
            </span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Thamar Shefah Choir</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

