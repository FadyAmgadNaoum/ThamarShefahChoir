"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Music,
  Plus,
  Search,
  Play,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Bookmark,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RehearsalAudioPlayer, { ActiveAudioTrack } from "@/components/songs/RehearsalAudioPlayer";
import SheetMusicViewerModal from "@/components/songs/SheetMusicViewerModal";
import { SongItem, SONG_CATEGORY_LABELS, SongCategory } from "@/lib/songs/types";
import NavbarApple from "@/components/apple/NavbarApple";

const CATEGORIES = [
  { id: "ALL", label: "الكل" },
  { id: "GENERAL", label: "عام" },
  { id: "PASSION_WEEK", label: "أسبوع الآلام" },
  { id: "RESURRECTION", label: "عيد القيامة المجيد" },
  { id: "KOIAHK", label: "كيهك والتسبحة" },
  { id: "LENT", label: "الصوم الكبير" },
  { id: "NATIVITY", label: "الميلاد المجيد" },
  { id: "PRAISES", label: "تماجيد ومدائح" },
  { id: "FEASTS", label: "أعياد ومناسبات" },
  { id: "CANTATA", label: "كنتاتا" },
];

export default function MemberSongsPage() {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Audio Player State
  const [activeTrack, setActiveTrack] = useState<ActiveAudioTrack | null>(null);

  // Sheet Music Modal State
  const [activeSheet, setActiveSheet] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    fileName?: string | null;
  }>({ isOpen: false, title: "", url: "", fileName: null });

  // Expanded Lyrics & Harmony Drawer State
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  const [activeVoiceTab, setActiveVoiceTab] = useState<"soprano" | "alto" | "tenor" | "bass">("tenor");

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/songs", window.location.origin);
      if (selectedCategory !== "ALL") {
        url.searchParams.set("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        url.searchParams.set("search", searchQuery.trim());
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = (await res.json()) as { songs?: SongItem[] };
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Failed to load songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [selectedCategory, searchQuery]);

  const handlePlayAudio = (song: SongItem) => {
    if (!song.audioFileKey) return;
    setActiveTrack({
      songId: song.id,
      title: song.title,
      copticTitle: song.copticTitle,
      musicalKey: song.musicalKey,
      categoryLabel: song.categoryLabel,
      audioUrl: `/api/storage/file/${song.audioFileKey}`,
      audioFileName: song.audioFileName,
    });
  };

  const handleOpenSheet = (song: SongItem) => {
    if (!song.sheetMusicKey) return;
    setActiveSheet({
      isOpen: true,
      title: song.title,
      url: `/api/storage/file/${song.sheetMusicKey}`,
      fileName: song.sheetMusicName,
    });
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal pb-36 pt-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="mb-8 text-center sm:text-start flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold mb-3 shadow-2xs">
            <Music className="w-3.5 h-3.5 text-gold" />
            <span>أرشيف الترانيم والتسجيلات المعتمدة</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
            مكتبة ونوتات الكورال
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-xl">
            «أُسَبِّحُ الرَّبَّ فِي حَيَاتِي، وَأُرَنِّمُ لإِلهِي مَا دُمْتُ مَوْجُودًا» (مزمور 146: 2).
            استمع لتسجيلات البروفات وتصفح النوت الموسيقية وتوزيع الهارموني لكل صوت.
          </p>
        </div>

        {/* Quick Upload Action for Admins */}
        <Link
          href="/admin/songs"
          className="px-4 py-2.5 rounded-2xl bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>رفع وإدارة الترانيم (للمسؤولين)</span>
        </Link>
      </div>

      {/* Search and Category Filter Strip */}
      <div className="space-y-3 mb-8">
        {/* Search Bar */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث باسم الترنيمة، المقام، أو الكلمات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-11 pe-4 py-3 rounded-2xl bg-surface-card border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition-all shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-burgundy text-white shadow-xs"
                  : "bg-surface-card text-charcoal-muted hover:text-burgundy border border-surface-border hover:border-gold-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Songs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 rounded-3xl bg-surface-card/60 animate-pulse border border-surface-border"
            />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="apple-glass rounded-3xl p-12 text-center border border-surface-border my-8">
          <Music className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
          <h3 className="font-display font-bold text-base text-charcoal">
            لم نجد ترانيم مطابقة للبحث
          </h3>
          <p className="text-xs text-charcoal-muted mt-1">
            جرب اختيار تصنيف آخر أو مسح كلمة البحث الحالية.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => {
            const hasAudio = !!song.audioFileKey;
            const hasSheet = !!song.sheetMusicKey;
            const isPlayingThis = activeTrack?.songId === song.id;
            const isExpanded = expandedSongId === song.id;

            return (
              <motion.div
                key={song.id}
                layout
                className="apple-glass rounded-3xl p-4 sm:p-5 border border-surface-border hover:border-gold-300/80 transition-all duration-300 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-50 text-burgundy border border-gold-300">
                      {song.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {song.musicalKey && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-canvas border border-surface-border text-charcoal">
                          المقام: {song.musicalKey}
                        </span>
                      )}
                      {song.tempo && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-canvas border border-surface-border text-charcoal-muted hidden sm:inline">
                          {song.tempo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-display font-extrabold text-base text-charcoal tracking-tight">
                    {song.title}
                  </h3>
                  {song.copticTitle && (
                    <p className="text-xs text-charcoal-muted mt-0.5 font-medium">
                      {song.copticTitle}
                    </p>
                  )}

                  {/* Preview Lyrics or arrangement */}
                  {song.lyrics && (
                    <p className="text-xs text-charcoal-muted/80 mt-2 line-clamp-2 leading-relaxed font-sans">
                      {song.lyrics}
                    </p>
                  )}
                </div>

                {/* Actions & Expand Details */}
                <div className="mt-4 pt-3 border-t border-surface-border/60">
                  <div className="flex items-center justify-between gap-2">
                    {/* Media Actions */}
                    <div className="flex items-center gap-1.5">
                      {hasAudio && (
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(song)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                            isPlayingThis
                              ? "bg-gold-500 text-charcoal"
                              : "bg-burgundy text-white hover:bg-burgundy-dark"
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isPlayingThis ? "قيد التشغيل" : "استماع"}</span>
                        </button>
                      )}

                      {hasSheet && (
                        <button
                          type="button"
                          onClick={() => handleOpenSheet(song)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-gold-50 hover:bg-gold-100 text-burgundy border border-gold-300 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-gold" />
                          <span>النوتة</span>
                        </button>
                      )}
                    </div>

                    {/* Expand Lyrics & Harmony Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedSongId(isExpanded ? null : song.id)}
                      className="p-1.5 rounded-full hover:bg-surface-canvas text-charcoal-muted hover:text-burgundy transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      title={isExpanded ? "طي التفاصيل" : "عرض الكلمات والهارموني"}
                    >
                      <span className="text-[11px] font-bold">التفاصيل</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Harmony & Lyrics Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-surface-border text-start overflow-hidden"
                      >
                        {/* Tab Switcher: Lyrics vs Vocal Parts */}
                        <div className="space-y-2">
                          {song.lyrics && (
                            <div className="p-3 rounded-2xl bg-surface-canvas border border-surface-border">
                              <h5 className="font-bold text-[11px] text-burgundy mb-1 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-gold" />
                                <span>كلمات الترنيمة كاملة:</span>
                              </h5>
                              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line font-sans">
                                {song.lyrics}
                              </p>
                            </div>
                          )}

                          {/* Vocal Section Harmonies (Soprano, Alto, Tenor, Bass) */}
                          {song.voicePartNotes && (
                            <div className="p-3 rounded-2xl bg-gold-50/60 border border-gold-200">
                              <h5 className="font-bold text-[11px] text-burgundy mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3 text-gold" />
                                <span>ملاحظات توزيع الأصوات (Harmony):</span>
                              </h5>

                              {/* Voice Selector Tabs */}
                              <div className="grid grid-cols-4 gap-1 mb-2">
                                {(["soprano", "alto", "tenor", "bass"] as const).map((voice) => {
                                  const voiceNames: Record<string, string> = {
                                    soprano: "سوبرانو",
                                    alto: "ألتو",
                                    tenor: "تينور",
                                    bass: "باص",
                                  };
                                  const hasNotes = !!song.voicePartNotes?.[voice];
                                  return (
                                    <button
                                      key={voice}
                                      onClick={() => setActiveVoiceTab(voice)}
                                      className={`py-1 px-1 rounded-xl text-[10px] font-bold text-center transition-colors cursor-pointer ${
                                        activeVoiceTab === voice
                                          ? "bg-burgundy text-white"
                                          : hasNotes
                                          ? "bg-white text-burgundy border border-gold-300"
                                          : "bg-surface-canvas text-charcoal-muted opacity-60"
                                      }`}
                                    >
                                      {voiceNames[voice]}
                                    </button>
                                  );
                                })}
                              </div>

                              <p className="text-xs text-charcoal bg-white/80 p-2.5 rounded-xl border border-gold-200/80 leading-relaxed font-sans">
                                {song.voicePartNotes[activeVoiceTab] ||
                                  "لا توجد ملاحظات خاصة مسجلة لهذا الصوت في هذه الترنيمة."}
                              </p>
                            </div>
                          )}

                          {song.arrangementNotes && (
                            <p className="text-[11px] text-charcoal-muted italic px-1">
                              ملاحظات الهارموني: {song.arrangementNotes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Rehearsal Audio Player */}
      <RehearsalAudioPlayer
        track={activeTrack}
        onClose={() => setActiveTrack(null)}
      />

      {/* Sheet Music Modal */}
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
