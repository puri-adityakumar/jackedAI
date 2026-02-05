"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
  color?: "orange" | "blue" | "green" | "purple";
}

const colorClasses = {
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    progress: "bg-orange-500 dark:bg-orange-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    progress: "bg-blue-500 dark:bg-blue-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-600 dark:text-green-400",
    progress: "bg-green-500 dark:bg-green-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-600 dark:text-purple-400",
    progress: "bg-purple-500 dark:bg-purple-400",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  progress,
  color = "blue",
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <article className={cn("rounded-xl p-4 border border-border shadow-sm", colors.bg)}>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p
        className={cn("text-2xl font-bold mt-1", colors.text)}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", colors.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
