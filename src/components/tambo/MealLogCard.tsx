"use client";

import { Check, Utensils } from "lucide-react";
import { z } from "zod";

export const mealLogCardSchema = z.object({
  foodName: z.string().describe("Name of the food/meal"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).describe("Type of meal"),
  quantity: z.string().optional().describe("Quantity description (e.g., '1 bowl', '200g')"),
  calories: z.number().describe("Estimated calories"),
  protein: z.number().describe("Estimated protein in grams"),
  carbs: z.number().describe("Estimated carbs in grams"),
  fat: z.number().describe("Estimated fat in grams"),
  message: z.string().optional().describe("Optional confirmation message"),
});

type MealLogCardProps = z.infer<typeof mealLogCardSchema>;

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealLogCard({
  foodName,
  mealType,
  quantity,
  calories,
  protein,
  carbs,
  fat,
  message,
}: MealLogCardProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-orange-900">{foodName}</h4>
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-0.5">
            {mealTypeLabels[mealType]}
            {quantity && ` • ${quantity}`}
          </p>

          {/* Macro breakdown */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="text-center">
              <p className="font-bold text-orange-900">{calories}</p>
              <p className="text-xs text-orange-600">cal</p>
            </div>
            <div className="h-8 w-px bg-orange-200" />
            <div className="text-center">
              <p className="font-bold text-blue-700">{protein}g</p>
              <p className="text-xs text-gray-500">protein</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-orange-700">{carbs}g</p>
              <p className="text-xs text-gray-500">carbs</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-700">{fat}g</p>
              <p className="text-xs text-gray-500">fat</p>
            </div>
          </div>

          {message && (
            <p className="text-xs text-orange-600 mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
