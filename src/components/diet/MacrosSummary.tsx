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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Calories consumed</p>
          <p className="text-3xl font-bold text-gray-900">
            {calories}{" "}
            <span className="text-lg font-normal text-gray-400">
              / {calorieTarget}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Remaining</p>
          <p
            className={cn(
              "text-2xl font-bold",
              remaining >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
          </p>
        </div>
      </div>

      {/* Calorie Progress Bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            calorieProgress >= 100
              ? "bg-red-500"
              : calorieProgress >= 80
                ? "bg-orange-500"
                : "bg-green-500"
          )}
          style={{ width: `${calorieProgress}%` }}
        />
      </div>

      {/* Macro Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">{proteinPercent}%</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{protein}g</p>
          <p className="text-sm text-gray-500">Protein</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold">{carbsPercent}%</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{carbs}g</p>
          <p className="text-sm text-gray-500">Carbs</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-bold">{fatPercent}%</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{fat}g</p>
          <p className="text-sm text-gray-500">Fat</p>
        </div>
      </div>
    </div>
  );
}
