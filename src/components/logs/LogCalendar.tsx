"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarView = "week" | "month";

interface LogCalendarProps {
  datesWithLogs: Record<string, { count: number; color?: string }>;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function LogCalendar({
  datesWithLogs,
  selectedDate,
  onDateSelect,
  className,
}: LogCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Get the week containing the selected date (or today)
  const weekDays = useMemo(() => {
    const selected = selectedDate ? new Date(selectedDate) : new Date();
    const dayOfWeek = selected.getDay(); // 0 = Sunday
    const weekStart = new Date(selected);
    weekStart.setDate(selected.getDate() - dayOfWeek);

    const days: { day: number; month: number; year: number; dateKey: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), dateKey });
    }
    return days;
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewDate.year, viewDate.month, 1);
    const lastDay = new Date(viewDate.year, viewDate.month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }, [viewDate]);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(viewDate.year, viewDate.month)
  );

  // Week view: format the range label (e.g. "Feb 2 - 8, 2026")
  const weekLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      new Date(start.year, start.month)
    );
    const endMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      new Date(end.year, end.month)
    );

    if (start.month === end.month) {
      return `${startMonth} ${start.day} - ${end.day}, ${start.year}`;
    }
    return `${startMonth} ${start.day} - ${endMonth} ${end.day}, ${end.year}`;
  }, [weekDays]);

  const goToPrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const goToPrevWeek = () => {
    const selected = selectedDate ? new Date(selectedDate) : new Date();
    selected.setDate(selected.getDate() - 7);
    const dateKey = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
    onDateSelect(dateKey);
  };

  const goToNextWeek = () => {
    const selected = selectedDate ? new Date(selectedDate) : new Date();
    selected.setDate(selected.getDate() + 7);
    const dateKey = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
    onDateSelect(dateKey);
  };

  const formatDateKey = (day: number) => {
    return `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={cn("bg-card border border-border p-4", className)}>
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={view === "week" ? goToPrevWeek : goToPrevMonth}
            className="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={view === "week" ? "Previous week" : "Previous month"}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={view === "week" ? goToNextWeek : goToNextMonth}
            className="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={view === "week" ? "Next week" : "Next month"}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <h3 className="font-semibold text-sm text-foreground">
          {view === "week" ? weekLabel : `${monthName} ${viewDate.year}`}
        </h3>

        {/* View toggle */}
        <div className="flex items-center bg-muted p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setView("week")}
            className={cn(
              "p-1.5 transition-colors cursor-pointer",
              view === "week"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Week view"
            title="Week view"
          >
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={cn(
              "p-1.5 transition-colors cursor-pointer",
              view === "month"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Month view"
            title="Month view"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week view */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Week days">
          {weekDays.map(({ day, dateKey }) => {
            const hasLog = datesWithLogs[dateKey];
            const isSelected = dateKey === selectedDate;
            const isToday = dateKey === today;

            return (
              <button
                type="button"
                key={dateKey}
                onClick={() => onDateSelect(dateKey)}
                role="gridcell"
                className={cn(
                  "py-3 flex flex-col items-center justify-center text-sm transition-colors cursor-pointer",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isToday && !isSelected && "ring-1 ring-primary/50",
                  !isSelected && "text-foreground"
                )}
                aria-label={`${dateKey}${hasLog ? `, ${hasLog.count} entries` : ""}`}
                aria-pressed={isSelected}
              >
                <span className="tabular-nums">{day}</span>
                {hasLog && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-0.5",
                      isSelected ? "bg-primary-foreground" : hasLog.color || "bg-primary"
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Month view */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar days">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" role="gridcell" />;
            }

            const dateKey = formatDateKey(day);
            const hasLog = datesWithLogs[dateKey];
            const isSelected = dateKey === selectedDate;
            const isToday = dateKey === today;

            return (
              <button
                type="button"
                key={dateKey}
                onClick={() => onDateSelect(dateKey)}
                role="gridcell"
                className={cn(
                  "aspect-square flex flex-col items-center justify-center text-sm transition-colors cursor-pointer",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isToday && !isSelected && "ring-1 ring-primary/50",
                  !isSelected && "text-foreground"
                )}
                aria-label={`${dateKey}${hasLog ? `, ${hasLog.count} entries` : ""}`}
                aria-pressed={isSelected}
              >
                <span className="tabular-nums">{day}</span>
                {hasLog && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-0.5",
                      isSelected ? "bg-primary-foreground" : hasLog.color || "bg-primary"
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
