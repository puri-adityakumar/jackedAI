"use client";

import { Activity, Flame, Target, TrendingUp } from "lucide-react";
import { z } from "zod";

export const dailyProgressCardSchema = z.object({
  caloriesConsumed: z.number().describe("Total calories consumed today"),
  calorieTarget: z.number().describe("Daily calorie target"),
  proteinConsumed: z.number().describe("Total protein consumed in grams"),
  exerciseCount: z.number().describe("Number of exercises completed today"),
  message: z.string().optional().describe("Optional motivational message"),
});

type DailyProgressCardProps = z.infer<typeof dailyProgressCardSchema>;

export function DailyProgressCard({
  caloriesConsumed,
  calorieTarget,
  proteinConsumed,
  exerciseCount,
  message,
}: DailyProgressCardProps) {
  const calorieProgress = Math.min(
    Math.round((caloriesConsumed / calorieTarget) * 100),
    100
  );
  const remaining = calorieTarget - caloriesConsumed;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 my-2">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Today&apos;s Progress</h4>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Calories */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Calories</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {caloriesConsumed}
            <span className="text-sm font-normal text-gray-400">
              /{calorieTarget}
            </span>
          </p>
          <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Protein</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {proteinConsumed}
            <span className="text-sm font-normal text-gray-400">g</span>
          </p>
        </div>

        {/* Exercises */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Exercises</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{exerciseCount}</p>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Remaining</span>
          </div>
          <p
            className={`text-xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
            <span className="text-sm font-normal text-gray-400"> cal</span>
          </p>
        </div>
      </div>

      {message && (
        <p className="text-sm text-gray-600 bg-white rounded-lg p-3 shadow-sm">
          {message}
        </p>
      )}
    </div>
  );
}
