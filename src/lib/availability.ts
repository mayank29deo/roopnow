// Availability model — derives per-day status for an artist.
//
// Rules (from client brief):
//   • Green  = whole day free
//   • Yellow = ≥1 active booking or artist-scheduled event that day
//   • Red    = date is explicitly blocked OR fully booked (≥ artist's
//             max_bookings_per_day on the artist row)
//
// Each artist controls their own "fully booked" threshold via the
// `max_bookings_per_day` column (Phase 1 addition). DEFAULT_FULL_DAY_LIMIT
// is the fallback when the threshold isn't supplied — kept at 3 for any
// legacy caller that hasn't been updated.

export const DEFAULT_FULL_DAY_LIMIT = 3;

export type DayStatus = "green" | "yellow" | "red";

export type AvailabilityInput = {
  // YYYY-MM-DD for all keys
  bookingsByDay: Record<string, number>;   // count of pending/accepted bookings
  eventsByDay: Record<string, number>;     // count of artist-scheduled events
  blockedDays: Set<string>;                // dates the artist explicitly blocked
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

// Given raw rows from Supabase, fold them into the aggregate shape used
// above. Pass the artist's max_bookings_per_day as `fullDayLimit` —
// when omitted, falls back to DEFAULT_FULL_DAY_LIMIT so legacy callers
// don't break.
export function buildAvailability(
  bookings: { date: string; status: string }[],
  events: { event_date: string }[],
  blocks: { blocked_date: string }[],
  fullDayLimit: number = DEFAULT_FULL_DAY_LIMIT,
): AvailabilityInput {
  const bookingsByDay: Record<string, number> = {};
  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "rejected") continue;
    const key = isoDay(b.date);
    bookingsByDay[key] = (bookingsByDay[key] ?? 0) + 1;
  }
  const eventsByDay: Record<string, number> = {};
  for (const e of events) {
    eventsByDay[e.event_date] = (eventsByDay[e.event_date] ?? 0) + 1;
  }
  const blockedDays = new Set(blocks.map((b) => b.blocked_date));
  return {
    bookingsByDay,
    eventsByDay,
    blockedDays,
    fullDayLimit: Math.max(1, fullDayLimit),
  };
}
