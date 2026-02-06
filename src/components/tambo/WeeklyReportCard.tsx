"use client";

import { cn } from "@/lib/utils";
import { BarChart3, Utensils, Bell, Flame, Lightbulb } from "lucide-react";
import { z } from "zod";

export const weeklyReportCardSchema = z.object({
  weekStart: z.string().describe("Start date of the week"),
  weekEnd: z.string().describe("End date of the week"),
  workout: z.object({
    totalDays: z.number(),
    targetDays: z.number(),
    totalExercises: z.number(),
    grade: z.string(),
  }).describe("Workout metrics with grade"),
  nutrition: z.object({
    totalDaysLogged: z.number(),
    averageCalories: z.number(),
    averageProtein: z.number(),
    grade: z.string(),
  }).describe("Nutrition metrics with grade"),
  reminders: z.object({
    completed: z.number(),
    totalScheduled: z.number(),
    adherenceRate: z.number(),
    grade: z.string(),
  }).describe("Reminder metrics with grade"),
  overallGrade: z.string().describe("Overall grade (A-F)"),
  overallScore: z.number().describe("Overall score out of 100"),
  insights: z.array(z.string()).describe("AI-generated insights"),
  message: z.string().optional().describe("Optional message"),
});

type WeeklyReportCardProps = z.infer<typeof weeklyReportCardSchema>;

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
  B: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
  C: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50",
  D: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
  F: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50",
};

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
        GRADE_COLORS[grade] || GRADE_COLORS.F
      )}
    >
      {grade}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function WeeklyReportCard({
  weekStart,
  weekEnd,
  workout,
  nutrition,
  reminders,
  overallGrade,
  overallScore,
  insights,
  message,
}: WeeklyReportCardProps) {
  return (
    <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-semibold text-violet-900 dark:text-violet-100">Weekly Report</h4>
            <p className="text-xs text-violet-600 dark:text-violet-400">
              {formatDate(weekStart)} – {formatDate(weekEnd)}
            </p>
          </div>
        </div>
        <div className="text-center">
          <GradeBadge grade={overallGrade} />
          <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5 tabular-nums">{overallScore}/100</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Workout */}
        <div className="bg-white/60 dark:bg-white/5 rounded-md p-2.5 text-center border border-violet-100 dark:border-violet-800/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" aria-hidden="true" />
            <GradeBadge grade={workout.grade} />
          </div>
          <p className="text-lg font-bold text-violet-900 dark:text-violet-100 tabular-nums">
            {workout.totalDays}/{workout.targetDays}
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400">workout days</p>
          <p className="text-xs text-violet-500 dark:text-violet-400 tabular-nums">{workout.totalExercises} exercises</p>
        </div>

        {/* Nutrition */}
        <div className="bg-white/60 dark:bg-white/5 rounded-md p-2.5 text-center border border-violet-100 dark:border-violet-800/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Utensils className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" aria-hidden="true" />
            <GradeBadge grade={nutrition.grade} />
          </div>
          <p className="text-lg font-bold text-violet-900 dark:text-violet-100 tabular-nums">
            {nutrition.averageCalories}
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400">avg cal/day</p>
          <p className="text-xs text-violet-500 dark:text-violet-400 tabular-nums">{nutrition.averageProtein}g protein</p>
        </div>

        {/* Reminders */}
        <div className="bg-white/60 dark:bg-white/5 rounded-md p-2.5 text-center border border-violet-100 dark:border-violet-800/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Bell className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" aria-hidden="true" />
            <GradeBadge grade={reminders.grade} />
          </div>
          <p className="text-lg font-bold text-violet-900 dark:text-violet-100 tabular-nums">
            {reminders.adherenceRate}%
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400">adherence</p>
          <p className="text-xs text-violet-500 dark:text-violet-400 tabular-nums">
            {reminders.completed}/{reminders.totalScheduled}
          </p>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="border-t border-violet-200 dark:border-violet-800 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" aria-hidden="true" />
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Insights</span>
          </div>
          <ul className="space-y-1">
            {insights.map((insight, i) => (
              <li key={i} className="text-xs text-violet-600 dark:text-violet-400">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p className="text-xs text-violet-600 dark:text-violet-400 mt-3">{message}</p>
      )}
    </div>
  );
}
