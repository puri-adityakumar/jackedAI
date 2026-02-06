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
            ? "text-destructive"
            : "text-primary"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          isZero
            ? "text-muted-foreground"
            : isPositive
            ? "text-destructive"
            : "text-primary"
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
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">Body Stats Logged</h4>
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-primary mt-0.5">{date}</p>

          {/* Stats grid */}
          <div className="mt-3 flex flex-wrap gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {weight}<span className="text-sm font-normal text-primary ml-0.5">kg</span>
              </p>
              {weightChange !== undefined && weightChange !== null && (
                <ChangeIndicator value={weightChange} unit="kg" label="" />
              )}
            </div>

            {bodyFat !== undefined && (
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {bodyFat}<span className="text-sm font-normal text-primary ml-0.5">%</span>
                </p>
                {bodyFatChange !== undefined && bodyFatChange !== null && (
                  <ChangeIndicator value={bodyFatChange} unit="%" label="bf" />
                )}
              </div>
            )}
          </div>

          {message && (
            <p className="text-xs text-muted-foreground mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
