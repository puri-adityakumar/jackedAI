"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { LogCalendar } from "./LogCalendar";
import { StreakBadge } from "./StreakBadge";
import { Pencil, Trash2, Plus, X, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

interface MealLog {
  _id: Id<"mealLogs">;
  date: string;
  mealType: MealType;
  foodName: string;
  quantity?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface EditModalProps {
  meal: MealLog | null;
  isNew: boolean;
  date: string;
  onClose: () => void;
  onSave: (data: Partial<MealLog>) => void;
}

function EditMealModal({ meal, isNew, date, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    mealType: meal?.mealType || ("breakfast" as MealType),
    foodName: meal?.foodName || "",
    quantity: meal?.quantity || "",
    calories: meal?.calories || 0,
    protein: meal?.protein || 0,
    carbs: meal?.carbs || 0,
    fat: meal?.fat || 0,
    fiber: meal?.fiber || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      quantity: formData.quantity || undefined,
      fiber: formData.fiber || undefined,
      date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-border"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 id="modal-title" className="text-lg font-semibold text-foreground">
            {isNew ? "Add Meal" : "Edit Meal"}
          </h2>
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
          <div>
            <label
              htmlFor="mealType"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Meal Type
            </label>
            <select
              id="mealType"
              name="mealType"
              value={formData.mealType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  mealType: e.target.value as MealType,
                }))
              }
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              required
            >
              {MEAL_TYPES.map((mt) => (
                <option key={mt.value} value={mt.value}>
                  {mt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="foodName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Food Name
            </label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              value={formData.foodName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, foodName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="e.g., Chicken Rice…"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Quantity
            </label>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quantity: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="e.g., 1 bowl, 200g…"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="calories"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Calories
              </label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    calories: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                min={0}
                required
              />
            </div>
            <div>
              <label
                htmlFor="protein"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Protein (g)
              </label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    protein: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                min={0}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="carbs"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Carbs (g)
              </label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    carbs: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                min={0}
                required
              />
            </div>
            <div>
              <label
                htmlFor="fat"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Fat (g)
              </label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fat: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                min={0}
                required
              />
            </div>
            <div>
              <label
                htmlFor="fiber"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Fiber (g)
              </label>
              <input
                type="number"
                id="fiber"
                name="fiber"
                value={formData.fiber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fiber: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                min={0}
              />
            </div>
          </div>

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
              {isNew ? "Add Meal" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  foodName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({
  foodName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 border border-border"
        role="alertdialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
      >
        <h2 id="delete-title" className="text-lg font-semibold text-foreground mb-2">
          Delete Meal?
        </h2>
        <p id="delete-desc" className="text-muted-foreground mb-4">
          Are you sure you want to delete &ldquo;{foodName}&rdquo;? This action
          cannot be undone.
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

export function DietLogView() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingMeal, setDeletingMeal] = useState<MealLog | null>(null);

  const currentDate = new Date();
  const monthSummary = useQuery(api.mealLogs.getMonthSummary, {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const streak = useQuery(api.mealLogs.getStreak);
  const dayLogs = useQuery(api.mealLogs.getByDate, { date: selectedDate });
  const dailySummary = useQuery(api.mealLogs.getDailySummary, { date: selectedDate });

  const createMeal = useMutation(api.mealLogs.create);
  const updateMeal = useMutation(api.mealLogs.update);
  const deleteMeal = useMutation(api.mealLogs.remove);

  const calendarData = useMemo(() => {
    if (!monthSummary?.byDate) return {};
    const data: Record<string, { count: number; color: string }> = {};
    for (const [date, info] of Object.entries(monthSummary.byDate)) {
      // Color based on calorie tracking (simplified)
      data[date] = { count: info.mealCount, color: "bg-orange-500" };
    }
    return data;
  }, [monthSummary]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(selectedDate));

  const handleSave = async (data: Partial<MealLog>) => {
    if (isAddingNew) {
      await createMeal({
        date: selectedDate,
        mealType: data.mealType!,
        foodName: data.foodName!,
        quantity: data.quantity,
        calories: data.calories!,
        protein: data.protein!,
        carbs: data.carbs!,
        fat: data.fat!,
        fiber: data.fiber,
      });
    } else if (editingMeal) {
      await updateMeal({
        id: editingMeal._id,
        mealType: data.mealType,
        foodName: data.foodName,
        quantity: data.quantity,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
      });
    }
    setEditingMeal(null);
    setIsAddingNew(false);
  };

  const handleDelete = async () => {
    if (deletingMeal) {
      await deleteMeal({ id: deletingMeal._id });
      setDeletingMeal(null);
    }
  };

  // Group logs by meal type
  const groupedLogs = useMemo(() => {
    if (!dayLogs) return {};
    const groups: Record<MealType, MealLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const log of dayLogs) {
      groups[log.mealType].push(log);
    }
    return groups;
  }, [dayLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight" style={{ textWrap: "balance" }}>
            Diet Log
          </h2>
        </div>
        {streak && (
          <StreakBadge
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
          />
        )}
      </header>

      {/* Stats */}
      {monthSummary && (
        <p className="text-sm text-muted-foreground">
          <span className="tabular-nums">{monthSummary.totalDays}</span> days logged
          this month &middot; Avg{" "}
          <span className="tabular-nums">
            {new Intl.NumberFormat("en-US").format(monthSummary.avgCalories)}
          </span>{" "}
          cal/day
        </p>
      )}

      {/* Calendar */}
      <LogCalendar
        datesWithLogs={calendarData}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Day view */}
      <section className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium text-foreground">{formattedDate}</h3>
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Add new meal"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add
          </button>
        </div>

        {/* Table */}
        {dayLogs && dayLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Meal</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Food</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground tabular-nums">Cal</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground tabular-nums">P</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground tabular-nums">C</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground tabular-nums">F</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dayLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 capitalize text-foreground">{log.mealType}</td>
                    <td className="px-4 py-3 font-medium text-foreground truncate max-w-[150px]">
                      {log.foodName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.quantity || "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground">{log.calories}</td>
                    <td className="px-4 py-3 tabular-nums text-blue-600 dark:text-blue-400">{log.protein}g</td>
                    <td className="px-4 py-3 tabular-nums text-orange-600 dark:text-orange-400">{log.carbs}g</td>
                    <td className="px-4 py-3 tabular-nums text-purple-600 dark:text-purple-400">{log.fat}g</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingMeal(log)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          aria-label={`Edit ${log.foodName}`}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMeal(log)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          aria-label={`Delete ${log.foodName}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Utensils className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" aria-hidden="true" />
            <p>No meals logged for this day</p>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="mt-2 text-primary hover:text-primary/80 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
            >
              Add your first meal
            </button>
          </div>
        )}

        {/* Daily Summary */}
        {dailySummary && dailySummary.mealCount > 0 && (
          <div className="px-4 py-3 bg-muted/50 border-t border-border">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="font-medium text-foreground">Daily Total:</div>
              <div className="tabular-nums text-foreground">
                <span className="font-semibold">
                  {new Intl.NumberFormat("en-US").format(dailySummary.totalCalories)}
                </span>{" "}
                cal
              </div>
              <div className="tabular-nums text-blue-600 dark:text-blue-400">
                <span className="font-semibold">{dailySummary.totalProtein}g</span> protein
              </div>
              <div className="tabular-nums text-orange-600 dark:text-orange-400">
                <span className="font-semibold">{dailySummary.totalCarbs}g</span> carbs
              </div>
              <div className="tabular-nums text-purple-600 dark:text-purple-400">
                <span className="font-semibold">{dailySummary.totalFat}g</span> fat
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      {(editingMeal || isAddingNew) && (
        <EditMealModal
          meal={editingMeal}
          isNew={isAddingNew}
          date={selectedDate}
          onClose={() => {
            setEditingMeal(null);
            setIsAddingNew(false);
          }}
          onSave={handleSave}
        />
      )}

      {deletingMeal && (
        <DeleteConfirmModal
          foodName={deletingMeal.foodName}
          onConfirm={handleDelete}
          onCancel={() => setDeletingMeal(null)}
        />
      )}
    </div>
  );
}
