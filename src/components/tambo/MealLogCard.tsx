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
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{foodName}</h4>
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          <p className="text-xs text-primary mt-0.5">
            {mealTypeLabels[mealType]}
            {quantity && ` • ${quantity}`}
          </p>

          {/* Macro breakdown */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="text-center">
              <p className="font-bold text-foreground">{calories}</p>
              <p className="text-xs text-muted-foreground">cal</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-primary">{protein}g</p>
              <p className="text-xs text-muted-foreground">protein</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{carbs}g</p>
              <p className="text-xs text-muted-foreground">carbs</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{fat}g</p>
              <p className="text-xs text-muted-foreground">fat</p>
            </div>
          </div>

          {message && (
            <p className="text-xs text-muted-foreground mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
