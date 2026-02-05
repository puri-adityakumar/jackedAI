"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewDate.year, viewDate.month, 1);
    const lastDay = new Date(viewDate.year, viewDate.month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];

    // Padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }, [viewDate]);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(viewDate.year, viewDate.month)
  );

  const goToPrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const formatDateKey = (day: number) => {
    return `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={cn("bg-card rounded-xl border border-border p-4 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h3 className="font-semibold text-foreground" style={{ textWrap: "balance" }}>
          {monthName} {viewDate.year}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
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
                "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors",
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
    </div>
  );
}
