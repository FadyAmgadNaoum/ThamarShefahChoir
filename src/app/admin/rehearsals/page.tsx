"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Radio,
  CheckCircle2,
  Trash2,
  Home,
  RefreshCw,
  Users,
  Layers,
  X,
  Sparkles,
  Edit,
  Pencil,
  Map,
  Compass,
  Check,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";
import TimePicker12h from "@/components/attendance/TimePicker12h";
import MapLocationPicker from "@/components/attendance/MapLocationPicker";

interface RehearsalItem {
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
  createdAt: string;
}

interface QuarterItem {
  id: string;
  name: string;
  status: "UPCOMING" | "ACTIVE" | "CLOSED";
}

interface DefaultLocation {
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

const DEFAULT_CHURCH_LOCATION_KEY = "thamar_default_church_location";

const FALLBACK_CHURCH_LOCATION: DefaultLocation = {
  locationName: "مطرانية السيدة العذراء مريم بسوهاج — قاعة الكورال",
  latitude: 26.5565,
  longitude: 31.6958,
  radiusMeters: 100,
};

export default function AdminRehearsalsPage() {
  const router = useRouter();
  const [rehearsals, setRehearsals] = useState<RehearsalItem[]>([]);
  const [quarters, setQuarters] = useState<QuarterItem[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Default Church Location
  const [defaultLocation, setDefaultLocation] = useState<DefaultLocation>(FALLBACK_CHURCH_LOCATION);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [editingRehearsal, setEditingRehearsal] = useState<RehearsalItem | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    quarterId: "",
    title: "البروفة الأسبوعية الرسمية",
    date: new Date().toISOString().split("T")[0],
    startTime: "19:00", // 7:00 PM
    endTime: "22:00",   // 10:00 PM
    locationName: FALLBACK_CHURCH_LOCATION.locationName,
    latitude: FALLBACK_CHURCH_LOCATION.latitude,
    longitude: FALLBACK_CHURCH_LOCATION.longitude,
    radiusMeters: FALLBACK_CHURCH_LOCATION.radiusMeters,
  });

