"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Eye, Calendar } from "lucide-react";
import { GalleryItem } from "@/data/choir-profile";

interface ChoirGalleryProps {
  gallery: GalleryItem[];
  isArabic: boolean;
}

export default function ChoirGallery({ gallery, isArabic }: ChoirGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const categories = [
    { key: "all", labelAr: "الكل", labelEn: "All" },
    { key: "cantatas", labelAr: "كنتاتات وحفلات", labelEn: "Cantatas & Concerts" },
    { key: "rehearsals", labelAr: "بروفات وتحضير", labelEn: "Rehearsals" },
    { key: "liturgy", labelAr: "صلوات وطقوس", labelEn: "Liturgical Chants" },
    { key: "fellowship", labelAr: "لقاءات وخدمة", labelEn: "Fellowship" },
  ];

  const filteredItems = selectedCategory === "all"
    ? gallery
    : gallery.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % filteredItems.length);
    }
  };

  const currentPhoto = activePhotoIndex !== null ? filteredItems[activePhotoIndex] : null;

  return (
    <section id="gallery" className="py-20 bg-surface-canvas relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-burgundy text-xs font-bold mb-4">
            <ImageIcon className="w-3.5 h-3.5 text-gold-600" />
            <span>{isArabic ? "أرشيف الذكريات والخدمة" : "Visual Archive"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-burgundy mb-4">
            {isArabic ? "معرض صور الحفلات والصلوات" : "Choir Photo Gallery"}
          </h2>
          <p className="text-charcoal-muted text-sm sm:text-base">
            {isArabic
              ? "لقطات وثائقية من احتفالات الكنتاتا، البروفات الصوتية، والصلوات الكنسية على مدار مسيرة الكورال."
              : "Documenting our cantatas, intensive voice rehearsals, and liturgical feasts through the years."}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === cat.key
                  ? "bg-burgundy text-gold shadow-md shadow-burgundy/20 scale-105"
                  : "bg-white text-charcoal border border-surface-border/80 hover:bg-gold-50/50"
              }`}
            >
              {isArabic ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => openLightbox(index)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-surface-border/80 shadow-sm hover:shadow-xl hover:border-gold-300 transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <Image
                  src={item.imageUrl}
                  alt={isArabic ? item.titleAr : item.titleEn}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-white bg-burgundy/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isArabic ? "عرض الصورة كاملة" : "View Photo"}</span>
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-charcoal-muted mb-1.5">
                    <span className="font-bold text-burgundy bg-gold-50 px-2 py-0.5 rounded">
                      {item.categoryAr}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-gold-600" />
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-charcoal group-hover:text-burgundy transition-colors line-clamp-1">
                    {isArabic ? item.titleAr : item.titleEn}
                  </h3>
                  {item.captionAr && (
                    <p className="text-xs text-charcoal-muted mt-1 line-clamp-2">
                      {isArabic ? item.captionAr : item.captionEn || item.captionAr}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if category has no photos */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gold-300">
            <ImageIcon className="w-12 h-12 text-gold-400 mx-auto mb-3" />
            <p className="text-charcoal-muted font-medium text-sm">
              {isArabic ? "لا توجد صور في هذا القسم حالياً" : "No photos available in this category"}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {currentPhoto && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Close photo preview"
            className="absolute top-6 end-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous / Next buttons */}
          <button
            onClick={prevPhoto}
            aria-label="Previous photo"
            className="absolute start-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={nextPhoto}
            aria-label="Next photo"
            className="absolute end-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden bg-stone-900 border border-gold/30 shadow-2xl"
          >
            <div className="relative w-full h-[60vh] bg-black">
              <Image
                src={currentPhoto.imageUrl}
                alt={isArabic ? currentPhoto.titleAr : currentPhoto.titleEn}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 sm:p-6 bg-stone-950 text-white flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-gold-300">
                <span>{currentPhoto.categoryAr}</span>
                <span className="font-mono">{currentPhoto.date}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {isArabic ? currentPhoto.titleAr : currentPhoto.titleEn}
              </h3>
              {currentPhoto.captionAr && (
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  {isArabic ? currentPhoto.captionAr : currentPhoto.captionEn || currentPhoto.captionAr}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
