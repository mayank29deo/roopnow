// Availability model — derives per-day status for an artist.
//
// Rules (from client brief):
//   • Green  = whole day free
//   • Yellow = ≥1 active booking or artist-scheduled event that day
//   • Red    = date is explicitly blocked OR fully booked (≥ artist's
//             max_bookings_per_day on the artist row)
//
// 28-Jun iteration: the calendar redesign needs more than just a count
// per day — when a customer taps a yellow date the drawer shows the
// individual already-scheduled slots and the free windows in between.
// `slotsByDay` carries the per-day list; `availableWindows()` derives
// the gaps inside the business-hour envelope below.
//
// Each artist controls their own "fully booked" threshold via the
// `max_bookings_per_day` column (Phase 1 addition). DEFAULT_FULL_DAY_LIMIT
// is the fallback when the threshold isn't supplied — kept at 3 for any
// legacy caller that hasn't been updated.

export const DEFAULT_FULL_DAY_LIMIT = 3;

// Business hours envelope — used to derive "available windows" as
// gaps between already-scheduled slots. 24-Jun tracker discussion +
// 28-Jun mockup: 6 AM (early bridal prep) to 11 PM (late receptions).
export const BUSINESS_HOURS_START = "06:00";
export const BUSINESS_HOURS_END = "23:00";

// Don't surface a free window smaller than this — slivers between
// back-to-back bookings aren't useful to the customer.
const MIN_WINDOW_MINUTES = 60;

// Customer-side duration presets shown as chips next to the arrival
// time picker. Values are minutes. Full-day = 12 hrs per Suraksha's
// preference (28-Jun ask).
export const DURATION_PRESETS = [
  { label: "~3 hrs", minutes: 180 },
  { label: "~5 hrs", minutes: 300 },
  { label: "Full day", minutes: 720 },
] as const;

export type DayStatus = "green" | "yellow" | "red";

export type SlotKind = "confirmed" | "tentative" | "event";

export type ScheduledSlot = {
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
  kind: SlotKind;      // confirmed = accepted booking; tentative = pending; event = artist's own block
  label?: string;      // optional context, e.g. "Tentatively held"
};

export type AvailabilityInput = {
  // YYYY-MM-DD for all keys
  bookingsByDay: Record<string, number>;   // count of pending/accepted bookings
  eventsByDay: Record<string, number>;     // count of artist-scheduled events
  blockedDays: Set<string>;                // dates the artist explicitly blocked
  slotsByDay: Record<string, ScheduledSlot[]>; // 28-Jun: per-day slot ranges
  // 7-Jul item 8: reason the artist gave when explicitly blocking a
  // date. Surfaced on the customer picker when they tap a red date.
  blockedReasonByDay?: Record<string, string | null>;
  fullDayLimit: number;                    // artist's max_bookings_per_day
};

export function statusForDay(day: string, input: AvailabilityInput): DayStatus {
  if (input.blockedDays.has(day)) return "red";
  const occupied = (input.bookingsByDay[day] ?? 0) + (input.eventsByDay[day] ?? 0);
  if (occupied >= input.fullDayLimit) return "red";
  if (occupied >= 1) return "yellow";
  return "green";
}

export function isoDay(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isUnbookable(day: string, input: AvailabilityInput): boolean {
  return statusForDay(day, input) === "red";
}

// "HH:MM" → minutes-since-midnight. Defensive against bad input.
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function fromMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Human-readable rendering of "HH:MM" → "9:00 AM" / "5:30 PM".
export function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h)) return hhmm;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0
    ? `${h12}:00 ${ampm}`
    : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Slot range as a single string. e.g. "5:00 AM – 11:00 AM".
export function formatRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

export type AvailableWindow = {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  // Phrased so the UI can stack a sub-line: "11:30 AM onwards" / "After ~7:00 PM"
  label: string;
  subLabel: string;
};

