"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Volume2, Sparkles, Sliders } from "lucide-react";

interface VocalPartData {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  rangeAr: string;
  harmonicDesc: string;
  color: string;
  bgGlow: string;
  barHeights: number[];
}

const VOCAL_PARTS: VocalPartData[] = [
  {
    id: "soprano",
    nameAr: "سوبرانو",
    nameEn: "Soprano",
    roleAr: "الطبقة النسائية الحادة — قمة البنيان اللحني والتطريب العلوي",
    rangeAr: "C4 - A5",
    harmonicDesc: "تحمل النغمة الأساسية وتقود ألحان التسبحة بأعلى درجات الصفاء والنقاء الروحي.",
    color: "#DCA40C",
    bgGlow: "rgba(220, 164, 12, 0.15)",
    barHeights: [35, 60, 95, 70, 85, 100, 65, 80, 50, 90, 75, 40],
  },
  {
    id: "alto",
    nameAr: "ألتو",
    nameEn: "Alto",
    roleAr: "الطبقة النسائية الغليظة — عمق التناغم والهارموني الداخلي",
    rangeAr: "F3 - D5",
    harmonicDesc: "تنسج الجمل الهارمونية الوسيطة وتمنح الترانيم امتلاءً دافئاً وهدوءاً تأملياً.",
    color: "#CE5A6B",
    bgGlow: "rgba(206, 90, 107, 0.15)",
    barHeights: [50, 75, 45, 80, 60, 70, 85, 65, 90, 55, 70, 45],
  },
  {
    id: "tenor",
    nameAr: "تينور",
    nameEn: "Tenor",
    roleAr: "الطبقة الرجالية الحادة — الطاقة والحماس والقيادة الصوتية",
    rangeAr: "C3 - A4",
    harmonicDesc: "تصدح بالنغمات المضيئة وتمنح الكورال قوته الدافعة في الألحان الفرايحية والأعياد.",
    color: "#640810",
    bgGlow: "rgba(100, 8, 16, 0.18)",
    barHeights: [40, 70, 85, 90, 60, 100, 80, 55, 75, 95, 65, 50],
  },
  {
    id: "bass",
    nameAr: "باص",
    nameEn: "Bass",
    roleAr: "الطبقة الرجالية الرخيمة — الأساس الإيقاعي وعمود الخيمة الصوتي",
    rangeAr: "E2 - E4",
    harmonicDesc: "القاعدة الصلبة والقرار المهيب الذي يرتكز عليه باقي الكورال بثبات ووقار كنسي.",
    color: "#4A070D",
    bgGlow: "rgba(74, 7, 13, 0.22)",
    barHeights: [85, 95, 70, 80, 100, 65, 90, 75, 60, 85, 50, 40],
  },
];

export default function SoundwaveVisualizer({ isArabic = true }: { isArabic?: boolean }) {
  const [activePart, setActivePart] = useState<string>("tenor");
  const selected = VOCAL_PARTS.find((p) => p.id === activePart) || VOCAL_PARTS[0];

  return (
    <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-surface-border/80 p-6 md:p-8 shadow-card overflow-hidden">
      {/* Ambient background glow */}
      <motion.div
        animate={{ backgroundColor: selected.bgGlow }}
        transition={{ duration: 0.6 }}
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-burgundy/10 text-burgundy flex items-center justify-center shadow-inner">
            <Volume2 className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-charcoal flex items-center gap-2">
              <span>{isArabic ? "الهارموني الصوتي الرباعي" : "4-Part Vocal Harmonic Stems"}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-burgundy border border-gold-300">
                {isArabic ? "أكوستيك كنسي" : "Church Acoustic"}
              </span>
            </h4>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {isArabic
                ? "توزيع احترافي لنغمات الكورال الأربعة بانسجام كنسي متوارث"
                : "Professional 4-part choir stems harmonized in sacred Coptic tradition"}
            </p>
          </div>
        </div>

        {/* Apple Segmented Control for Vocal Parts */}
        <div className="flex p-1 rounded-2xl bg-surface-canvas border border-surface-border/70 text-xs font-bold w-full sm:w-auto">
          {VOCAL_PARTS.map((part) => {
            const isSelected = part.id === activePart;
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => setActivePart(part.id)}
                className={`relative flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer select-none text-center ${
                  isSelected ? "text-burgundy font-extrabold" : "text-charcoal-muted hover:text-charcoal"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeVocalPill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-surface-border/60"
                  />
                )}
                <span className="relative z-10">{isArabic ? part.nameAr : part.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualizer Display & Bars */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* Animated Waveform Canvas Box */}
          <div className="bg-surface-canvas/90 rounded-2xl p-5 border border-surface-border/60 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Equalizer Bars */}
            <div className="w-full md:w-auto flex items-end justify-center gap-1.5 sm:gap-2 h-24 px-2">
              {selected.barHeights.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [`${Math.max(15, h * 0.4)}%`, `${h}%`, `${Math.max(20, h * 0.7)}%`],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.2 + (i % 4) * 0.25,
                    ease: "easeInOut",
                    delay: i * 0.08,
                  }}
                  style={{
                    backgroundColor: selected.color,
                  }}
                  className="w-2 sm:w-2.5 rounded-full shadow-xs transition-colors"
                />
              ))}
            </div>

            {/* Vocal Stem Metadata Badge */}
            <div className="flex-1 w-full md:w-auto text-start space-y-2">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: selected.color }}
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                />
                <span className="text-xs font-bold text-burgundy">
                  {isArabic ? "النطاق الصوتي:" : "Vocal Range:"}{" "}
                  <code className="text-charcoal bg-white px-2 py-0.5 rounded-md border border-surface-border">
                    {selected.rangeAr}
                  </code>
                </span>
              </div>
              <h5 className="font-bold text-sm text-charcoal">{selected.roleAr}</h5>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {selected.harmonicDesc}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

