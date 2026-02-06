"use client";

import { cn } from "@/lib/utils";

interface MacrosSummaryProps {
  calories: number;
  calorieTarget: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function MacrosSummary({
  calories,
  calorieTarget,
  protein,
  carbs,
  fat,
}: MacrosSummaryProps) {
  const calorieProgress = Math.min(
    Math.round((calories / calorieTarget) * 100),
    100
  );
  const remaining = calorieTarget - calories;

  // Calculate macro percentages (rough estimate based on calories)
  const totalMacroCals = protein * 4 + carbs * 4 + fat * 9;
  const proteinPercent = totalMacroCals > 0 ? Math.round((protein * 4 / totalMacroCals) * 100) : 0;
  const carbsPercent = totalMacroCals > 0 ? Math.round((carbs * 4 / totalMacroCals) * 100) : 0;
  const fatPercent = totalMacroCals > 0 ? Math.round((fat * 9 / totalMacroCals) * 100) : 0;

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Calories consumed</p>
          <p className="text-3xl font-bold text-foreground">
            {calories}{" "}
            <span className="text-lg font-normal text-muted-foreground">
              / {calorieTarget}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p
            className={cn(
              "text-2xl font-bold",
              remaining >= 0 ? "text-primary" : "text-destructive"
            )}
          >
            {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
          </p>
        </div>
      </div>

      {/* Calorie Progress Bar */}
      <div className="h-3 bg-muted overflow-hidden mb-6">
        <div
          className={cn(
            "h-full transition-all",
            calorieProgress >= 100
              ? "bg-destructive"
              : calorieProgress >= 80
                ? "bg-primary/70"
                : "bg-primary"
          )}
          style={{ width: `${calorieProgress}%` }}
        />
      </div>

      {/* Macro Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{proteinPercent}%</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{protein}g</p>
          <p className="text-sm text-muted-foreground">Protein</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{carbsPercent}%</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{carbs}g</p>
          <p className="text-sm text-muted-foreground">Carbs</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{fatPercent}%</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{fat}g</p>
          <p className="text-sm text-muted-foreground">Fat</p>
        </div>
      </div>
    </div>
  );
}
