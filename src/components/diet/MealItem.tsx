"use client";

import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Coffee, Moon, Sun, Trash2, Utensils } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface MealItemProps {
  meal: {
    _id: Id<"mealLogs">;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodName: string;
    quantity?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  compact?: boolean;
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Utensils,
};

const mealColors = {
  breakfast: "bg-yellow-100 text-yellow-600",
  lunch: "bg-orange-100 text-orange-600",
  dinner: "bg-purple-100 text-purple-600",
  snack: "bg-blue-100 text-blue-600",
};

export function MealItem({ meal, compact = false }: MealItemProps) {
  const removeMeal = useMutation(api.mealLogs.remove);
  const Icon = mealIcons[meal.mealType];

  const handleDelete = () => {
    if (confirm("Remove this meal?")) {
      removeMeal({ id: meal._id });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between group",
        compact ? "py-1" : ""
      )}
    >
      <div className="flex items-center gap-3">
        {!compact && (
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              mealColors[meal.mealType]
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <p
            className={cn(
              "font-medium text-gray-900",
              compact ? "text-sm" : ""
            )}
          >
            {meal.foodName}
            {meal.quantity && (
              <span className="text-gray-400 font-normal"> ({meal.quantity})</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F:{" "}
            {meal.fat}g
          </p>
        </div>
      </div>
      {!compact && (
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
          title="Remove meal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
