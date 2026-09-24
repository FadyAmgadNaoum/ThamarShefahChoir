"use client";

import React from "react";
import { Calendar, ChevronRight, Award } from "lucide-react";
import { MilestoneItem } from "@/data/choir-profile";

interface ChoirTimelineProps {
  history: MilestoneItem[];
  isArabic: boolean;
}

export default function ChoirTimeline({ history, isArabic }: ChoirTimelineProps) {
  return (
    <section id="history" className="py-20 bg-stone-50/70 border-y border-surface-border/60 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-burgundy/10 border border-burgundy/20 text-burgundy text-xs font-bold mb-4">
            <Calendar className="w-3.5 h-3.5 text-burgundy" />
            <span>{isArabic ? "مسيرة أكثر من ربع قرن" : "Over 25 Years of Grace"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-burgundy mb-4">
            {isArabic ? "محطات مضيئة في تاريخ كورال ثمر شفاه" : "Milestones in Choir History"}
          </h2>
          <p className="text-charcoal-muted text-sm sm:text-base">
            {isArabic
              ? "رحلة التسبيح والبركة منذ التأسيس عام 2000 في كنيسة الشهيد مارجرجس بسوهاج وحتى يومنا هذا."
              : "A sacred journey of prayer and praise since foundation in 2000 at St. George Church, Sohag."}
          </p>
        </div>

        {/* Timeline Path */}
        <div className="relative border-s-2 border-gold-300 ms-4 sm:ms-32 space-y-10">
          {history.map((milestone, idx) => {
            return (
              <div key={milestone.id || idx} className="relative ps-6 sm:ps-8 group">
                {/* Year Marker Badge (Floating on Left for desktop) */}
                <div
                  className={`hidden sm:flex absolute -start-32 top-1.5 w-24 justify-end text-end font-mono font-extrabold text-lg text-burgundy`}
                >
                  <span className="px-2 py-0.5 rounded-md bg-gold-100 text-burgundy border border-gold-300">
                    {milestone.year}
                  </span>
                </div>

                {/* Timeline Dot Indicator */}
                <div className="absolute -start-[17px] top-2 w-8 h-8 rounded-full bg-white border-4 border-gold shadow-md flex items-center justify-center text-[10px] text-burgundy font-bold group-hover:scale-125 group-hover:border-burgundy transition-all duration-300">
                  <Award className="w-3.5 h-3.5 text-gold-600" />
                </div>

                {/* Milestone Card */}
                <div className="bg-white rounded-2xl p-6 border border-surface-border/80 shadow-sm hover:shadow-md hover:border-gold-300 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="sm:hidden font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-gold-100 text-burgundy border border-gold-300">
                      {milestone.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-burgundy/10 text-burgundy text-[11px] font-bold">
                      {isArabic ? milestone.badgeAr : milestone.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-burgundy mb-2">
                    {isArabic ? milestone.titleAr : milestone.titleEn}
                  </h3>

                  <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
                    {isArabic ? milestone.descAr : milestone.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
