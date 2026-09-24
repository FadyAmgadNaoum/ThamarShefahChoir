"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Clock, UserPlus, HeartHandshake, Phone, Mail } from "lucide-react";
import { ChoirProfileData } from "@/data/choir-profile";

interface ChoirContactProps {
  contact: ChoirProfileData["contact"];
  isArabic: boolean;
}

export default function ChoirContact({ contact, isArabic }: ChoirContactProps) {
  return (
    <section id="contact" className="py-20 bg-stone-50/80 border-t border-surface-border/60 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-burgundy-950 via-burgundy to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Subtle Decorative Cross Pattern */}
          <div className="absolute top-0 end-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-bold mb-4 backdrop-blur-md border border-white/15">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>{isArabic ? "خدمة ومحبة كنسية" : "Ecclesiastical Ministry"}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
                {isArabic ? "انضم لأسرة كورال ثمر شفاه" : "Join the Choir Family"}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                {isArabic
                  ? "نرحب دائماً بالأصوات المكرسة والراغبة في تقديم ذبيحة تسبيح نقية لمجد الله بكنيسة الشهيد مارجرجس بمطرانية سوهاج."
                  : "We always welcome consecrated voices desiring to offer a pure sacrifice of praise at St. George Church, Sohag."}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-burgundy-950 font-bold text-sm sm:text-base shadow-lg hover:bg-gold-300 transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isArabic ? "تقديم طلب انضمام جديد" : "Apply as a New Voice"}</span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all"
                >
                  <span>{isArabic ? "تسجيل دخول الأعضاء" : "Member Login"}</span>
                </Link>
              </div>
            </div>

            {/* Information Cards */}
            <div className="space-y-4">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isArabic ? contact.churchAr : contact.churchEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
                    {isArabic ? contact.addressAr : contact.addressEn}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isArabic ? "مواعيد البروفات الدورية" : "Regular Rehearsal Times"}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 mt-0.5 font-sans">
                    {isArabic ? contact.rehearsalTimesAr : contact.rehearsalTimesEn}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur-md flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-xs text-stone-200 font-mono truncate">{contact.email}</span>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur-md flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-xs text-stone-200 font-mono">{contact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
