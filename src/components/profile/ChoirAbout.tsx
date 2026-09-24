"use client";

import React from "react";
import { Heart, Sparkles, Award, Music2 } from "lucide-react";
import { ChoirProfileData } from "@/data/choir-profile";

interface ChoirAboutProps {
  profile: ChoirProfileData;
  isArabic: boolean;
}

export default function ChoirAbout({ profile, isArabic }: ChoirAboutProps) {
  const { general } = profile;

  const pillars = [
    {
      icon: Heart,
      titleAr: "التكريس وروح الصلاة",
      titleEn: "Spiritual Consecration",
      descAr: "التسبيح ليس مجرد أداء موسيقي، بل هو ذبيحة شكر وصلاة حية تُرفع من قلوب خاشعة ومكرسة لمجد الله.",
      descEn: "Praise is not merely musical performance, but a living sacrifice of thanksgiving and prayer offered from consecrated hearts.",
    },
    {
      icon: Music2,
      titleAr: "التوزيع الهارموني البوليفوني",
      titleEn: "Four-Part Harmony (SATB)",
      descAr: "نسج أصوات السوبرانو والألتو والتينور والباص في وحدة صوتية متناغمة تعبر عن جسد الكنيسة الواحد.",
      descEn: "Blending Soprano, Alto, Tenor, and Bass voices into an exquisite polyphonic tapestry reflecting the unity of the Church.",
    },
    {
      icon: Sparkles,
      titleAr: "الكنتاتات والأعمال الطقسية",
      titleEn: "Liturgical Cantatas & Feasts",
      descAr: "أعمال موسيقية درامية وروحية متكاملة تقدم رسالة الخلاص في أعياد الميلاد والقيامة ومناسبات الكنيسة.",
      descEn: "Dramatic choral cantatas conveying the message of salvation during Nativity, Pascha, and ecclesiastical feasts.",
    },
    {
      icon: Award,
      titleAr: "الأصالة والتراث القبطي",
      titleEn: "Coptic Liturgical Heritage",
      descAr: "الجمع بين عمق وروحانية التراث القبطي العريق والأساليب الموسيقية الكورالية المعاصرة.",
      descEn: "Fusing the spiritual depth of ancient Coptic hymnology with refined contemporary choral orchestration.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-surface-canvas relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-burgundy-900 text-xs font-bold mb-4">
            <span>🕊️</span>
            <span>{isArabic ? "رسالة وروح الخدمة" : "Our Spiritual Mission"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-burgundy mb-6">
            {isArabic ? "ذبيحة تسبيح تُرفع بقلب واحد وصوت واحد" : "A Sacrifice of Praise with One Heart and Voice"}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed font-sans">
            {isArabic ? general.fullBioAr : general.fullBioEn}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gold-200/80 shadow-sm hover:shadow-md hover:border-gold transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center text-burgundy mb-5 group-hover:scale-110 group-hover:bg-burgundy group-hover:text-gold transition-all duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-burgundy mb-2">
                  {isArabic ? pillar.titleAr : pillar.titleEn}
                </h3>
                <p className="text-sm text-charcoal-muted leading-relaxed">
                  {isArabic ? pillar.descAr : pillar.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
