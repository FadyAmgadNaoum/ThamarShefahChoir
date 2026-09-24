"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  AlertCircle,
  Home,
  RefreshCw,
  LogOut,
  Calendar,
  Sparkles,
  Award,
  Navigation,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  ListFilter,
  UserX,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";
import ExcuseSubmissionModal from "@/components/excuses/ExcuseSubmissionModal";

interface ActiveRehearsal {
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

interface AttendanceRecord {
  id: string;
  rehearsalId: string;
  rehearsalTitle: string;
  rehearsalDate: string;
  rehearsalStartTime: string;
  checkInTime: string;
  checkOutTime?: string | null;
  distanceMeters: number;
  status: "PRESENT" | "LATE" | "VERY_LATE" | "EXTREME_LATE" | "ABSENT";
  meta: {
    labelAr: string;
    descriptionAr: string;
    badgeClass: string;
    textClass: string;
  };
}

interface CalendarRehearsalItem {
  id: string;
  quarterId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  radiusMeters: number;
  windowStatus: "NOT_STARTED" | "OPEN" | "CLOSED";
  colorIndicator: "GREEN" | "YELLOW" | "RED" | "BLUE" | "GRAY";
  statusLabel: string;
  userAttendance?: {
    checkInTime: string;
    distanceMeters: number;
    status: string;
  } | null;
}

export default function AttendancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CHECK_IN" | "CALENDAR">("CHECK_IN");
  const [activeRehearsal, setActiveRehearsal] = useState<ActiveRehearsal | null>(null);
  const [isOpenForCheckIn, setIsOpenForCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  // Device Geolocation state
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);

  // Today's attendance status for the current member
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [myHistory, setMyHistory] = useState<AttendanceRecord[]>([]);
  const [calendarRehearsals, setCalendarRehearsals] = useState<CalendarRehearsalItem[]>([]);

  // Simulation mode for testing in dev environments
  const [useSimulatedGps, setUseSimulatedGps] = useState(false);

  // Calculate distance on client for live visual preview
  const previewDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      // 1. Fetch active rehearsal
      const rRes = await fetch("/api/rehearsals/active");
      if (!rRes.ok) {
        if (rRes.status === 401) {
          router.push("/login");
          return;
        }
      }
      const rData = (await rRes.json()) as {
        rehearsal?: ActiveRehearsal | null;
        isOpenForCheckIn?: boolean;
      };

      if (rData.rehearsal) {
        setActiveRehearsal(rData.rehearsal);
        setIsOpenForCheckIn(Boolean(rData.isOpenForCheckIn));
      }

      // 2. Fetch user's attendance records
      const myRes = await fetch("/api/attendance/my");
      if (myRes.ok) {
        const myData = (await myRes.json()) as { records?: AttendanceRecord[] };
        const records = myData.records || [];
        setMyHistory(records);

        if (rData.rehearsal) {
          const match = records.find((r) => r.rehearsalId === rData.rehearsal?.id);
          if (match) {
            setTodayAttendance(match);
          }
        }
      }

