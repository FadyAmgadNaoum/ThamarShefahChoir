"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  UserX,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Timer,
  Send,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";

interface RehearsalOption {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  windowStatus?: string;
}

interface ExcuseSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRehearsalId?: string;
  onSuccess?: () => void;
}

export default function ExcuseSubmissionModal({
  isOpen,
  onClose,
  defaultRehearsalId,
  onSuccess,
}: ExcuseSubmissionModalProps) {
  const [excuseType, setExcuseType] = useState<"ABSENCE" | "DELAY">("ABSENCE");
  const [rehearsals, setRehearsals] = useState<RehearsalOption[]>([]);
  const [selectedRehearsalId, setSelectedRehearsalId] = useState<string>(defaultRehearsalId || "");
  const [reason, setReason] = useState("");
  const [expectedDelayMinutes, setExpectedDelayMinutes] = useState<number>(30);
  const [customDelay, setCustomDelay] = useState<string>("");
  const [isCustomDelay, setIsCustomDelay] = useState<boolean>(false);

  const [loadingRehearsals, setLoadingRehearsals] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load upcoming rehearsals for selection
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchRehearsals = async () => {
      setLoadingRehearsals(true);
      setError(null);
      try {
        const res = await fetch("/api/rehearsals/list");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: any = await res.json();
        const items = (data.rehearsals || []) as RehearsalOption[];

        // Filter out rehearsals that have already closed/concluded in the past
        const now = new Date();
        const available = items.filter((r) => {
          const endDateTime = new Date(`${r.date}T${r.endTime}:00`);
          return endDateTime >= now;
        });

        if (isMounted) {
          setRehearsals(available);
          if (defaultRehearsalId && available.some((r) => r.id === defaultRehearsalId)) {
            setSelectedRehearsalId(defaultRehearsalId);
          } else if (available.length > 0) {
            setSelectedRehearsalId(available[0].id);
          }
        }
      } catch (e) {
        if (isMounted) {
          setError("تعذر تحميل قائمة البروفات القادمة، تأكد من اتصال الإنترنت");
        }
      } finally {
        if (isMounted) setLoadingRehearsals(false);
      }
    };

    fetchRehearsals();

    return () => {
      isMounted = false;
    };
  }, [isOpen, defaultRehearsalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRehearsalId) {
      setError("يرجى اختيار البروفة");
      return;
    }
    if (reason.trim().length < 5) {
      setError("يرجى كتابة سبب واضح للاستئذان (5 أحرف على الأقل)");
      return;
    }

    const finalDelay = isCustomDelay
      ? parseInt(customDelay, 10) || 15
      : expectedDelayMinutes;

    if (excuseType === "DELAY" && (!finalDelay || finalDelay <= 0)) {
      setError("يرجى تحديد مدة التأخير المتوقعة بالدقائق");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/excuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rehearsalId: selectedRehearsalId,
          type: excuseType,
          reason: reason.trim(),
          expectedDelayMinutes: excuseType === "DELAY" ? finalDelay : null,
        }),
      });

      const data: any = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل العذر");
      }

      setSuccessMsg(data.message || "تم تسجيل طلبك بنجاح");
      setTimeout(() => {
        setSuccessMsg(null);
        setReason("");
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تقديم العذر");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gold/40 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-burgundy text-gold flex items-center justify-center shadow-xs">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-burgundy">
                تقديم عذر أو إشعار تأخير
              </h3>
              <p className="text-[11px] text-charcoal-muted">
                خدمة كورال ثمر شفاه — سوهاج
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-canvas text-charcoal-muted hover:text-charcoal cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {/* Dual Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-surface-canvas p-1 rounded-2xl border border-surface-border">
            <button
              type="button"
              onClick={() => {
                setExcuseType("ABSENCE");
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                excuseType === "ABSENCE"
                  ? "bg-burgundy text-white shadow-xs"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>أعتذر عن الحضور (غياب)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExcuseType("DELAY");
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                excuseType === "DELAY"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>هتأخر عن البروفة (تأخير)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rehearsal Selection */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                اختر البروفة:
              </label>
              {loadingRehearsals ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-canvas text-xs text-charcoal-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-burgundy" />
                  <span>جاري تحميل البروفات القادمة...</span>
                </div>
              ) : rehearsals.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>لا توجد بروفات قادمة متاحة للاستئذان حالياً.</span>
                </div>
              ) : (
                <select
                  value={selectedRehearsalId}
                  onChange={(e) => setSelectedRehearsalId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs font-bold text-charcoal focus:border-gold focus:ring-2 focus:ring-gold/30 outline-none shadow-xs"
                >
                  {rehearsals.map((reh) => (
                    <option key={reh.id} value={reh.id}>
                      {reh.title} — {reh.date} ({formatTime12h(reh.startTime)}) — {reh.locationName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Delay-specific options */}
            {excuseType === "DELAY" && (
              <div className="space-y-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-amber-900">
                  مدة التأخير المتوقعة:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setExpectedDelayMinutes(mins);
                        setIsCustomDelay(false);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !isCustomDelay && expectedDelayMinutes === mins
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-white text-charcoal border border-amber-200 hover:bg-amber-100/50"
                      }`}
                    >
                      {mins} دقيقة
                    </button>
                  ))}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomDelay(true)}
                    className={`text-[11px] font-semibold underline cursor-pointer ${
                      isCustomDelay ? "text-amber-900 font-bold" : "text-charcoal-muted"
                    }`}
                  >
                    أو حدد مدة أخرى بالدقائق:
                  </button>
                  {isCustomDelay && (
                    <input
                      type="number"
                      min={5}
                      max={180}
                      step={5}
                      value={customDelay}
                      onChange={(e) => setCustomDelay(e.target.value)}
                      placeholder="مثال: 40"
                      className="w-24 px-2 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-charcoal outline-none"
                    />
                  )}
                </div>

                {/* Precedence Rule Notice */}
                <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-start gap-1.5 text-[11px] text-amber-800 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>تنبيه إداري:</strong> إشعار التأخير مخصص لإحاطة المشرفين علماً مسبقاً؛ ويتم احتساب فئة حضورك بدقة بناءً على توقيت تسجيل الـ GPS عند وصولك الفعلي للقاعة.
                  </span>
                </div>
              </div>
            )}

            {/* Reason Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  سبب {excuseType === "ABSENCE" ? "الاعتذار" : "التأخير"}:
                </label>
                <span className="text-[10px] text-charcoal-muted">
                  {reason.length} حرف (الحد الأدنى 5)
                </span>
              </div>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  excuseType === "ABSENCE"
                    ? "وضح سبب عدم التمكن من الحضور (ظرف صحي، سفر، دراسة، إلخ)..."
                    : "وضح سبب التأخير المتوقع وموعد وصولك التقريبي..."
                }
                className="w-full px-3 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs text-charcoal focus:border-gold focus:ring-2 focus:ring-gold/30 outline-none resize-none shadow-xs"
              />
            </div>

            {/* Feedback messages */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-surface-border">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal hover:bg-surface-canvas transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={submitting || rehearsals.length === 0 || reason.trim().length < 5}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-gold" />
                    <span>إرسال الطلب للمشرفين</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