// Derive free windows for a day by subtracting all scheduled slots
// from the business-hours envelope. Returns windows ≥ 60 min sorted
// by start time, with a label tuned to where in the day they sit.
export function availableWindows(day: string, input: AvailabilityInput): AvailableWindow[] {
  const slots = (input.slotsByDay[day] ?? [])
    .slice()
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const bizStart = toMinutes(BUSINESS_HOURS_START);
  const bizEnd = toMinutes(BUSINESS_HOURS_END);

  const windows: AvailableWindow[] = [];
  let cursor = bizStart;
  for (const s of slots) {
    const start = toMinutes(s.startTime);
    const end = toMinutes(s.endTime);
    if (start > cursor) {
      const dur = start - cursor;
      if (dur >= MIN_WINDOW_MINUTES) {
        windows.push({
          startTime: fromMinutes(cursor),
          endTime: fromMinutes(start),
          durationMinutes: dur,
          label: cursor === bizStart
            ? `Until ${formatTime(fromMinutes(start))}`
            : `${formatTime(fromMinutes(cursor))} onwards`,
          subLabel: cursor === bizStart
            ? "Before the first booking"
            : `Before the ${formatTime(s.startTime)} slot`,
        });
      }
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < bizEnd) {
    const dur = bizEnd - cursor;
    if (dur >= MIN_WINDOW_MINUTES) {
      windows.push({
        startTime: fromMinutes(cursor),
        endTime: fromMinutes(bizEnd),
        durationMinutes: dur,
        label: cursor === bizStart
          ? "Open all day"
          : `After ${formatTime(fromMinutes(cursor))}`,
        subLabel: cursor === bizStart
          ? "No bookings yet on this date"
          : "Evening / late night functions",
      });
    }
  }
  return windows;
}

// Given raw rows from Supabase, fold them into the aggregate shape used
// above. Pass the artist's max_bookings_per_day as `fullDayLimit` —
// when omitted, falls back to DEFAULT_FULL_DAY_LIMIT so legacy callers
// don't break.
//
// 28-Jun: bookings can now carry time_slot + duration_minutes + service
// duration, and events carry start_time + end_time. The richer shapes
// flow into slotsByDay; older callers passing minimal rows still work
// (slot ranges just stay empty for that day, which the UI handles).
export function buildAvailability(
  bookings: {
    date: string;
    status: string;
    time_slot?: string | null;
    duration_minutes?: number | null;
    services?: { duration?: number | null } | null;
  }[],
  events: {
    event_date: string;
    start_time?: string | null;
    end_time?: string | null;
  }[],
  blocks: { blocked_date: string; reason?: string | null }[],
  fullDayLimit: number = DEFAULT_FULL_DAY_LIMIT,
): AvailabilityInput {
  const bookingsByDay: Record<string, number> = {};
  const slotsByDay: Record<string, ScheduledSlot[]> = {};

  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "rejected") continue;
    const key = isoDay(b.date);
    bookingsByDay[key] = (bookingsByDay[key] ?? 0) + 1;

    if (b.time_slot) {
      const startMin = toMinutes(b.time_slot);
      const durMin = b.duration_minutes ?? b.services?.duration ?? 180;
      const endMin = startMin + durMin;
      const kind: SlotKind = b.status === "accepted" ? "confirmed" : "tentative";
      (slotsByDay[key] ??= []).push({
        startTime: b.time_slot,
        endTime: fromMinutes(endMin),
        kind,
        label: kind === "confirmed" ? "Confirmed booking" : "Tentatively held",
      });
    }
  }

  const eventsByDay: Record<string, number> = {};
  for (const e of events) {
    eventsByDay[e.event_date] = (eventsByDay[e.event_date] ?? 0) + 1;
    if (e.start_time && e.end_time) {
      (slotsByDay[e.event_date] ??= []).push({
        startTime: e.start_time.slice(0, 5),
        endTime: e.end_time.slice(0, 5),
        kind: "event",
        label: "Artist scheduled",
      });
    }
  }
  const blockedDays = new Set(blocks.map((b) => b.blocked_date));
  const blockedReasonByDay: Record<string, string | null> = {};
  for (const b of blocks) {
    blockedReasonByDay[b.blocked_date] = b.reason ?? null;
  }
  return {
    bookingsByDay,
    eventsByDay,
    blockedDays,
    blockedReasonByDay,
    slotsByDay,
    fullDayLimit: Math.max(1, fullDayLimit),
  };
}
