"use client";

import {
  Bell,
  Check,
  Pill,
  FlaskConical,
  Dumbbell,
  Utensils,
  Droplets,
  Clock,
  Calendar,
  Repeat,
} from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

export const reminderCardSchema = z.object({
  title: z.string().describe("Title of the reminder"),
  category: z
    .enum(["medicine", "supplement", "workout", "meal", "water", "custom"])
    .describe("Category of the reminder"),
  customCategoryName: z
    .string()
    .optional()
    .describe("Custom category name when category is 'custom'"),
  time: z.string().describe("Scheduled time in HH:MM format"),
  frequency: z
    .enum(["once", "daily", "weekly", "monthly"])
    .describe("How often the reminder repeats"),
  repeatDays: z
    .array(z.string())
    .optional()
    .describe("Days of the week for weekly reminders"),
  startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
  trackInventory: z.boolean().optional().describe("Whether inventory is being tracked"),
  quantityRemaining: z.number().optional().describe("Remaining quantity if tracking inventory"),
  message: z.string().optional().describe("Optional confirmation message"),
  action: z
    .enum(["created", "completed", "skipped", "updated"])
    .optional()
    .describe("What action was performed"),
});

type ReminderCardProps = z.infer<typeof reminderCardSchema>;

const CATEGORY_ICONS = {
  medicine: Pill,
  supplement: FlaskConical,
  workout: Dumbbell,
  meal: Utensils,
  water: Droplets,
  custom: Bell,
};

const CATEGORY_COLORS = {
  medicine: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    text: "text-rose-600 dark:text-rose-400",
    accent: "text-rose-900 dark:text-rose-100",
  },
  supplement: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    text: "text-purple-600 dark:text-purple-400",
    accent: "text-purple-900 dark:text-purple-100",
  },
  workout: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    text: "text-green-600 dark:text-green-400",
    accent: "text-green-900 dark:text-green-100",
  },
  meal: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    text: "text-orange-600 dark:text-orange-400",
    accent: "text-orange-900 dark:text-orange-100",
  },
  water: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-600 dark:text-blue-400",
    accent: "text-blue-900 dark:text-blue-100",
  },
  custom: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    border: "border-gray-200 dark:border-gray-700",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    accent: "text-gray-900 dark:text-gray-100",
  },
};

const CATEGORY_LABELS = {
  medicine: "Medicine",
  supplement: "Supplement",
  workout: "Workout",
  meal: "Meal",
  water: "Water",
  custom: "Reminder",
};

const FREQUENCY_LABELS = {
  once: "One time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export function ReminderCard({
  title,
  category,
  customCategoryName,
  time,
  frequency,
  repeatDays,
  startDate,
  trackInventory,
  quantityRemaining,
  message,
  action = "created",
}: ReminderCardProps) {
  const Icon = CATEGORY_ICONS[category];
  const colors = CATEGORY_COLORS[category];
  
  // Use custom category name if provided, otherwise use default label
  const categoryLabel = category === "custom" && customCategoryName
    ? customCategoryName
    : CATEGORY_LABELS[category];

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const getActionBadge = () => {
    switch (action) {
      case "completed":
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" aria-hidden="true" />
          </div>
        );
      case "skipped":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            Skipped
          </span>
        );
      case "updated":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            Updated
          </span>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
          </div>
        );
    }
  };

  return (
    <div className={cn("rounded-lg p-4 my-2 border", colors.bg, colors.border)}>
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colors.iconBg)}>
          <Icon className={cn("w-5 h-5", colors.text)} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("font-semibold truncate", colors.accent)}>{title}</h4>
            {getActionBadge()}
          </div>

          <p className={cn("text-xs mt-0.5", colors.text)}>
            {categoryLabel}
          </p>

          {/* Schedule details */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <time className="tabular-nums">{formatTime(time)}</time>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{FREQUENCY_LABELS[frequency]}</span>
            </div>

            {frequency === "weekly" && repeatDays && repeatDays.length > 0 && (
              <span className="text-muted-foreground">
                ({repeatDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ")})
              </span>
            )}

            {startDate && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{formatDate(startDate)}</span>
              </div>
            )}
          </div>

          {/* Inventory info */}
          {trackInventory && quantityRemaining !== undefined && (
            <p className={cn("text-xs mt-2 tabular-nums", colors.text)}>
              {quantityRemaining} remaining in stock
            </p>
          )}

          {message && (
            <p className={cn("text-xs mt-2", colors.text)}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
