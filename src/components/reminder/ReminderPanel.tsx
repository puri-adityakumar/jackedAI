"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { LogCalendar } from "@/components/logs/LogCalendar";
import {
  Bell,
  Plus,
  X,
  Pill,
  FlaskConical,
  Dumbbell,
  Utensils,
  Droplets,
  Clock,
  Check,
  SkipForward,
  Pause,
  Play,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReminderCategory =
  | "medicine"
  | "supplement"
  | "workout"
  | "meal"
  | "water"
  | "custom";

type ReminderFrequency = "once" | "daily" | "weekly" | "monthly";

type ReminderStatus = "completed" | "missed" | "skipped" | "snoozed" | "pending";

const CATEGORIES: { value: ReminderCategory; label: string; icon: typeof Bell }[] = [
  { value: "medicine", label: "Medicine", icon: Pill },
  { value: "supplement", label: "Supplement", icon: FlaskConical },
  { value: "workout", label: "Workout", icon: Dumbbell },
  { value: "meal", label: "Meal", icon: Utensils },
  { value: "water", label: "Water", icon: Droplets },
  { value: "custom", label: "Custom", icon: Bell },
];

const FREQUENCIES: { value: ReminderFrequency; label: string }[] = [
  { value: "once", label: "One Time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DAYS_OF_WEEK = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

const CATEGORY_COLORS: Record<ReminderCategory, { bg: string; text: string; border: string }> = {
  medicine: { bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
  supplement: { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  workout: { bg: "bg-green-100 dark:bg-green-950/50", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  meal: { bg: "bg-orange-100 dark:bg-orange-950/50", text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
  water: { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  custom: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700" },
};

interface Reminder {
  _id: Id<"reminders">;
  title: string;
  description?: string;
  category: ReminderCategory;
  customCategoryName?: string;
  frequency: ReminderFrequency;
  time: string;
  repeatDays?: string[];
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
  trackInventory?: boolean;
  quantityRemaining?: number;
  refillThreshold?: number;
  isActive: boolean;
  isPaused?: boolean;
  todayStatus?: ReminderStatus;
  todayLogId?: Id<"reminderLogs">;
}

interface ReminderFormData {
  title: string;
  description: string;
  category: ReminderCategory;
  customCategoryName: string;
  frequency: ReminderFrequency;
  time: string;
  repeatDays: string[];
  dayOfMonth: number;
  startDate: string;
  endDate: string;
  trackInventory: boolean;
  quantityRemaining: number;
  refillThreshold: number;
}

interface EditModalProps {
  reminder: Reminder | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: ReminderFormData) => void;
}

function ReminderFormModal({ reminder, isNew, onClose, onSave }: EditModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<ReminderFormData>({
    title: reminder?.title || "",
    description: reminder?.description || "",
    category: reminder?.category || "custom",
    customCategoryName: reminder?.customCategoryName || "",
    frequency: reminder?.frequency || "daily",
    time: reminder?.time || "08:00",
    repeatDays: reminder?.repeatDays || ["mon", "tue", "wed", "thu", "fri"],
    dayOfMonth: reminder?.dayOfMonth || 1,
    startDate: reminder?.startDate || today,
    endDate: reminder?.endDate || "",
    trackInventory: reminder?.trackInventory || false,
    quantityRemaining: reminder?.quantityRemaining || 0,
    refillThreshold: reminder?.refillThreshold || 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day],
    }));
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === formData.category);
  const CategoryIcon = selectedCategory?.icon || Bell;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", CATEGORY_COLORS[formData.category].bg)}>
              <CategoryIcon className={cn("w-4 h-4", CATEGORY_COLORS[formData.category].text)} aria-hidden="true" />
            </div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground">
              {isNew ? "New Reminder" : "Edit Reminder"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="e.g., Take Vitamin D…"
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="Optional details…"
              autoComplete="off"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isSelected
                        ? cn(CATEGORY_COLORS[cat.value].bg, CATEGORY_COLORS[cat.value].border)
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? CATEGORY_COLORS[cat.value].text : "text-muted-foreground")} aria-hidden="true" />
                    <span className={cn("text-xs font-medium", isSelected ? CATEGORY_COLORS[cat.value].text : "text-muted-foreground")}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Category Name - shown when custom is selected */}
          {formData.category === "custom" && (
            <div>
              <label htmlFor="customCategoryName" className="block text-sm font-medium text-foreground mb-1">
                Custom Category Name
              </label>
              <input
                type="text"
                id="customCategoryName"
                name="customCategoryName"
                value={formData.customCategoryName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customCategoryName: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                placeholder="e.g., Self Care, Pet Care, Study…"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1">Give your custom reminder a category name</p>
            </div>
          )}

          {/* Time & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-foreground mb-1">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-foreground mb-1">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value as ReminderFrequency }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekly days */}
          {formData.frequency === "weekly" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Repeat On</label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      formData.repeatDays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly day */}
          {formData.frequency === "monthly" && (
            <div>
              <label htmlFor="dayOfMonth" className="block text-sm font-medium text-foreground mb-1">
                Day of Month
              </label>
              <input
                type="number"
                id="dayOfMonth"
                name="dayOfMonth"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                min={1}
                max={31}
              />
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              />
            </div>
          </div>

          {/* Inventory tracking (for medicine/supplement) */}
          {(formData.category === "medicine" || formData.category === "supplement") && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackInventory}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trackInventory: e.target.checked }))}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm font-medium text-foreground">Track Inventory</span>
              </label>

              {formData.trackInventory && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quantityRemaining" className="block text-xs font-medium text-muted-foreground mb-1">
                      Quantity Remaining
                    </label>
                    <input
                      type="number"
                      id="quantityRemaining"
                      name="quantityRemaining"
                      value={formData.quantityRemaining}
                      onChange={(e) => setFormData((prev) => ({ ...prev, quantityRemaining: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                      min={0}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label htmlFor="refillThreshold" className="block text-xs font-medium text-muted-foreground mb-1">
                      Refill Alert At
                    </label>
                    <input
                      type="number"
                      id="refillThreshold"
                      name="refillThreshold"
                      value={formData.refillThreshold}
                      onChange={(e) => setFormData((prev) => ({ ...prev, refillThreshold: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                      min={0}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {isNew ? "Create Reminder" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ title, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 border border-border"
        role="alertdialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
      >
        <h2 id="delete-title" className="text-lg font-semibold text-foreground mb-2">
          Delete Reminder?
        </h2>
        <p id="delete-desc" className="text-muted-foreground mb-4">
          Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderItem({
  reminder,
  onEdit,
  onDelete,
  onComplete,
  onSkip,
  onTogglePause,
}: {
  reminder: Reminder;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onTogglePause: () => void;
}) {
  const category = CATEGORIES.find((c) => c.value === reminder.category);
  const Icon = category?.icon || Bell;
  const colors = CATEGORY_COLORS[reminder.category];
  
  // Display custom category name if available, otherwise use default label
  const categoryLabel = reminder.category === "custom" && reminder.customCategoryName
    ? reminder.customCategoryName
    : category?.label || "Reminder";

  const needsRefill =
    reminder.trackInventory &&
    reminder.refillThreshold &&
    (reminder.quantityRemaining || 0) <= reminder.refillThreshold;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getFrequencyLabel = () => {
    switch (reminder.frequency) {
      case "once":
        return "One time";
      case "daily":
        return "Every day";
      case "weekly":
        return reminder.repeatDays?.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ");
      case "monthly":
        return `Day ${reminder.dayOfMonth} of month`;
      default:
        return "";
    }
  };

  const isCompleted = reminder.todayStatus === "completed";
  const isSkipped = reminder.todayStatus === "skipped";
  const isPending = reminder.todayStatus === "pending" || !reminder.todayStatus;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all",
        reminder.isPaused
          ? "bg-muted/50 border-border opacity-60"
          : isCompleted
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : isSkipped
          ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
          : cn(colors.bg, colors.border)
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("font-semibold truncate", isCompleted ? "text-green-700 dark:text-green-400 line-through" : "text-foreground")}>
              {reminder.title}
            </h4>
            {isCompleted && (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" aria-hidden="true" />
              </div>
            )}
            {reminder.isPaused && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Paused</span>
            )}
          </div>

          <p className={cn("text-xs mt-0.5", colors.text)}>{categoryLabel}</p>

          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <time className="tabular-nums">{formatTime(reminder.time)}</time>
            <span className="text-muted-foreground/50">·</span>
            <span>{getFrequencyLabel()}</span>
          </div>

          {reminder.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">{reminder.description}</p>
          )}

          {/* Inventory warning */}
          {needsRefill && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="tabular-nums">{reminder.quantityRemaining} remaining</span>
              <span>— time to refill!</span>
            </div>
          )}

          {reminder.trackInventory && !needsRefill && reminder.quantityRemaining !== undefined && (
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {reminder.quantityRemaining} remaining
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isPending && !reminder.isPaused && (
            <>
              <button
                type="button"
                onClick={onComplete}
                className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Mark ${reminder.title} as done`}
              >
                <Check className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Skip ${reminder.title}`}
              >
                <SkipForward className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onTogglePause}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={reminder.isPaused ? `Resume ${reminder.title}` : `Pause ${reminder.title}`}
          >
            {reminder.isPaused ? (
              <Play className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Pause className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`Edit ${reminder.title}`}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`Delete ${reminder.title}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReminderPanel() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState<ReminderCategory | "all">("all");
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

  const todayReminders = useQuery(api.reminders.getTodayReminders, { date: selectedDate });
  const allReminders = useQuery(api.reminders.getAll);
  const needsRefill = useQuery(api.reminders.getNeedingRefill);

  const createReminder = useMutation(api.reminders.create);
  const updateReminder = useMutation(api.reminders.update);
  const deleteReminder = useMutation(api.reminders.remove);
  const togglePause = useMutation(api.reminders.togglePause);
  const logCompletion = useMutation(api.reminders.logCompletion);

  // Build calendar data from reminder logs
  const logsByDate = useQuery(api.reminders.getLogsByDate, { date: selectedDate });

  const calendarData = useMemo(() => {
    if (!allReminders) return {};
    const data: Record<string, { count: number; color: string }> = {};
    // For simplicity, mark dates that have active reminders
    // In a real app, we'd fetch logs for the month
    return data;
  }, [allReminders]);

  const filteredReminders = useMemo(() => {
    if (!todayReminders) return [];
    if (selectedCategory === "all") return todayReminders;
    return todayReminders.filter((r) => r.category === selectedCategory);
  }, [todayReminders, selectedCategory]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(selectedDate));

  const handleSave = async (data: ReminderFormData) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      category: data.category,
      customCategoryName: data.category === "custom" && data.customCategoryName ? data.customCategoryName : undefined,
      frequency: data.frequency,
      time: data.time,
      repeatDays: data.frequency === "weekly" ? data.repeatDays : undefined,
      dayOfMonth: data.frequency === "monthly" ? data.dayOfMonth : undefined,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      trackInventory: data.trackInventory || undefined,
      quantityRemaining: data.trackInventory ? data.quantityRemaining : undefined,
      refillThreshold: data.trackInventory ? data.refillThreshold : undefined,
    };

    if (isAddingNew) {
      await createReminder(payload);
    } else if (editingReminder) {
      await updateReminder({ id: editingReminder._id, ...payload });
    }
    setEditingReminder(null);
    setIsAddingNew(false);
  };

  const handleDelete = async () => {
    if (deletingReminder) {
      await deleteReminder({ id: deletingReminder._id });
      setDeletingReminder(null);
    }
  };

  const handleComplete = async (reminder: Reminder) => {
    await logCompletion({
      reminderId: reminder._id,
      date: selectedDate,
      scheduledTime: reminder.time,
      status: "completed",
    });
  };

  const handleSkip = async (reminder: Reminder) => {
    await logCompletion({
      reminderId: reminder._id,
      date: selectedDate,
      scheduledTime: reminder.time,
      status: "skipped",
    });
  };

  const handleTogglePause = async (reminder: Reminder) => {
    await togglePause({ id: reminder._id });
  };

  const completedCount = filteredReminders.filter((r) => r.todayStatus === "completed").length;
  const totalCount = filteredReminders.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight" style={{ textWrap: "balance" }}>
              Reminders
            </h2>
            {totalCount > 0 && (
              <p className="text-sm text-muted-foreground tabular-nums">
                {completedCount} of {totalCount} completed today
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Reminder
        </button>
      </header>

      {/* Refill alerts */}
      {needsRefill && needsRefill.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Refill Needed</span>
          </div>
          <ul className="mt-2 space-y-1">
            {needsRefill.map((r) => (
              <li key={r._id} className="text-sm text-amber-600 dark:text-amber-400">
                {r.title} — <span className="tabular-nums">{r.quantityRemaining}</span> remaining
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selectedCategory === cat.value
                  ? cn(CATEGORY_COLORS[cat.value].bg, CATEGORY_COLORS[cat.value].text)
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Calendar */}
      <LogCalendar
        datesWithLogs={calendarData}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Day view */}
      <section className="space-y-3">
        <h3 className="font-medium text-foreground">{formattedDate}</h3>

        {filteredReminders.length > 0 ? (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => (
              <ReminderItem
                key={reminder._id}
                reminder={reminder as Reminder}
                onEdit={() => setEditingReminder(reminder as Reminder)}
                onDelete={() => setDeletingReminder(reminder as Reminder)}
                onComplete={() => handleComplete(reminder as Reminder)}
                onSkip={() => handleSkip(reminder as Reminder)}
                onTogglePause={() => handleTogglePause(reminder as Reminder)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-card rounded-xl border border-border">
            <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" aria-hidden="true" />
            <p className="text-muted-foreground">No reminders scheduled for this day</p>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="mt-2 text-primary hover:text-primary/80 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
            >
              Create your first reminder
            </button>
          </div>
        )}
      </section>

      {/* Modals */}
      {(editingReminder || isAddingNew) && (
        <ReminderFormModal
          reminder={editingReminder}
          isNew={isAddingNew}
          onClose={() => {
            setEditingReminder(null);
            setIsAddingNew(false);
          }}
          onSave={handleSave}
        />
      )}

      {deletingReminder && (
        <DeleteConfirmModal
          title={deletingReminder.title}
          onConfirm={handleDelete}
          onCancel={() => setDeletingReminder(null)}
        />
      )}
    </div>
  );
}