  // Load default church location from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_CHURCH_LOCATION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DefaultLocation;
        if (parsed.locationName && parsed.latitude && parsed.longitude) {
          setDefaultLocation(parsed);
          setFormData((prev) => ({
            ...prev,
            locationName: parsed.locationName,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            radiusMeters: parsed.radiusMeters || 100,
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Quarters
      const qRes = await fetch("/api/admin/quarters");
      if (!qRes.ok) {
        if (qRes.status === 403 || qRes.status === 401) {
          router.push("/login");
          return;
        }
      }
      const qData = (await qRes.json()) as { quarters?: QuarterItem[] };
      const qList = qData.quarters || [];
      setQuarters(qList);

      // Set default selected quarter to ACTIVE one if available
      const activeQ = qList.find((q) => q.status === "ACTIVE");
      if (activeQ && selectedQuarterId === "ALL") {
        setFormData((prev) => ({ ...prev, quarterId: activeQ.id }));
      } else if (qList.length > 0 && !formData.quarterId) {
        setFormData((prev) => ({ ...prev, quarterId: qList[0].id }));
      }

      // Fetch Rehearsals
      const rRes = await fetch("/api/admin/rehearsals");
      const rData = (await rRes.json()) as { rehearsals?: RehearsalItem[] };
      setRehearsals(rData.rehearsals || []);
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل بيانات البروفات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRehearsal(null);
    const activeQ = quarters.find((q) => q.status === "ACTIVE");
    setFormData({
      quarterId: activeQ ? activeQ.id : quarters[0]?.id || "",
      title: "البروفة الأسبوعية الرسمية",
      date: new Date().toISOString().split("T")[0],
      startTime: "19:00", // 7:00 PM
      endTime: "22:00",   // 10:00 PM
      locationName: defaultLocation.locationName,
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude,
      radiusMeters: defaultLocation.radiusMeters,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (reh: RehearsalItem) => {
    setEditingRehearsal(reh);
    setFormData({
      quarterId: reh.quarterId,
      title: reh.title,
      date: reh.date,
      startTime: reh.startTime,
      endTime: reh.endTime,
      locationName: reh.locationName,
      latitude: reh.latitude,
      longitude: reh.longitude,
      radiusMeters: reh.radiusMeters,
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSubmitRehearsal = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("submit");
    setFeedback(null);

    try {
      const isEditing = Boolean(editingRehearsal);
      const url = "/api/admin/rehearsals";
      const method = isEditing ? "PATCH" : "POST";
      const payload = isEditing
        ? { ...formData, rehearsalId: editingRehearsal!.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || (isEditing ? "فشل تعديل البروفة" : "فشل جدولة البروفة"),
        });
        return;
      }

      setFeedback({
        type: "success",
        text: data.message || (isEditing ? "تم تعديل بيانات البروفة بنجاح" : "تمت جدولة البروفة بنجاح"),
      });
      setIsModalOpen(false);
      setEditingRehearsal(null);
      await fetchData();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ غير متوقع" });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Rehearsal
  const handleDeleteRehearsal = async (rehearsalId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء هذه البروفة؟")) return;
    setActionLoading(rehearsalId);

    try {
      const res = await fetch(`/api/admin/rehearsals?rehearsalId=${rehearsalId}`, {
        method: "DELETE",
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل إلغاء البروفة" });
        return;
      }

      setFeedback({ type: "success", text: "تم إلغاء البروفة بنجاح" });
      await fetchData();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ أثناء إلغاء البروفة" });
    } finally {
      setActionLoading(null);
    }
  };

  // Location Selected from Map Picker
  const handleLocationPicked = (loc: {
    locationName: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    saveAsDefault?: boolean;
  }) => {
    setFormData((prev) => ({
      ...prev,
      locationName: loc.locationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      radiusMeters: loc.radiusMeters,
    }));

    if (loc.saveAsDefault) {
      const newDef: DefaultLocation = {
        locationName: loc.locationName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        radiusMeters: loc.radiusMeters,
      };
      setDefaultLocation(newDef);
      try {
        localStorage.setItem(DEFAULT_CHURCH_LOCATION_KEY, JSON.stringify(newDef));
      } catch {
        // ignore
      }
      setFeedback({
        type: "success",
        text: "تم تحديث وحفظ موقع الكنيسة الافتراضي بنجاح لجميع البروفات القادمة!",
      });
    }
  };

  const filtered = rehearsals.filter((r) => {
    if (selectedQuarterId === "ALL") return true;
    return r.quarterId === selectedQuarterId;
  });

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Page Title Strip */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold mb-2 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>إدارة وجدولة البروفات</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
              جدولة البروفات ونطاق الكنيسة الجغرافي
            </h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              مواعيد بنظام 12 ساعة • موقع الكنيسة الافتراضي • محرك التحقق الجغرافي (Geofence)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/excuses"
              className="px-3.5 py-2 rounded-2xl text-xs font-bold text-burgundy bg-gold-100/80 hover:bg-gold-200 border border-gold-300 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Inbox className="w-3.5 h-3.5 text-burgundy" />
              <span>صندوق الأعذار</span>
            </Link>
            <Link
              href="/admin/attendance"
              className="px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>متابعة الحضور المباشر</span>
            </Link>
          </div>
        </div>
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between border animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
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
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold hover:underline"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Default Church Location Banner */}
        <div className="bg-white border border-gold/30 rounded-3xl p-4 sm:p-5 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 text-burgundy flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-burgundy">
                  موقع الكنيسة الافتراضي الحالي:
                </h3>
                <span className="text-[10px] font-bold bg-gold/20 text-gold-900 px-2 py-0.5 rounded-md">
                  افتراضي لكل البروفات
                </span>
              </div>
              <p className="text-xs text-charcoal font-semibold mt-0.5">
                {defaultLocation.locationName}
              </p>
              <p className="text-[11px] text-charcoal-muted font-mono" dir="ltr">
                ({defaultLocation.latitude}, {defaultLocation.longitude}) • نطاق: {defaultLocation.radiusMeters}م
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMapPickerOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-burgundy bg-burgundy-50 hover:bg-burgundy-100 border border-burgundy/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Map className="w-3.5 h-3.5 text-gold-600" />
            <span>تعديل موقع الكنيسة الافتراضي على الخريطة</span>
          </button>
        </div>

        {/* Control Bar: Filter & Add Rehearsal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-charcoal">عرض بروفات:</label>
            <select
              value={selectedQuarterId}
              onChange={(e) => setSelectedQuarterId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-surface-border bg-white text-xs font-semibold text-charcoal focus:border-gold outline-none cursor-pointer shadow-xs"
            >
              <option value="ALL">جميع الفصول السنوية</option>
              {quarters.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name} {q.status === "ACTIVE" ? "(النشط حالياً)" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-burgundy hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة بروفة جديدة</span>
          </button>
        </div>

        {/* Rehearsals Grid */}
        {loading ? (
          <div className="py-20 text-center text-charcoal-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-600 mb-2" />
            <p className="text-xs">جاري تحميل جدول البروفات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-xs">
            <Calendar className="w-12 h-12 text-gold-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-charcoal mb-1">
              لا توجد بروفات مجدولة في هذا الفصل
            </h3>
            <p className="text-xs text-charcoal-muted mb-4">
              يمكنك جدولة بروفة جديدة بالموقع الافتراضي وتوقيت 12 ساعة (7:00 م - 10:00 م)
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-xs"
            >
              جدولة أول بروفة الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((reh) => {
              const isOpen = reh.windowStatus === "OPEN";
              const isNotStarted = reh.windowStatus === "NOT_STARTED";
              const isDeleting = actionLoading === reh.id;

              return (
                <div
                  key={reh.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-xs ${
                    isOpen
                      ? "border-2 border-emerald-500 ring-2 ring-emerald-100"
                      : "border-surface-border hover:border-gold"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Live Window Indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          isOpen
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold"
                            : isNotStarted
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-surface-canvas text-charcoal-muted border border-surface-border"
                        }`}
                      >
                        {isOpen ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                            <span>مفتوح لتسجيل الحضور الآن</span>
                          </>
                        ) : isNotStarted ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>بروفة قادمة</span>
                          </>
                        ) : (
                          <span>منتهية ومغلقة</span>
                        )}
                      </span>

                      <span className="text-[11px] text-charcoal-muted font-mono font-medium">
                        {reh.date}
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="font-bold text-lg text-burgundy font-display">
                        {reh.title}
                      </h3>
                      <div className="mt-2.5 space-y-1.5 text-xs text-charcoal-muted">
                        <p className="flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4 text-gold-600 shrink-0" />
                          <span className="text-charcoal font-semibold">
                            من {formatTime12h(reh.startTime)} إلى {formatTime12h(reh.endTime)}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-burgundy shrink-0" />
                          <span>{reh.locationName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Geofence info */}
                    <div className="p-3 rounded-2xl bg-surface-canvas border border-surface-border text-[11px] text-charcoal space-y-1">
                      <div className="flex items-center justify-between font-bold text-gold-800">
                        <span className="flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-gold-600" />
                          <span>نطاق القبول الجغرافي:</span>
                        </span>
                        <span>{reh.radiusMeters} متراً</span>
                      </div>
                      <p className="text-[10px] text-charcoal-muted font-mono" dir="ltr">
                        {reh.latitude.toFixed(4)}, {reh.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-5 border-t border-surface-border flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/attendance?rehearsalId=${reh.id}`}
                      className="text-xs text-burgundy font-semibold hover:underline flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>كشف الحضور</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(reh)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-gold-50 hover:text-burgundy border border-surface-border transition-colors flex items-center gap-1"
                        title="تعديل البروفة"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gold-600" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRehearsal(reh.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="إلغاء البروفة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Schedule / Edit Rehearsal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-border max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-5">
                <div>
                  <h3 className="font-bold text-lg text-burgundy font-display">
                    {editingRehearsal ? "تعديل بيانات البروفة المجدولة" : "جدولة بروفة جديدة"}
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    توقيت بنظام 12 ساعة (7:00 م) • تحديد الموقع الافتراضي أو الخريطة
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-canvas text-charcoal-muted hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRehearsal} className="space-y-4">
                {/* Quarter Select */}
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    الفصل السنوي (Quarter) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.quarterId}
                    onChange={(e) => setFormData({ ...formData, quarterId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none"
                  >
                    {quarters.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name} ({q.status === "ACTIVE" ? "نشط" : q.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    عنوان البروفة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: البروفة الأسبوعية - تسبيحة الأحد"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none"
                  />
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    تاريخ البروفة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none font-mono"
                  />
                </div>

                {/* 12-Hour Time Pickers (7:00 م to 10:00 م) */}
                <div className="bg-surface-canvas p-3.5 rounded-2xl border border-surface-border space-y-3.5">
                  <div className="flex items-center justify-between pb-1 border-b border-surface-border/60">
                    <span className="text-xs font-bold text-burgundy">
                      ميعاد البروفة (تنسيق 12 ساعة)
                    </span>
                    <span className="text-[11px] text-charcoal-muted">
                      من {formatTime12h(formData.startTime)} إلى {formatTime12h(formData.endTime)}
                    </span>
                  </div>

                  <TimePicker12h
                    label="وقت بدء البروفة"
                    value={formData.startTime}
                    onChange={(val24) => setFormData({ ...formData, startTime: val24 })}
                    required
                  />

                  <TimePicker12h
                    label="وقت انتهاء البروفة"
                    value={formData.endTime}
                    onChange={(val24) => setFormData({ ...formData, endTime: val24 })}
                    required
                  />
                </div>

                {/* Location Picker Section */}
                <div className="bg-surface-canvas p-3.5 rounded-2xl border border-surface-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-burgundy" />
                      <span>موقع البروفة ونطاق الـ GPS</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="text-xs font-bold text-burgundy hover:text-burgundy-hover bg-white px-3 py-1.5 rounded-xl border border-surface-border hover:border-gold shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Map className="w-3.5 h-3.5 text-gold-600" />
                      <span>تحديد ع الخريطة</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      placeholder="اسم الكنيسة / القاعة"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none"
                    />
                    <div className="flex items-center justify-between text-[11px] text-charcoal-muted px-1">
                      <span className="font-mono" dir="ltr">
                        {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                      </span>
                      <span>نطاق القبول: {formData.radiusMeters} متر</span>
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal hover:bg-surface-canvas transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "submit"}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-burgundy hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-gold" />
                    <span>
                      {actionLoading === "submit"
                        ? "جاري الحفظ..."
                        : editingRehearsal
                        ? "حفظ تعديلات البروفة"
                        : "تأكيد وجدولة البروفة"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Map Location Picker Modal */}
        <MapLocationPicker
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          onSelectLocation={handleLocationPicked}
          initialLocation={{
            locationName: formData.locationName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            radiusMeters: formData.radiusMeters,
          }}
        />
      </main>
    </div>
  );
}
