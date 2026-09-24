"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Music, Play, Pause, ArrowLeft, ArrowRight, Disc3, Sparkles } from "lucide-react";
import { FeaturedHymnItem } from "@/data/choir-profile";

interface ChoirFeaturedHymnsProps {
  hymns: FeaturedHymnItem[];
  isArabic: boolean;
}

export default function ChoirFeaturedHymns({ hymns, isArabic }: ChoirFeaturedHymnsProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="hymns" className="py-20 bg-surface-canvas relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-burgundy text-xs font-bold mb-4">
              <Music className="w-3.5 h-3.5 text-gold-600" />
              <span>{isArabic ? "ترانيم وكنتاتات مختارة" : "Choir Repertoire"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-burgundy">
              {isArabic ? "باقة من ألحان وتسابيح ثمر شفاه" : "Selected Anthems & Cantatas"}
            </h2>
            <p className="text-charcoal-muted text-sm sm:text-base mt-2">
              {isArabic
                ? "مقتطفات من الكنتاتات الكنسية والألحان البوليفونية المسجلة لكورال ثمر شفاه."
                : "Highlights from our sacred polyphonic hymns and festive ecclesiastical cantatas."}
            </p>
          </div>

          <Link
            href="/songs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy text-gold font-bold text-sm shadow-md hover:bg-burgundy-hover transition-all self-start md:self-auto"
          >
            <span>{isArabic ? "تصفح مكتبة الترانيم الكاملة والنوت" : "Browse Full Hymn Archive"}</span>
            {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        {/* Hymns Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hymns.map((hymn) => {
            const isPlaying = playingId === hymn.id;
            return (
              <div
                key={hymn.id}
                className="bg-white rounded-2xl p-6 border border-surface-border/80 shadow-sm hover:shadow-md hover:border-gold-300 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePlay(hymn.id)}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isPlaying
                        ? "bg-burgundy text-gold scale-105 shadow-md shadow-burgundy/20"
                        : "bg-gold-50 text-burgundy group-hover:bg-burgundy group-hover:text-gold"
                    }`}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 animate-pulse" /> : <Play className="w-6 h-6 ms-0.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {hymn.isCantata && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-100 text-burgundy-900 border border-gold-300">
                          <Sparkles className="w-3 h-3 text-gold-600" />
                          <span>{isArabic ? "كنتاتا كنسية" : "Cantata"}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-charcoal-muted">
                        {isArabic ? hymn.categoryAr : hymn.categoryEn}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-burgundy group-hover:text-gold-700 transition-colors">
                      {isArabic ? hymn.titleAr : hymn.titleEn}
                    </h3>

                    {isPlaying && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-1 h-3 bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1 h-5 bg-burgundy animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1 h-2 bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                        <div className="w-1 h-4 bg-burgundy animate-bounce" style={{ animationDelay: "450ms" }} />
                        <span className="text-[10px] text-charcoal-muted ms-1">
                          {isArabic ? "جارٍ التشغيل التجريبي..." : "Playing preview..."}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-xs font-mono text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Disc3 className="w-3.5 h-3.5 text-gold-600" />
                    <span>{hymn.duration}</span>
                  </span>
                  <Link
                    href="/songs"
                    className="text-[11px] font-bold text-burgundy hover:underline"
                  >
                    {isArabic ? "عرض النوتة" : "Score"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
