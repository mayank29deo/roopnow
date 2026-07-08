"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  format,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { isoDay, statusForDay, type AvailabilityInput, type DayStatus } from "@/lib/availability";

type Props = {
  availability: AvailabilityInput;
  // When provided, highlights the currently-picked date.
  value?: Date | null;
  // When provided, the calendar is interactive (dashboard / booking drawer).
  onPick?: (date: Date) => void;
  // Minimum selectable date (defaults to today).
  min?: Date;
  compact?: boolean;
};

const dowLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function AvailabilityCalendar({ availability, value, onPick, min, compact }: Props) {
  const [cursor, setCursor] = useState<Date>(value ?? new Date());
  const minDay = startOfDay(min ?? new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  return (
    <div className={compact ? "text-xs" : "text-sm"}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-gold/50"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="font-display text-lg">{format(cursor, "MMMM yyyy")}</div>
        <button
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-gold/50"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1 text-[10px] tracking-widest text-ink-dim text-center">
        {dowLabels.map((d) => <div key={d}>{d}</div>)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={format(cursor, "yyyy-MM")}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((d) => {
            const key = isoDay(d);
            const status: DayStatus = statusForDay(key, availability);
            const inMonth = isSameMonth(d, cursor);
            const past = isBefore(d, minDay);
            const selected = value && isSameDay(d, value);
            // 7-Jul item 8: red dates are now tappable so the customer
            // can read the "why" panel below. Only past dates and
            // out-of-month days stay hard-disabled.
            const disabled = past || !inMonth;

            const color =
              status === "red"
                ? "bg-rose/15 text-rose border-rose/30"
                : status === "yellow"
                  ? "bg-amber/15 text-amber border-amber/30"
                  : "bg-emerald/10 text-emerald border-emerald/25";

            return (
              <button
                key={key}
                onClick={() => !disabled && onPick?.(d)}
                disabled={disabled}
                className={`aspect-square rounded-xl border transition-all flex items-center justify-center font-medium
                  ${!inMonth ? "opacity-20" : ""}
                  ${past && inMonth ? "opacity-30" : ""}
                  ${disabled ? "cursor-not-allowed" : "hover:scale-105 hover:shadow"}
                  ${selected ? "ring-2 ring-gold ring-offset-2 ring-offset-bg" : ""}
                  ${color}
                `}
                aria-label={`${format(d, "MMMM d, yyyy")} — ${status}`}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3 mt-5 text-[11px] text-ink-dim">
        <Legend color="emerald" label="Available" />
        <Legend color="amber" label="Partially booked" />
        <Legend color="rose" label="Unavailable" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: "emerald" | "amber" | "rose"; label: string }) {
  const cls =
    color === "emerald" ? "bg-emerald/30 border-emerald/50"
    : color === "amber" ? "bg-amber/30 border-amber/50"
    : "bg-rose/30 border-rose/50";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded border ${cls}`} />
      {label}
    </div>
  );
}
