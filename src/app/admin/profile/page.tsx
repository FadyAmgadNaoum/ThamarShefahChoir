"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Info,
  Layers,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { ChoirProfileData, defaultChoirProfile, MilestoneItem, GalleryItem } from "@/data/choir-profile";

export default function AdminProfileEditorPage() {
  const [activeTab, setActiveTab] = useState<"general" | "history" | "gallery" | "stats">("general");
  const [profile, setProfile] = useState<ChoirProfileData>(defaultChoirProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Milestone Form State (for adding/editing)
  const [editingMilestone, setEditingMilestone] = useState<MilestoneItem | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  // Gallery Form State (for adding/editing)
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data: any = await res.json();
        if (data?.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        showToast("تم حفظ وتحديث ملف الكورال بنجاح!", "success");
      } else {
        const err: any = await res.json();
        showToast(err?.error || "فشل في حفظ التعديلات", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بالخادم", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("هل أنت متأكد من استعادة القيم والمعلومات الافتراضية؟ سيتم استبدال التعديلات الحالية.")) {
      setProfile(defaultChoirProfile);
      showToast("تمت استعادة القيم الافتراضية، اضغط حفظ لتطبيقها", "success");
    }
  };

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // General Fields Handler
  const updateGeneral = (field: keyof ChoirProfileData["general"], value: string) => {
    setProfile((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  // Stats Fields Handler
  const updateStats = (field: keyof ChoirProfileData["stats"], value: string) => {
    setProfile((prev) => ({
      ...prev,
      stats: { ...prev.stats, [field]: value },
    }));
  };

  // Contact Fields Handler
  const updateContact = (field: keyof ChoirProfileData["contact"], value: string) => {
    setProfile((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  // Milestone Actions
  const openAddMilestone = () => {
    setEditingMilestone({
      id: `m_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      titleAr: "",
      titleEn: "",
      descAr: "",
      descEn: "",
      badgeAr: "محطة هامة",
      badgeEn: "Milestone",
    });
    setIsMilestoneModalOpen(true);
  };

  const openEditMilestone = (m: MilestoneItem) => {
    setEditingMilestone({ ...m });
    setIsMilestoneModalOpen(true);
  };

  const saveMilestone = () => {
    if (!editingMilestone || !editingMilestone.titleAr || !editingMilestone.year) {
      alert("يرجى ملء السنة وعنوان المحطة");
      return;
    }

    setProfile((prev) => {
      const exists = prev.history.some((m) => m.id === editingMilestone.id);
      const updated = exists
        ? prev.history.map((m) => (m.id === editingMilestone.id ? editingMilestone : m))
        : [...prev.history, editingMilestone];
      return { ...prev, history: updated };
    });

    setIsMilestoneModalOpen(false);
    setEditingMilestone(null);
    showToast("تم تحديث المحطة في القائمة (اضغط حفظ لاعتمادها)", "success");
  };

  const deleteMilestone = (id: string) => {
    if (confirm("هل تريد حذف هذه المحطة التاريخية؟")) {
      setProfile((prev) => ({
        ...prev,
        history: prev.history.filter((m) => m.id !== id),
      }));
      showToast("تم حذف المحطة (اضغط حفظ لاعتماد التغيير)", "success");
    }
  };

  const moveMilestone = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= profile.history.length) return;
    const items = [...profile.history];
    const [moved] = items.splice(index, 1);
    items.splice(newIdx, 0, moved);
    setProfile((prev) => ({ ...prev, history: items }));
  };

  // Gallery Actions
  const openAddPhoto = () => {
    setEditingPhoto({
      id: `g_${Date.now()}`,
      titleAr: "",
      titleEn: "",
      category: "cantatas",
      categoryAr: "كنتاتات وحفلات",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      date: new Date().getFullYear().toString(),
      captionAr: "",
      captionEn: "",
    });
    setIsPhotoModalOpen(true);
  };

  const savePhoto = () => {
    if (!editingPhoto || !editingPhoto.titleAr || !editingPhoto.imageUrl) {
      alert("يرجى ملء عنوان الصورة ورابطها");
      return;
    }

    // Set Arabic category label based on key
    const catMap: Record<string, string> = {
      cantatas: "كنتاتات وحفلات",
      rehearsals: "بروفات وتحضير",
      liturgy: "صلوات وطقوس",
      fellowship: "لقاءات وخدمة",
    };
    const finalPhoto = {
      ...editingPhoto,
      categoryAr: catMap[editingPhoto.category] || "عام",
    };

    setProfile((prev) => {
      const exists = prev.gallery.some((p) => p.id === finalPhoto.id);
      const updated = exists
        ? prev.gallery.map((p) => (p.id === finalPhoto.id ? finalPhoto : p))
        : [...prev.gallery, finalPhoto];
      return { ...prev, gallery: updated };
    });

    setIsPhotoModalOpen(false);
    setEditingPhoto(null);
    showToast("تم تحديث الصورة في المعرض (اضغط حفظ لاعتمادها)", "success");
  };

  const deletePhoto = (id: string) => {
    if (confirm("هل تريد حذف هذه الصورة من المعرض؟")) {
      setProfile((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((p) => p.id !== id),
      }));
      showToast("تم حذف الصورة (اضغط حفظ لاعتماد التغيير)", "success");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center text-charcoal">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold border-t-burgundy rounded-full animate-spin" />
          <p className="font-bold text-sm text-burgundy">جارٍ تحميل محتوى ملف الكورال...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal pb-24 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 start-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold animate-slide-down ${
            toastMessage.type === "success"
              ? "bg-green-800 text-white border border-green-600"
              : "bg-red-800 text-white border border-red-600"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-300" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-300" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Action Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-border/80 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold shadow-sm bg-white relative shrink-0"
            >
              <Image src="/images/logo.jpg" alt="Logo" fill className="object-contain p-0.5" />
            </Link>
            <div>
              <h1 className="text-xl font-display font-extrabold text-burgundy">
                لوحة تحرير وإدارة ملف الكورال (Choir CMS)
              </h1>
              <p className="text-xs text-charcoal-muted">
                تعديل وتخصيص كافة نصوص، صور، تاريخ وإحصائيات الصفحة الرئيسية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-charcoal text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة الموقع الحي</span>
            </Link>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors"
              title="استعادة القيم الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gold text-burgundy-950 font-extrabold text-sm shadow-md hover:bg-gold-300 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main CMS Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-surface-border mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "general"
                ? "bg-burgundy text-gold shadow-md shadow-burgundy/20"
                : "bg-white text-charcoal hover:bg-gold-50/60"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>البيانات العامة والتعريف</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "history"
                ? "bg-burgundy text-gold shadow-md shadow-burgundy/20"
                : "bg-white text-charcoal hover:bg-gold-50/60"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>تاريخ الكورال والمحطات ({profile.history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "gallery"
                ? "bg-burgundy text-gold shadow-md shadow-burgundy/20"
                : "bg-white text-charcoal hover:bg-gold-50/60"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>معرض الصور والذكريات ({profile.gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "stats"
                ? "bg-burgundy text-gold shadow-md shadow-burgundy/20"
                : "bg-white text-charcoal hover:bg-gold-50/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأرقام ومواعيد الخدمة</span>
          </button>
        </div>

        {/* TAB 1: General Info & Bio */}
        {activeTab === "general" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border/80 shadow-sm space-y-6">
            <div className="border-b border-surface-border pb-4">
              <h2 className="text-lg font-bold text-burgundy">البيانات التعريفية والروحية للكورال</h2>
              <p className="text-xs text-charcoal-muted">تعديل الاسم والشعار والآية ونشأة ورسالة الكورال</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">اسم الكورال (بالعربية)</label>
                <input
                  type="text"
                  value={profile.general.nameAr}
                  onChange={(e) => updateGeneral("nameAr", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Choir Name (English)</label>
                <input
                  type="text"
                  value={profile.general.nameEn}
                  onChange={(e) => updateGeneral("nameEn", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">الكنيسة والإيبارشية (بالعربية)</label>
                <input
                  type="text"
                  value={profile.general.churchAr}
                  onChange={(e) => updateGeneral("churchAr", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Church & Diocese (English)</label>
                <input
                  type="text"
                  value={profile.general.churchEn}
                  onChange={(e) => updateGeneral("churchEn", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">شعار الخدمة (بالعربية)</label>
                <input
                  type="text"
                  value={profile.general.mottoAr}
                  onChange={(e) => updateGeneral("mottoAr", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">سنة التأسيس</label>
                <input
                  type="text"
                  value={profile.general.foundationYear}
                  onChange={(e) => updateGeneral("foundationYear", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm font-mono"
                />
              </div>
            </div>

            {/* Verse */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">الآية الروحية الأساسية للكورال</label>
              <input
                type="text"
                value={profile.general.verseAr}
                onChange={(e) => updateGeneral("verseAr", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm"
              />
            </div>

            {/* Short Bio */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">النبذة الموجزة (Hero Subtitle)</label>
              <textarea
                rows={2}
                value={profile.general.shortBioAr}
                onChange={(e) => updateGeneral("shortBioAr", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm"
              />
            </div>

            {/* Full Bio */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">السيرة الكاملة ورسالة الكورال (About Section)</label>
              <textarea
                rows={5}
                value={profile.general.fullBioAr}
                onChange={(e) => updateGeneral("fullBioAr", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy focus:ring-1 focus:ring-burgundy outline-none text-sm leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 2: History & Milestones */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-burgundy">سجل محطات وتاريخ الكورال</h2>
                <p className="text-xs text-charcoal-muted">
                  إضافة وتعديل وترتيب المحطات والأعمال التاريخية والكنتاتات التي مرت على مسيرة الكورال
                </p>
              </div>

              <button
                onClick={openAddMilestone}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy text-gold font-bold text-xs shadow-md hover:bg-burgundy-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة محطة تاريخية جديدة</span>
              </button>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
              {profile.history.map((milestone, idx) => (
                <div
                  key={milestone.id}
                  className="bg-white rounded-2xl p-5 border border-surface-border/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gold-50 border border-gold-200 flex flex-col items-center justify-center text-burgundy shrink-0">
                      <span className="font-mono font-extrabold text-sm">{milestone.year}</span>
                      <span className="text-[9px] text-charcoal-muted">سنة</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-burgundy/10 text-burgundy text-[10px] font-bold">
                          {milestone.badgeAr}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-charcoal">{milestone.titleAr}</h3>
                      <p className="text-xs text-charcoal-muted mt-1 max-w-2xl line-clamp-2">
                        {milestone.descAr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => moveMilestone(idx, "up")}
                      disabled={idx === 0}
                      className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 disabled:opacity-20"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveMilestone(idx, "down")}
                      disabled={idx === profile.history.length - 1}
                      className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 disabled:opacity-20"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditMilestone(milestone)}
                      className="p-2 rounded-lg hover:bg-gold-50 text-gold-700"
                      title="تعديل المحطة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      title="حذف المحطة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Gallery Photos */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-burgundy">معرض صور الكورال والاحتفالات</h2>
                <p className="text-xs text-charcoal-muted">
                  إضافة صور الحفلات، البروفات، الكنتاتات، والمناسبات الكنسية المعروضة على الصفحة الرئيسية
                </p>
              </div>

              <button
                onClick={openAddPhoto}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy text-gold font-bold text-xs shadow-md hover:bg-burgundy-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صورة جديدة</span>
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profile.gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl overflow-hidden border border-surface-border/80 shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full bg-stone-100">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.titleAr}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 start-2 bg-black/60 text-gold text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                      {photo.categoryAr}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-charcoal">{photo.titleAr}</h4>
                      <p className="text-xs text-charcoal-muted font-mono mt-0.5">{photo.date}</p>
                      {photo.captionAr && (
                        <p className="text-[11px] text-charcoal-muted mt-1 line-clamp-2">
                          {photo.captionAr}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-xs flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Stats & Schedules */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border/80 shadow-sm space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h2 className="text-lg font-bold text-burgundy">الأرقام والإحصائيات ومواعيد الخدمة</h2>
                <p className="text-xs text-charcoal-muted">تعديل العدادات الرقمية ومواعيد البروفات والتواصل</p>
              </div>

              {/* 4 Counter Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">سنوات التسبيح</label>
                  <input
                    type="text"
                    value={profile.stats.years}
                    onChange={(e) => updateStats("years", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">عدد الأعضاء والخدام</label>
                  <input
                    type="text"
                    value={profile.stats.members}
                    onChange={(e) => updateStats("members", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">الترانيم والكنتاتات</label>
                  <input
                    type="text"
                    value={profile.stats.hymns}
                    onChange={(e) => updateStats("hymns", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">الاحتفالات والمهرجانات</label>
                  <input
                    type="text"
                    value={profile.stats.concerts}
                    onChange={(e) => updateStats("concerts", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none font-mono font-bold text-sm"
                  />
                </div>
              </div>

              {/* Contact and Schedules */}
              <div className="pt-4 border-t border-surface-border grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">عنوان الكنيسة والمقر</label>
                  <input
                    type="text"
                    value={profile.contact.addressAr}
                    onChange={(e) => updateContact("addressAr", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">مواعيد البروفات الدورية</label>
                  <input
                    type="text"
                    value={profile.contact.rehearsalTimesAr}
                    onChange={(e) => updateContact("rehearsalTimesAr", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">البريد الإلكتروني للخدمة</label>
                  <input
                    type="text"
                    value={profile.contact.email}
                    onChange={(e) => updateContact("email", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">رقم الهاتف للتواصل</label>
                  <input
                    type="text"
                    value={profile.contact.phone}
                    onChange={(e) => updateContact("phone", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-burgundy outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add/Edit Milestone */}
      {isMilestoneModalOpen && editingMilestone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-burgundy">
              {editingMilestone.id.startsWith("m_") ? "إضافة محطة تاريخية جديدة" : "تعديل المحطة التاريخية"}
            </h3>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">السنة / الفترة (مثل 2005 أو 2024 - 2026)</label>
              <input
                type="text"
                value={editingMilestone.year}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">عنوان المحطة (بالعربية)</label>
              <input
                type="text"
                value={editingMilestone.titleAr}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, titleAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                placeholder="مثال: تقديم أول كنتاتا كنسية ميلادية"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">وسام المحطة (Badge)</label>
              <input
                type="text"
                value={editingMilestone.badgeAr}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, badgeAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                placeholder="مثال: كنتاتا طقسية"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">التفاصيل والشرح</label>
              <textarea
                rows={3}
                value={editingMilestone.descAr}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, descAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                placeholder="شرح مختصر لما تم إنجازه في هذه المحطة..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveMilestone}
                className="px-5 py-2 rounded-xl bg-burgundy text-gold text-xs font-bold hover:bg-burgundy-hover"
              >
                حفظ في القائمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Photo */}
      {isPhotoModalOpen && editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-burgundy">إضافة صورة إلى المعرض</h3>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">رابط الصورة (Image URL)</label>
              <input
                type="text"
                value={editingPhoto.imageUrl}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, imageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">عنوان الصورة</label>
              <input
                type="text"
                value={editingPhoto.titleAr}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, titleAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                placeholder="مثال: احتفالية الكنتاتا السنوية"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">القسم / التصنيف</label>
                <select
                  value={editingPhoto.category}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                >
                  <option value="cantatas">كنتاتات وحفلات</option>
                  <option value="rehearsals">بروفات وتحضير</option>
                  <option value="liturgy">صلوات وطقوس</option>
                  <option value="fellowship">لقاءات وخدمة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">تاريخ أو سنة الصورة</label>
                <input
                  type="text"
                  value={editingPhoto.date}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  placeholder="مثال: يناير 2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">الوصف أو التعليق (اختياري)</label>
              <textarea
                rows={2}
                value={editingPhoto.captionAr || ""}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, captionAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                placeholder="تعليق قصير يوضح تفاصيل الصورة..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={savePhoto}
                className="px-5 py-2 rounded-xl bg-burgundy text-gold text-xs font-bold hover:bg-burgundy-hover"
              >
                إضافة للمعرض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
