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
  A: "text-primary bg-primary/10",
  B: "text-primary/80 bg-primary/10",
  C: "text-muted-foreground bg-muted",
  D: "text-destructive/80 bg-destructive/10",
  F: "text-destructive bg-destructive/10",
};

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 text-sm font-bold",
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
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Weekly Report</h4>
            <p className="text-xs text-primary">
              {formatDate(weekStart)} – {formatDate(weekEnd)}
            </p>
          </div>
        </div>
        <div className="text-center">
          <GradeBadge grade={overallGrade} />
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{overallScore}/100</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Workout */}
        <div className="bg-card border border-border p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <GradeBadge grade={workout.grade} />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {workout.totalDays}/{workout.targetDays}
          </p>
          <p className="text-xs text-muted-foreground">workout days</p>
          <p className="text-xs text-muted-foreground tabular-nums">{workout.totalExercises} exercises</p>
        </div>

        {/* Nutrition */}
        <div className="bg-card border border-border p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Utensils className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <GradeBadge grade={nutrition.grade} />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {nutrition.averageCalories}
          </p>
          <p className="text-xs text-muted-foreground">avg cal/day</p>
          <p className="text-xs text-muted-foreground tabular-nums">{nutrition.averageProtein}g protein</p>
        </div>

        {/* Reminders */}
        <div className="bg-card border border-border p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Bell className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <GradeBadge grade={reminders.grade} />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {reminders.adherenceRate}%
          </p>
          <p className="text-xs text-muted-foreground">adherence</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {reminders.completed}/{reminders.totalScheduled}
          </p>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="border-t border-primary/20 dark:border-primary/30 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs font-medium text-foreground">Insights</span>
          </div>
          <ul className="space-y-1">
            {insights.map((insight, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p className="text-xs text-muted-foreground mt-3">{message}</p>
      )}
    </div>
  );
}
