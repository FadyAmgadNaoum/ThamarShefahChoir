"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  ShieldCheck,
  Navigation,
  LogOut,
  Home,
  Sparkles,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";

interface RehearsalDetail {
  id: string;
  quarterId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  windowStatus: "NOT_STARTED" | "OPEN" | "CLOSED";
}

interface UserAttendance {
  id: string;
  rehearsalId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string | null;
  distanceMeters: number;
  status: string;
  meta: {
    labelAr: string;
    descriptionAr?: string;
    badgeClass: string;
    textClass: string;
  };
  notes?: string | null;
}

export default function RehearsalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rehearsalId = params?.rehearsalId as string;

  const [rehearsal, setRehearsal] = useState<RehearsalDetail | null>(null);
  const [attendance, setAttendance] = useState<UserAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rehearsalId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/rehearsals/${rehearsalId}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load");
        }
        const data = (await res.json()) as {
          rehearsal?: RehearsalDetail;
          userAttendance?: UserAttendance | null;
        };

        if (data.rehearsal) {
          setRehearsal(data.rehearsal);
        }
        if (data.userAttendance) {
          setAttendance(data.userAttendance);
        }
      } catch {
        setError("فشل تحميل بيانات وتفاصيل البروفة");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rehearsalId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !rehearsal) {
    return (
      <div className="min-h-screen bg-surface-canvas text-charcoal font-sans p-6 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
        <h2 className="text-lg font-bold text-burgundy mb-2">{error || "البروفة غير موجودة"}</h2>
        <Link
          href="/attendance"
          className="text-xs font-semibold text-charcoal hover:text-burgundy flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لجدول البروفات</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans pb-16">
      {/* Header */}
      <header className="bg-white border-b border-surface-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/attendance"
            className="flex items-center gap-2 text-xs font-semibold text-charcoal hover:text-burgundy transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>جدول البروفات</span>
          </Link>

          <Link href="/" className="relative w-8 h-8 rounded-full overflow-hidden border border-gold bg-white">
            <Image src="/images/logo.jpg" alt="شعار ثمر شفاه" fill className="object-contain p-0.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Rehearsal Card */}
        <div className="bg-white rounded-3xl border border-gold/30 shadow-md p-6 relative overflow-hidden">
          {/* Header pill */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-charcoal-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              {rehearsal.date}
            </span>

            {rehearsal.windowStatus === "OPEN" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                مفتوحة الآن
              </span>
            ) : rehearsal.windowStatus === "NOT_STARTED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                لم تبدأ بعد
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-100 text-charcoal-muted">
                مغلقة
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-xl text-burgundy mb-2">{rehearsal.title}</h1>

          <div className="space-y-2.5 text-xs text-charcoal-muted mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold shrink-0" />
              <span>
                من <strong>{formatTime12h(rehearsal.startTime)}</strong> إلى <strong>{formatTime12h(rehearsal.endTime)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>{rehearsal.locationName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-gold shrink-0" />
              <span className="font-mono">
                الإحداثيات: {rehearsal.latitude}, {rehearsal.longitude} (نطاق: {rehearsal.radiusMeters}م)
              </span>
            </div>
          </div>

          {/* Attendance Evidence Section */}
          <div className="pt-4 border-t border-surface-border">
            <h3 className="font-bold text-xs text-charcoal-muted uppercase mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              سجل وأدلة الحضور الخاصة بك (Evidence Record)
            </h3>

            {attendance ? (
              <div className="bg-surface-canvas rounded-2xl p-4 border border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-muted font-medium">الحالة المسجلة:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${attendance.meta.badgeClass}`}
                  >
                    {attendance.meta.labelAr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-surface-border">
                    <span className="text-charcoal-muted block text-[11px] mb-0.5">وقت تسجيل الحضور</span>
                    <strong className="font-mono text-burgundy text-sm">
                      {new Date(attendance.checkInTime).toLocaleTimeString("ar-EG")}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-surface-border">
                    <span className="text-charcoal-muted block text-[11px] mb-0.5">المسافة المحسوبة (Haversine)</span>
                    <strong className="font-mono text-emerald-700 text-sm">
                      {attendance.distanceMeters} متر
                    </strong>
                  </div>
                </div>

                {attendance.checkOutTime && (
                  <div className="bg-white p-3 rounded-xl border border-surface-border text-xs">
                    <span className="text-charcoal-muted block text-[11px] mb-0.5">وقت تسجيل الانصراف</span>
                    <strong className="font-mono text-charcoal">
                      {new Date(attendance.checkOutTime).toLocaleTimeString("ar-EG")}
                    </strong>
                  </div>
                )}

                <div className="text-[11px] text-charcoal-muted bg-white/60 p-2.5 rounded-xl border border-surface-border/60">
                  <span className="font-semibold block text-charcoal">ملاحظات التحقق:</span>
                  <span>{attendance.notes || "تم التحقق آلياً عبر خادم السحابة بدون تدخل يدوي."}</span>
                </div>
              </div>
            ) : (
              <div className="bg-surface-canvas rounded-2xl p-5 text-center space-y-3">
                <p className="text-xs text-charcoal-muted">
                  {rehearsal.windowStatus === "OPEN"
                    ? "لم تسجل حضورك لهذه البروفة بعد. نافذة التسجيل مفتوحة الآن!"
                    : rehearsal.windowStatus === "NOT_STARTED"
                    ? "لم يبدأ تسجيل الحضور بعد، يرجى التواجد في الكنيسة في الموعد المحدد."
                    : "لم يتم تسجيل حضورك لهذه البروفة، وتم إغلاق نافذة التسجيل."}
                </p>

                {rehearsal.windowStatus === "OPEN" && (
                  <Link
                    href="/attendance"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold bg-burgundy text-white hover:bg-burgundy-900 transition-colors shadow-xs"
                  >
                    <Radio className="w-4 h-4 text-gold" />
                    <span>الانتقال لشاشة تسجيل الحضور عبر GPS</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/attendance"
            className="text-xs font-semibold text-charcoal hover:text-burgundy transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لجدول البروفات وسجل الحضور</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

