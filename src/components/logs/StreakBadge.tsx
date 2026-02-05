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
          ? "bg-orange-100 text-orange-700"
          : "bg-gray-100 text-gray-500",
        className
      )}
    >
      <Flame
        className={cn(
          "w-4 h-4",
          isActive ? "text-orange-500" : "text-gray-400"
        )}
        aria-hidden="true"
      />
      <span className="tabular-nums">{currentStreak}</span>
      <span>Day Streak</span>
      {longestStreak !== undefined && longestStreak > currentStreak && (
        <span className="text-xs text-gray-500 ml-1">
          (Best: {longestStreak})
        </span>
      )}
    </div>
  );
}
