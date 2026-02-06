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
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
          </div>
        );
      case "skipped":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Skipped
          </span>
        );
      case "updated":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
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
    <div className="bg-primary/5 dark:bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate text-foreground">{title}</h4>
            {getActionBadge()}
          </div>

          <p className="text-xs mt-0.5 text-primary">
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
            <p className="text-xs mt-2 tabular-nums text-primary">
              {quantityRemaining} remaining in stock
            </p>
          )}

          {message && (
            <p className="text-xs mt-2 text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
