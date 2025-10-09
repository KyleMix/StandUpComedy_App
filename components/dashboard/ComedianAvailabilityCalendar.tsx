import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CalendarAvailabilityEntry, CalendarBookingEntry } from "@/lib/availability";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayState = "booked" | "available" | "busy" | "none";

type DayStateConfig = {
  label: string;
  className: string;
  indicatorClassName: string;
};

const STATE_META: Record<DayState, DayStateConfig> = {
  booked: {
    label: "Booked",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    indicatorClassName: "bg-rose-500"
  },
  available: {
    label: "Available",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    indicatorClassName: "bg-emerald-500"
  },
  busy: {
    label: "Unavailable",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    indicatorClassName: "bg-amber-500"
  },
  none: {
    label: "Add availability",
    className: "border-slate-200 bg-white text-slate-500",
    indicatorClassName: "bg-slate-300"
  }
};

interface ComedianAvailabilityCalendarProps {
  availability: CalendarAvailabilityEntry[];
  bookings: CalendarBookingEntry[];
  referenceDate?: Date;
}

export function ComedianAvailabilityCalendar({
  availability,
  bookings,
  referenceDate = new Date()
}: ComedianAvailabilityCalendarProps) {
  const monthStart = startOfMonth(referenceDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(endOfMonth(referenceDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const availabilityMap = new Map<string, CalendarAvailabilityEntry["status"]>();
  availability.forEach((entry) => {
    const key = format(entry.date, "yyyy-MM-dd");
    availabilityMap.set(key, entry.status);
  });

  const bookingMap = new Map<string, CalendarBookingEntry[]>();
  bookings.forEach((booking) => {
    const key = format(booking.date, "yyyy-MM-dd");
    const entries = bookingMap.get(key) ?? [];
    entries.push(booking);
    bookingMap.set(key, entries);
  });

  function getDayState(key: string): DayState {
    if (bookingMap.has(key)) {
      return "booked";
    }

    const status = availabilityMap.get(key);
    if (status === "busy") {
      return "busy";
    }
    if (status === "free") {
      return "available";
    }
    return "none";
  }

  return (
    <Card className="border-base-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-base-content">
          {format(referenceDate, "MMMM yyyy")} availability
        </CardTitle>
        <p className="text-xs text-base-content/60">
          Keep your calendar current so bookers know when to reach out. Confirmed gigs appear automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1 text-xs font-medium uppercase tracking-wide text-base-content/40">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="text-center">
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const state = getDayState(key);
            const meta = STATE_META[state];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentDay = isToday(day);
            const bookingsForDay = bookingMap.get(key) ?? [];
            const secondaryLabel =
              bookingsForDay.length > 0
                ? bookingsForDay[0].title ?? "Booked gig"
                : state === "available"
                ? "Open to book"
                : state === "busy"
                ? "Blocked"
                : "";

            return (
              <div
                key={key}
                className={cn(
                  "flex min-h-[82px] flex-col rounded-xl border p-2 transition",
                  meta.className,
                  !isCurrentMonth && "opacity-40",
                  isCurrentDay && "ring-2 ring-offset-2 ring-brand"
                )}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{format(day, "d")}</span>
                  <span className={cn("h-2 w-2 rounded-full", meta.indicatorClassName)} aria-hidden="true" />
                </div>
                <span className="mt-1 text-[11px] font-medium leading-4 text-base-content/70">{meta.label}</span>
                {secondaryLabel ? (
                  <span className="mt-auto line-clamp-2 text-[11px] text-base-content/60">{secondaryLabel}</span>
                ) : null}
                {bookingsForDay.length > 1 ? (
                  <span className="mt-1 text-[10px] font-medium text-base-content/50">
                    +{bookingsForDay.length - 1} more
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
          {Object.entries(STATE_META).map(([state, meta]) => (
            <span key={state} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", meta.indicatorClassName)} aria-hidden="true" />
              {meta.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