      // 3. Fetch full calendar list
      const listRes = await fetch("/api/rehearsals/list");
      if (listRes.ok) {
        const listData = (await listRes.json()) as { rehearsals?: CalendarRehearsalItem[] };
        setCalendarRehearsals(listData.rehearsals || []);
      }
    } catch {
      setFeedback({ type: "error", text: "فشل تحديث البيانات، يرجى إعادة المحاولة" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Request browser GPS position
  const acquireLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("متصفحك لا يدعم خدمات الموقع الجغرافي (GPS)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng, accuracy: position.coords.accuracy });

        if (activeRehearsal) {
          const d = previewDistance(lat, lng, activeRehearsal.latitude, activeRehearsal.longitude);
          setCalculatedDistance(d);
        }
      },
      (error) => {
        let msg = "تعذر الحصول على إحداثيات موقعك";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "تم رفض إذن الوصول إلى الموقع. يرجى تفعيل الـ GPS من إعدادات المتصفح";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "إشارة الـ GPS غير متوفرة حالياً، يرجى المحاولة في مكان مفتوح";
        } else if (error.code === error.TIMEOUT) {
          msg = "انتهت مهلة تحديد الموقع الجغرافي";
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger GPS acquisition when active rehearsal is loaded
  useEffect(() => {
    if (activeRehearsal) {
      if (useSimulatedGps) {
        const lat = activeRehearsal.latitude + 0.0001;
        const lng = activeRehearsal.longitude + 0.0001;
        setCoords({ lat, lng, accuracy: 5 });
        setCalculatedDistance(18.5);
      } else {
        acquireLocation();
      }
    }
  }, [activeRehearsal, useSimulatedGps]);

  // Execute Check-in
  const handleCheckIn = async () => {
    if (!coords) {
      acquireLocation();
      setFeedback({ type: "error", text: "جاري تحديد موقعك الجغرافي، يرجى المحاولة مرة أخرى" });
      return;
    }

    if (!activeRehearsal) {
      setFeedback({ type: "error", text: "لا توجد بروفة مفتوحة حالياً" });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          rehearsalId: activeRehearsal.id,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        attendance?: AttendanceRecord;
        message?: string;
      };

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل تسجيل الحضور" });
        return;
      }

      setFeedback({ type: "success", text: data.message || "تم تسجيل الحضور بنجاح" });
      if (data.attendance) {
        setTodayAttendance(data.attendance);
      }
      await loadData();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ غير متوقع أثناء تسجيل الحضور" });
    } finally {
      setSubmitting(false);
    }
  };

  // Execute Check-out
  const handleCheckOut = async () => {
    if (!activeRehearsal) return;

    setCheckingOut(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rehearsalId: activeRehearsal.id }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string; message?: string };

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل تسجيل الانصراف" });
        return;
      }

      setFeedback({ type: "success", text: data.message || "تم تسجيل الانصراف بنجاح" });
      await loadData();
    } catch {
      setFeedback({ type: "error", text: "فشل تسجيل الانصراف" });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans">
      <main className="max-w-md mx-auto px-4 pt-24 pb-20 space-y-5">
        {/* Action Header Strip */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-gold" />
            <span>حضور البروفات والتحقق الجغرافي</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/excuses"
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-charcoal hover:text-burgundy bg-surface-card hover:bg-gold-50 border border-surface-border transition-colors flex items-center gap-1 shadow-2xs"
              title="سجل الأعذار"
            >
              <UserX className="w-3.5 h-3.5 text-burgundy" />
              <span>أعذاري</span>
            </Link>

            <button
              onClick={loadData}
              className="p-1.5 rounded-full text-charcoal-muted hover:text-burgundy bg-surface-card hover:bg-surface-canvas border border-surface-border transition-colors shadow-2xs cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-burgundy" : "text-gold"}`} />
            </button>
          </div>
        </div>
        {/* Navigation Tabs (Check-in vs Calendar) */}
        <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-surface-border shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("CHECK_IN")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "CHECK_IN"
                ? "bg-burgundy text-white shadow-xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>تسجيل الحضور اللحظي</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CALENDAR")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "CALENDAR"
                ? "bg-burgundy text-white shadow-xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>تقويم البروفات ({calendarRehearsals.length})</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between border animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : feedback.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-burgundy-50 text-burgundy-800 border-burgundy-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          </div>
        )}

        {/* TAB 1: LIVE GPS CHECK-IN */}
        {activeTab === "CHECK_IN" && (
          <>
            {/* GPS Simulation Switch for Dev/Testing */}
            <div className="bg-white border border-surface-border/80 rounded-2xl p-3 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-charcoal-muted">
                <Radio className="w-4 h-4 text-gold" />
                <span>محاكاة الحضور داخل الكنيسة (للتجربة)</span>
              </div>
              <button
                type="button"
                onClick={() => setUseSimulatedGps(!useSimulatedGps)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  useSimulatedGps
                    ? "bg-gold text-charcoal shadow-xs"
                    : "bg-surface-canvas text-charcoal-muted hover:bg-gray-200"
                }`}
              >
                {useSimulatedGps ? "مفعلة (18.5م)" : "GPS الحقيقي"}
              </button>
            </div>

            {/* Active Rehearsal Card */}
            {activeRehearsal ? (
              <div className="bg-white rounded-3xl border border-gold/30 shadow-md p-6 relative overflow-hidden">
                <div className="absolute -left-12 -bottom-12 w-44 h-44 opacity-5 pointer-events-none">
                  <Image src="/images/logo.jpg" alt="" fill className="object-contain" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-charcoal-muted font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    {activeRehearsal.date}
                  </span>

                  {isOpenForCheckIn ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      التسجيل مفتوح الآن
                    </span>
                  ) : activeRehearsal.windowStatus === "NOT_STARTED" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      تبدأ في {formatTime12h(activeRehearsal.startTime)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-100 text-charcoal-muted">
                      مغلقة
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-display font-black text-burgundy mb-2">
                  {activeRehearsal.title}
                </h2>

                <div className="space-y-2 text-xs text-charcoal-muted mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold shrink-0" />
                    <span>
                      من <strong>{formatTime12h(activeRehearsal.startTime)}</strong> إلى <strong>{formatTime12h(activeRehearsal.endTime)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    <span>{activeRehearsal.locationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                    <span>نطاق القبول المسموح: {activeRehearsal.radiusMeters} متر</span>
                  </div>
                </div>

                {/* Distance Meter */}
                <div className="bg-surface-canvas rounded-2xl p-4 border border-surface-border mb-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-charcoal-muted flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-burgundy" />
                      المسافة الحالية من قاعة الكورال:
                    </span>
                    {calculatedDistance !== null ? (
                      <span
                        className={`font-mono font-bold ${
                          calculatedDistance <= activeRehearsal.radiusMeters
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {calculatedDistance} متر
                      </span>
                    ) : (
                      <span className="text-charcoal-muted">جاري التحديد...</span>
                    )}
                  </div>

                  {calculatedDistance !== null && (
                    <div className="space-y-1.5">
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            calculatedDistance <= activeRehearsal.radiusMeters ? "bg-emerald-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (activeRehearsal.radiusMeters / Math.max(1, calculatedDistance)) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-center">
                        {calculatedDistance <= activeRehearsal.radiusMeters ? (
                          <span className="text-emerald-700 font-semibold">
                            ✅ أنت داخل النطاق الجغرافي لقاعة الكورال
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            ⚠️ أنت خارج النطاق (يلزم الاقتراب {Math.round(calculatedDistance - activeRehearsal.radiusMeters)}م إضافية)
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {geoError && (
                    <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {geoError}
                    </p>
                  )}
                </div>

                {/* State Card or Button */}
                {todayAttendance ? (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 text-sm">تم تسجيل حضورك بنجاح!</h3>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        الحالة: <strong>{todayAttendance.meta?.labelAr || todayAttendance.status}</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <div>
                        <span className="text-charcoal-muted block">وقت التسجيل</span>
                        <strong className="font-mono text-emerald-900">
                          {new Date(todayAttendance.checkInTime).toLocaleTimeString("ar-EG")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-charcoal-muted block">دليل المسافة</span>
                        <strong className="font-mono text-emerald-900">
                          {todayAttendance.distanceMeters} متر
                        </strong>
                      </div>
                    </div>

                    {todayAttendance.checkOutTime ? (
                      <p className="text-xs text-charcoal-muted pt-1">
                        تم تسجيل الانصراف في:{" "}
                        <strong>{new Date(todayAttendance.checkOutTime).toLocaleTimeString("ar-EG")}</strong>
                      </p>
                    ) : (
                      <button
                        onClick={handleCheckOut}
                        disabled={checkingOut}
                        className="w-full mt-2 py-2 px-4 rounded-xl text-xs font-semibold text-charcoal bg-white border border-surface-border hover:bg-surface-canvas hover:text-burgundy transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{checkingOut ? "جاري تسجيل الانصراف..." : "تسجيل الانصراف من البروفة"}</span>
                      </button>
                    )}

                    <div className="pt-2 border-t border-emerald-200/60">
                      <Link
                        href={`/attendance/${activeRehearsal.id}`}
                        className="text-xs text-emerald-800 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>عرض تفاصيل وسجل الأدلة بالكامل</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleCheckIn}
                      disabled={submitting || !isOpenForCheckIn}
                      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 ${
                        isOpenForCheckIn
                          ? "bg-burgundy text-white hover:bg-burgundy-900 active:scale-[0.98]"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Radio className={`w-5 h-5 text-gold ${submitting ? "animate-spin" : ""}`} />
                      <span>
                        {submitting
                          ? "جاري التحقق عبر السيرفر..."
                          : !isOpenForCheckIn
                          ? "نافذة الحضور غير مفتوحة حالياً"
                          : "سجل حضورك الآن عبر GPS"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsExcuseModalOpen(true)}
                      className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs bg-surface-canvas hover:bg-gold-50 text-charcoal hover:text-burgundy border border-surface-border transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserX className="w-4 h-4 text-burgundy" />
                      <span>تقديم عذر لهذه البروفة (غياب أو تأخير)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-surface-border p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-burgundy-50 text-burgundy rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-burgundy">لا توجد بروفة مجدولة حالياً</h3>
                <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                  سيظهر إشعار تسجيل الحضور فور اقتراب موعد البروفة القادمة المجدولة من قبل المشرفين.
                </p>
                <button
                  type="button"
                  onClick={() => setIsExcuseModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-burgundy bg-gold-50 hover:bg-gold-100 border border-gold-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>تقديم عذر بروفة قادمة</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB 2: REHEARSAL CALENDAR VIEW (Green, Yellow, Red, Blue indicators) */}
        {activeTab === "CALENDAR" && (
          <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <h3 className="font-display font-bold text-sm text-burgundy">تقويم البروفات وسجل الحضور</h3>
                <span className="text-[11px] text-charcoal-muted">
                  مؤشرات ملونة: أخضر (حاضر)، أصفر (متأخر)، أحمر (تأخير كبير/غياب)، أزرق (عذر)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExcuseModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-burgundy bg-gold-50 hover:bg-gold-100 border border-gold-300 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>تقديم عذر</span>
              </button>
            </div>

            {/* Indicator Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-canvas p-3 rounded-2xl border border-surface-border">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>أخضر: حاضر في ميعادك</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>أصفر: متأخر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>أحمر: تأخير حرج / غياب</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>أزرق: غياب بعذر مقبول</span>
              </div>
            </div>

            {/* List of Rehearsals */}
            {calendarRehearsals.length === 0 ? (
              <p className="text-xs text-charcoal-muted text-center py-6">
                لا توجد بروفات مجدولة في هذا الفصل حتى الآن.
              </p>
            ) : (
              <div className="divide-y divide-surface-border">
                {calendarRehearsals.map((r) => (
                  <Link
                    key={r.id}
                    href={`/attendance/${r.id}`}
                    className="py-3.5 flex items-center justify-between hover:bg-surface-canvas/60 px-2 rounded-xl transition-colors block"
                  >
                    <div className="flex items-start gap-3">
                      {/* Color indicator dot */}
                      <span
                        className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          r.colorIndicator === "GREEN"
                            ? "bg-emerald-500 ring-2 ring-emerald-200"
                            : r.colorIndicator === "YELLOW"
                            ? "bg-amber-500 ring-2 ring-amber-200"
                            : r.colorIndicator === "RED"
                            ? "bg-red-500 ring-2 ring-red-200"
                            : r.colorIndicator === "BLUE"
                            ? "bg-blue-500 ring-2 ring-blue-200"
                            : "bg-gray-300"
                        }`}
                      ></span>

                      <div>
                        <h4 className="font-bold text-xs text-charcoal">{r.title}</h4>
                        <div className="text-[11px] text-charcoal-muted flex items-center gap-2 mt-0.5">
                          <span>{r.date}</span>
                          <span>•</span>
                          <span>{formatTime12h(r.startTime)} - {formatTime12h(r.endTime)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.colorIndicator === "GREEN"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : r.colorIndicator === "YELLOW"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : r.colorIndicator === "RED"
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : r.colorIndicator === "BLUE"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {r.statusLabel}
                      </span>
                      <ChevronLeft className="w-4 h-4 text-charcoal-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reusable Excuse Submission Modal */}
      <ExcuseSubmissionModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        defaultRehearsalId={activeRehearsal?.id}
        onSuccess={loadData}
      />
    </div>
  );
}

