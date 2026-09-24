import { getDb, schema } from "@/db";
import { eq, desc, and, gte, lte, sql, like, or } from "drizzle-orm";

export type AuditAction =
  | "USER_APPROVED"
  | "USER_REJECTED"
  | "ROLE_ASSIGNED"
  | "REHEARSAL_CREATED"
  | "REHEARSAL_UPDATED"
  | "REHEARSAL_DELETED"
  | "CHECK_IN_RECORDED"
  | "ATTENDANCE_OVERRIDE"
  | "EXCUSE_SUBMITTED"
  | "EXCUSE_APPROVED"
  | "EXCUSE_REJECTED"
  | "POINTS_RULE_CREATED"
  | "POINTS_ADJUSTED"
  | "SUBSCRIPTIONS_GENERATED"
  | "PAYMENT_RECORDED"
  | "CHARGE_WAIVED"
  | "SONG_CREATED"
  | "SONG_UPDATED"
  | "SONG_DELETED"
  | "AI_IMPORT_EXECUTED";

export type AuditEntity =
  | "USER"
  | "ROLE"
  | "REHEARSAL"
  | "ATTENDANCE"
  | "EXCUSE"
  | "POINT_RULE"
  | "POINT_TRANSACTION"
  | "SUBSCRIPTION_CHARGE"
  | "SUBSCRIPTION_PAYMENT"
  | "SONG"
  | "SYSTEM";

export interface LogAuditEventParams {
  actorId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
}

/**
 * Log a security or administrative action to the immutable audit trail
 */
export async function logAuditEvent(params: LogAuditEventParams): Promise<void> {
  try {
    const db = await getDb();
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const oldValueStr =
      params.oldValue !== undefined
        ? typeof params.oldValue === "string"
          ? params.oldValue
          : JSON.stringify(params.oldValue)
        : null;

    const newValueStr =
      params.newValue !== undefined
        ? typeof params.newValue === "string"
          ? params.newValue
          : JSON.stringify(params.newValue)
        : null;

    await db.insert(schema.auditLogs).values({
      id,
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValue: oldValueStr,
      newValue: newValueStr,
      reason: params.reason || null,
    });
  } catch (error) {
    console.error("[AuditLog Error] Failed to write audit event:", error);
  }
}

export interface GetAuditLogsFilter {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  actorId?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  timestamp: string;
}

/**
 * Retrieve paginated audit logs with search, actor details, and filters
 */
export async function getAuditLogs(filter: GetAuditLogsFilter = {}) {
  const db = await getDb();
  const page = Math.max(1, filter.page || 1);
  const limit = Math.min(100, Math.max(1, filter.limit || 25));
  const offset = (page - 1) * limit;

  const usersList = await db.select().from(schema.users);
  const userMap = new Map(usersList.map((u) => [u.id, u]));

  let rawLogs = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp));

  if (filter.action && filter.action !== "ALL") {
    rawLogs = rawLogs.filter((l) => l.action === filter.action);
  }

  if (filter.entity && filter.entity !== "ALL") {
    rawLogs = rawLogs.filter((l) => l.entity === filter.entity);
  }

  if (filter.actorId) {
    rawLogs = rawLogs.filter((l) => l.actorId === filter.actorId);
  }

  if (filter.startDate) {
    rawLogs = rawLogs.filter((l) => l.timestamp >= filter.startDate!);
  }

  if (filter.endDate) {
    const endStr = `${filter.endDate} 23:59:59`;
    rawLogs = rawLogs.filter((l) => l.timestamp <= endStr);
  }

  if (filter.query && filter.query.trim()) {
    const q = filter.query.trim().toLowerCase();
    rawLogs = rawLogs.filter((l) => {
      const actor = userMap.get(l.actorId);
      const actorName = actor?.fullName?.toLowerCase() || "";
      const actorEmail = actor?.email?.toLowerCase() || "";
      return (
        (l.reason && l.reason.toLowerCase().includes(q)) ||
        l.entityId.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        actorName.includes(q) ||
        actorEmail.includes(q)
      );
    });
  }

  const total = rawLogs.length;
  const paginatedRows = rawLogs.slice(offset, offset + limit);

  const logs: AuditLogItem[] = paginatedRows.map((l) => {
    const actor = userMap.get(l.actorId);
    return {
      id: l.id,
      actorId: l.actorId,
      actorName: actor?.fullName || "نظام الكورال (System)",
      actorEmail: actor?.email || "system@thamar-shefah.org",
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      oldValue: l.oldValue,
      newValue: l.newValue,
      reason: l.reason,
      timestamp: l.timestamp,
    };
  });

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
