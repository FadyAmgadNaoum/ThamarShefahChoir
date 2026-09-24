"use client";

import React from "react";
import { Mic2, Activity } from "lucide-react";
import { VocalSectionInfo } from "@/data/choir-profile";

interface ChoirVocalSectionsProps {
  sections: VocalSectionInfo[];
  isArabic: boolean;
}

export default function ChoirVocalSections({ sections, isArabic }: ChoirVocalSectionsProps) {
  return (
    <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
      {/* Background Decorative Soundwave Ambient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-gold-500 via-burgundy to-gold-500 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-gold-300 text-xs font-bold mb-4 backdrop-blur-md">
            <Mic2 className="w-3.5 h-3.5 text-gold" />
            <span>{isArabic ? "التوزيع البوليفوني المتكامل" : "Polyphonic Architecture"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
            {isArabic ? "الأقسام الصوتية وتوافق الهارموني (SATB)" : "Harmonic Vocal Sections (SATB)"}
          </h2>
          <p className="text-stone-300 text-sm sm:text-base">
            {isArabic
              ? "يتكامل الكورال من أربعة أقسام صوتية منضبطة تنسج معاً التوافق اللحني الكنسي بجمال وخشوع."
              : "Four structured vocal parts interwoven to create sacred polyphony with reverence and precision."}
          </p>
        </div>

        {/* 4 Voice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <div
              key={section.key}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 hover:border-gold/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Symbol & Range Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-display font-black text-xl group-hover:scale-110 transition-transform">
                    {section.symbol}
                  </div>
                  <span className="text-[11px] font-mono text-gold-300 bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                    {isArabic ? section.rangeAr : section.rangeEn}
                  </span>
                </div>

                {/* Section Title */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  {isArabic ? section.titleAr : section.titleEn}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  {isArabic ? section.descAr : section.descEn}
                </p>
              </div>

              {/* Acoustic Frequency Indicator Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-gold" />
                  <span>{isArabic ? "طبقة متزنة" : "Tuned Part"}</span>
                </span>
                <span className="text-gold-400 font-bold font-mono">100% Balanced</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
