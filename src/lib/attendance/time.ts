/**
 * Time utility functions for 12-hour Egyptian Arabic format, 24-hour storage,
 * and automated rehearsal window derivation.
 */

/**
 * Formats a 24-hour time string (e.g. "19:00", "22:00") into a 12-hour Arabic string (e.g. "7:00 م", "10:00 م")
 */
export function formatTime12h(time24: string | undefined | null): string {
  if (!time24) return "";
  try {
    const parts = time24.split(":");
    if (parts.length < 2) return time24;
    let h = parseInt(parts[0], 10);
    const m = parts[1].padStart(2, "0");
    if (isNaN(h)) return time24;

    const period = h >= 12 ? "م" : "ص";
    h = h % 12;
    if (h === 0) h = 12;

    return `${h}:${m} ${period}`;
  } catch {
    return time24 || "";
  }
}

/**
 * Converts 12-hour components (hour: 1-12, minute: 0-59, period: "AM" | "PM") into "HH:MM" 24h
 */
export function to24hTime(hour12: number, minute: number, period: "AM" | "PM"): string {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Parses a 24-hour time string (e.g. "19:00") into 12-hour components ({ hour: 7, minute: 0, period: "PM" })
 */
export function parse12hTime(time24: string): { hour: number; minute: number; period: "AM" | "PM" } {
  const [hStr, mStr] = (time24 || "19:00").split(":");
  let h = parseInt(hStr, 10);
  if (isNaN(h)) h = 19;
  const m = parseInt(mStr, 10) || 0;

  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return { hour: h, minute: m, period };
}

/**
 * Calculates automated attendance window status mathematically derived from rehearsal schedule:
 * - NOT_STARTED: When current time < scheduled start time
 * - OPEN: When scheduled start time <= current time <= scheduled end time
 * - CLOSED: When current time > scheduled end time
 */
export function deriveWindowStatus(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string
): "NOT_STARTED" | "OPEN" | "CLOSED" {
  try {
    const now = new Date();
    // Parse Date and times in local time
    const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
    const [startH, startM] = startTimeStr.split(":").map((n) => parseInt(n, 10));
    const [endH, endM] = endTimeStr.split(":").map((n) => parseInt(n, 10));

    const startDate = new Date(year, month - 1, day, startH, startM, 0);
    const endDate = new Date(year, month - 1, day, endH, endM, 0);

    // If end time is earlier than start time, assume rehearsal ends next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    if (now < startDate) {
      return "NOT_STARTED";
    } else if (now >= startDate && now <= endDate) {
      return "OPEN";
    } else {
      return "CLOSED";
    }
  } catch {
    return "CLOSED";
  }
}

