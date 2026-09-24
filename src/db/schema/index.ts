import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * USERS TABLE
 * Represents every user in the system.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] })
    .notNull()
    .default("PENDING"),
  voicePart: text("voice_part", { enum: ["SOPRANO", "ALTO", "TENOR", "BASS"] }),
  tier: text("tier", { enum: ["STUDENT", "WORKING", "OTHER"] }).default("WORKING"),
  profilePhotoUrl: text("profile_photo_url"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * ROLES & USER_ROLES
 * Composable roles (MEMBER, ADMIN, SUPER_ADMIN, SUBSCRIPTION_MANAGER)
 */
export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const userRoles = sqliteTable("user_roles", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  assignedAt: text("assigned_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  assignedBy: text("assigned_by"),
});

/**
 * QUARTERS (4-month operational cycles)
 */
export const quarters = sqliteTable("quarters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status", { enum: ["UPCOMING", "ACTIVE", "CLOSED"] })
    .notNull()
    .default("UPCOMING"),
  settingsJson: text("settings_json"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * REHEARSALS (Scheduled choir rehearsals with geofencing)
 */
export const rehearsals = sqliteTable("rehearsals", {
  id: text("id").primaryKey(),
  quarterId: text("quarter_id")
    .notNull()
    .references(() => quarters.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  locationName: text("location_name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radiusMeters: integer("radius_meters").notNull().default(100),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  quarterDateIdx: index("idx_rehearsals_quarter_date").on(table.quarterId, table.date),
}));

/**
 * ATTENDANCE (Server-authoritative attendance records with evidence)
 */
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  rehearsalId: text("rehearsal_id")
    .notNull()
    .references(() => rehearsals.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  checkInTime: text("check_in_time"),
  checkOutTime: text("check_out_time"),
  distanceMeters: real("distance_meters"),
  status: text("status", {
    enum: [
      "PRESENT",
      "LATE",
      "VERY_LATE",
      "EXTREME_LATE",
      "ABSENT",
      "EXCUSED_ABSENCE",
      "EARLY_LEAVE",
    ],
  }).notNull(),
  isManualAdjustment: integer("is_manual_adjustment", { mode: "boolean" })
    .notNull()
    .default(false),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userRehearsalIdx: index("idx_attendance_user_rehearsal").on(table.userId, table.rehearsalId),
  rehearsalStatusIdx: index("idx_attendance_rehearsal_status").on(table.rehearsalId, table.status),
}));

/**
 * EXCUSE REQUESTS (Advance absence or delay requests)
 */
export const excuseRequests = sqliteTable("excuse_requests", {
  id: text("id").primaryKey(),
  rehearsalId: text("rehearsal_id")
    .notNull()
    .references(() => rehearsals.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["ABSENCE", "DELAY"] }).notNull(),
  reason: text("reason").notNull(),
  expectedDelayMinutes: integer("expected_delay_minutes"),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] })
    .notNull()
    .default("PENDING"),
  reviewerNotes: text("reviewer_notes"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * POINT RULES (Configurable occurrence-based point rules)
 */
export const pointRules = sqliteTable("point_rules", {
  id: text("id").primaryKey(),
  quarterId: text("quarter_id")
    .notNull()
    .references(() => quarters.id, { onDelete: "cascade" }),
  ruleType: text("rule_type").notNull(),
  occurrenceStart: integer("occurrence_start").notNull().default(1),
  occurrenceEnd: integer("occurrence_end"),
  pointsDelta: integer("points_delta").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * POINT TRANSACTIONS (Immutable ledger of all points earned/deducted)
 */
export const pointTransactions = sqliteTable("point_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quarterId: text("quarter_id")
    .notNull()
    .references(() => quarters.id, { onDelete: "cascade" }),
  rehearsalId: text("rehearsal_id"),
  pointsDelta: integer("points_delta").notNull(),
  transactionType: text("transaction_type", {
    enum: ["AUTOMATIC", "MANUAL_BONUS", "MANUAL_DEDUCTION", "ADJUSTMENT"],
  }).notNull(),
  reason: text("reason").notNull(),
  createdBy: text("created_by"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userQuarterIdx: index("idx_point_transactions_user_quarter").on(table.userId, table.quarterId),
  quarterIdx: index("idx_point_transactions_quarter").on(table.quarterId),
}));

/**
 * SUBSCRIPTIONS (Monthly dues & FIFO payments)
 */
export const subscriptionCharges = sqliteTable("subscription_charges", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  monthYear: text("month_year").notNull(),
  amountDue: real("amount_due").notNull(),
  isWaived: integer("is_waived", { mode: "boolean" }).notNull().default(false),
  waivedReason: text("waived_reason"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userWaivedIdx: index("idx_subscription_charges_user_waived").on(table.userId, table.isWaived),
  monthYearIdx: index("idx_subscription_charges_month").on(table.monthYear),
}));

export const subscriptionPayments = sqliteTable("subscription_payments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chargeId: text("charge_id").references(() => subscriptionCharges.id, {
    onDelete: "set null",
  }),
  amountPaid: real("amount_paid").notNull(),
  paymentMethod: text("payment_method").default("CASH"),
  paymentDate: text("payment_date").notNull(),
  notes: text("notes"),
  recordedBy: text("recorded_by").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  chargeIdx: index("idx_subscription_payments_charge").on(table.chargeId),
  userDateIdx: index("idx_subscription_payments_user_date").on(table.userId, table.paymentDate),
}));

/**
 * AUDIT LOGS (Immutable security and operations trail)
 */
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  reason: text("reason"),
  timestamp: text("timestamp")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  actorActionIdx: index("idx_audit_logs_actor_action").on(table.actorId, table.action),
  timestampIdx: index("idx_audit_logs_timestamp").on(table.timestamp),
  entityIdx: index("idx_audit_logs_entity").on(table.entity, table.entityId),
}));

/**
 * SONGS & HYMN ARCHIVE (Rehearsal audio recordings & sheet music files)
 */
export const songs = sqliteTable("songs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  copticTitle: text("coptic_title"),
  musicalKey: text("musical_key"),
  tempo: text("tempo"),
  category: text("category").notNull().default("GENERAL"),
  lyrics: text("lyrics"),
  audioFileKey: text("audio_file_key"),
  audioFileName: text("audio_file_name"),
  audioFileSize: integer("audio_file_size"),
  audioDurationSeconds: integer("audio_duration_seconds"),
  sheetMusicKey: text("sheet_music_key"),
  sheetMusicName: text("sheet_music_name"),
  sheetMusicSize: integer("sheet_music_size"),
  voicePartNotes: text("voice_part_notes"), // JSON string { soprano?: string, alto?: string, tenor?: string, bass?: string }
  arrangementNotes: text("arrangement_notes"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  activeCategoryIdx: index("idx_songs_active_category").on(table.isActive, table.category),
}));

/**
 * SITE SETTINGS & CHOIR PROFILE CMS
 */
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by"),
});


