"use client";

import React from "react";
import { X, Download, FileText, ExternalLink, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SheetMusicViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sheetMusicUrl: string;
  sheetMusicName?: string | null;
}

export default function SheetMusicViewerModal({
  isOpen,
  onClose,
  title,
  sheetMusicUrl,
  sheetMusicName,
}: SheetMusicViewerModalProps) {
  if (!isOpen) return null;

  const isImage =
    sheetMusicUrl.endsWith(".png") ||
    sheetMusicUrl.endsWith(".jpg") ||
    sheetMusicUrl.endsWith(".jpeg") ||
    sheetMusicUrl.endsWith(".webp");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl h-[88vh] bg-surface-card rounded-3xl border border-gold-300/70 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-canvas/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-100 border border-gold-300 flex items-center justify-center text-burgundy">
                <FileText className="w-5 h-5 text-burgundy" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-charcoal">
                  النوتة الموسيقية: {title}
                </h3>
                <p className="text-[11px] text-charcoal-muted">
                  {sheetMusicName || "ملف النوتة المعتمد للبروفات"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={sheetMusicUrl}
                download={sheetMusicName || `${title}-Sheet.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-gold-50 hover:bg-gold-100 text-burgundy border border-gold-300 transition-colors flex items-center gap-1.5"
                title="تحميل الملف"
              >
                <Download className="w-3.5 h-3.5 text-gold" />
                <span className="hidden sm:inline">تحميل النوتة</span>
              </a>

              <a
                href={sheetMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-surface-border text-charcoal-muted hover:text-burgundy transition-colors"
                title="فتح في نافذة مستقلة"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-border text-charcoal-muted hover:text-burgundy transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Viewer Body */}
          <div className="flex-1 bg-neutral-900/5 relative overflow-auto p-2 sm:p-4 flex items-center justify-center">
            {isImage ? (
              <img
                src={sheetMusicUrl}
                alt={`النوتة الموسيقية - ${title}`}
                className="max-h-full max-w-full object-contain rounded-xl shadow-md"
              />
            ) : (
              <iframe
                src={`${sheetMusicUrl}#toolbar=1&navpanes=0`}
                title={`نوتة ${title}`}
                className="w-full h-full rounded-2xl border border-surface-border bg-white"
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

