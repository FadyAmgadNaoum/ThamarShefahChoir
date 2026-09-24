"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Music,
  Plus,
  Search,
  Upload,
  FileText,
  Trash2,
  Edit3,
  Play,
  Pause,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Volume2,
  Users,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SongItem, SONG_CATEGORY_LABELS, SongCategory } from "@/lib/songs/types";
import SheetMusicViewerModal from "@/components/songs/SheetMusicViewerModal";
import NavbarApple from "@/components/apple/NavbarApple";

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [copticTitle, setCopticTitle] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [tempo, setTempo] = useState("");
  const [category, setCategory] = useState<SongCategory>("GENERAL");
  const [lyrics, setLyrics] = useState("");
  const [arrangementNotes, setArrangementNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Vocal Part Notes
  const [sopranoNotes, setSopranoNotes] = useState("");
  const [altoNotes, setAltoNotes] = useState("");
  const [tenorNotes, setTenorNotes] = useState("");
  const [bassNotes, setBassNotes] = useState("");

  // Media Files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileKey, setAudioFileKey] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [sheetMusicKey, setSheetMusicKey] = useState<string | null>(null);
  const [sheetMusicName, setSheetMusicName] = useState<string | null>(null);
  const [uploadingSheet, setUploadingSheet] = useState(false);

  // Preview Player State
  const [previewTrack, setPreviewTrack] = useState<{ id: string; url: string } | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sheet Viewer Modal
  const [activeSheet, setActiveSheet] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    fileName?: string | null;
  }>({ isOpen: false, title: "", url: "", fileName: null });

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/songs", window.location.origin);
      if (selectedCategory !== "ALL") {
        url.searchParams.set("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        url.searchParams.set("search", searchQuery.trim());
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = (await res.json()) as any;
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Failed to load admin songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [selectedCategory, searchQuery]);

  const resetForm = () => {
    setEditingSong(null);
    setTitle("");
    setCopticTitle("");
    setMusicalKey("");
    setTempo("");
    setCategory("GENERAL");
    setLyrics("");
    setArrangementNotes("");
    setIsActive(true);
    setSopranoNotes("");
    setAltoNotes("");
    setTenorNotes("");
    setBassNotes("");
    setAudioFile(null);
    setAudioFileKey(null);
    setAudioFileName(null);
    setSheetFile(null);
    setSheetMusicKey(null);
    setSheetMusicName(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (song: SongItem) => {
    setEditingSong(song);
    setTitle(song.title);
    setCopticTitle(song.copticTitle || "");
    setMusicalKey(song.musicalKey || "");
    setTempo(song.tempo || "");
    setCategory(song.category);
    setLyrics(song.lyrics || "");
    setArrangementNotes(song.arrangementNotes || "");
    setIsActive(song.isActive);
    setSopranoNotes(song.voicePartNotes?.soprano || "");
    setAltoNotes(song.voicePartNotes?.alto || "");
    setTenorNotes(song.voicePartNotes?.tenor || "");
    setBassNotes(song.voicePartNotes?.bass || "");
    setAudioFileKey(song.audioFileKey);
    setAudioFileName(song.audioFileName);
    setSheetMusicKey(song.sheetMusicKey);
    setSheetMusicName(song.sheetMusicName);
    setIsModalOpen(true);
  };

  // Upload Audio Handler (Preserving Original Extension)
  const handleUploadAudio = async (file: File) => {
    try {
      setUploadingAudio(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "audio");

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "فشل رفع الملف الصوتي");

      setAudioFileKey(data.fileKey);
      setAudioFileName(data.fileName);
      setAudioFile(file);
      setFeedback({ type: "success", message: `تم رفع التسجيل الصوتي بنجاح (${data.fileName})` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUploadingAudio(false);
    }
  };

  // Upload Sheet Music Handler
  const handleUploadSheet = async (file: File) => {
    try {
      setUploadingSheet(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "sheet");

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "فشل رفع ملف النوتة");

      setSheetMusicKey(data.fileKey);
      setSheetMusicName(data.fileName);
      setSheetFile(file);
      setFeedback({ type: "success", message: `تم رفع النوتة الموسيقية بنجاح (${data.fileName})` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUploadingSheet(false);
    }
  };

  // Submit Song (Create or Update)
  const handleSubmitSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: "error", message: "يرجى كتابة عنوان الترنيمة" });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        copticTitle: copticTitle.trim() || null,
        musicalKey: musicalKey.trim() || null,
        tempo: tempo.trim() || null,
        category,
        lyrics: lyrics.trim() || null,
        arrangementNotes: arrangementNotes.trim() || null,
        isActive,
        audioFileKey,
        audioFileName,
        sheetMusicKey,
        sheetMusicName,
        voicePartNotes: {
          soprano: sopranoNotes.trim() || undefined,
          alto: altoNotes.trim() || undefined,
          tenor: tenorNotes.trim() || undefined,
          bass: bassNotes.trim() || undefined,
        },
      };

      const url = editingSong ? `/api/admin/songs/${editingSong.id}` : "/api/admin/songs";
      const method = editingSong ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "فشل حفظ الترنيمة");

      setFeedback({
        type: "success",
        message: editingSong ? "تم تحديث بيانات الترنيمة بنجاح" : "تمت إضافة الترنيمة الجديدة بنجاح",
      });
      setIsModalOpen(false);
      resetForm();
      fetchSongs();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Song Handler
  const handleDeleteSong = async (song: SongItem) => {
    if (!confirm(`هل أنت متأكد من حذف ترنيمة "${song.title}" نهائياً من الأرشيف؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/songs/${song.id}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "فشل حذف الترنيمة");

      setFeedback({ type: "success", message: `تم حذف ترنيمة "${song.title}" بنجاح` });
      fetchSongs();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (song: SongItem) => {
    try {
      const res = await fetch(`/api/admin/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !song.isActive }),
      });
      if (res.ok) {
        fetchSongs();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Toggle Preview Audio
  const togglePreviewAudio = (song: SongItem) => {
    if (!song.audioFileKey) return;
    const url = `/api/storage/file/${song.audioFileKey}`;

    if (previewTrack?.id === song.id) {
      if (previewAudioRef.current) {
        if (previewAudioRef.current.paused) {
          previewAudioRef.current.play();
        } else {
          previewAudioRef.current.pause();
          setPreviewTrack(null);
        }
      }
    } else {
      setPreviewTrack({ id: song.id, url });
      setTimeout(() => {
        if (previewAudioRef.current) {
          previewAudioRef.current.src = url;
          previewAudioRef.current.play();
        }
      }, 50);
    }
  };

  // Stats calculation
  const totalAudioCount = songs.filter((s) => s.audioFileKey).length;
  const totalSheetCount = songs.filter((s) => s.sheetMusicKey).length;
  const activeCount = songs.filter((s) => s.isActive).length;

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal pb-24 pt-24 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Hidden Audio Element for Previews */}
        <audio
          ref={previewAudioRef}
          onEnded={() => setPreviewTrack(null)}
          onError={() => setPreviewTrack(null)}
        />

        {/* Breadcrumbs & Direct Return Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/songs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-card hover:bg-gold-100/90 border border-surface-border hover:border-gold text-charcoal hover:text-burgundy text-xs font-bold transition-all shadow-2xs group cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-gold group-hover:-translate-x-1 transition-transform" />
            <span>العودة إلى مكتبة الترانيم</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-charcoal-muted font-medium">
            <Link href="/" className="hover:text-burgundy transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/songs" className="hover:text-burgundy transition-colors">
              الترانيم
            </Link>
            <span>/</span>
            <span className="text-burgundy font-bold">لوحة الإدارة</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold mb-3 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span>لوحة مسؤولي الكورال • الأرشيف والمكتبة</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
            إدارة الترانيم والنوت الموسيقية
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-xl">
            رفع التسجيلات الصوتية بجميع الامتدادات، وإرفاق نوتات الـ PDF، وتوثيق ملاحظات توزيع الأصوات (هارموني).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>إضافة ترنيمة جديدة</span>
        </button>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl mb-6 flex items-center justify-between border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-charcoal-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-surface-border shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-muted mb-2">
            <span className="text-xs font-bold">إجمالي الترانيم</span>
            <Music className="w-4 h-4 text-gold" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-charcoal">
            {songs.length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            {activeCount} ترنيمة نشطة
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-surface-border shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-muted mb-2">
            <span className="text-xs font-bold">التسجيلات الصوتية</span>
            <Volume2 className="w-4 h-4 text-burgundy" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-charcoal">
            {totalAudioCount}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1 font-semibold">
            بجميع الصيغ الأصلية
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-surface-border shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-muted mb-2">
            <span className="text-xs font-bold">نوتات الـ PDF</span>
            <FileText className="w-4 h-4 text-gold" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-charcoal">
            {totalSheetCount}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1 font-semibold">
            نوت ومخطوطات موسيقية
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-surface-border shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-muted mb-2">
            <span className="text-xs font-bold">الأقسام الكنسية</span>
            <Layers className="w-4 h-4 text-charcoal" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-charcoal">
            {Object.keys(SONG_CATEGORY_LABELS).length}
          </div>
          <div className="text-[11px] text-charcoal-muted mt-1 font-semibold">
            تصنيفات طقسية وعامة
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث باسم الترنيمة أو المقام..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-11 pe-4 py-2.5 rounded-2xl bg-surface-card border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition-all shadow-2xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-surface-card border border-surface-border text-xs sm:text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 shadow-2xs cursor-pointer"
        >
          <option value="ALL">جميع التصنيفات</option>
          {Object.entries(SONG_CATEGORY_LABELS).map(([catKey, catLabel]) => (
            <option key={catKey} value={catKey}>
              {catLabel}
            </option>
          ))}
        </select>
      </div>

      {/* Songs Table */}
      <div className="apple-glass rounded-3xl border border-surface-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-end text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-card/60 text-charcoal-muted font-bold text-[11px] uppercase">
                <th className="px-4 py-3.5 text-start">الترنيمة</th>
                <th className="px-4 py-3.5">المقام / الإيقاع</th>
                <th className="px-4 py-3.5">التصنيف</th>
                <th className="px-4 py-3.5 text-center">الملفات المرفقة</th>
                <th className="px-4 py-3.5 text-center">الحالة</th>
                <th className="px-4 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-charcoal-muted">
                    جاري تحميل الأرشيف...
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-charcoal-muted">
                    لا توجد ترانيم مسجلة في هذا التصنيف.
                  </td>
                </tr>
              ) : (
                songs.map((song) => {
                  const isPlayingThis = previewTrack?.id === song.id;
                  return (
                    <tr
                      key={song.id}
                      className="hover:bg-surface-canvas/50 transition-colors"
                    >
                      {/* Title & Subtitle */}
                      <td className="px-4 py-3.5 text-start">
                        <div className="font-display font-extrabold text-charcoal">
                          {song.title}
                        </div>
                        {song.copticTitle && (
                          <div className="text-[11px] text-charcoal-muted font-medium">
                            {song.copticTitle}
                          </div>
                        )}
                      </td>

                      {/* Musical Key & Tempo */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {song.musicalKey && (
                            <span className="px-2 py-0.5 rounded-full bg-gold-100 text-burgundy font-bold text-[10px] border border-gold-300">
                              {song.musicalKey}
                            </span>
                          )}
                          {song.tempo && (
                            <span className="text-[11px] text-charcoal-muted">
                              {song.tempo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-surface-card border border-surface-border text-charcoal text-[11px] font-bold">
                          {song.categoryLabel}
                        </span>
                      </td>

                      {/* Attached Media Links */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {song.audioFileKey ? (
                            <button
                              type="button"
                              onClick={() => togglePreviewAudio(song)}
                              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                isPlayingThis
                                  ? "bg-gold-400 text-charcoal font-bold"
                                  : "hover:bg-gold-50 text-burgundy"
                              }`}
                              title={isPlayingThis ? "إيقاف المعاينة" : "استماع للتسجيل"}
                            >
                              {isPlayingThis ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[11px] text-charcoal-muted opacity-40">
                              لا أوديو
                            </span>
                          )}

                          {song.sheetMusicKey && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveSheet({
                                  isOpen: true,
                                  title: song.title,
                                  url: `/api/storage/file/${song.sheetMusicKey}`,
                                  fileName: song.sheetMusicName,
                                })
                              }
                              className="p-1.5 rounded-full hover:bg-gold-50 text-burgundy transition-colors cursor-pointer"
                              title="معاينة النوتة الموسيقية"
                            >
                              <FileText className="w-4 h-4 text-gold" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Active Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(song)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            song.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-surface-card text-charcoal-muted border border-surface-border"
                          }`}
                        >
                          {song.isActive ? "نشطة 🟢" : "مؤرشفة ⚪"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(song)}
                            className="p-1.5 rounded-lg hover:bg-surface-border text-charcoal-muted hover:text-burgundy transition-colors cursor-pointer"
                            title="تعديل الترنيمة"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSong(song)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-muted hover:text-red-600 transition-colors cursor-pointer"
                            title="حذف الترنيمة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Song Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-card rounded-3xl border border-gold-300/80 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-canvas/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gold-100 flex items-center justify-center text-burgundy">
                    <Music className="w-4 h-4 text-burgundy" />
                  </div>
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-charcoal">
                    {editingSong ? "تعديل بيانات الترنيمة" : "إضافة ترنيمة جديدة للأرشيف"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-border text-charcoal-muted cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSubmitSong} className="p-6 overflow-y-auto space-y-4 text-start">
                {/* 1. Basic Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      اسم الترنيمة / اللحن *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: يا كنيسة قومي واشهدي"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      الاسم القبطي / العنوان الفرعي
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: Ti-ekklisia"
                      value={copticTitle}
                      onChange={(e) => setCopticTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      المقام / الطبقة الموسيقية
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: Dm أو كرد على الري"
                      value={musicalKey}
                      onChange={(e) => setMusicalKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      الميزان / الإيقاع
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 4/4 معتدل"
                      value={tempo}
                      onChange={(e) => setTempo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      المناسبة / القسم الطقسي
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SongCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs sm:text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/20 cursor-pointer"
                    >
                      {Object.entries(SONG_CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Media Upload Dropzones (Original Extension Preserved) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Audio Upload */}
                  <div className="p-3.5 rounded-2xl bg-surface-canvas border border-dashed border-surface-border">
                    <label className="block text-xs font-bold text-charcoal mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-burgundy" />
                        <span>تسجيل البروفة (صوت)</span>
                      </span>
                      <span className="text-[10px] text-charcoal-muted">جميع الصيغ مدعومة</span>
                    </label>

                    {audioFileName ? (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-gold-300 flex items-center justify-between text-xs">
                        <span className="truncate font-bold text-charcoal max-w-[180px]">
                          {audioFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAudioFileKey(null);
                            setAudioFileName(null);
                            setAudioFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          إزالة
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.opus,.midi,.caf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadAudio(f);
                          }}
                          disabled={uploadingAudio}
                          className="w-full text-xs text-charcoal-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-100 file:text-burgundy cursor-pointer"
                        />
                        {uploadingAudio && (
                          <p className="text-[11px] text-burgundy font-bold mt-1 animate-pulse">
                            جاري رفع التسجيل...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sheet Music Upload */}
                  <div className="p-3.5 rounded-2xl bg-surface-canvas border border-dashed border-surface-border">
                    <label className="block text-xs font-bold text-charcoal mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gold" />
                        <span>النوتة الموسيقية (PDF / صورة)</span>
                      </span>
                      <span className="text-[10px] text-charcoal-muted">PDF, PNG, JPG</span>
                    </label>

                    {sheetMusicName ? (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-gold-300 flex items-center justify-between text-xs">
                        <span className="truncate font-bold text-charcoal max-w-[180px]">
                          {sheetMusicName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSheetMusicKey(null);
                            setSheetMusicName(null);
                            setSheetFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          إزالة
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp,.mxl"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadSheet(f);
                          }}
                          disabled={uploadingSheet}
                          className="w-full text-xs text-charcoal-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-100 file:text-burgundy cursor-pointer"
                        />
                        {uploadingSheet && (
                          <p className="text-[11px] text-burgundy font-bold mt-1 animate-pulse">
                            جاري رفع النوتة...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Lyrics */}
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    كلمات الترنيمة
                  </label>
                  <textarea
                    rows={4}
                    placeholder="اكتب كلمات الترنيمة كاملة هنا مقسمة إلى قرارات وأعداد..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 font-sans"
                  />
                </div>

                {/* 4. Vocal Section Guidance (Harmony Notes) */}
                <div className="p-3.5 rounded-2xl bg-gold-50/70 border border-gold-200">
                  <h4 className="font-bold text-xs text-burgundy mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    <span>توزيع الهارموني وتعليمات الأصوات الأربعة</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-charcoal block mb-0.5">
                        سوبرانو (Soprano)
                      </span>
                      <input
                        type="text"
                        placeholder="اللحن الأساسي، دخول المازورة 4..."
                        value={sopranoNotes}
                        onChange={(e) => setSopranoNotes(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-surface-border text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-charcoal block mb-0.5">
                        ألتو (Alto)
                      </span>
                      <input
                        type="text"
                        placeholder="هارموني ثنائي، خط الكونترا..."
                        value={altoNotes}
                        onChange={(e) => setAltoNotes(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-surface-border text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-charcoal block mb-0.5">
                        تينور (Tenor)
                      </span>
                      <input
                        type="text"
                        placeholder="طبقة التينور، جواب القرار..."
                        value={tenorNotes}
                        onChange={(e) => setTenorNotes(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-surface-border text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-charcoal block mb-0.5">
                        باص (Bass)
                      </span>
                      <input
                        type="text"
                        placeholder="أساس الكورد والهارموني، النغمات العميقة..."
                        value={bassNotes}
                        onChange={(e) => setBassNotes(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-surface-border text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Active Status Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-burgundy focus:ring-burgundy/20"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs font-bold text-charcoal cursor-pointer">
                    نشر الترنيمة وجعلها مرئية فوراً لجميع أعضاء الكورال
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-muted hover:bg-surface-canvas transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    {submitting ? "جاري الحفظ..." : editingSong ? "حفظ التعديلات" : "إضافة الترنيمة"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sheet Music Viewer Modal */}
      <SheetMusicViewerModal
        isOpen={activeSheet.isOpen}
        onClose={() => setActiveSheet({ isOpen: false, title: "", url: "", fileName: null })}
        title={activeSheet.title}
        sheetMusicUrl={activeSheet.url}
        sheetMusicName={activeSheet.fileName}
      />
    </div>
  );
}
