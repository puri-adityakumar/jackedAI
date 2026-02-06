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
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Today&apos;s Progress</h4>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Calories */}
        <div className="bg-card border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Calories</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {caloriesConsumed}
            <span className="text-sm font-normal text-muted-foreground">
              /{calorieTarget}
            </span>
          </p>
          <div className="h-1.5 bg-muted mt-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="bg-card border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Protein</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {proteinConsumed}
            <span className="text-sm font-normal text-muted-foreground">g</span>
          </p>
        </div>

        {/* Exercises */}
        <div className="bg-card border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Exercises</span>
          </div>
          <p className="text-xl font-bold text-foreground">{exerciseCount}</p>
        </div>

        {/* Remaining */}
        <div className="bg-card border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Remaining</span>
          </div>
          <p
            className={`text-xl font-bold ${remaining >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
            <span className="text-sm font-normal text-muted-foreground"> cal</span>
          </p>
        </div>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground bg-card border border-border p-3">
          {message}
        </p>
      )}
    </div>
  );
}
