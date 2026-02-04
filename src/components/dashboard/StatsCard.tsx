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
    bg: "bg-orange-50",
    text: "text-orange-600",
    progress: "bg-orange-500",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    progress: "bg-blue-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    progress: "bg-green-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    progress: "bg-purple-500",
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
    <div className={cn("rounded-lg p-4 border border-gray-200", colors.bg)}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={cn("text-2xl font-bold mt-1", colors.text)}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", colors.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
