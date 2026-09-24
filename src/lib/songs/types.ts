export type SongCategory =
  | "GENERAL"
  | "PASSION_WEEK"
  | "RESURRECTION"
  | "KOIAHK"
  | "LENT"
  | "NATIVITY"
  | "PRAISES"
  | "FEASTS"
  | "CANTATA";

export const SONG_CATEGORY_LABELS: Record<SongCategory, string> = {
  GENERAL: "عام",
  PASSION_WEEK: "أسبوع الآلام",
  RESURRECTION: "عيد القيامة المجيد",
  KOIAHK: "كيهك والتسبحة",
  LENT: "الصوم الكبير",
  NATIVITY: "الميلاد المجيد",
  PRAISES: "تماجيد ومدائح",
  FEASTS: "أعياد ومناسبات",
  CANTATA: "كنتاتا",
};

export interface VocalPartNotes {
  soprano?: string;
  alto?: string;
  tenor?: string;
  bass?: string;
}

export interface SongItem {
  id: string;
  title: string;
  copticTitle: string | null;
  musicalKey: string | null;
  tempo: string | null;
  category: SongCategory;
  categoryLabel: string;
  lyrics: string | null;
  audioFileKey: string | null;
  audioFileName: string | null;
  audioFileSize: number | null;
  audioDurationSeconds: number | null;
  sheetMusicKey: string | null;
  sheetMusicName: string | null;
  sheetMusicSize: number | null;
  voicePartNotes: VocalPartNotes | null;
  arrangementNotes: string | null;
  isActive: boolean;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

