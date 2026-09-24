import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { hashPassword } from "@/lib/auth/crypto";

export type CloudflareEnv = {
  DB: D1Database;
  STORAGE: R2Bucket;
  ENVIRONMENT?: string;
  CHOIR_NAME?: string;
  DEFAULT_LOCALE?: string;
};

let localDbInstance: ReturnType<typeof drizzleLibsql<typeof schema>> | null = null;
let isInitialized = false;

/**
 * Initialize schema tables and default roles/admin in local database
 */
export async function initLocalDb(client: ReturnType<typeof createClient>) {
  if (isInitialized) return;

  // Execute table creations
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING' NOT NULL,
      voice_part TEXT,
      tier TEXT DEFAULT 'WORKING',
      profile_photo_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      assigned_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      assigned_by TEXT,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quarters (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'UPCOMING' NOT NULL,
      settings_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rehearsals (
      id TEXT PRIMARY KEY NOT NULL,
      quarter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location_name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_meters INTEGER DEFAULT 100 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (quarter_id) REFERENCES quarters(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY NOT NULL,
      rehearsal_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      distance_meters REAL,
      status TEXT NOT NULL,
      is_manual_adjustment INTEGER DEFAULT 0 NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (rehearsal_id) REFERENCES rehearsals(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS excuse_requests (
      id TEXT PRIMARY KEY NOT NULL,
      rehearsal_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      expected_delay_minutes INTEGER,
      status TEXT DEFAULT 'PENDING' NOT NULL,
      reviewer_notes TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (rehearsal_id) REFERENCES rehearsals(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS point_rules (
      id TEXT PRIMARY KEY NOT NULL,
      quarter_id TEXT NOT NULL,
      rule_type TEXT NOT NULL,
      occurrence_start INTEGER DEFAULT 1 NOT NULL,
      occurrence_end INTEGER,
      points_delta INTEGER NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (quarter_id) REFERENCES quarters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS point_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      quarter_id TEXT NOT NULL,
      rehearsal_id TEXT,
      points_delta INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quarter_id) REFERENCES quarters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subscription_charges (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      month_year TEXT NOT NULL,
      amount_due REAL NOT NULL,
      is_waived INTEGER DEFAULT 0 NOT NULL,
      waived_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subscription_payments (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      charge_id TEXT,
      amount_paid REAL NOT NULL,
      payment_method TEXT DEFAULT 'CASH',
      payment_date TEXT NOT NULL,
      notes TEXT,
      recorded_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (charge_id) REFERENCES subscription_charges(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      reason TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      coptic_title TEXT,
      musical_key TEXT,
      tempo TEXT,
      category TEXT DEFAULT 'GENERAL' NOT NULL,
      lyrics TEXT,
      audio_file_key TEXT,
      audio_file_name TEXT,
      audio_file_size INTEGER,
      audio_duration_seconds INTEGER,
      sheet_music_key TEXT,
      sheet_music_name TEXT,
      sheet_music_size INTEGER,
      voice_part_notes TEXT,
      arrangement_notes TEXT,
      is_active INTEGER DEFAULT 1 NOT NULL,
      created_by_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- High Performance Compound Indexes for Cloudflare D1 & SQLite
    CREATE INDEX IF NOT EXISTS idx_rehearsals_quarter_date ON rehearsals(quarter_id, date);
    CREATE INDEX IF NOT EXISTS idx_attendance_user_rehearsal ON attendance(user_id, rehearsal_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_rehearsal_status ON attendance(rehearsal_id, status);
    CREATE INDEX IF NOT EXISTS idx_excuse_rehearsal_user ON excuse_requests(rehearsal_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_point_transactions_user_quarter ON point_transactions(user_id, quarter_id);
    CREATE INDEX IF NOT EXISTS idx_point_transactions_quarter ON point_transactions(quarter_id);
    CREATE INDEX IF NOT EXISTS idx_subscription_charges_user_waived ON subscription_charges(user_id, is_waived);
    CREATE INDEX IF NOT EXISTS idx_subscription_charges_month ON subscription_charges(month_year);
    CREATE INDEX IF NOT EXISTS idx_subscription_payments_charge ON subscription_payments(charge_id);
    CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_date ON subscription_payments(user_id, payment_date);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action ON audit_logs(actor_id, action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
    CREATE INDEX IF NOT EXISTS idx_songs_active_category ON songs(is_active, category);
  `);

  // Seed default 4 system roles
  const defaultRoles = [
    { id: "role_member", name: "MEMBER", description: "عضو / مرنم بالكورال" },
    { id: "role_admin", name: "ADMIN", description: "خادم إداري مسؤول عن البروفات والتنظيم" },
    { id: "role_super_admin", name: "SUPER_ADMIN", description: "المشرف العام وأعلى صلاحيات النظام" },
    { id: "role_sub_mgr", name: "SUBSCRIPTION_MANAGER", description: "أمين الصندوق ومسؤول الاشتراكات" },
  ];

  for (const r of defaultRoles) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)",
      args: [r.id, r.name, r.description],
    });
  }

  // Seed default Admin user for local testing if not exists
  const adminCheck = await client.execute({
    sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
    args: ["admin@thamar-shefah.org"],
  });

  if (adminCheck.rows.length === 0) {
    const adminId = "usr_super_admin";
    const passwordHash = await hashPassword("Admin123456!");
    await client.execute({
      sql: `INSERT INTO users (id, email, phone, full_name, password_hash, status, voice_part, tier)
            VALUES (?, ?, ?, ?, ?, 'APPROVED', 'TENOR', 'WORKING')`,
      args: [
        adminId,
        "admin@thamar-shefah.org",
        "01000000001",
        "المشرف العام (أدمن)",
        passwordHash,
      ],
    });

    // Assign all roles to Super Admin
    for (const r of defaultRoles) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)",
        args: [adminId, r.id, "SYSTEM_INIT"],
      });
    }
  }

  // Safe runtime schema migrations
  try {
    await client.execute("ALTER TABLE excuse_requests ADD COLUMN reviewer_notes TEXT");
  } catch {
    // Column already exists, safe to ignore
  }

  isInitialized = true;
}

/**
 * Get or create the active database client
 */
export async function getDb(d1?: D1Database) {
  if (d1) {
    return drizzleD1(d1, { schema });
  }

  if (!localDbInstance) {
    const client = createClient({
      url: process.env.DATABASE_URL || "file:local.db",
    });
    await initLocalDb(client);
    localDbInstance = drizzleLibsql(client, { schema });
  }

  return localDbInstance;
}

export { schema };
