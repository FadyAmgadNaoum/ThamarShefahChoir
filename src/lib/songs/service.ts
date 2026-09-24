import { getDb, schema } from "@/db";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { deleteFile } from "@/lib/storage/service";
export * from "./types";
import type { SongCategory, VocalPartNotes, SongItem } from "./types";
import { SONG_CATEGORY_LABELS } from "./types";

/**
 * List songs with optional category filter and full-text search
 */
export async function listSongs(params?: {
  category?: string;
  search?: string;
  activeOnly?: boolean;
}): Promise<SongItem[]> {
  const db = await getDb();
  const { category, search, activeOnly = true } = params || {};

  const conditions = [];

  if (activeOnly) {
    conditions.push(eq(schema.songs.isActive, true));
  }

  if (category && category !== "ALL") {
    conditions.push(eq(schema.songs.category, category as SongCategory));
  }

  if (search && search.trim().length > 0) {
    const q = `%${search.trim()}%`;
    conditions.push(
      or(
        like(schema.songs.title, q),
        like(schema.songs.copticTitle, q),
        like(schema.songs.lyrics, q),
        like(schema.songs.musicalKey, q)
      )
    );
  }

  let results;
  if (conditions.length === 1) {
    results = await db
      .select()
      .from(schema.songs)
      .where(conditions[0])
      .orderBy(desc(schema.songs.createdAt));
  } else if (conditions.length > 1) {
    results = await db
      .select()
      .from(schema.songs)
      .where(and(...conditions))
      .orderBy(desc(schema.songs.createdAt));
  } else {
    results = await db
      .select()
      .from(schema.songs)
      .orderBy(desc(schema.songs.createdAt));
  }

  return results.map((song) => {
    let parsedVocalNotes: VocalPartNotes | null = null;
    if (song.voicePartNotes) {
      try {
        parsedVocalNotes = JSON.parse(song.voicePartNotes);
      } catch {
        parsedVocalNotes = { soprano: song.voicePartNotes };
      }
    }

    return {
      id: song.id,
      title: song.title,
      copticTitle: song.copticTitle,
      musicalKey: song.musicalKey,
      tempo: song.tempo,
      category: song.category as SongCategory,
      categoryLabel: SONG_CATEGORY_LABELS[song.category as SongCategory] || song.category,
      lyrics: song.lyrics,
      audioFileKey: song.audioFileKey,
      audioFileName: song.audioFileName,
      audioFileSize: song.audioFileSize,
      audioDurationSeconds: song.audioDurationSeconds,
      sheetMusicKey: song.sheetMusicKey,
      sheetMusicName: song.sheetMusicName,
      sheetMusicSize: song.sheetMusicSize,
      voicePartNotes: parsedVocalNotes,
      arrangementNotes: song.arrangementNotes,
      isActive: song.isActive,
      createdById: song.createdById,
      createdByName: "إدارة الكورال",
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    };
  });
}

/**
 * Get single song by ID
 */
export async function getSongById(id: string): Promise<SongItem | null> {
  const db = await getDb();
  const results = await db
    .select()
    .from(schema.songs)
    .where(eq(schema.songs.id, id))
    .limit(1);

  if (results.length === 0) return null;

  const song = results[0];
  let parsedVocalNotes: VocalPartNotes | null = null;
  if (song.voicePartNotes) {
    try {
      parsedVocalNotes = JSON.parse(song.voicePartNotes);
    } catch {
      parsedVocalNotes = { soprano: song.voicePartNotes };
    }
  }

  return {
    id: song.id,
    title: song.title,
    copticTitle: song.copticTitle,
    musicalKey: song.musicalKey,
    tempo: song.tempo,
    category: song.category as SongCategory,
    categoryLabel: SONG_CATEGORY_LABELS[song.category as SongCategory] || song.category,
    lyrics: song.lyrics,
    audioFileKey: song.audioFileKey,
    audioFileName: song.audioFileName,
    audioFileSize: song.audioFileSize,
    audioDurationSeconds: song.audioDurationSeconds,
    sheetMusicKey: song.sheetMusicKey,
    sheetMusicName: song.sheetMusicName,
    sheetMusicSize: song.sheetMusicSize,
    voicePartNotes: parsedVocalNotes,
    arrangementNotes: song.arrangementNotes,
    isActive: song.isActive,
    createdById: song.createdById,
    createdByName: "إدارة الكورال",
    createdAt: song.createdAt,
    updatedAt: song.updatedAt,
  };
}

export interface CreateSongInput {
  title: string;
  copticTitle?: string | null;
  musicalKey?: string | null;
  tempo?: string | null;
  category: SongCategory;
  lyrics?: string | null;
  audioFileKey?: string | null;
  audioFileName?: string | null;
  audioFileSize?: number | null;
  audioDurationSeconds?: number | null;
  sheetMusicKey?: string | null;
  sheetMusicName?: string | null;
  sheetMusicSize?: number | null;
  voicePartNotes?: VocalPartNotes | null;
  arrangementNotes?: string | null;
  isActive?: boolean;
}

/**
 * Create a new choir song / hymn + log audit trail
 */
