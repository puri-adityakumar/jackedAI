"use client";

import { cn } from "@/lib/utils";
import { Check, Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { z } from "zod";

export const bodyStatsCardSchema = z.object({
  weight: z.number().describe("Weight in kg"),
  bodyFat: z.number().optional().describe("Body fat percentage"),
  weightChange: z.number().optional().describe("Weight change from previous entry in kg"),
  bodyFatChange: z.number().optional().describe("Body fat change from previous entry"),
  date: z.string().describe("Date of the measurement"),
  message: z.string().optional().describe("Optional confirmation message"),
});

type BodyStatsCardProps = z.infer<typeof bodyStatsCardSchema>;

function ChangeIndicator({ value, unit, label }: { value: number; unit: string; label: string }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Icon
        className={cn(
          "w-3.5 h-3.5",
          isZero
            ? "text-muted-foreground"
            : isPositive
            ? "text-orange-500 dark:text-orange-400"
            : "text-emerald-500 dark:text-emerald-400"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          isZero
            ? "text-muted-foreground"
            : isPositive
            ? "text-orange-600 dark:text-orange-400"
            : "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {isPositive ? "+" : ""}
        {value.toFixed(1)}
        {unit} {label}
      </span>
    </div>
  );
}

export function BodyStatsCard({
  weight,
  bodyFat,
  weightChange,
  bodyFatChange,
  date,
  message,
}: BodyStatsCardProps) {
  return (
    <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center flex-shrink-0">
          <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-cyan-900 dark:text-cyan-100">Body Stats Logged</h4>
            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">{date}</p>

          {/* Stats grid */}
          <div className="mt-3 flex flex-wrap gap-4">
            <div>
              <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 tabular-nums">
                {weight}<span className="text-sm font-normal text-cyan-600 dark:text-cyan-400 ml-0.5">kg</span>
              </p>
              {weightChange !== undefined && weightChange !== null && (
                <ChangeIndicator value={weightChange} unit="kg" label="" />
              )}
            </div>

            {bodyFat !== undefined && (
              <div>
                <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 tabular-nums">
                  {bodyFat}<span className="text-sm font-normal text-cyan-600 dark:text-cyan-400 ml-0.5">%</span>
                </p>
                {bodyFatChange !== undefined && bodyFatChange !== null && (
                  <ChangeIndicator value={bodyFatChange} unit="%" label="bf" />
                )}
              </div>
            )}
          </div>

          {message && (
            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
