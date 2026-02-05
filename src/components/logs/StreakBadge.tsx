"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
}

export function StreakBadge({
  currentStreak,
  longestStreak,
  className,
}: StreakBadgeProps) {
  const isActive = currentStreak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        isActive
          ? "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300"
          : "bg-muted text-muted-foreground",
        className
      )}
      role="status"
      aria-label={`Current streak: ${currentStreak} days${longestStreak !== undefined && longestStreak > currentStreak ? `, best: ${longestStreak} days` : ""}`}
    >
      <Flame
        className={cn(
          "w-4 h-4",
          isActive ? "text-orange-500 dark:text-orange-400" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
      <span className="tabular-nums">{currentStreak}</span>
      <span>Day Streak</span>
      {longestStreak !== undefined && longestStreak > currentStreak && (
        <span className="text-xs text-muted-foreground ml-1">
          (Best: <span className="tabular-nums">{longestStreak}</span>)
        </span>
      )}
    </div>
  );
}