export async function createSong(input: CreateSongInput, actorId: string): Promise<SongItem> {
  const db = await getDb();
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    throw new Error("عنوان الترنيمة إلزامي");
  }

  const songId = `sng_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const serializedVocalNotes = input.voicePartNotes
    ? JSON.stringify(input.voicePartNotes)
    : null;

  const newSongRow = {
    id: songId,
    title: trimmedTitle,
    copticTitle: input.copticTitle?.trim() || null,
    musicalKey: input.musicalKey?.trim() || null,
    tempo: input.tempo?.trim() || null,
    category: input.category || "GENERAL",
    lyrics: input.lyrics?.trim() || null,
    audioFileKey: input.audioFileKey || null,
    audioFileName: input.audioFileName || null,
    audioFileSize: input.audioFileSize || null,
    audioDurationSeconds: input.audioDurationSeconds || null,
    sheetMusicKey: input.sheetMusicKey || null,
    sheetMusicName: input.sheetMusicName || null,
    sheetMusicSize: input.sheetMusicSize || null,
    voicePartNotes: serializedVocalNotes,
    arrangementNotes: input.arrangementNotes?.trim() || null,
    isActive: input.isActive ?? true,
    createdById: actorId,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.insert(schema.songs).values(newSongRow);

  // Audit trail
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    action: "SONG_CREATED",
    entity: "songs",
    entityId: songId,
    oldValue: null,
    newValue: JSON.stringify({
      title: trimmedTitle,
      category: input.category,
      musicalKey: input.musicalKey,
      hasAudio: !!input.audioFileKey,
      hasSheet: !!input.sheetMusicKey,
    }),
    reason: `إضافة ترنيمة جديدة للأرشيف: "${trimmedTitle}"`,
  });

  return (await getSongById(songId))!;
}

/**
 * Update an existing choir song + log audit trail
 */
export async function updateSong(
  id: string,
  input: Partial<CreateSongInput>,
  actorId: string
): Promise<SongItem> {
  const db = await getDb();
  const existing = await getSongById(id);
  if (!existing) {
    throw new Error("الترنيمة غير موجودة في الأرشيف");
  }

  const nowIso = new Date().toISOString();
  const updateData: any = { updatedAt: nowIso };

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.copticTitle !== undefined) updateData.copticTitle = input.copticTitle?.trim() || null;
  if (input.musicalKey !== undefined) updateData.musicalKey = input.musicalKey?.trim() || null;
  if (input.tempo !== undefined) updateData.tempo = input.tempo?.trim() || null;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.lyrics !== undefined) updateData.lyrics = input.lyrics?.trim() || null;
  if (input.audioFileKey !== undefined) updateData.audioFileKey = input.audioFileKey || null;
  if (input.audioFileName !== undefined) updateData.audioFileName = input.audioFileName || null;
  if (input.audioFileSize !== undefined) updateData.audioFileSize = input.audioFileSize || null;
  if (input.audioDurationSeconds !== undefined) updateData.audioDurationSeconds = input.audioDurationSeconds || null;
  if (input.sheetMusicKey !== undefined) updateData.sheetMusicKey = input.sheetMusicKey || null;
  if (input.sheetMusicName !== undefined) updateData.sheetMusicName = input.sheetMusicName || null;
  if (input.sheetMusicSize !== undefined) updateData.sheetMusicSize = input.sheetMusicSize || null;
  if (input.arrangementNotes !== undefined) updateData.arrangementNotes = input.arrangementNotes?.trim() || null;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.voicePartNotes !== undefined) {
    updateData.voicePartNotes = input.voicePartNotes ? JSON.stringify(input.voicePartNotes) : null;
  }

  await db.update(schema.songs).set(updateData).where(eq(schema.songs.id, id));

  // Audit trail
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    action: "SONG_UPDATED",
    entity: "songs",
    entityId: id,
    oldValue: JSON.stringify({ title: existing.title, category: existing.category, isActive: existing.isActive }),
    newValue: JSON.stringify(updateData),
    reason: `تحديث بيانات ترنيمة: "${existing.title}"`,
  });

  return (await getSongById(id))!;
}

/**
 * Delete a song + cleanup associated audio/sheet files
 */
export async function deleteSong(id: string, actorId: string): Promise<boolean> {
  const db = await getDb();
  const existing = await getSongById(id);
  if (!existing) {
    throw new Error("الترنيمة غير موجودة في الأرشيف");
  }

  // Cleanup files from storage if present
  if (existing.audioFileKey) {
    await deleteFile(existing.audioFileKey);
  }
  if (existing.sheetMusicKey) {
    await deleteFile(existing.sheetMusicKey);
  }

  await db.delete(schema.songs).where(eq(schema.songs.id, id));

  // Audit trail
  await db.insert(schema.auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    action: "SONG_DELETED",
    entity: "songs",
    entityId: id,
    oldValue: JSON.stringify({ title: existing.title, category: existing.category }),
    newValue: null,
    reason: `حذف ترنيمة نهائياً من الأرشيف: "${existing.title}"`,
  });

  return true;
}
